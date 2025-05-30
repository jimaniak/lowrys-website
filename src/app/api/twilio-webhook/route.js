// src/app/api/twilio-webhook/route.js
import { NextResponse } from 'next/server';
import { 
  validateTwilioRequest, 
  getRequest, 
  generatePasscode, 
  storePasscode, 
  sendPasscodeEmail, 
  sendRejectionEmail, 
  sendSMS, 
  sendAuditEmail 
} from '@/lib/resumeAccessUtils';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const Body = formData.get('Body');
    const From = formData.get('From');
    
    // Validate the request is from Twilio
    const twilioSignature = request.headers.get('x-twilio-signature');
    const isValid = validateTwilioRequest(twilioSignature, { Body, From });
    
    if (!isValid) {
      return new Response(null, { status: 403 });
    }
    
    // Check if this is from your number
    if (From !== process.env.YOUR_PHONE_NUMBER) {
      return new Response(null, { status: 403 });
    }
    
    // Parse the response (Y123456 or N123456)
    const body = Body.trim();
    const action = body.charAt(0).toUpperCase();
    const requestId = body.substring(1);
    
    // Get the request details
    const request = getRequest(requestId);
    
    if (!request) {
      // Send error SMS
      await sendSMS("Invalid request ID. Please check and try again.");
      return new Response('<Response></Response>', {
        status: 200,
        headers: { 'Content-Type': 'text/xml' }
      });
    }
    
    if (action === 'Y') {
      // Approve: Generate passcode and send to requester
      const passcode = generatePasscode();
      storePasscode(passcode, request.email);
      
      // Send passcode to requester
      await sendPasscodeEmail(request.name, request.email, passcode);
      
      // Send confirmation SMS
      await sendSMS(`Resume access approved for ${request.name}. Passcode sent.`);
      
      // Send audit email
      await sendAuditEmail({
        ...request,
        requestId,
        action: 'approved',
        passcode
      });
    } else if (action === 'N') {
      // Deny: Send rejection email
      await sendRejectionEmail(request.name, request.email);
      
      // Send confirmation SMS
      await sendSMS(`Resume access denied for ${request.name}.`);
      
      // Send audit email
      await sendAuditEmail({
        ...request,
        requestId,
        action: 'denied'
      });
    } else {
      // Invalid action
      await sendSMS("Invalid response. Reply Y{requestId} to approve or N{requestId} to deny.");
    }
    
    // TwiML response
    return new Response('<Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' }
    });
  } catch (error) {
    console.error('Error processing Twilio webhook:', error);
    return new Response('<Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'text/xml' }
    });
  }
}
