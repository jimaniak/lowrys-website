// src/app/api/approve-resume-request/route.js
import { NextResponse } from 'next/server';
import { admin } from '../../../lib/firebase-admin';
import nodemailer from 'nodemailer';
import { generatePasscode } from '../../../lib/resumeAccessUtils';

export async function GET(request) {
  try {
    // Get the request ID from the URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Request ID is required' },
        { status: 400 }
      );
    }
    
    // Generate a passcode
    const passcode = generatePasscode();
    
    // Update the request status in Firestore and store the passcode in the same document
    await admin.firestore().collection('resumeRequests').doc(id).update({
      status: 'approved',
      approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      passcode: passcode,
      passcodeExpiresAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      )
    });
    
    // Get the request details to send a confirmation email
    const requestDoc = await admin.firestore().collection('resumeRequests').doc(id).get();
    
    if (!requestDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Request not found' },
        { status: 404 }
      );
    }
    
    const requestData = requestDoc.data();
    
    // Send a confirmation notification to the admin (without using 'actions' field)
    try {
      // Get all FCM tokens
      const tokensSnapshot = await admin.firestore().collection('fcmTokens').get();
      
      if (!tokensSnapshot.empty) {
        const tokens = [];
        tokensSnapshot.forEach(doc => {
          tokens.push(doc.data().token);
        });
        
        // Create a simple notification without the problematic 'actions' field
        // Add isConfirmation flag to indicate this is a confirmation notification
        const notificationMessage = {
          notification: {
            title: 'Resume Request Approved',
            body: `You approved the resume request from ${requestData.name} (${requestData.email})`
          },
          data: {
            requestId: id,
            name: requestData.name,
            email: requestData.email,
            status: 'approved',
            isConfirmation: 'true', // Add this flag to indicate it's a confirmation
            click_action: 'OPEN_ADMIN_PANEL'
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
        
        await Promise.all(sendPromises.map(p => p.catch(e => {
          console.error('Error sending confirmation notification:', e);
          return null;
        })));
      }
    } catch (notificationError) {
      console.error('Error sending confirmation notification:', notificationError);
      // Continue even if notification fails - the status update is more important
    }
    
    // Send passcode email to the requester
    try {
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
        to: requestData.email,
        subject: `Your Resume Access Passcode`,
        text: `
          Your passcode to access the resume is: ${passcode}
          
          This passcode will expire in 24 hours.
          
          If you did not request access to the resume, please ignore this email.
        `,
        html: `
          <h2>Your Resume Access Passcode</h2>
          <p>Your passcode to access the resume is: <strong>${passcode}</strong></p>
          <p>This passcode will expire in 24 hours.</p>
          <p>If you did not request access to the resume, please ignore this email.</p>
        `
      };
      
      // Send email
      await transporter.sendMail(mailOptions);
      
      console.log(`Passcode ${passcode} sent to ${requestData.email}`);
    } catch (emailError) {
      console.error('Error sending passcode email:', emailError);
      // Log the error to Firestore for debugging
      try {
        await admin.firestore().collection('fcmErrors').add({
          type: 'passcode_email_error',
          error: emailError.toString(),
          stack: emailError.stack,
          requestId: id,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (logError) {
        console.error('Error logging to Firestore:', logError);
      }
      
      // Continue even if email fails - the status update is more important
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Resume request approved successfully',
      requestId: id
    });
  } catch (error) {
    console.error('Error approving resume request:', error);
    return NextResponse.json(
      { success: false, message: `Failed to approve request: ${error.message}` },
      { status: 500 }
    );
  }
}
