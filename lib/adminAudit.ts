import { getDb } from "@/lib/firebase";

type AdminAuditPayload = {
  action: string;
  outcome: "success" | "failed";
  detail?: string;
  metadata?: Record<string, unknown>;
};

export async function logAdminAuditEvent(payload: AdminAuditPayload) {
  try {
    const db = getDb();
    await db.collection("adminAuditLogs").add({
      ...payload,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to write admin audit log:", error);
  }
}
