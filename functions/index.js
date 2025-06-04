/**
 * Firebase Cloud Function for sending emails when resume requests are approved
 */

const {onDocumentUpdated} = require('firebase-functions/v2/firestore');
const {initializeApp} = require('firebase-admin/app');
const {getFirestore} = require('firebase-admin/firestore');
const nodemailer = require('nodemailer');
const logger = require('firebase-functions/logger');

// Initialize Firebase
initializeApp();

// Create a transporter using GoDaddy SMTP
const transporter = nodemailer.createTransport({
  host: 'smtpout.secureserver.net',
  port: 465,
  secure: true, // use SSL
  auth: {
    user: process.env.EMAIL_USER || 'business@lowrys.org',
    pass: process.env.EMAIL_PASSWORD
  }
});

// Cloud Function triggered when a resumeRequest document is updated
exports.sendResumeAccessEmail = onDocumentUpdated('resumeRequests/{requestId}', async (event) => {
  const newData = event.data.after.data();
  const previousData = event.data.before.data();
  
  // Only send email when status changes from pending to approved
  if (previousData.status === 'pending' && newData.status === 'approved') {
    const { email, name, passcode } = newData;
    
    logger.info(`Sending resume access email to ${email}`, {
      requestId: event.params.requestId,
      name: name
    });
    
    const mailOptions = {
      from: `"Jim Lowry" <business@lowrys.org>`,
      to: email,
      subject: 'Resume Access Approved',
      text: `Hello ${name},\n\nYour request to access Jim Lowry's resume has been approved. Your access code is: ${passcode}\n\nRegards,\nJim Lowry`,
      html: `<p>Hello ${name},</p><p>Your request to access Jim Lowry's resume has been approved.</p><p>Your access code is: <strong>${passcode}</strong></p><p>Regards,<br>Jim Lowry</p>`
    };
    
    try {
      await transporter.sendMail(mailOptions);
      logger.info('Email sent successfully', {
        requestId: event.params.requestId,
        recipient: email
      });
      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      return false;
    }
  }
  
  return null;
});
