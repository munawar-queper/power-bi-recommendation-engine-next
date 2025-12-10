import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { db } from "@/lib/firebase";
import { requireAdminToken } from "@/lib/adminAuth";
import { Submission } from "@/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authResponse = requireAdminToken(request);
  if (authResponse) return authResponse;

  try {
    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get("limit"));
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), 200)
      : 50;

    const snapshot = await db
      .collection("submissions")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const submissions: Submission[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt =
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt;

      return {
        id: doc.id,
        email: data.email,
        score: data.score,
        recommendedCourse: data.recommendedCourse,
        answersText: data.answersText,
        answers: data.answers || [],
        aiResponse: data.aiResponse ?? null,
        createdAt,
      };
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Failed to load submissions:", error);
    return NextResponse.json(
      { error: "Failed to load submissions" },
      { status: 500 }
    );
  }
}
