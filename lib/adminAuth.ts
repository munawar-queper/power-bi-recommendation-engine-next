import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { ADMIN_SESSION_COOKIE } from "@/lib/adminConstants";
import { getFirebaseAdminApp } from "@/lib/firebase";

const ADMIN_EMAIL_ALLOWLIST = (process.env.ADMIN_EMAIL_ALLOWLIST || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

type AdminSessionUser = {
  uid: string;
  email: string;
};

function getAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

function getHeaderToken(request: Request): string | null {
  const bearerToken = request.headers
    .get("authorization")
    ?.replace("Bearer ", "")
    .trim();
  const legacyToken = request.headers.get("x-admin-token")?.trim();

  return bearerToken || legacyToken || null;
}

function getCookieValue(request: Request, key: string): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;

  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const [cookieKey, ...valueParts] = pair.trim().split("=");
    if (cookieKey === key) {
      return decodeURIComponent(valueParts.join("="));
    }
  }

  return null;
}

function isAllowedAdmin(email: string, adminClaim: unknown): boolean {
  if (adminClaim === true) return true;
  if (ADMIN_EMAIL_ALLOWLIST.length === 0) return false;
  return ADMIN_EMAIL_ALLOWLIST.includes(email.toLowerCase());
}

function extractAdminUser(decodedToken: {
  uid: string;
  email?: string;
  admin?: unknown;
}): AdminSessionUser {
  const email = decodedToken.email?.toLowerCase();

  if (!email) {
    throw new Error("Admin token does not include an email.");
  }

  const canAccessAdmin = isAllowedAdmin(email, decodedToken.admin);
  if (!canAccessAdmin) {
    throw new Error("Admin privileges are required.");
  }

  return {
    uid: decodedToken.uid,
    email,
  };
}

export async function verifyAdminIdToken(token: string): Promise<AdminSessionUser> {
  const decodedToken = await getAdminAuth().verifyIdToken(
    token,
    true
  );

  return extractAdminUser(decodedToken);
}

export async function verifyAdminSessionCookie(
  sessionCookie: string
): Promise<AdminSessionUser> {
  const decodedToken = await getAdminAuth().verifySessionCookie(
    sessionCookie,
    true
  );
  return extractAdminUser(decodedToken);
}

export function getRequestSessionToken(request: Request): string | null {
  return getHeaderToken(request) || getCookieValue(request, ADMIN_SESSION_COOKIE);
}

export function getSessionCookieToken(request: Request): string | null {
  return getCookieValue(request, ADMIN_SESSION_COOKIE);
}

export function getHeaderAuthToken(request: Request): string | null {
  return getHeaderToken(request);
}

export async function requireAdminToken(request: Request) {
  const headerToken = getHeaderAuthToken(request);
  const sessionCookie = getSessionCookieToken(request);
  const sessionToken = headerToken || sessionCookie;

  if (!sessionToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (headerToken) {
      await verifyAdminIdToken(headerToken);
    } else if (sessionCookie) {
      await verifyAdminSessionCookie(sessionCookie);
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
