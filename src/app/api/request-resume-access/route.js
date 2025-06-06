// src/app/api/request-resume-access/route.js

import { NextResponse } from 'next/server';
import { 
  generateRequestId,
  storeRequest,
  sendNotification,
  sendAuditEmail,
  sendRegularMessage,
  handleResumeRequest,
  handleMessageSubmission
} from '@/lib/resumeAccessUtils';
import { db } from '@/lib/firebase-admin';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Received form submission:', body); // Debug log
    
    const { name, email, company, message, requestResume, category = 'resume', reason } = body; // Added category with default
    console.log('Extracted form data:', { name, email, company, message, requestResume, category }); // Debug log
    
    // Validate request
    if (!name || !email) {
      console.log('Missing required fields:', { name, email }); // Debug log
      return NextResponse.json(
        { 
          success: false,
          message: 'Missing required fields'
        },
        { status: 400 }
      );
    }
    
    // If this is a resume request
    if (requestResume) {
      console.log(`Processing ${category} request for:`, email); // Debug log
      
      // Check for existing active requests in the same category
      try {
        const resumeRequestsRef = db.collection('resumeRequests');
        const existingRequests = await resumeRequestsRef
          .where('email', '==', email)
          .where('category', '==', category)
          .where('status', 'in', ['pending', 'approved'])
          .get();
        
        if (!existingRequests.empty) {
          console.log(`User ${email} already has an active request for category: ${category}`);
          return NextResponse.json(
            { 
              success: false,
              message: `You already have an active request for ${getCategoryDisplayName(category)}. Please wait for approval or use your existing access code.`
            },
            { status: 400 }
          );
        }
        
        console.log('No duplicate requests found, proceeding with new request');
      } catch (checkError) {
        console.error('Error checking for existing requests:', checkError);
        // Continue with request creation even if check fails (fail open for better UX)
      }
      
      // Generate request ID
      const requestId = generateRequestId();
      console.log('Generated request ID:', requestId); // Debug log
      
      // Store request - now including the message field and category
      try {
        const requestData = { 
          name, 
          email, 
          company, 
          message, // Store the message content
          reason, // Store the reason if provided
          category, // Store the category
          status: 'pending',
          timestamp: new Date().toISOString() 
        };
        console.log('Storing request with ID:', requestId, 'with data:', requestData); // Debug log
        
        await storeRequest(requestId, requestData);
        console.log('Request stored successfully in Firestore'); // Debug log
      } catch (storeError) {
        console.error('Error storing request:', storeError);
        return NextResponse.json(
          { 
            success: false,
            message: `Failed to store request: ${storeError.message}`
          },
          { status: 500 }
        );
      }
      
      // Send FCM notification with detailed error handling
      try {
        console.log('Sending FCM notification for request:', requestId); // Debug log
        
        await sendNotification(
          requestId,
          name,
          email,
          company || 'No company',
          reason || null, // reason parameter
          message || 'No message provided',
          category // Add category to notification
        );
        
        console.log('FCM notification sent successfully'); // Debug log
      } catch (notificationError) {
        console.error('Notification sending error:', notificationError);
        return NextResponse.json(
          { 
            success: false,
            message: `Failed to send notification: ${notificationError.message}`
          },
          { status: 500 }
        );
      }
      
      // Send audit email - now including the message and category in the email
      try {
        console.log('Sending audit email for request:', requestId); // Debug log
        
        await sendAuditEmail({
          name,
          email,
          company,
          reason: reason || null,
          message,
          requestId,
          category // Add category to audit email
        });
        
        console.log('Audit email sent successfully'); // Debug log
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Continue execution even if email fails
      }
      
      console.log(`${category} request processed successfully:`, requestId); // Debug log
      
      return NextResponse.json({ 
        success: true, 
        message: `${getCategoryDisplayName(category)} request submitted successfully`,
        requestId: requestId,
        category: category
      });
    } 
    // If this is just a regular message (not a resume request)
    else {
      console.log('Processing regular message from:', email); // Debug log
      
      // Send regular message email
      try {
        console.log('Sending regular message email'); // Debug log
        
        await sendRegularMessage({
          name,
          email,
          company,
          message
        });
        
        console.log('Regular message email sent successfully'); // Debug log
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        return NextResponse.json(
          { 
            success: false,
            message: `Failed to send message: ${emailError.message}`
          },
          { status: 500 }
        );
      }
      
      console.log('Regular message processed successfully'); // Debug log
      
      return NextResponse.json({ 
        success: true, 
        message: 'Message sent successfully'
      });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { 
        success: false,
        message: `Failed to process request: ${error.message}`
      },
      { status: 500 }
    );
  }
}

// Helper function to get a display name for a category
function getCategoryDisplayName(category) {
  const displayNames = {
    'resume': 'Resume',
    'free_item': 'Free item',
    'portfolio': 'Portfolio'
  };
  
  return displayNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
}