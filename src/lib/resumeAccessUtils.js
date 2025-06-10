// Send denial email to requester
export async function sendDenialEmail({ name, email, category, reason }) {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const resourceName = category ? (category.charAt(0).toUpperCase() + category.slice(1)) : 'Resource';
  const mailOptions = {
    from: `"${resourceName} Access System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `${resourceName} Access Request Denied`,
    text: `Dear ${name},\n\nYour request to access the ${resourceName.toLowerCase()} has been denied.${reason ? `\n\nReason: ${reason}` : ''}\n\nIf you have questions, please contact the site owner.`,
    html: `<h2>${resourceName} Access Request Denied</h2><p>Dear ${name},</p><p>Your request to access the <strong>${resourceName.toLowerCase()}</strong> has been <span style='color:red;'>denied</span>.</p>${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}<p>If you have questions, please contact the site owner.</p>`
  };
  await transporter.sendMail(mailOptions);
}
// src/lib/resumeAccessUtils.js
import { admin } from './firebase-admin';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Generate a unique request ID
export function generateRequestId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Generate a passcode for resume access
export function generatePasscode() {
  // Generate a 6-digit numeric passcode
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store request in Firestore instead of IndexedDB
export async function storeRequest(requestId, requestData) {
  // Save to Firestore resumeRequests collection
  await admin.firestore().collection('resumeRequests').doc(requestId).set({
    id: requestId,
    ...requestData,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });
  return requestId;
}

// Send FCM notification
export async function sendNotification(requestId, name, email, company, reason, message) {
  try {
    // Get all FCM tokens
    const tokensSnapshot = await admin.firestore().collection('fcmTokens').get();
    
    if (tokensSnapshot.empty) {
      //
      return;
    }
    
    const tokens = [];
    tokensSnapshot.forEach(doc => {
      tokens.push(doc.data().token);
    });
    
    // Create notification message
    const notificationMessage = {
      notification: {
        title: 'New Resume Request',
        body: `${name} (${email}) has requested access to your resume`
      },
      data: {
        requestId: requestId,
        name: name,
        email: email,
        company: company || 'Not specified',
        reason: reason || 'Not specified',
        message: message || 'No message provided',
        click_action: 'OPEN_ADMIN_PANEL',
        // Add action information as a string in the data payload
        // This will be used by the service worker to show action buttons
        showActions: 'true'
      }
    };
    
    // Send to each token individually
    const sendPromises = [];
    for (const token of tokens) {
      sendPromises.push(
        admin.messaging().send({
          token: token,
          notification: notificationMessage.notification,
          data: notificationMessage.data
        })
      );
    }
    
    const results = await Promise.all(sendPromises.map(p => p.catch(e => e)));
    
    // Count successes and failures
    const successes = results.filter(result => !(result instanceof Error));
    const failures = results.filter(result => result instanceof Error);
    
    //
    
    if (failures.length > 0) {
      // Optionally handle error in production
    }
  } catch (error) {
    // Optionally handle error in production
    throw error;
  }
}

// Send audit email
export async function sendAuditEmail(requestData) {
  const { name, email, company, reason, message, requestId } = requestData;
  
  // Create email transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
    },
    tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
    }
  });
  
  // Email content
  const mailOptions = {
    from: `"Resume Access System" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_ADMIN,
    subject: `[AUDIT] New Resume Request from ${name}`,
    text: `
      New resume access request:
      
      Request ID: ${requestId}
      Name: ${name}
      Email: ${email}
      Company: ${company || 'Not specified'}
      Reason: ${reason || 'Not specified'}
      Message: ${message || 'No message provided'}
      
      You can approve or deny this request from your admin panel.
    `,
    html: `
      <h2>New Resume Access Request</h2>
      <p><strong>Request ID:</strong> ${requestId}</p>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Company:</strong> ${company || 'Not specified'}</p>
      <p><strong>Reason:</strong> ${reason || 'Not specified'}</p>
      <p><strong>Message:</strong> ${message || 'No message provided'}</p>
      <p>You can approve or deny this request from your admin panel.</p>
    `
  };
  
  // Send email
  await transporter.sendMail(mailOptions);
}

// Send regular message email
export async function sendRegularMessage(messageData) {
  const { name, email, company, message } = messageData;
  
  // Create email transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
    },
    tls: {
    // Do not fail on invalid certs
    rejectUnauthorized: false
    }
  });

  
  // Email content
  const mailOptions = {
    from: `"Website Contact Form" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_ADMIN,
    subject: `New message from ${name}`,
    text: `
      New message from your website:
      
      Name: ${name}
      Email: ${email}
      Company: ${company || 'Not specified'}
      Message: ${message}
    `,
    html: `
      <h2>New Message from Website</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Company:</strong> ${company || 'Not specified'}</p>
      <p><strong>Message:</strong> ${message}</p>
    `
  };
  
  // Send email
  await transporter.sendMail(mailOptions);
}

// Send passcode email for resume access
export async function sendPasscodeEmail(email, passcode, requestId) {
  // Create email transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    }
  });
  
  // Email content
  const mailOptions = {
    from: `"Resume Access System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your Resume Access Passcode`,
    text: `
      Your passcode to access the resume is: ${passcode}
      
      This passcode will expire in 15 minutes.
      
      If you did not request access to the resume, please ignore this email.
    `,
    html: `
      <h2>Your Resume Access Passcode</h2>
      <p>Your passcode to access the resume is: <strong>${passcode}</strong></p>
      <p>This passcode will expire in 15 minutes.</p>
      <p>If you did not request access to the resume, please ignore this email.</p>
    `
  };
  
  // Send email
  await transporter.sendMail(mailOptions);
  
  // Store passcode in Firestore with expiration
  const expirationTime = new Date();
  expirationTime.setMinutes(expirationTime.getMinutes() + 15); // 15 minutes expiration
  
  await admin.firestore().collection('passcodes').doc(requestId).set({
    passcode,
    email,
    requestId,
    expiresAt: admin.firestore.Timestamp.fromDate(expirationTime),
    used: false
  });
}

// Validate passcode
export async function validatePasscode(requestId, passcode) {
  // Get passcode document from Firestore
  const passcodeDoc = await admin.firestore().collection('passcodes').doc(requestId).get();
  
  if (!passcodeDoc.exists) {
    return { valid: false, message: 'Invalid request ID' };
  }
  
  const passcodeData = passcodeDoc.data();
  
  // Check if passcode is expired
  const now = admin.firestore.Timestamp.now();
  if (passcodeData.expiresAt.seconds < now.seconds) {
    return { valid: false, message: 'Passcode has expired' };
  }
  
  // Check if passcode has been used
  if (passcodeData.used) {
    return { valid: false, message: 'Passcode has already been used' };
  }
  
  // Check if passcode matches
  if (passcodeData.passcode !== passcode) {
    return { valid: false, message: 'Invalid passcode' };
  }
  
  // Mark passcode as used
  await admin.firestore().collection('passcodes').doc(requestId).update({
    used: true,
    usedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  return { valid: true, message: 'Passcode validated successfully' };
}

// Handle resume request (placeholder for future use)
export async function handleResumeRequest(requestData) {
  // This function can be expanded in the future
  return await storeRequest(generateRequestId(), requestData);
}

// Handle message submission (placeholder for future use)
export async function handleMessageSubmission(messageData) {
  // This function can be expanded in the future
  return await sendRegularMessage(messageData);
}
