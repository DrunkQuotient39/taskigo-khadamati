/**
 * Firebase Admin SDK Initialization Test
 * 
 * This script tests if Firebase Admin SDK can be properly initialized
 * using the credentials from config.env
 */

// Load environment variables from config.env
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import admin from 'firebase-admin';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, 'config.env') });

// Function to initialize Firebase Admin SDK
function initFirebase() {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    // Render/Firebase keys often use literal \n sequences; convert them to real newlines
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    console.log('Firebase Admin SDK initialization with:');
    console.log(`- Project ID: ${projectId}`);
    console.log(`- Client Email: ${clientEmail}`);
    console.log(`- Private Key: ${privateKey ? 'Present (first 20 chars): ' + privateKey.substring(0, 20) + '...' : 'Missing'}`);
    console.log(`- Storage Bucket: ${storageBucket}`);

    if (!projectId || !clientEmail || !privateKey) {
      console.error('Firebase Admin not configured. Missing required credentials.');
      return false;
    }

    // Initialize the app if not already initialized
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        }),
        storageBucket
      });
      console.log('✅ Firebase Admin SDK initialized successfully!');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    return false;
  }
}

// Test Firebase initialization
const initialized = initFirebase();

// Try to access Firestore if initialized
if (initialized) {
  try {
    const db = admin.firestore();
    console.log('✅ Firestore accessed successfully!');
    
    // Try to get a test document
    db.collection('test').doc('test').get()
      .then(doc => {
        console.log('✅ Firestore read operation successful!');
        if (doc.exists) {
          console.log('Document data:', doc.data());
        } else {
          console.log('No such document exists (this is normal for a test)');
        }
        process.exit(0);
      })
      .catch(err => {
        console.error('❌ Firestore read operation failed:', err);
        process.exit(1);
      });
  } catch (error) {
    console.error('❌ Firestore access error:', error);
    process.exit(1);
  }
} else {
  console.log('Firebase Admin SDK initialization failed. Please check your credentials.');
  process.exit(1);
} 