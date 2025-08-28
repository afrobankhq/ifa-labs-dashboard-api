import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Firebase Admin SDK
let app: admin.app.App;

try {
  // Check if Firebase is already initialized
  app = admin.app();
} catch (error) {
  // Initialize Firebase Admin SDK
  const serviceAccount = process.env['FIREBASE_SERVICE_ACCOUNT_KEY'];
  
  if (serviceAccount) {
    // Use service account key from environment variable
    const serviceAccountObj = JSON.parse(serviceAccount);
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountObj),
      databaseURL: process.env['FIREBASE_DATABASE_URL'],
      storageBucket: process.env['FIREBASE_STORAGE_BUCKET']
    });
  } else if (process.env['FIREBASE_PROJECT_ID']) {
    // Use default credentials (for production environments like Vercel)
    app = admin.initializeApp({
      projectId: process.env['FIREBASE_PROJECT_ID'],
      databaseURL: process.env['FIREBASE_DATABASE_URL'],
      storageBucket: process.env['FIREBASE_STORAGE_BUCKET']
    });
  } else {
    // Fallback for development
    app = admin.initializeApp({
      projectId: 'ifa-labs-dashboard-dev',
      databaseURL: 'https://ifa-labs-dashboard-dev.firebaseio.com',
      storageBucket: 'ifa-labs-dashboard-dev.appspot.com'
    });
  }
}

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Export the app instance
export { app };

// Firebase configuration object
export const firebaseConfig = {
  projectId: process.env['FIREBASE_PROJECT_ID'] || 'ifa-labs-dashboard-dev',
  databaseURL: process.env['FIREBASE_DATABASE_URL'] || 'https://ifa-labs-dashboard-dev.firebaseio.com',
  storageBucket: process.env['FIREBASE_STORAGE_BUCKET'] || 'ifa-labs-dashboard-dev.appspot.com',
  apiKey: process.env['FIREBASE_API_KEY'],
  authDomain: process.env['FIREBASE_AUTH_DOMAIN'],
  messagingSenderId: process.env['FIREBASE_MESSAGING_SENDER_ID'],
  appId: process.env['FIREBASE_APP_ID']
};

export default firebaseConfig;
