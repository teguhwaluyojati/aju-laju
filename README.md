# AjuLaju Web

AjuLaju is a bilingual (Indonesian/English) web app for tracking vehicle service history and fuel expenses.

Built with Next.js App Router, TypeScript, Tailwind CSS, and Firebase (Authentication + Firestore).

## Features

- Bilingual UI: Indonesian (`id`) and English (`en`)
- Locale-aware routing with middleware (`/id/...`, `/en/...`)
- Vehicle management
- Service history CRUD
- Fuel history CRUD
- Dashboard summary and charts
- Profile page with verification status
- Email/password auth + Google/Facebook login
- Email verification flow for manual signup/login
- Route protection for unverified email/password users

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Firebase Auth
- Cloud Firestore

## Prerequisites

- Node.js 18+
- npm (or compatible package manager)
- A Firebase project

## Installation

1. Clone the repository.
2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` in the project root.
4. Add your Firebase web app credentials.

## Environment Variables

Required variables in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Firebase Setup

1. Create a Firebase project.
2. Enable Authentication providers:
- Email/Password
- Google (optional)
- Facebook (optional)
3. Create Firestore database.
4. Deploy or apply Firestore rules/indexes from:
- `firestore.rules`
- `firestore.indexes.json`

## Run Locally

```bash
npm run dev
```

Open http://localhost:3000

## Build and Start

```bash
npm run build
npm run start
```

## Lint

```bash
npm run lint
```

## Authentication and Verification Rules

- Manual signup (email/password):
- Sends verification email after registration.
- Shows verification modal with resend cooldown (60s).
- User is not allowed into dashboard until email is verified.

- Manual login (email/password):
- If email is not verified, user is blocked from dashboard.
- Verification modal is shown with resend + recheck actions.

- Dashboard route protection:
- Direct URL access is blocked for unverified email/password users.

## Project Structure

```text
src/
  app/
    (auth)/
      login/
      register/
    dashboard/
      fuel/
      profile/
      service/
      vehicles/
  components/
  hooks/
  i18n/
  lib/
  types/
  utils/
```

## Notes

- Locale is resolved from path, HTML lang, and locale cookie.
- The app uses client-side Firebase SDK for auth and Firestore access.
- Ensure Firestore security rules are configured for your production use case.

## License

Private project.
