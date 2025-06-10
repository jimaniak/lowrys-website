// src/app/api/download-resume/route.js
import { NextResponse } from 'next/server';
import { admin } from '../../../lib/firebase-admin';
import path from 'path';
import fs from 'fs/promises';

// Only allow POST for secure download
export async function POST(request) {
  try {
    const body = await request.json();
    const { passcode, category = 'resume' } = body;
    if (!passcode) {
      return NextResponse.json({ success: false, message: 'Passcode is required' }, { status: 400 });
    }

    // Query for requests with this passcode and category
    const requestsSnapshot = await admin.firestore()
      .collection('resumeRequests')
      .where('passcode', '==', passcode)
      .where('category', '==', category)
      .get();

    if (requestsSnapshot.empty) {
      return NextResponse.json({ success: false, message: 'Invalid passcode for this resource' }, { status: 400 });
    }

    const requestDoc = requestsSnapshot.docs[0];
    const requestData = requestDoc.data();
    const requestId = requestDoc.id;

    // Check status
    if (requestData.status === 'used') {
      return NextResponse.json({ success: false, message: 'This access code has already been used. Please request access again if needed.' }, { status: 403 });
    }
    if (requestData.status === 'denied') {
      return NextResponse.json({ success: false, message: 'Your request was denied. Please contact the site owner for more information.' }, { status: 403 });
    }
    if (requestData.status === 'expired') {
      return NextResponse.json({ success: false, message: 'This access code has expired. Please request access again.' }, { status: 403 });
    }
    if (requestData.status !== 'approved') {
      return NextResponse.json({ success: false, message: `Invalid request status: ${requestData.status}` }, { status: 403 });
    }

    // Check passcode expiration
    const passcodeExpiresAt = requestData.passcodeExpiresAt?.toDate();
    if (passcodeExpiresAt && passcodeExpiresAt < new Date()) {
      // Update status to expired
      await admin.firestore().collection('resumeRequests').doc(requestId).update({
        status: 'expired',
        expiredAt: admin.firestore.FieldValue.serverTimestamp()
      });
      return NextResponse.json({ success: false, message: 'This access code has expired. Please request access again.' }, { status: 403 });
    }

    // Mark as used
    await admin.firestore().collection('resumeRequests').doc(requestId).update({
      status: 'used',
      usedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Serve the file
    const filePath = path.join(process.cwd(), 'public', 'documents', 'jim-lowry-resume.pdf');
    try {
      const fileBuffer = await fs.readFile(filePath);
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="jim-lowry-resume.pdf"',
        },
      });
    } catch (fileErr) {
      return NextResponse.json({ success: false, message: 'Resume file not found.' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: `Failed to process download: ${error.message}` }, { status: 500 });
  }
}
