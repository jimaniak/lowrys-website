import { NextRequest, NextResponse } from 'next/server';

// Simple health check for the Rate Calculator API
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  if (action === 'health') {
    return NextResponse.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      message: 'Rate Calculator Enhanced API is running'
    });
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
