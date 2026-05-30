import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAdwVjpUXLC-Wt5F9Zxdy1DJH8T_ooqnP8',
  authDomain: 'dspm-proyectofinal.firebaseapp.com',
  projectId: 'dspm-proyectofinal',
  storageBucket: 'dspm-proyectofinal.firebasestorage.app',
  messagingSenderId: '809010870349',
  appId: '1:809010870349:web:2c766004add73847498404',
  measurementId: 'G-KLQSFQN9NE',
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!app) {
    app = getApps()[0] ?? initializeApp(firebaseConfig);
  }
  if (!auth) {
    auth = getAuth(app);
  }
  return auth;
}
