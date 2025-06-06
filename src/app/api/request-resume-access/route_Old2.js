// src/app/api/request-resume-access/route.js
import { NextResponse } from 'next/server';
import { db } from '../../../lib/firebase-admin';
import { generatePasscode, sendNotification } from '../../../lib/resumeAccessUtils';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, company, message, reason, requestResume, category = 'resume' } = body;
    
    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    // If this is a resume request, validate additional fields
    if (requestResume) {
      if (!company) {
        return NextResponse.json(
          { success: false, message: 'Company is required for resource requests' },
          { status: 400 }
        );
      }
      
      if (!reason) {
        return NextResponse.json(
          { success: false, message: 'Reason is required for resource requests' },
          { status: 400 }
        );
      }
      
      // Check if user already has an active request for this category
      const existingRequestsSnapshot = await db.collection('resumeRequests')
        .where('email', '==', email)
        .where('category', '==', category)
        .where('status', 'in', ['pending', 'approved'])
        .get();
      
      if (!existingRequestsSnapshot.empty) {
        // User already has an active request for this category
        return NextResponse.json(
          { 
            success: false, 
            message: `You already have an active request for this resource category (${category}). Please wait for approval or check your email for the access code.` 
          },
          { status: 400 }
        );
      }
      
      // Create a new resume request document
      const requestData = {
        name,
        email,
        company,
        message: message || '',
        reason,
        status: 'pending',
        createdAt: new Date(),
        category: category // Store the category
      };
      
      // Add to Firestore
      const docRef = await db.collection('resumeRequests').add(requestData);
      
      // Send notification to admin
      try {
        await sendNotification({
          title: `New ${category} Access Request`,
          body: `${name} from ${company} has requested access to your ${category}`,
          data: {
            requestId: docRef.id,
            name,
            email,
            company,
            category,
            status: 'pending',
            click_action: 'OPEN_ADMIN_PANEL'
          }
        });
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
        // Continue even if notification fails
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Your ${category} access request has been submitted successfully`,
        requestId: docRef.id
      });
    } else {
      // This is just a regular message, not a resume request
      // Store in Firestore for record-keeping
      const messageData = {
        name,
        email,
        message: message || '',
        createdAt: new Date()
      };
      
      await db.collection('messages').add(messageData);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Your message has been sent successfully' 
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { success: false, message: `Failed to process request: ${error.message}` },
      { status: 500 }
    );
  }
}
