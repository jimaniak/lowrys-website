// src/lib/resumeAccessUtils.js
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection } from 'firebase/firestore';
import { admin } from './firebase-admin';

// Your Firebase configuration - store these in environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
let app;
let db;

// Initialize Firebase safely (handling server-side rendering)
try {
  // Check if Firebase is already initialized
  if (!global._firebaseInitialized) {
    app = initializeApp(firebaseConfig);
    global._firebaseInitialized = true;
  } else {
    app = global._firebaseApp;
  }
  
  db = getFirestore(app);
  global._firebaseApp = app;
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Generate a unique request ID
export function generateRequestId() {
  return uuidv4().substring(0, 8);
}

// Store request in Firebase
export async function storeRequest(requestId, data) {
  try {
    await setDoc(doc(db, "resumeRequests", requestId), {
      ...data,
      createdAt: new Date().toISOString()
    });
    console.log(`Stored request ${requestId} in Firebase`);
    return true;
  } catch (error) {
    console.error('Error storing request in Firebase:', error);
    throw error;
  }
}

// Retrieve request from Firebase
export async function getRequest(requestId) {
  try {
    const docRef = doc(db, "resumeRequests", requestId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error retrieving request from Firebase:', error);
    return null;
  }
}

// Send notification via Firebase Cloud Messaging
export async function sendNotification(requestId, name, email, company, reason) {
  try {
    // Get the admin FCM token from Firestore
    const tokenDoc = await admin.firestore().collection('fcmTokens').doc('admin').get();
    if (!tokenDoc.exists) {
      console.error('No admin FCM token found');
      return false;
    }
    
    const token = tokenDoc.data().token;
    
    // Send the notification via Firebase Cloud Messaging
    const message = {
      notification: {
        title: 'New Resume Access Request',
        body: `${name} from ${company} has requested access to your resume.`
      },
      data: {
        requestId: requestId,
        name: name,
        email: email,
        company: company,
        reason: reason,
        click_action: 'OPEN_ADMIN_PAGE'
      },
      token: token
    };
    
    // Send via Firebase Admin SDK
    const response = await admin.messaging().send(message);
    console.log('Successfully sent notification:', response);
    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

// Send audit email
export async function sendAuditEmail({ name, email, company, reason, requestId }) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: `Resume Request: ${name} (${company})`,
    text: `
Resume Access Request

Name: ${name}
Email: ${email}
Company: ${company}
Reason: ${reason}

Request ID: ${requestId}

Visit the admin page to approve or deny this request: ${process.env.SITE_URL}/admin
    `,
    html: `
<h2>Resume Access Request</h2>

<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Company:</strong> ${company}</p>
<p><strong>Reason:</strong> ${reason}</p>

<p><strong>Request ID:</strong> ${requestId}</p>

<p>Visit the <a href="${process.env.SITE_URL}/admin">admin page</a> to approve or deny this request.</p>
    `
  });
}

// Generate a passcode
export function generatePasscode() {
  return crypto.randomInt(100000, 999999).toString();
}

// Store passcode in Firebase
export async function storePasscode(email, passcode) {
  try {
    // Use email as document ID (after sanitizing)
    const docId = email.replace(/[.#$[\]]/g, '_');
    
    await setDoc(doc(db, "resumePasscodes", docId), {
      email,
      passcode,
      timestamp: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error storing passcode in Firebase:', error);
    throw error;
  }
}

// Validate passcode from Firebase
export async function validatePasscode(email, passcode) {
  try {
    // Use email as document ID (after sanitizing)
    const docId = email.replace(/[.#$[\]]/g, '_');
    const docRef = doc(db, "resumePasscodes", docId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return false;
    }
    
    const storedData = docSnap.data();
    
    // Check if passcode matches
    if (storedData.passcode !== passcode) {
      return false;
    }
    
    // Check if passcode is expired (24 hours)
    const storedTime = new Date(storedData.timestamp);
    const currentTime = new Date();
    const diffHours = (currentTime - storedTime) / (1000 * 60 * 60);
    
    if (diffHours > 24) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error validating passcode from Firebase:', error);
    return false;
  }
}

// Send passcode email
export async function sendPasscodeEmail(email, passcode) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Your Resume Access Passcode',
    text: `
Your resume access request has been approved!

Your passcode is: ${passcode}

This passcode will expire in 24 hours.

Visit ${process.env.SITE_URL}/resume and enter this passcode to access the resume.
    `,
    html: `
<h2>Your resume access request has been approved!</h2>

<p>Your passcode is: <strong>${passcode}</strong></p>

<p>This passcode will expire in 24 hours.</p>

<p>Visit <a href="${process.env.SITE_URL}/resume">${process.env.SITE_URL}/resume</a> and enter this passcode to access the resume.</p>
    `
  });
}

// Handle resume request - main function that orchestrates the process
export async function handleResumeRequest(name, email, company, reason) {
  try {
    const requestId = generateRequestId();
    
    // Store the request in Firestore
    await storeRequest(requestId, {
      name,
      email,
      company,
      reason,
      status: 'pending',
      timestamp: new Date().toISOString()
    });
    
    // Send FCM notification instead of SMS
    await sendNotification(requestId, name, email, company, reason);
    
    // Still send the audit email
    await sendAuditEmail({ name, email, company, reason, requestId });
    
    return { success: true, message: 'Resume request submitted successfully' };
  } catch (error) {
    console.error('Error handling resume request:', error);
    return { success: false, message: 'Error submitting resume request' };
  }
}
