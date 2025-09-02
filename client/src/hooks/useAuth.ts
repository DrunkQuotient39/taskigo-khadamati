import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { auth } from "@/lib/firebase";
import { api } from "@/lib/api";
const DEBUG = import.meta.env.VITE_DEBUG === 'true';

export function useAuth() {
  const [firebaseReady, setFirebaseReady] = useState(false);

  useEffect(() => {
    if (DEBUG) console.log('Setting up auth state listener');
    const unsub = auth.onAuthStateChanged(async (fbUser) => {
      if (DEBUG) console.log('Auth state changed:', fbUser?.email || 'No user');
      setFirebaseReady(true);
      if (fbUser) {
        // Force refresh token when auth state changes
        try {
          await fbUser.getIdToken(true);
        } catch (error) {
          if (DEBUG) console.error('Error refreshing token:', error);
        }
      }
    });
    return () => unsub();
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me-firebase", firebaseReady],
    queryFn: async () => {
      if (!firebaseReady) {
        if (DEBUG) console.log('Firebase not ready yet, skipping auth check');
        return null;
      }
      
      // Check if Firebase has a current user
      if (!auth.currentUser) {
        if (DEBUG) console.log('No current Firebase user');
        return null;
      }
      
      try {
        if (DEBUG) console.log('Fetching user data with token for', auth.currentUser.email);
        let idToken;
        try {
          // Force a token refresh to ensure we have the latest claims
          idToken = await auth.currentUser.getIdToken(true);
          if (DEBUG) console.log('Got fresh ID token, length:', idToken?.length);
        } catch (tokenError) {
          if (DEBUG) console.error('Error getting ID token:', tokenError);
          // Try again with no force refresh
          idToken = await auth.currentUser.getIdToken(false);
          if (DEBUG) console.log('Got cached ID token instead, length:', idToken?.length);
        }
        
        if (!idToken) {
          console.error('No ID token available, cannot authenticate with API');
          return null;
        }
        
        // Special handling for admin user
        const isAdminEmail = auth.currentUser.email?.toLowerCase() === 'taskigo.khadamati@gmail.com';
        if (isAdminEmail && DEBUG) console.log('Making API request for admin user');
        
        // Make API request with detailed logging
        if (DEBUG) console.log('Making API request to /api/auth/me-firebase');
        const response = await api.get('/api/auth/me-firebase', {
          headers: {
            'Cache-Control': 'no-cache',
            'X-Is-Admin-Email': isAdminEmail ? 'true' : 'false'
          }
        });
        
        if (DEBUG) console.log('API response:', response);
        
        if (response.actionHeader === 'claims-updated' && auth.currentUser) {
          if (DEBUG) console.log('Claims updated header detected, refreshing ID token');
          try { await auth.currentUser.getIdToken(true); } catch (e) { if (DEBUG) console.error('ID token refresh failed', e); }
        }
        
        if (response.data && response.data.user) {
          if (DEBUG) console.log('User data received:', response.data.user);
          return response.data.user;
        } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
          // Handle case where user data is directly in the response
          if (DEBUG) console.log('Direct user data received:', response.data);
          return response.data;
        } else {
          if (DEBUG) console.log('No user data in response:', response.data);
          return null;
        }
      } catch (error) {
        if (DEBUG) console.error("Error fetching user data:", error);
        
        // Log specific error details for debugging
        if (error instanceof Error) {
          if (DEBUG) console.error("Error name:", error.name);
          if (DEBUG) console.error("Error message:", error.message);
          if (DEBUG) console.error("Error stack:", error.stack);
        }
        
        return null;
      }
    },
    enabled: firebaseReady,
    retry: 2, // Try up to 3 times (initial + 2 retries)
    retryDelay: 1000, // Wait 1 second between retries
    staleTime: 30000, // Cache for 30 seconds to reduce excessive requests
  });

  // Force refetch when auth state changes after initial ready
  const { refetch } = useQuery({
    queryKey: ["/api/auth/me-firebase-refresh", firebaseReady],
    queryFn: async () => {
      if (!firebaseReady) {
        if (DEBUG) console.log('Firebase not ready yet for refresh, skipping');
        return null;
      }
      
      // Check if Firebase has a current user
      if (!auth.currentUser) {
        if (DEBUG) console.log('No current Firebase user for refresh');
        return null;
      }
      
      try {
        if (DEBUG) console.log('Refreshing user data with token for', auth.currentUser.email);
        let idToken;
        try {
          // Always force token refresh for refresh calls
          idToken = await auth.currentUser.getIdToken(true);
          if (DEBUG) console.log('Got fresh ID token for refresh, length:', idToken?.length);
        } catch (tokenError) {
          if (DEBUG) console.error('Error getting ID token for refresh:', tokenError);
          return null;
        }
        
        if (!idToken) {
          console.error('No ID token available for refresh');
          return null;
        }
        
        // Special handling for admin user
        const isAdminEmail = auth.currentUser.email?.toLowerCase() === 'taskigo.khadamati@gmail.com';
        if (isAdminEmail && DEBUG) console.log('Making refresh API request for admin user');
        
        // Add timestamp to URL to ensure we bust any cache
        const timestamp = new Date().getTime();
        const url = `/api/auth/me-firebase?_t=${timestamp}`;
        if (DEBUG) console.log('Making refresh API request to', url);
        
        const response = await api.get(url, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'X-Is-Admin-Email': isAdminEmail ? 'true' : 'false'
          }
        });
        
        if (DEBUG) console.log('API refresh response:', response);
        
        if (response.actionHeader === 'claims-updated' && auth.currentUser) {
          if (DEBUG) console.log('Claims updated header detected (refresh), refreshing ID token');
          try { await auth.currentUser.getIdToken(true); } catch (e) { if (DEBUG) console.error('ID token refresh failed (refresh)', e); }
        }
        
        // For admin users, log token claims for debugging
        if (isAdminEmail && !response.data) {
          try {
            const decodedToken = JSON.parse(atob(idToken.split('.')[1]));
            if (DEBUG) console.log('Token payload for debugging:', decodedToken);
          } catch (e) {
            if (DEBUG) console.error('Could not decode token for debugging:', e);
          }
        }
        
        if (response.data && response.data.user) {
          if (DEBUG) console.log('User data received from refresh:', response.data.user);
          return response.data.user;
        } else if (response.data && typeof response.data === 'object' && 'id' in response.data) {
          // Handle case where user data is directly in the response
          if (DEBUG) console.log('Direct user data received from refresh:', response.data);
          return response.data;
        } else {
          if (DEBUG) console.log('No user data in refresh response:', response.data);
          return null;
        }
      } catch (error) {
        if (DEBUG) console.error("Error refreshing user data:", error);
        
        // Log specific error details for debugging
        if (error instanceof Error) {
          if (DEBUG) console.error("Refresh error name:", error.name);
          if (DEBUG) console.error("Refresh error message:", error.message);
          if (DEBUG) console.error("Refresh error stack:", error.stack);
        }
        
        return null;
      }
    },
    enabled: firebaseReady,
    retry: 1, // Try up to 2 times (initial + 1 retry)
    retryDelay: 1000, // Wait 1 second between retries
    staleTime: 0, // Don't cache refresh requests
  });

  // Force refetch when auth state changes
  useEffect(() => {
    const unsub = auth.onIdTokenChanged(async (fbUser) => {
      if (DEBUG) console.log('ID token changed:', fbUser?.email || 'No user');
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