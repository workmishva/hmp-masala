import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'

const firebaseConfig = {
  apiKey:    process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
}

// Singleton — avoids re-initialisation during hot reloads
export const firebaseApp: FirebaseApp =
  getApps().length ? getApps()[0]! : initializeApp(firebaseConfig)
