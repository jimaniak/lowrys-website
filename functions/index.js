/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https" );
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https" );
const {onDocumentCreated, onDocumentUpdated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");

admin.initializeApp();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.helloWorld = onRequest((request, response ) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

// Function to send email when resume access is approved
exports.sendResumeAccessEmail = onDocumentUpdated("resumeRequests/{docId}", async (event) => {
  // Get the document before and after the update
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();

  // Only proceed if status changed from pending to approved
  if (beforeData.status === "pending" && afterData.status === "approved") {
    const email = afterData.email;
    const passcode = afterData.passcode;

    // Create a transporter using GoDaddy SMTP
    const transporter = nodemailer.createTransport({
      host: "smtpout.secureserver.net",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER, // your GoDaddy email
        pass: process.env.EMAIL_PASS, // your GoDaddy password
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER, // sender address (your GoDaddy email)
      to: email, // recipient email
      subject: "Your Resume Access Request Has Been Approved", // Subject line
      text: `Your request to access Jim Lowry's resume has been approved. Use the following passcode to access the resume: ${passcode}`, // plain text body
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Resume Access Approved</h2>
          <p>Your request to access Jim Lowry's resume has been approved.</p>
          <p>Use the following passcode to access the resume:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 2px; margin: 20px 0;">
            <strong>${passcode}</strong>
          </div>
          <p>Thank you for your interest.</p>
          <p>Best regards,<br>Jim Lowry</p>
        </div>
      `, // html body
    };

    try {
      // Send email
      const info = await transporter.sendMail(mailOptions);
      logger.info("Email sent:", info.messageId);
      return {success: true, messageId: info.messageId};
    } catch (error) {
      logger.error("Error sending email:", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  } else {
    logger.info("No status change to approved, no email sent");
    return null;
  }
});

// NEW FUNCTION: Send FCM notification when a new resume request is created
exports.sendResumeRequestNotification = onDocumentCreated("resumeRequests/{docId}", async (event) => {
  const requestData = event.data.data();
  logger.info("New resume request received:", requestData);
  
  try {
    // Get the FCM tokens from your database
    const tokensSnapshot = await admin.firestore().collection('fcmTokens').get();
    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);
    
    if (tokens.length === 0) {
      logger.info('No FCM tokens found to send notifications to');
      return null;
    }
    
    // Send FCM notification
    const message = {
      notification: {
        title: 'New Resume Access Request',
        body: `New request from: ${requestData.email || 'Unknown'}`,
      },
      tokens: tokens,
    };
    
    const response = await admin.messaging().sendMulticast(message);
    logger.info('Successfully sent notifications:', response);
    return response;
  } catch (error) {
    logger.error('Error sending notifications:', error);
    throw error;
  }
});
