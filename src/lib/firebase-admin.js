// src/lib/firebase-admin.js
import * as admin from 'firebase-admin';

// Check if Firebase Admin is already initialized
if (!global.firebaseAdmin) {
  try {
    // Check if we have all required environment variables
    if (!process.env.FIREBASE_PROJECT_ID || 
        !process.env.FIREBASE_CLIENT_EMAIL || 
        !process.env.FIREBASE_PRIVATE_KEY) {
      // Optionally handle error in production
      // Initialize with a minimal config for development/build
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'lowrys-resume-access'
      });
    } else {
      // Get the Firebase Admin credentials from environment variables
      const serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || undefined,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID || undefined,
        auth_uri: 'https://accounts.google.com/o/oauth2/auth',
        token_uri: 'https://oauth2.googleapis.com/token',
        auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
        client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL || undefined
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    
    global.firebaseAdmin = admin;
    //
  } catch (error) {
    // Optionally handle error in production
  }
} else {
  //
}

// Create and export the Firestore database instance
const db = admin.firestore();

export { admin, db };
