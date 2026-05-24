# EduCheck AI

AI-powered assignment **understanding verification** for teachers and students. Generates tailored questions from assignments and submissions to support live oral verification.

Works on **Firebase Spark (free)** — no Storage, no Cloud Functions, no Blaze plan required.

## Features

- Teacher / student auth (Firebase)
- Assignments & submissions (text stored in Firestore)
- Client-side file reading (PDF, DOCX, TXT, code)
- **AI questions in the browser** (Google Gemini API from frontend)
- Live verification mode + reports

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Vite, Tailwind |
| Database | Firestore + Auth |
| AI | Google Gemini API (called from browser) |
| Files | Browser extraction → Firestore text |

## Setup

### 1. Firebase (Spark plan is fine)

1. [Firebase Console](https://console.firebase.google.com) → create project
2. Enable **Authentication** → Email/Password
3. Create **Firestore** database
4. Register a **Web app** → copy config

### 2. Environment

```bash
cp .env.example .env
```

Fill in `.env`:

```env
# Firebase Web App config (Firebase Console → Project settings → Your apps)
VITE_FIREBASE_API_KEY=AIzaSyCwZdEFBgO16wGgbY6oWdgEY31z-wlhyV4
VITE_FIREBASE_AUTH_DOMAIN=educheck-ai-2c412.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=educheck-ai-2c412
VITE_FIREBASE_STORAGE_BUCKET=educheck-ai-2c412.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=822801075035
VITE_FIREBASE_APP_ID=1:822801075035:web:b08a794ad2f5677eece87e

# Set to true when running Firebase emulators locally
VITE_USE_FUNCTIONS_EMULATOR=false

# Google Gemini (runs in browser — get key at https://aistudio.google.com/apikey)
VITE_GEMINI_API_KEY=AIzaSyC-nB9UQ2JHbUXR1hHddHwFAfRVGPiPvKc
# Optional: gemini-2.0-flash (default), gemini-1.5-flash, gemini-2.5-flash-preview, etc.
VITE_GEMINI_MODEL=gemini-2.5-flash
```

### 3. Deploy Firestore rules

```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules,firestore:indexes
```

### 4. Run

```bash
npm install
npm run dev
```

## Usage

1. Register as **teacher** → create assignment  
2. Register as **student** (other email) → submit work  
3. Teacher → submission → **Generate questions**  
4. **Live verify** → save report  

## Security note

`VITE_GEMINI_API_KEY` is bundled into the frontend — anyone can see it in devtools. Fine for personal/school demos; for production use a backend proxy later.

## Optional: hosting

```bash
npm run build
npx firebase-tools deploy --only hosting
```

## License

Private / educational use.
# educheck-ai
