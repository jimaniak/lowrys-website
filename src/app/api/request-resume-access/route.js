//************ Creating a Comment to force a change ***************
// src/app/api/request-resume-access/route.js
import { NextResponse } from 'next/server';
import { 
  generateRequestId, 
  storeRequest, 
  sendSMS, 
  sendAuditEmail 
} from '@/lib/resumeAccessUtils';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, company, reason } = body;
    
    // Validate request
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate request ID
    const requestId = generateRequestId();
    
    // Store request
    try {
      storeRequest(requestId, { 
        name, 
        email, 
        company, 
        reason, 
        timestamp: new Date().toISOString() 
      });
    } catch (storeError) {
      console.error('Error storing request:', storeError);
      return NextResponse.json(
        { error: `Failed to store request: ${storeError.message}` },
        { status: 500 }
      );
    }
    
    // Send SMS notification with detailed error handling
    try {
      await sendSMS(
        `Resume Request from ${name} (${company || 'No company'}). Reply Y${requestId} to approve or N${requestId} to deny.`
      );
    } catch (smsError) {
      console.error('SMS sending error:', smsError);
      return NextResponse.json(
        { error: `Failed to send SMS notification: ${smsError.message}` },
        { status: 500 }
      );
    }
    
    // Send audit email
    try {
      await sendAuditEmail({
        name,
        email,
        company,
        reason,
        requestId
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Continue execution even if email fails
      // We don't return an error here since SMS is the primary notification
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing resume request:', error);
    return NextResponse.json(
      { error: `Failed to process request: ${error.message}` },
      { status: 500 }
    );
  }
}
