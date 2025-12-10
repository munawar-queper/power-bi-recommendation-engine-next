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

ADMIN_TOKEN=... # shared token for admin APIs/UI
```

## Getting started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the quiz.

### Admin dashboard

- Visit `/admin` and enter the `ADMIN_TOKEN` to load submissions and users.
- Submissions store: email, score, recommended course, full answer text, structured answers, and AI response.
- Users list is populated automatically when a submission is saved (keyed by email with timestamps).
