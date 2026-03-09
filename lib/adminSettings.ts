import { getDb } from "@/lib/firebase";
import { decryptValue, encryptValue } from "@/lib/crypto";
import { SmtpSettings, SmtpSettingsDocument, SmtpSettingsResponse } from "@/types";

const SETTINGS_COLLECTION = "appSettings";
const SETTINGS_DOC = "admin";

const defaultSettings: SmtpSettings = {
  host: "",
  port: 587,
  username: "",
  password: "",
  secure: false,
  fromEmail: "",
  notifyToEmail: "",
  notificationsEnabled: false,
};

export async function getSmtpSettings(): Promise<SmtpSettings> {
  const db = getDb();
  const snapshot = await db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC).get();

  if (!snapshot.exists) {
    return defaultSettings;
  }

  const data = snapshot.data() as Partial<SmtpSettingsDocument>;

  return {
    host: data.host || "",
    port: data.port || 587,
    username: data.username || "",
    password: data.encryptedPassword ? decryptValue(data.encryptedPassword) : "",
    secure: Boolean(data.secure),
    fromEmail: data.fromEmail || "",
    notifyToEmail: data.notifyToEmail || "",
    notificationsEnabled: Boolean(data.notificationsEnabled),
  };
}

export async function getSmtpSettingsForAdminUI(): Promise<SmtpSettingsResponse> {
  const db = getDb();
  const snapshot = await db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC).get();

  if (!snapshot.exists) {
    return {
      host: "",
      port: 587,
      username: "",
      secure: false,
      fromEmail: "",
      notifyToEmail: "",
      notificationsEnabled: false,
      hasPassword: false,
    };
  }

  const data = snapshot.data() as Partial<SmtpSettingsDocument>;

  return {
    host: data.host || "",
    port: data.port || 587,
    username: data.username || "",
    secure: Boolean(data.secure),
    fromEmail: data.fromEmail || "",
    notifyToEmail: data.notifyToEmail || "",
    notificationsEnabled: Boolean(data.notificationsEnabled),
    hasPassword: Boolean(data.encryptedPassword),
  };
}

export async function saveSmtpSettings(settings: SmtpSettings) {
  const db = getDb();
  const snapshot = await db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC).get();
  const existing = snapshot.exists
    ? (snapshot.data() as Partial<SmtpSettingsDocument>)
    : undefined;

  const encryptedPassword = settings.password
    ? encryptValue(settings.password)
    : existing?.encryptedPassword || "";

  const payload: SmtpSettingsDocument = {
    host: settings.host.trim(),
    port: Number(settings.port),
    username: settings.username.trim(),
    encryptedPassword,
    secure: Boolean(settings.secure),
    fromEmail: settings.fromEmail.trim(),
    notifyToEmail: settings.notifyToEmail.trim(),
    notificationsEnabled: Boolean(settings.notificationsEnabled),
    updatedAt: new Date().toISOString(),
  };

  await db.collection(SETTINGS_COLLECTION).doc(SETTINGS_DOC).set(payload, { merge: true });
}
