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

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, company, message, requestResume } = body; // Added requestResume flag
    
    // Validate request
    if (!name || !email) {
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
      // Generate request ID
      const requestId = generateRequestId();
      
      // Store request - now including the message field
      try {
        await storeRequest(requestId, { 
          name, 
          email, 
          company, 
          message, // Store the message content
          status: 'pending',
          timestamp: new Date().toISOString() 
        });
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
        await sendNotification(
          requestId,
          name,
          email,
          company || 'No company',
          null, // reason parameter
          message || 'No message provided'
        );
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
      
      // Send audit email - now including the message in the email
      try {
        await sendAuditEmail({
          name,
          email,
          company,
          reason: null,
          message,
          requestId
        });
      } catch (emailError) {
        console.error('Email sending error:', emailError);
        // Continue execution even if email fails
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Resume request submitted successfully',
        requestId: requestId
      });
    } 
    // If this is just a regular message (not a resume request)
    else {
      // Send regular message email
      try {
        await sendRegularMessage({
          name,
          email,
          company,
          message
        });
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
