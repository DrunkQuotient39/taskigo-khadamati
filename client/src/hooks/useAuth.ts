import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { auth } from "@/lib/firebase";

let authListenersAttached = false;

export function useAuth() {
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    if (authListenersAttached) return;
    authListenersAttached = true;

    console.log('Setting up auth state listener');
    const unsub = auth.onAuthStateChanged(async (fbUser) => {
      console.log('Auth state changed:', fbUser?.email || 'No user');
      setFirebaseReady(true);
      if (fbUser) {
        // Force refresh token when auth state changes
        try {
          await fbUser.getIdToken(true);
        } catch (error) {
          console.error('Error refreshing token:', error);
        }
      }
    });
    return () => {
      unsub();
      authListenersAttached = false;
    };
  }, []);

  const { data: user, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/me-firebase", firebaseReady],
    queryFn: async () => {
      if (!firebaseReady) {
        console.log('Firebase not ready yet, skipping auth check');
        return null;
      }
      
      // Check if Firebase has a current user
      if (!auth.currentUser) {
        console.log('No current Firebase user');
        return null;
      }
      
      try {
        console.log('Fetching user data with token for', auth.currentUser.email);
        let idToken;
        try {
          // Force a token refresh to ensure we have the latest claims
          idToken = await auth.currentUser.getIdToken(true);
          console.log('Got fresh ID token, length:', idToken?.length);
        } catch (tokenError) {
          console.error('Error getting ID token:', tokenError);
          // Try again with no force refresh
          idToken = await auth.currentUser.getIdToken(false);
          console.log('Got cached ID token instead, length:', idToken?.length);
        }
        
        if (!idToken) {
          console.error('No ID token available, cannot authenticate with API');
          return null;
        }
        
        // Special handling for admin user
        const isAdminEmail = auth.currentUser.email?.toLowerCase() === 'taskigo.khadamati@gmail.com';
        if (isAdminEmail) {
          console.log('Making API request for admin user');
        }
        
        // Make API request
        console.log('Making API request to /api/auth/me-firebase');
        const res = await fetch('/api/auth/me-firebase', {
          headers: { 
            Authorization: `Bearer ${idToken}`,
            'Cache-Control': 'no-cache',
            'X-Is-Admin-Email': isAdminEmail ? 'true' : 'false'
          },
          credentials: 'include',
        });
        
        console.log('API response status:', res.status);
        
        if (!res.ok) {
          if (res.status === 401) {
            console.log('Unauthorized (401) response from API');
            if (isAdminEmail) {
              console.error('Admin authentication failed with 401. This may indicate the admin role is not properly set in the backend.');
            }
            return null;
          }
          if (res.status === 429) {
            console.warn('Rate limited (429) on /me-firebase');
            return null;
          }
          throw new Error(`API error: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('API response:', data);
        
        if (data && data.user) {
          console.log('User data received:', data.user);
          return data.user;
        } else if (data && typeof data === 'object' && 'id' in data) {
          console.log('Direct user data received:', data);
          return data;
        } else {
          console.log('No user data in response:', data);
          return null;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        
        if (error instanceof Error) {
          console.error("Error name:", error.name);
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
        
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

  // Debounced refetch after ID token changes to avoid bursts
  useEffect(() => {
    let timer: any;
    const unsub = auth.onIdTokenChanged(async (fbUser) => {
      console.log('ID token changed:', fbUser?.email || 'No user');
      if (fbUser) {
        clearTimeout(timer);
        timer = setTimeout(() => {
          console.log('Refreshing user data after token change');
          refetch();
        }, 250);
      } else {
        console.log('No user after token change');
      }
    });
    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, [refetch]);

  return {
    user,
    isLoading: !firebaseReady || isLoading,
    isAuthenticated: !!user,
  };
}