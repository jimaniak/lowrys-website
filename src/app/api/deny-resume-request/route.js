import { NextResponse } from 'next/server';
import { db, admin } from '../../../lib/firebase-admin';

export async function POST(request) {
  try {
    const { requestId } = await request.json();
    
    // Update the request status
    await db.collection('resumeRequests').doc(requestId).update({
      status: 'denied',
      deniedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error denying request:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
