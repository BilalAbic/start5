import { NextRequest, NextResponse } from 'next/server';
import { removeTokenCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Remove the token cookie
    await removeTokenCookie();
    
    return NextResponse.json({
      message: 'Logged out successfully',
    });
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
} 