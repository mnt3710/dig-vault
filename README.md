# Dig Vault

Dig Vault is a thrift store dig judgment app + closet management app built with **Next.js App Router + TypeScript**.

## Tech Stack

- Next.js 16 + TypeScript (strict mode)
- Tailwind CSS
- Firebase (Authentication / Firestore / Storage)
- Gemini Vision API (image judgment)
- Google Maps integration (embedded thrift-store lookup)

## App Structure

```text
app/
  api/
    judge/
      route.ts
  (auth)/
    login/
  dig/
    page.tsx
  closet/
    page.tsx
components/
  dig/
  closet/
  ui/
lib/
  firebase.ts
  gemini.ts
types/
  index.ts
```

## Phase 1 Implemented

- `/api/judge` API route sends uploaded image data to Gemini and returns judgment
- Dig mode image upload UI
- Judgment result display with GRAB / BUY / HOLD / PASS / TRY

## Environment Variables (`.env.local`)

```bash
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Run

```bash
npm install
npm run dev
```
