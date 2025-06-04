// src/lib/resumeAccessUtils.js
import { admin } from './firebase-admin';
import nodemailer from 'nodemailer';

// Generate a unique request ID
export function generateRequestId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
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
      console.log('No FCM tokens found');
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
        click_action: 'OPEN_ADMIN_PANEL'
      }
    };
    
    // Send to all tokens
    const sendPromises = tokens.map(token => {
      return admin.messaging().sendToDevice(token, notificationMessage);
    });
    
    await Promise.all(sendPromises);
    console.log(`Notification sent to ${tokens.length} devices`);
  } catch (error) {
    console.error('Error sending notification:', error);
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
