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
    storeRequest(requestId, { 
      name, 
      email, 
      company, 
      reason, 
      timestamp: new Date().toISOString() 
    });
    
    // Send SMS notification
    await sendSMS(
      `Resume Request from ${name} (${company || 'No company'}). Reply Y${requestId} to approve or N${requestId} to deny.`
    );
    
    // Send audit email
    await sendAuditEmail({
      name,
      email,
      company,
      reason,
      requestId
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing resume request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
