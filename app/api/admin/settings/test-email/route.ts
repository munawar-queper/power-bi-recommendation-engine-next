import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/adminAuth";
import { sendTestEmail } from "@/lib/mailer";
import { logAdminAuditEvent } from "@/lib/adminAudit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authResponse = await requireAdminToken(request);
  if (authResponse) return authResponse;

  try {
    const body = await request.json().catch(() => ({}));
    const toEmail = typeof body?.toEmail === "string" ? body.toEmail : undefined;

    await sendTestEmail(toEmail);
    await logAdminAuditEvent({
      action: "admin.settings.smtp.test",
      outcome: "success",
      detail: "SMTP test email sent",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("SMTP test email failed:", error);
    await logAdminAuditEvent({
      action: "admin.settings.smtp.test",
      outcome: "failed",
      detail: "SMTP test email failed",
    });
    return NextResponse.json(
      { error: "Failed to send test email. Check SMTP settings." },
      { status: 500 }
    );
  }
}
