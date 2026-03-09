import nodemailer from "nodemailer";
import { getDb } from "@/lib/firebase";
import { getSmtpSettings } from "@/lib/adminSettings";

export type MailStatus = "sent" | "failed";

async function logMailEvent(status: MailStatus, message: string) {
  try {
    const db = getDb();
    await db.collection("notificationLogs").add({
      status,
      message,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to log mail event:", error);
  }
}

export async function sendAdminSubmissionAlert(params: {
  submissionEmail: string;
  score: number;
  recommendedCourse: string;
  createdAt: string;
}) {
  const settings = await getSmtpSettings();
  if (!settings.notificationsEnabled) {
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: {
      user: settings.username,
      pass: settings.password,
    },
  });

  try {
    await transporter.sendMail({
      from: settings.fromEmail,
      to: settings.notifyToEmail,
      subject: "New questionnaire submission received",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>New Submission Available</h2>
          <p>A new form submission has been received on the recommendation portal.</p>
          <ul>
            <li><strong>Email:</strong> ${params.submissionEmail}</li>
            <li><strong>Score:</strong> ${params.score}</li>
            <li><strong>Recommended Course:</strong> ${params.recommendedCourse}</li>
            <li><strong>Submitted At:</strong> ${new Date(params.createdAt).toLocaleString()}</li>
          </ul>
        </div>
      `,
    });

    await logMailEvent("sent", "Admin submission alert sent.");
    return { skipped: false };
  } catch (error) {
    await logMailEvent("failed", "Admin submission alert failed.");
    throw error;
  }
}

export async function sendTestEmail(toEmail?: string) {
  const settings = await getSmtpSettings();
  const recipient = toEmail || settings.notifyToEmail;

  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: {
      user: settings.username,
      pass: settings.password,
    },
  });

  try {
    await transporter.sendMail({
      from: settings.fromEmail,
      to: recipient,
      subject: "SMTP test email from AMZ LMS admin",
      text: "This is a test email to validate your SMTP settings.",
    });

    await logMailEvent("sent", "SMTP test email sent.");
    return { ok: true };
  } catch (error) {
    await logMailEvent("failed", "SMTP test email failed.");
    throw error;
  }
}
