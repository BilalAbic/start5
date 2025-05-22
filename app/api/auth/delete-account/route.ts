import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
  try {
    // Get user from JWT token
    const payload = await getCurrentUser(req);
    
    if (!payload) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Return a message that this feature is temporarily disabled
    return NextResponse.json(
      { error: 'Bu özellik geçici olarak devre dışı bırakılmıştır. Lütfen daha sonra tekrar deneyiniz.' },
      { status: 503 } // Service Unavailable
    );
    
    /* 
    Actual account deletion implementation would look like this:
    
    // Delete user and associated data
    await prisma.user.delete({
      where: { id: payload.userId },
    });
    
    // Clear auth token
    await removeTokenCookie();
    
    return NextResponse.json({
      message: 'Account deleted successfully',
    });
    */
    
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 