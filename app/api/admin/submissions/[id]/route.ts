import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase";
import { requireAdminToken } from "@/lib/adminAuth";
import { AdminUser, Submission } from "@/types";

export const runtime = "nodejs";

function normalizeTimestamp(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return "";
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authResponse = await requireAdminToken(request);
  if (authResponse) return authResponse;

  try {
    const { id } = params;
    const submissionId = decodeURIComponent(id);
    const db = getDb();

    const submissionDoc = await db.collection("submissions").doc(submissionId).get();
    if (!submissionDoc.exists) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const data = submissionDoc.data() || {};
    const submission: Submission = {
      id: submissionDoc.id,
      email: data.email,
      score: data.score,
      recommendedCourse: data.recommendedCourse,
      answersText: data.answersText || "",
      answers: data.answers || [],
      aiResponse: data.aiResponse ?? null,
      createdAt: normalizeTimestamp(data.createdAt),
    };

    let user: AdminUser | null = null;
    if (submission.email) {
      const userDoc = await db.collection("users").doc(submission.email).get();
      if (userDoc.exists) {
        const userData = userDoc.data() || {};
        user = {
          id: userDoc.id,
          email: userData.email,
          name: userData.name,
          role: userData.role ?? "user",
          createdAt: normalizeTimestamp(userData.createdAt),
          lastSubmissionAt: normalizeTimestamp(userData.lastSubmissionAt),
        };
      }
    }

    return NextResponse.json({ submission, user });
  } catch (error) {
    console.error("Failed to load submission details:", error);
    return NextResponse.json(
      { error: "Failed to load submission details" },
      { status: 500 }
    );
  }
}
