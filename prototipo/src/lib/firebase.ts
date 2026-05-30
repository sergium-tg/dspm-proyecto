import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAdwVjpUXLC-Wt5F9Zxdy1DJH8T_ooqnP8",
  authDomain: "dspm-proyectofinal.firebaseapp.com",
  projectId: "dspm-proyectofinal",
  storageBucket: "dspm-proyectofinal.firebasestorage.app",
  messagingSenderId: "809010870349",
  appId: "1:809010870349:web:2c766004add73847498404",
  measurementId: "G-KLQSFQN9NE",
};

// Firebase Auth touches browser-only APIs (indexedDB, window). Initialize lazily
// and ONLY on the client to keep SSR rendering safe.
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (typeof window === "undefined") {
    throw new Error("Firebase Auth is only available on the client");
  }
  if (!_app) {
    _app = getApps()[0] ?? initializeApp(firebaseConfig);
  }
  if (!_auth) {
    _auth = getAuth(_app);
  }
  return _auth;
}

// Backwards-compatible proxy: code can keep importing `auth` and using it
// inside effects/handlers. Accessing properties on the server will throw,
// which is the desired behavior (and won't happen during SSR render).
export const auth = new Proxy({} as Auth, {
  get(_t, prop) {
    const a = getFirebaseAuth() as unknown as Record<string, unknown>;
    const v = a[prop as string];
    return typeof v === "function" ? (v as Function).bind(a) : v;
  },
});