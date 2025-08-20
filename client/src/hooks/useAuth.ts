import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { auth } from "@/lib/firebase";

export function useAuth() {
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (fbUser) => {
      setFirebaseReady(true);
    });
    return () => unsub();
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me-firebase", firebaseReady],
    queryFn: async () => {
      if (!firebaseReady || !auth.currentUser) return null;
      const idToken = await auth.currentUser.getIdToken(true);
      const res = await fetch('/api/auth/me-firebase', {
        headers: { Authorization: `Bearer ${idToken}` },
        credentials: 'include',
      });
      if (res.status === 401) return null;
      return res.json();
    },
    enabled: firebaseReady,
    retry: false,
  });

  return {
    user,
    isLoading: !firebaseReady || isLoading,
    isAuthenticated: !!user,
  };
}