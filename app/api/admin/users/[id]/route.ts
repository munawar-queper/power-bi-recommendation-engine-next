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
  { params }: { params: Promise<{ id: string }> }
) {
  const authResponse = await requireAdminToken(request);
  if (authResponse) return authResponse;

  try {
    const { id } = await params;
    const userId = decodeURIComponent(id);
    const db = getDb();

    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data() || {};
    const user: AdminUser = {
      id: userDoc.id,
      email: userData.email,
      name: userData.name,
      role: userData.role ?? "user",
      createdAt: normalizeTimestamp(userData.createdAt),
      lastSubmissionAt: normalizeTimestamp(userData.lastSubmissionAt),
    };

    const submissionsSnapshot = await db
      .collection("submissions")
      .where("email", "==", user.email)
      .limit(200)
      .get();

    const submissions: Submission[] = submissionsSnapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          score: data.score,
          recommendedCourse: data.recommendedCourse,
          answersText: data.answersText || "",
          answers: data.answers || [],
          aiResponse: data.aiResponse ?? null,
          createdAt: normalizeTimestamp(data.createdAt),
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return NextResponse.json({ user, submissions });
  } catch (error) {
    console.error("Failed to load user details:", error);
    return NextResponse.json(
      { error: "Failed to load user details" },
      { status: 500 }
    );
  }
}
