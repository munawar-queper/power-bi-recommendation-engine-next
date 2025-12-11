import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
const databaseURL = process.env.FIREBASE_DATABASE_URL;

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    "Missing Firebase service account env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY"
  );
}

// const firebaseConfig = {
//   apiKey: "AIzaSyCVXsZhm4rOj__G3WDqZO0sVJojgtakVwM",
//   authDomain: "amz-recommendation-engine.firebaseapp.com",
//   projectId: "amz-recommendation-engine",
//   storageBucket: "amz-recommendation-engine.firebasestorage.app",
//   messagingSenderId: "675333287972",
//   appId: "1:675333287972:web:8ad449375f41d828ffe8b1",
//   measurementId: "G-4H1HF10EE7"
// };

const app = getApps().length
  ? getApp()
  : initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      databaseURL,
    });

export const db = getFirestore(app);
