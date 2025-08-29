import admin from 'firebase-admin';

export function getFirestore() {
  try {
    if ((admin as any)?.apps && (admin as any).apps.length > 0) {
      return admin.firestore();
    }
  } catch {}
  return null as any;
}


