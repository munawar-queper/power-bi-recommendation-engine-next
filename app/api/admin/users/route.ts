import { NextResponse } from "next/server";
import { Timestamp } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebase";
import { requireAdminToken } from "@/lib/adminAuth";
import { AdminUser } from "@/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authResponse = requireAdminToken(request);
  if (authResponse) return authResponse;

  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get("limit"));
    const limit = Number.isFinite(limitParam)
      ? Math.min(Math.max(limitParam, 1), 200)
      : 100;

    const snapshot = await db
      .collection("users")
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();

    const users: AdminUser[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt =
        data.createdAt instanceof Timestamp
          ? data.createdAt.toDate().toISOString()
          : data.createdAt;

      const lastSubmissionAt =
        data.lastSubmissionAt instanceof Timestamp
          ? data.lastSubmissionAt.toDate().toISOString()
          : data.lastSubmissionAt;

      return {
        id: doc.id,
        email: data.email,
        name: data.name,
        role: data.role ?? "user",
        createdAt,
        lastSubmissionAt,
      };
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Failed to load users:", error);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}
