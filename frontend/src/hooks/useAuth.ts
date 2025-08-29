import { useEffect, useMemo, useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, browserLocalPersistence, setPersistence, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useLocation } from 'wouter';
import { useQuery } from "@tanstack/react-query";

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let appInited = false;
function ensureFirebase() {
	if (!appInited) {
		initializeApp(firebaseConfig as any);
		appInited = true;
	}
}

export function useAuth() {
  const [, navigate] = useLocation();
  const [ready, setReady] = useState(false);
  const [claims, setClaims] = useState<{ admin?: boolean; provider?: boolean } | null>(null);

  useEffect(() => {
	ensureFirebase();
	const auth = getAuth();
	setPersistence(auth, browserLocalPersistence);
	const unsub = onAuthStateChanged(auth, async (user) => {
		if (!user) {
			setClaims(null);
			setReady(true);
			return navigate('/login');
		}
		const token = await user.getIdToken(true);
		const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
		if (res.ok) {
			const data = await res.json();
			setClaims(data.claims || {});
			if (data.claims?.admin) navigate('/admin-panel');
			else if (data.claims?.provider) navigate('/provider-dashboard');
			else navigate('/apply');
		}
		setReady(true);
	});
	return () => unsub();
  }, [navigate]);

  return {
    isLoading: !ready,
    isAuthenticated: !!claims,
    claims: claims || {},
    signInWithGoogle: async () => {
      ensureFirebase();
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    },
    signOut: async () => {
      ensureFirebase();
      const auth = getAuth();
      await auth.signOut();
    }
  };
}