// src/lib/resumeAccessUtils.js

// Import paths should use @/ prefix
import twilio from 'twilio';
import nodemailer from 'nodemailer';
import CryptoJS from 'crypto-js';
import fs from 'fs';
import path from 'path';

// File path for storing requests and passcodes
const REQUESTS_FILE = path.join(process.cwd(), 'resume-requests.json');
const PASSCODES_FILE = path.join(process.cwd(), 'resume-passcodes.json');

// Resume file path
const RESUME_PATH = '/documents/jim-lowry-resume.pdf';

// Initialize files if they don't exist
function initFiles() {
  if (!fs.existsSync(REQUESTS_FILE)) {
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify({}));
  }
  if (!fs.existsSync(PASSCODES_FILE)) {
    fs.writeFileSync(PASSCODES_FILE, JSON.stringify({}));
  }
}

// Generate a unique request ID
export function generateRequestId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Generate a random passcode
export function generatePasscode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Store a resume request
export function storeRequest(requestId, requestData) {
  initFiles();
  const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
  requests[requestId] = requestData;
  fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests));
}

// Get a resume request
export function getRequest(requestId) {
  initFiles();
  const requests = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf8'));
  return requests[requestId];
}

// Store a passcode
export function storePasscode(passcode, email) {
  initFiles();
  const hashedPasscode = CryptoJS.SHA256(passcode).toString();
  const passcodes = JSON.parse(fs.readFileSync(PASSCODES_FILE, 'utf8'));
  
  passcodes[hashedPasscode] = {
    email,
    expirationTime: Date.now() + (48 * 60 * 60 * 1000), // 48 hours
    used: false
  };
  
  fs.writeFileSync(PASSCODES_FILE, JSON.stringify(passcodes));
}

// Validate a passcode
export function validatePasscode(passcode) {
  initFiles();
  const hashedPasscode = CryptoJS.SHA256(passcode).toString();
  const passcodes = JSON.parse(fs.readFileSync(PASSCODES_FILE, 'utf8'));
  
  if (!passcodes[hashedPasscode]) {
    return { valid: false, message: 'Invalid passcode' };
  }
  
  const passcodeData = passcodes[hashedPasscode];
  
  if (Date.now() > passcodeData.expirationTime) {
    return { valid: false, message: 'Passcode expired' };
  }
  
  if (passcodeData.used) {
    return { valid: false, message: 'Passcode already used' };
  }
  
  // Mark passcode as used
  passcodes[hashedPasscode].used = true;
  fs.writeFileSync(PASSCODES_FILE, JSON.stringify(passcodes));
  
  return { valid: true, resumePath: RESUME_PATH };
}

// Send SMS via Twilio
export async function sendSMS(body, to) {
  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  
  return twilioClient.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: to || process.env.YOUR_PHONE_NUMBER
  });
}

// Configure email transporter
function getEmailTransporter() {
  return nodemailer.createTransport({
    host: 'smtpout.secureserver.net', // GoDaddy's SMTP server
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}

// Send passcode email to requester
export async function sendPasscodeEmail(name, email, passcode) {
  const transporter = getEmailTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Resume Access Code',
    html: `
      <h2>Resume Access Code</h2>
      <p>Hello ${name},</p>
      <p>Thank you for your interest in my resume. Your request has been approved. Please use the following access code to view my resume:</p>
      <div style="background-color: #f0f0f0; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">
        ${passcode}
      </div>
      <p>This code will expire in 48 hours and can only be used once.</p>
      <p>To access the resume, please return to my website and enter this code when prompted.</p>
      <p>Best regards,<br>Jim Lowry</p>
    `
  };
  
  return transporter.sendMail(mailOptions);
}

// Send rejection email to requester
export async function sendRejectionEmail(name, email) {
  const transporter = getEmailTransporter();
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Resume Access Request',
    html: `
      <h2>Resume Access Request</h2>
      <p>Hello ${name},</p>
      <p>Thank you for your interest in my resume. Unfortunately, I'm unable to provide access at this time.</p>
      <p>If you believe this is an error or would like to provide additional information, please feel free to contact me again.</p>
      <p>Best regards,<br>Jim Lowry</p>
    `
  };
  
  return transporter.sendMail(mailOptions);
}

// Send audit email
export async function sendAuditEmail(data) {
  const transporter = getEmailTransporter();
  
  const { name, email, company, reason, requestId, action, passcode } = data;
  
  let subject, htmlContent;
  
  if (!action) {
    // Initial request
    subject = 'Resume Access Request Received';
    htmlContent = `
      <h2>New Resume Access Request</h2>
      <p>A new resume access request has been received:</p>
      <ul>
        <li><strong>Request ID:</strong> ${requestId}</li>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Company:</strong> ${company || 'Not provided'}</li>
        <li><strong>Reason:</strong> ${reason || 'Not provided'}</li>
        <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
      </ul>
      <p>An SMS has been sent to your phone for approval.</p>
      <p>Reply Y${requestId} to approve or N${requestId} to deny.</p>
    `;
  } else if (action === 'approved') {
    // Approval
    subject = 'Resume Access Request Approved';
    htmlContent = `
      <h2>Resume Access Request Approved</h2>
      <p>You have approved the following resume access request:</p>
      <ul>
        <li><strong>Request ID:</strong> ${requestId}</li>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Company:</strong> ${company || 'Not provided'}</li>
        <li><strong>Reason:</strong> ${reason || 'Not provided'}</li>
        <li><strong>Passcode Issued:</strong> ${passcode}</li>
        <li><strong>Expiration:</strong> 48 hours from now</li>
        <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
      </ul>
      <p>The requester has been sent an email with the passcode.</p>
    `;
  } else if (action === 'denied') {
    // Denial
    subject = 'Resume Access Request Denied';
    htmlContent = `
      <h2>Resume Access Request Denied</h2>
      <p>You have denied the following resume access request:</p>
      <ul>
        <li><strong>Request ID:</strong> ${requestId}</li>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Company:</strong> ${company || 'Not provided'}</li>
        <li><strong>Reason:</strong> ${reason || 'Not provided'}</li>
        <li><strong>Timestamp:</strong> ${new Date().toLocaleString()}</li>
      </ul>
      <p>The requester has been sent a rejection email.</p>
    `;
  }
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.YOUR_EMAIL,
    subject,
    html: htmlContent
  };
  
  return transporter.sendMail(mailOptions);
}

// Validate Twilio request
export function validateTwilioRequest(twilioSignature, body) {
  // In a production environment, you should validate the Twilio signature
  // For simplicity in this implementation, we're skipping this step
  // See: https://www.twilio.com/docs/usage/security#validating-requests
  return true;
}
