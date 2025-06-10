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
    // Always normalize email to lowercase for duplicate checks and storage
    const { name, company, message, requestResume, category = 'resume', reason } = body;
    const email = body.email ? body.email.toLowerCase() : '';
    // DEBUG: Log start of duplicate check
    console.log(`[DEBUG] Checking for active requests for email=${email}, category=${category}`);

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
      //
      
      // Check for existing active, unexpired requests in the same category
      try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const resumeRequestsRef = db.collection('resumeRequests');
        // Get all pending/approved requests for this email/category
        const existingRequestsSnap = await resumeRequestsRef
          .where('email', '==', email)
          .where('category', '==', category)
          .where('status', 'in', ['pending', 'approved'])
          .get();

        let soonestDoc = null;
        let soonest = null;
        let soonestExpiresAt = null;
        let soonestStatus = null;
        let soonestPasscode = null;
        let soonestEmail = null;
        let soonestDocId = null;

        for (const doc of existingRequestsSnap.docs) {
          const data = doc.data();
          if (data.status === 'approved') {
            // Only consider if passcodeExpiresAt is in the future
            if (data.passcodeExpiresAt && data.passcodeExpiresAt.toDate() > now) {
              if (!soonest || data.passcodeExpiresAt.toDate() < soonestExpiresAt) {
                soonest = data;
                soonestDoc = doc;
                soonestExpiresAt = data.passcodeExpiresAt.toDate();
                soonestStatus = 'approved';
                soonestPasscode = data.passcode;
                soonestEmail = data.email;
                soonestDocId = doc.id;
              }
            }
          } else if (data.status === 'pending') {
            // Only consider if created/updated within last 24h
            let ts = data.timestamp;
            let tsDate = null;
            if (ts && typeof ts.toDate === 'function') {
              tsDate = ts.toDate();
            } else if (typeof ts === 'string') {
              tsDate = new Date(ts);
            } else if (ts instanceof Date) {
              tsDate = ts;
            }
            if (tsDate && tsDate > twentyFourHoursAgo) {
              if (!soonest || tsDate < soonestExpiresAt) {
                soonest = data;
                soonestDoc = doc;
                soonestExpiresAt = tsDate;
                soonestStatus = 'pending';
                soonestPasscode = data.passcode;
                soonestEmail = data.email;
                soonestDocId = doc.id;
              }
            }
          }
        }

        if (soonest) {
          let expiresAt = null;
          let remainingMs = null;
          let remainingStr = 'unknown';
          if (soonestStatus === 'approved') {
            expiresAt = soonestExpiresAt;
            remainingMs = expiresAt - now;
            remainingStr = remainingMs ? `${Math.floor(remainingMs/3600000)}h ${Math.floor((remainingMs%3600000)/60000)}m` : 'unknown';
            // Resend passcode email
            try {
              if (soonestEmail && soonestPasscode && soonestDocId) {
                const { sendPasscodeEmail } = await import('@/lib/resumeAccessUtils');
                await sendPasscodeEmail(soonestEmail, soonestPasscode, soonestDocId);
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
          } else if (soonestStatus === 'pending') {
            // For pending, expires 24h after creation
            expiresAt = new Date(soonestExpiresAt.getTime() + 24 * 60 * 60 * 1000);
            remainingMs = expiresAt - now;
            remainingStr = remainingMs ? `${Math.floor(remainingMs/3600000)}h ${Math.floor((remainingMs%3600000)/60000)}m` : 'unknown';
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
        } else {
          console.log('[DEBUG] No active requests found, proceeding to create new request.');
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
          email, // already lowercased
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

// Helper function to get a display name for a category
function getCategoryDisplayName(category) {
  const displayNames = {
    'resume': 'Resume',
    'free_item': 'Free item',
    'portfolio': 'Portfolio'
  };
  
    return displayNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
}
// FIX: Add missing closing brace for the file
// End of file
// removed stray closing brace
}