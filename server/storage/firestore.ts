import admin from 'firebase-admin';

export function getFirestore() {
  if (admin.apps.length > 0) {
    return admin.firestore();
  }
  return null;
}

// Export the Firestore instance directly for convenience
export const firestore = getFirestore();


