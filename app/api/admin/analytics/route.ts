import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase";
import { requireAdminToken } from "@/lib/adminAuth";
import { AdminAnalyticsResponse, Submission } from "@/types";

export const runtime = "nodejs";

function normalizeCreatedAt(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return new Date().toISOString();
}

export async function GET(request: Request) {
  const authResponse = await requireAdminToken(request);
  if (authResponse) return authResponse;

  try {
    const db = getDb();

    const [submissionsSnapshot, usersSnapshot, mailLogsSnapshot] = await Promise.all([
      db.collection("submissions").get(),
      db.collection("users").get(),
      db.collection("notificationLogs").get(),
    ]);

    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    const submissions: Submission[] = submissionsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        score: data.score,
        recommendedCourse: data.recommendedCourse,
        answersText: data.answersText || "",
        answers: data.answers || [],
        aiResponse: data.aiResponse ?? null,
        createdAt: normalizeCreatedAt(data.createdAt),
      };
    });

    const recommendationDistributionMap = new Map<string, number>();
    const dailyTrendMap = new Map<string, number>();
    const topCategoriesMap = new Map<string, number>();

    let submissionsThisWeek = 0;

    for (const submission of submissions) {
      recommendationDistributionMap.set(
        submission.recommendedCourse,
        (recommendationDistributionMap.get(submission.recommendedCourse) || 0) + 1
      );

      const createdDate = new Date(submission.createdAt);
      if (createdDate.getTime() >= weekAgo) {
        submissionsThisWeek += 1;
      }

      const dayKey = createdDate.toISOString().slice(0, 10);
      dailyTrendMap.set(dayKey, (dailyTrendMap.get(dayKey) || 0) + 1);

      for (const answer of submission.answers || []) {
        for (const label of answer.selectedOptionText || []) {
          topCategoriesMap.set(label, (topCategoriesMap.get(label) || 0) + 1);
        }
      }
    }

    const recommendationDistribution = [...recommendationDistributionMap.entries()]
      .map(([course, count]) => ({ course, count }))
      .sort((a, b) => b.count - a.count);

    const dailyTrend = [...dailyTrendMap.entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const topCategories = [...topCategoriesMap.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const notificationHealth = {
      sent: 0,
      failed: 0,
    };

    for (const doc of mailLogsSnapshot.docs) {
      const status = doc.data().status;
      if (status === "sent") notificationHealth.sent += 1;
      if (status === "failed") notificationHealth.failed += 1;
    }

    const payload: AdminAnalyticsResponse = {
      totals: {
        submissions: submissionsSnapshot.size,
        users: usersSnapshot.size,
        submissionsThisWeek,
      },
      recommendationDistribution,
      dailyTrend,
      topCategories,
      notificationHealth,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Failed to load analytics:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
