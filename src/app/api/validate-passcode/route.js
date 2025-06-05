// src/app/api/validate-passcode/route.js
import { NextResponse } from 'next/server';
import { admin } from '../../../lib/firebase-admin';

export async function POST(request) {
  try {
    const body = await request.json();
    const { passcode } = body;
    
    if (!passcode) {
      return NextResponse.json(
        { valid: false, message: 'Passcode is required' },
        { status: 400 }
      );
    }
    
    // Query Firestore to find the request with this passcode
    const requestsSnapshot = await admin.firestore()
      .collection('resumeRequests')
      .where('passcode', '==', passcode)
      .limit(1)
      .get();
    
    if (requestsSnapshot.empty) {
      return NextResponse.json(
        { valid: false, message: 'Invalid passcode' },
        { status: 400 }
      );
    }
    
    // Get the first matching document
    const requestDoc = requestsSnapshot.docs[0];
    const requestData = requestDoc.data();
    
    // Check if request is already used or expired
    if (requestData.status === 'used') {
      return NextResponse.json(
        { valid: false, message: 'Passcode has already been used' },
        { status: 400 }
      );
    }
    
    if (requestData.status === 'expired') {
      return NextResponse.json(
        { valid: false, message: 'Passcode has expired' },
        { status: 400 }
      );
    }
    
    // Check if passcode is expired based on timestamp
    const now = admin.firestore.Timestamp.now();
    if (requestData.passcodeExpiresAt && requestData.passcodeExpiresAt.seconds < now.seconds) {
      // Update status to expired
      await admin.firestore().collection('resumeRequests').doc(requestDoc.id).update({
        status: 'expired',
        expiredAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      return NextResponse.json(
        { valid: false, message: 'Passcode has expired' },
        { status: 400 }
      );
    }
    
    // Mark passcode as used by updating status
    await admin.firestore().collection('resumeRequests').doc(requestDoc.id).update({
      status: 'used',
      usedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
	return NextResponse.json({ 
	  valid: true, 
	  message: 'Passcode validated successfully',
	  requestId
	});
  } catch (error) {
    console.error('Error validating passcode:', error);
    return NextResponse.json(
      { valid: false, message: 'Failed to validate passcode' },
      { status: 500 }
    );
  }
}
