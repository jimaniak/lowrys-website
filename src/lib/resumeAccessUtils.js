// src/lib/resumeAccessUtils.js
import twilio from 'twilio';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection } from 'firebase/firestore';

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

// Send SMS via Twilio
export async function sendSMS(body, to) {
  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  
  return twilioClient.messages.create({
    body,
    messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
    to: to || process.env.YOUR_PHONE_NUMBER
  });
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

To approve, reply to the SMS with Y${requestId}
To deny, reply with N${requestId}
    `,
    html: `
<h2>Resume Access Request</h2>

<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Company:</strong> ${company}</p>
<p><strong>Reason:</strong> ${reason}</p>

<p><strong>Request ID:</strong> ${requestId}</p>

<p>To approve, reply to the SMS with Y${requestId}<br>
To deny, reply with N${requestId}</p>
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
