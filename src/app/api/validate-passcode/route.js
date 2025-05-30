// src/app/api/validate-passcode/route.js
import { NextResponse } from 'next/server';
import { validatePasscode } from '@/lib/resumeAccessUtils';

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
    
    const result = validatePasscode(passcode);
    
    if (result.valid) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error validating passcode:', error);
    return NextResponse.json(
      { error: 'Failed to validate passcode' },
      { status: 500 }
    );
  }
}
