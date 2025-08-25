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
  apiKey: "AIzaSyADQtywHCVJSa4wyT9-2MLK-AMNeiiDTfA",
  authDomain: "taskigo-5e30d.firebaseapp.com",
  projectId: "taskigo-5e30d",
  storageBucket: "taskigo-5e30d.appspot.com",
  messagingSenderId: "711846238759",
  appId: "1:711846238759:web:6c4b77a8d3e0f199740c02",
  measurementId: "G-S7LL0VP0CY"
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

