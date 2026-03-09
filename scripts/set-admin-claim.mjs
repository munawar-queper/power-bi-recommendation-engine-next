import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function getArgValue(name) {
  const pair = process.argv.find((arg) => arg.startsWith(`${name}=`));
  return pair ? pair.slice(name.length + 1) : "";
}

async function main() {
  const email = getArgValue("--email");
  const remove = process.argv.includes("--remove");

  if (!email) {
    throw new Error("Missing --email=<admin@email.com>");
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
    );
  }

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
  const user = await auth.getUserByEmail(email);

  const nextClaims = {
    ...(user.customClaims || {}),
    admin: !remove,
  };

  if (remove) {
    delete nextClaims.admin;
  }

  await auth.setCustomUserClaims(user.uid, nextClaims);

  const mode = remove ? "removed" : "set";
  console.log(`Admin claim ${mode} for ${email} (uid: ${user.uid}).`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
