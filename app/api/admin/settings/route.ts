import { NextResponse } from "next/server";
import { requireAdminToken } from "@/lib/adminAuth";
import { getSmtpSettingsForAdminUI, saveSmtpSettings } from "@/lib/adminSettings";
import { logAdminAuditEvent } from "@/lib/adminAudit";
import { SmtpSettings } from "@/types";

export const runtime = "nodejs";

function validatePayload(payload: Partial<SmtpSettings>) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!payload.host || !payload.username) {
    return "SMTP host and username are required.";
  }

  if (!payload.fromEmail || !payload.notifyToEmail) {
    return "From and notification email are required.";
  }

  if (!emailPattern.test(payload.fromEmail) || !emailPattern.test(payload.notifyToEmail)) {
    return "From and notification email must be valid email addresses.";
  }

  const port = Number(payload.port);
  if (!Number.isFinite(port) || port <= 0 || port > 65535) {
    return "SMTP port must be between 1 and 65535.";
  }

  return null;
}

export async function GET(request: Request) {
  const authResponse = await requireAdminToken(request);
  if (authResponse) return authResponse;

  try {
    const settings = await getSmtpSettingsForAdminUI();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Failed to load settings:", error);
    return NextResponse.json({ error: "Failed to load settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const authResponse = await requireAdminToken(request);
  if (authResponse) return authResponse;

  try {
    const payload = (await request.json()) as Partial<SmtpSettings>;
    const validationError = validatePayload(payload);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const existingSettings = await getSmtpSettingsForAdminUI();
    if (!payload.password && !existingSettings.hasPassword) {
      return NextResponse.json(
        { error: "SMTP password is required for the first save." },
        { status: 400 }
      );
    }

    await saveSmtpSettings({
      host: payload.host!.trim(),
      port: Number(payload.port),
      username: payload.username!.trim(),
      password: payload.password || "",
      secure: Boolean(payload.secure),
      fromEmail: payload.fromEmail!.trim(),
      notifyToEmail: payload.notifyToEmail!.trim(),
      notificationsEnabled: Boolean(payload.notificationsEnabled),
    });

    await logAdminAuditEvent({
      action: "admin.settings.smtp.update",
      outcome: "success",
      detail: "SMTP settings saved",
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to save settings:", error);
    await logAdminAuditEvent({
      action: "admin.settings.smtp.update",
      outcome: "failed",
      detail: "SMTP settings save failed",
    });
    return NextResponse.json({ error: "Failed to save settings" }, { status: 500 });
  }
}
