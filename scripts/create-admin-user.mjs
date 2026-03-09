import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import crypto from "crypto";

function getArgValue(name) {
  const pair = process.argv.find((arg) => arg.startsWith(`${name}=`));
  return pair ? pair.slice(name.length + 1) : "";
}

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function generatePassword() {
  // Strong but URL-safe printable password.
  return crypto.randomBytes(12).toString("base64url") + "A9!";
}

async function main() {
  const email = getArgValue("--email").trim().toLowerCase();
  const providedPassword = getArgValue("--password");
  const password = providedPassword || generatePassword();

  if (!email) {
    throw new Error("Missing --email=<admin@email.com>");
  }

  const projectId = getRequiredEnv("FIREBASE_PROJECT_ID");
  const clientEmail = getRequiredEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = getRequiredEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n");

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  const auth = getAuth();

  let user;
  let created = false;

  try {
    user = await auth.getUserByEmail(email);
  } catch {
    user = await auth.createUser({
      email,
      password,
      emailVerified: true,
      disabled: false,
    });
    created = true;
  }

  if (!created) {
    await auth.updateUser(user.uid, {
      password,
      disabled: false,
      emailVerified: true,
    });
  }

  const currentClaims = user.customClaims || {};
  await auth.setCustomUserClaims(user.uid, {
    ...currentClaims,
    admin: true,
  });

  console.log(JSON.stringify({
    email,
    password,
    uid: user.uid,
    created,
    admin: true,
  }));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
