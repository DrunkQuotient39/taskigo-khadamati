import { initializeApp, type FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
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

// Configure auth persistence
auth.setPersistence('local')
  .then(() => {
    console.log('Firebase: Auth persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('Firebase: Error setting persistence:', error);
  });

export async function signInWithGoogle(): Promise<void> {
  try {
    console.log('Firebase: Attempting Google sign in');
    const provider = new GoogleAuthProvider();
    // Add scopes for better user data
    provider.addScope('email');
    provider.addScope('profile');
    
    // Set custom parameters for better UX
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const result = await signInWithPopup(auth, provider);
    console.log('Firebase: Google sign in successful', result.user.uid);
    
    // Force token refresh to ensure we have the latest token
    await result.user.getIdToken(true);
    console.log('Firebase: Token refreshed after Google sign in');
    
    return;
  } catch (error: any) {
    console.error('Firebase: Google sign in failed', error.code, error.message);
    throw error; // Re-throw to be handled by the caller
  }
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  try {
    console.log('Firebase: Attempting email sign in');
    
    // Special case for admin login
    if (email.toLowerCase() === 'taskigo.khadamati@gmail.com') {
      console.log('Firebase: Admin login attempt');
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Firebase: Email sign in successful', userCredential.user.uid);
    
    // Force token refresh to ensure we have the latest token
    await userCredential.user.getIdToken(true);
    console.log('Firebase: Token refreshed after email sign in');
    
    return;
  } catch (error: any) {
    console.error('Firebase: Email sign in failed', error.code, error.message);
    
    // Handle special case for admin account
    if (email.toLowerCase() === 'taskigo.khadamati@gmail.com') {
      console.error('Firebase: Admin login failed with code:', error.code);
    }
    
    // Provide more detailed error messages
    if (error.code === 'auth/invalid-credential') {
      console.error('Firebase: Invalid credentials provided');
    } else if (error.code === 'auth/user-not-found') {
      console.error('Firebase: User not found');
    } else if (error.code === 'auth/wrong-password') {
      console.error('Firebase: Wrong password');
    } else if (error.code === 'auth/invalid-email') {
      console.error('Firebase: Invalid email format');
    } else if (error.code === 'auth/user-disabled') {
      console.error('Firebase: User account has been disabled');
    } else if (error.code === 'auth/too-many-requests') {
      console.error('Firebase: Too many unsuccessful login attempts');
    }
    
    throw error; // Re-throw to be handled by the caller
  }
}

export async function signUpWithEmail(email: string, password: string): Promise<void> {
  try {
    console.log('Firebase: Attempting to create account for', email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('Firebase: Account created successfully for', email);
    
    // If this is the admin account, set custom claims via the backend
    if (email.toLowerCase() === 'taskigo.khadamati@gmail.com') {
      console.log('Firebase: Setting up admin account');
      
      // Get the token to authenticate with backend
      const idToken = await userCredential.user.getIdToken();
      
      // Call backend to set admin role
      try {
        const res = await fetch('/api/auth/setup-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ email })
        });
        
        if (res.ok) {
          console.log('Firebase: Admin role setup successful');
        } else {
          console.error('Firebase: Failed to set admin role via backend');
        }
      } catch (error) {
        console.error('Firebase: Error setting admin role:', error);
      }
    }
    
    // Force token refresh to ensure we have the latest token with any custom claims
    await userCredential.user.getIdToken(true);
  } catch (error: any) {
    console.error('Firebase: Sign up failed', error.code, error.message);
    throw error;
  }
}

export async function firebaseSignOut(): Promise<void> {
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  try {
    console.log('Firebase: Sending password reset email to:', email);
    await sendPasswordResetEmail(auth, email);
    console.log('Firebase: Password reset email sent successfully');
  } catch (error: any) {
    console.error('Firebase: Failed to send password reset email:', error.code, error.message);
    throw error;
  }
}

