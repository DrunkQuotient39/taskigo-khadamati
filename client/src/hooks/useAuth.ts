import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { auth } from "@/lib/firebase";

export function useAuth() {
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
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
    return () => unsub();
  }, []);

  const { data: user, isLoading } = useQuery({
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
        console.log('Fetching user data with token');
        const idToken = await auth.currentUser.getIdToken(true);
        const res = await fetch('/api/auth/me-firebase', {
          headers: { Authorization: `Bearer ${idToken}` },
          credentials: 'include',
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            console.log('Unauthorized (401) response from API');
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
          // Handle case where user data is directly in the response
          console.log('Direct user data received:', data);
          return data;
        } else {
          console.log('No user data in response:', data);
          return null;
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
      }
    },
    enabled: firebaseReady,
    retry: false,
    staleTime: 30000, // Cache for 30 seconds to reduce excessive requests
  });

  // Force refetch when auth state changes after initial ready
  const { refetch } = useQuery({
    queryKey: ["/api/auth/me-firebase-refresh", firebaseReady],
    queryFn: async () => {
      if (!firebaseReady) {
        console.log('Firebase not ready yet for refresh, skipping');
        return null;
      }
      
      // Check if Firebase has a current user
      if (!auth.currentUser) {
        console.log('No current Firebase user for refresh');
        return null;
      }
      
      try {
        console.log('Refreshing user data with token');
        const idToken = await auth.currentUser.getIdToken(true);
        const res = await fetch('/api/auth/me-firebase', {
          headers: { Authorization: `Bearer ${idToken}` },
          credentials: 'include',
          // Add cache-busting query parameter
          cache: 'no-store',
        });
        
        if (!res.ok) {
          if (res.status === 401) {
            console.log('Unauthorized (401) response from API during refresh');
            return null;
          }
          throw new Error(`API error during refresh: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('API refresh response:', data);
        
        if (data && data.user) {
          console.log('User data received from refresh:', data.user);
          return data.user;
        } else if (data && typeof data === 'object' && 'id' in data) {
          // Handle case where user data is directly in the response
          console.log('Direct user data received from refresh:', data);
          return data;
        } else {
          console.log('No user data in refresh response:', data);
          return null;
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);
        return null;
      }
    },
    enabled: firebaseReady,
    retry: false,
    staleTime: 0, // Don't cache refresh requests
  });

  // Force refetch when auth state changes
  useEffect(() => {
    const unsub = auth.onIdTokenChanged(async (fbUser) => {
      console.log('ID token changed:', fbUser?.email || 'No user');
      if (fbUser) {
        console.log('Refreshing user data after token change');
        await refetch();
      } else {
        console.log('No user after token change');
      }
    });
    return () => unsub();
  }, [refetch]);

  return {
    user,
    isLoading: !firebaseReady || isLoading,
    isAuthenticated: !!user,
  };
}