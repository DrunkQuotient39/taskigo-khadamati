import { initializeApp, type FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'REPLACE_ME',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'REPLACE_ME',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'REPLACE_ME',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'REPLACE_ME',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export async function signInWithGoogle(): Promise<void> {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email: string, password: string): Promise<void> {
  await createUserWithEmailAndPassword(auth, email, password);
}

export async function firebaseSignOut(): Promise<void> {
  await signOut(auth);
}

