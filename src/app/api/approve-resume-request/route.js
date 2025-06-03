import { NextResponse } from 'next/server';
import { db, admin } from '../../../lib/firebase-admin';
import { generatePasscode, sendPasscodeEmail } from '../../../lib/resumeAccessUtils';

export async function POST(request) {
  try {
    const { requestId } = await request.json();
    
    // Get the request from Firestore
    const requestDoc = await db.collection('resumeRequests').doc(requestId).get();
    if (!requestDoc.exists) {
      return NextResponse.json({ success: false, message: 'Request not found' }, { status: 404 });
    }
    
    const requestData = requestDoc.data();
    
    // Generate a passcode
    const passcode = generatePasscode();
    
    // Store the passcode in Firestore
    await db.collection('resumePasscodes').doc(passcode).set({
      requestId,
      email: requestData.email,
      name: requestData.name,
      company: requestData.company,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      )
    });
    
    // Update the request status
    await db.collection('resumeRequests').doc(requestId).update({
      status: 'approved',
      approvedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Send the passcode email
    await sendPasscodeEmail(requestData.email, passcode);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error approving request:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
