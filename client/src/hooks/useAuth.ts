import { useEffect, useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { auth } from "@/lib/firebase";

let authListenersAttached = false;

export function useAuth() {
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    if (authListenersAttached) return;
    authListenersAttached = true;
    const unsub = auth.onAuthStateChanged(async () => {
      setFirebaseReady(true);
    });
    return () => {
      unsub();
      authListenersAttached = false;
    };
  }, []);

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/me-firebase", firebaseReady],
    queryFn: async () => {
      if (!firebaseReady) return null;
      
      if (!auth.currentUser) return null;
      
      try {
        // Get cached ID token; avoid forcing refresh on every read to reduce lag
        const idToken = await auth.currentUser.getIdToken();
        
        if (!idToken) {
          console.error('No ID token available, cannot authenticate with API');
          return null;
        }
        
        const isAdminEmail = auth.currentUser.email?.toLowerCase() === 'taskigo.khadamati@gmail.com';
        
        // Make API request
        const res = await fetch('/api/auth/me-firebase', {
          headers: { 
            Authorization: `Bearer ${idToken}`,
            'Cache-Control': 'no-cache',
            'X-Is-Admin-Email': isAdminEmail ? 'true' : 'false'
          },
          credentials: 'include',
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            return null;
          }
          if (res.status === 429) {
            return null;
          }
          throw new Error(`API error: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data && data.user) {
          return data.user;
        } else if (data && typeof data === 'object' && 'id' in data) {
          return data;
        } else {
          return null;
        }
      } catch (error) {
        console.error('Auth load error', error);
        return null;
      }
    },
    enabled: firebaseReady,
    // Do not spam retries on auth/rate-limit errors
    retry: (failureCount, err: any) => {
      const status = Number(String(err?.message).match(/\d+/)?.[0]);
      if ([401, 403, 429].includes(status)) return false;
      return failureCount < 1;
    },
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Provide a fast UI fallback from Firebase while the backend user loads
  const derivedUser = useMemo(() => {
    if (user) return user as any;
    const fb = auth.currentUser;
    if (!fb) return null;
    return {
      id: fb.uid,
      email: fb.email || '',
      firstName: fb.displayName?.split(' ')[0] || undefined,
      lastName: fb.displayName?.split(' ').slice(1).join(' ') || undefined,
      role: 'client',
      language: 'en',
      isVerified: fb.emailVerified ?? true,
    } as any;
  }, [user]);

  // Debounced refetch after ID token changes to avoid bursts
  const stableRefetch = useCallback(() => {
    refetch();
  }, [refetch]);
  
  useEffect(() => {
    let timer: any;
    let lastTokenChange = 0;
    
    const unsub = auth.onIdTokenChanged(async (fbUser) => {
      const now = Date.now();
      const email = fbUser?.email || 'No user';
      
      // Avoid excessive logging and refetching
      if (now - lastTokenChange < 1000) {
        return;
      }
      lastTokenChange = now;
      
      console.log('ID token changed:', email);
      if (fbUser && firebaseReady) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          console.log('Refreshing user data after token change');
          stableRefetch();
        }, 500);
      }
    });
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, [stableRefetch, firebaseReady]);

  // Listen for claims-updated events from API calls
  useEffect(() => {
    const handleClaimsUpdated = () => {
      console.log('[useAuth] Claims updated event received, refreshing user data');
      stableRefetch();
    };
    
    window.addEventListener('auth-claims-updated', handleClaimsUpdated);
    return () => window.removeEventListener('auth-claims-updated', handleClaimsUpdated);
  }, [stableRefetch]);

  return {
    user: derivedUser,
    isLoading: !firebaseReady || isLoading,
    isAuthenticated: !!derivedUser,
  };
}