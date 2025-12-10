import { NextResponse } from "next/server";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export function requireAdminToken(request: Request) {
  if (!ADMIN_TOKEN) {
    return NextResponse.json(
      { error: "ADMIN_TOKEN is not configured" },
      { status: 500 }
    );
  }

  const headerToken =
    request.headers.get("x-admin-token") ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (headerToken !== ADMIN_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
