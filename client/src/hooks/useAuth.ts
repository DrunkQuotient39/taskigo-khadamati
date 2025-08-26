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
        
        // Make API request with detailed logging
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
            // For admin user, log more details
            if (isAdminEmail) {
              console.error('Admin authentication failed with 401. This may indicate the admin role is not properly set in the backend.');
            }
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
        
        // Log specific error details for debugging
        if (error instanceof Error) {
          console.error("Error name:", error.name);
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
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
        console.log('Firebase not ready yet for refresh, skipping');
        return null;
      }
      
      // Check if Firebase has a current user
      if (!auth.currentUser) {
        console.log('No current Firebase user for refresh');
        return null;
      }
      
      try {
        console.log('Refreshing user data with token for', auth.currentUser.email);
        let idToken;
        try {
          // Always force token refresh for refresh calls
          idToken = await auth.currentUser.getIdToken(true);
          console.log('Got fresh ID token for refresh, length:', idToken?.length);
        } catch (tokenError) {
          console.error('Error getting ID token for refresh:', tokenError);
          return null;
        }
        
        if (!idToken) {
          console.error('No ID token available for refresh');
          return null;
        }
        
        // Special handling for admin user
        const isAdminEmail = auth.currentUser.email?.toLowerCase() === 'taskigo.khadamati@gmail.com';
        if (isAdminEmail) {
          console.log('Making refresh API request for admin user');
        }
        
        // Add timestamp to URL to ensure we bust any cache
        const timestamp = new Date().getTime();
        const url = `/api/auth/me-firebase?_t=${timestamp}`;
        console.log('Making refresh API request to', url);
        
        const res = await fetch(url, {
          headers: { 
            Authorization: `Bearer ${idToken}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'X-Is-Admin-Email': isAdminEmail ? 'true' : 'false'
          },
          credentials: 'include',
          cache: 'no-store',
        });
        
        console.log('API refresh response status:', res.status);
        
        if (!res.ok) {
          if (res.status === 401) {
            console.log('Unauthorized (401) response from API during refresh');
            // For admin user, log more details
            if (isAdminEmail) {
              console.error('Admin refresh authentication failed with 401. This may indicate the admin role is not properly set.');
              
              // For admin users, we'll try to recover by logging the current token claims
              try {
                const decodedToken = JSON.parse(atob(idToken.split('.')[1]));
                console.log('Token payload for debugging:', decodedToken);
              } catch (e) {
                console.error('Could not decode token for debugging:', e);
              }
            }
            return null;
          }
          throw new Error(`API error during refresh: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('API refresh response data:', data);
        
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
        
        // Log specific error details for debugging
        if (error instanceof Error) {
          console.error("Refresh error name:", error.name);
          console.error("Refresh error message:", error.message);
          console.error("Refresh error stack:", error.stack);
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