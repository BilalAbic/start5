import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear authentication cookies
    const cookieStore = cookies();
    
    // Delete all auth-related cookies
    cookieStore.delete('auth-token');
    cookieStore.delete('user-id');
    cookieStore.delete('session');
    
    return NextResponse.json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
} 