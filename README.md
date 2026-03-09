This project is a Next.js app that generates personalized Power BI course recommendations.

## Environment variables

Create a `.env.local` with the following server-side values (service account is required for Firestore):

```
OPENAI_API_KEY=...
OPENAI_ORG_ID=...
OPENAI_PROJECT_ID=...

FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=... # wrap in quotes; keep newlines escaped (\n)
FIREBASE_DATABASE_URL=...

NEXT_PUBLIC_FIREBASE_API_KEY=... # client key for Firebase email/password login
ADMIN_EMAIL_ALLOWLIST=admin@yourcompany.com,owner@yourcompany.com
ADMIN_ENCRYPTION_KEY=... # used to encrypt SMTP password before storing in Firestore
```

## Admin authentication setup

The admin panel now uses Firebase Auth and server-side ID token verification.

1. In Firebase Authentication, enable Email/Password sign-in.
2. Create your admin user account in Firebase Auth.
3. Add the admin email to `ADMIN_EMAIL_ALLOWLIST`.
4. Optional hardening: assign Firebase custom claim `admin=true` and keep allowlist as bootstrap fallback.

### Bootstrap admin claim

Use the helper script to set or remove admin claim on a Firebase user:

```bash
npm run admin:set-claim -- --email=admin@yourcompany.com
npm run admin:set-claim -- --email=admin@yourcompany.com --remove
```

This script requires: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.

All admin API routes validate the Firebase ID token and require admin access.

## Getting started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the quiz.

### Admin dashboard

- Visit `/admin/login` and sign in with your Firebase admin account.
- The admin panel includes Dashboard, Submissions, Users, and Settings pages.
- In Settings, configure SMTP and use "Send Test Email" before enabling notifications.
- When notifications are enabled, each new form submission triggers an email to the configured admin inbox.
- Submissions store: email, score, recommended course, full answer text, structured answers, and AI response.
- Users list is populated automatically when a submission is saved (keyed by email with timestamps).

### SMTP troubleshooting

1. Ensure `ADMIN_ENCRYPTION_KEY` is configured before saving SMTP settings.
2. Use `Send Test Email` after each SMTP change.
3. For port 465, set secure mode to enabled; for 587 usually keep secure mode disabled (STARTTLS).
4. If notification health shows failures, check `notificationLogs` and `adminAuditLogs` in Firestore.

### Security note

Service account JSON files should not be committed. This repository now ignores files matching `*-firebase-adminsdk-*.json`.
