// src/lib/firebase-client.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { 
  getMessaging, 
  getToken as getMessagingToken, 
  onMessage as onMessagingMessage,
  Messaging
} from 'firebase/messaging';

// Firebase configuration types
interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Your Firebase configuration - reuse existing config from resumeAccessUtils.js
const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
};

// Initialize Firebase
// Create a dummy app for server-side to avoid type errors
const dummyApp = {} as FirebaseApp;
const dummyDb = {} as Firestore;
const dummyMessaging = null as Messaging | null;

// Initialize Firebase safely (handling client-side only)
let app: FirebaseApp = dummyApp;
let db: Firestore = dummyDb;
let messaging: Messaging | null = dummyMessaging;

if (typeof window !== 'undefined') {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    
    // Initialize messaging only in browser environment
    try {
      messaging = getMessaging(app);
    } catch (error) {
      console.error('Firebase messaging initialization error:', error);
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

// Export with proper typing
export { 
  app, 
  db, 
  messaging, 
  getMessagingToken as getToken, 
  onMessagingMessage as onMessage 
};
