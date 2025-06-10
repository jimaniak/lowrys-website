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
    //
    
    const { name, email, company, message, requestResume, category = 'resume', reason } = body; // Added category with default
    //
    
    // Validate request
    if (!name || !email) {
      //
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
      //
      
      // Check for existing active, unexpired requests in the same category
      try {
        const now = new Date();
        const resumeRequestsRef = db.collection('resumeRequests');
        const existingRequests = await resumeRequestsRef
          .where('email', '==', email)
          .where('category', '==', category)
          .where('status', 'in', ['pending', 'approved'])
          .where('passcodeExpiresAt', '>', now)
          .get();

        if (!existingRequests.empty) {
          // Get the soonest expiring request
          let soonestDoc = null;
          let soonest = null;
          existingRequests.forEach(doc => {
            const data = doc.data();
            if (!soonest || (data.passcodeExpiresAt && data.passcodeExpiresAt.toDate() < soonest.passcodeExpiresAt.toDate())) {
              soonest = data;
              soonestDoc = doc;
            }
          });
          let expiresAt = soonest?.passcodeExpiresAt?.toDate();
          let remainingMs = expiresAt ? expiresAt - now : null;
          let remainingStr = remainingMs ? `${Math.floor(remainingMs/3600000)}h ${Math.floor((remainingMs%3600000)/60000)}m` : 'unknown';

          // If status is 'approved', resend passcode email
          if (soonest && soonest.status === 'approved') {
            try {
              if (soonest.email && soonest.passcode && soonestDoc && soonestDoc.id) {
                const { sendPasscodeEmail } = await import('@/lib/resumeAccessUtils');
                await sendPasscodeEmail(soonest.email, soonest.passcode, soonestDoc.id);
              }
            } catch (resendError) {
              // Optionally log resend error
            }
            return NextResponse.json(
              {
                success: false,
                message: `You already have an active request for ${getCategoryDisplayName(category)}. The passcode email has been resent. It will expire in ${remainingStr} (at ${expiresAt ? expiresAt.toLocaleString() : 'unknown'}).`,
                expiresAt: expiresAt,
                remaining: remainingStr,
                resent: true
              },
              { status: 400 }
            );
          } else {
            // If status is 'pending', inform user to wait for approval
            return NextResponse.json(
              {
                success: false,
                message: `You already have a pending request for ${getCategoryDisplayName(category)}. It is still awaiting approval and will expire in ${remainingStr} (at ${expiresAt ? expiresAt.toLocaleString() : 'unknown'}).`,
                expiresAt: expiresAt,
                remaining: remainingStr,
                resent: false
              },
              { status: 400 }
            );
          }
        }
      } catch (checkError) {
        // Optionally handle error in production
        // Continue with request creation even if check fails (fail open for better UX)
      }
      
      // Generate request ID
      const requestId = generateRequestId();
      //
      
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
        //
        
        await storeRequest(requestId, requestData);
        //
      } catch (storeError) {
        // Optionally handle error in production
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
        //
        
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