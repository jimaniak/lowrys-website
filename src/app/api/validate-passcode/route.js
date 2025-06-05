// src/app/api/validate-passcode/route.js
import { NextResponse } from 'next/server';
import { admin } from '../../../lib/firebase-admin';

export async function POST(request) {
  try {
    const body = await request.json();
    const { passcode, category = 'resume' } = body; // Added category with default
    
    if (!passcode) {
      return NextResponse.json(
        { success: false, message: 'Passcode is required' },
        { status: 400 }
      );
    }
    
    // Query for requests with this passcode and category
    const requestsSnapshot = await admin.firestore()
      .collection('resumeRequests')
      .where('passcode', '==', passcode)
      .where('category', '==', category) // Added category filter
      .get();
    
    if (requestsSnapshot.empty) {
      return NextResponse.json(
        { success: false, message: 'Invalid passcode for this resource' },
        { status: 400 }
      );
    }
    
    // Get the first matching request
    const requestDoc = requestsSnapshot.docs[0];
    const requestData = requestDoc.data();
    const requestId = requestDoc.id;
    
    // Check if the status is already 'used'
    if (requestData.status === 'used') {
      return NextResponse.json(
        { success: false, message: 'Passcode already used' },
        { status: 400 }
      );
    }
    
    // Check if the status is not 'approved'
    if (requestData.status !== 'approved') {
      return NextResponse.json(
        { success: false, message: `Invalid passcode status: ${requestData.status}` },
        { status: 400 }
      );
    }
    
    // Check if passcode has expired
    const passcodeExpiresAt = requestData.passcodeExpiresAt?.toDate();
    if (passcodeExpiresAt && passcodeExpiresAt < new Date()) {
      // Update status to expired
      await admin.firestore().collection('resumeRequests').doc(requestId).update({
        status: 'expired',
        expiredAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return NextResponse.json(
        { success: false, message: 'Passcode has expired' },
        { status: 400 }
      );
    }
    
    // Only update status to 'used' if we're going to return success
    try {
      // Update status to used
      await admin.firestore().collection('resumeRequests').doc(requestId).update({
        status: 'used',
        usedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Return success response with category information
      return NextResponse.json({ 
        success: true, 
        message: 'Passcode validated successfully',
        requestId,
        category: requestData.category || 'resume' // Return category, default if not found
      });
    } catch (updateError) {
      console.error('Error updating status to used:', updateError);
      // Still return success since the passcode is valid, but log the error
      return NextResponse.json({ 
        success: true, 
        message: 'Passcode validated successfully',
        requestId,
        category: requestData.category || 'resume' // Return category, default if not found
      });
    }
  } catch (error) {
    console.error('Error validating passcode:', error);
    return NextResponse.json(
      { success: false, message: `Failed to validate passcode: ${error.message}` },
      { status: 500 }
    );
  }
}
