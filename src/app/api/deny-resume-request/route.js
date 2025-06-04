// src/app/api/deny-resume-request/route.js
import { NextResponse } from 'next/server';
import { admin } from '../../../lib/firebase-admin';

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
    
    // Update the request status in Firestore
    await admin.firestore().collection('resumeRequests').doc(id).update({
      status: 'denied',
      deniedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Get the request details
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
        const notificationMessage = {
          notification: {
            title: 'Resume Request Denied',
            body: `You denied the resume request from ${requestData.name} (${requestData.email})`
          },
          data: {
            requestId: id,
            name: requestData.name,
            email: requestData.email,
            status: 'denied',
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
    
    return NextResponse.json({ 
      success: true, 
      message: 'Resume request denied successfully',
      requestId: id
    });
  } catch (error) {
    console.error('Error denying resume request:', error);
    return NextResponse.json(
      { success: false, message: `Failed to deny request: ${error.message}` },
      { status: 500 }
    );
  }
}
