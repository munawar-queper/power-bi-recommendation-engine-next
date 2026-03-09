import { NextResponse } from "next/server";
import {
  getSessionCookieToken,
  verifyAdminIdToken,
  verifyAdminSessionCookie,
} from "@/lib/adminAuth";
import { ADMIN_SESSION_COOKIE } from "@/lib/adminConstants";
import { getFirebaseAdminApp } from "@/lib/firebase";
import { getAuth } from "firebase-admin/auth";
import { logAdminAuditEvent } from "@/lib/adminAudit";

export const runtime = "nodejs";

const EIGHT_HOURS_SECONDS = 60 * 60 * 8;
const EIGHT_HOURS_MS = EIGHT_HOURS_SECONDS * 1000;

export async function GET(request: Request) {
  const token = getSessionCookieToken(request);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await verifyAdminSessionCookie(token);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idToken =
      typeof body?.idToken === "string" ? body.idToken.trim() : "";

    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    if (idToken.split(".").length !== 3) {
      return NextResponse.json({ error: "Invalid idToken format" }, { status: 400 });
    }

    const user = await verifyAdminIdToken(idToken);
    const sessionCookie = await getAuth(getFirebaseAdminApp()).createSessionCookie(
      idToken,
      { expiresIn: EIGHT_HOURS_MS }
    );
    const response = NextResponse.json({ user });

    await logAdminAuditEvent({
      action: "admin.login",
      outcome: "success",
      detail: `Admin login for ${user.email}`,
    });

    response.cookies.set({
      name: ADMIN_SESSION_COOKIE,
      value: sessionCookie,
      maxAge: EIGHT_HOURS_SECONDS,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("Admin session creation failed:", error);
    await logAdminAuditEvent({
      action: "admin.login",
      outcome: "failed",
      detail: "Admin login failed",
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  await logAdminAuditEvent({
    action: "admin.logout",
    outcome: "success",
    detail: "Admin session cleared",
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
