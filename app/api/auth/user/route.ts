import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/auth/user
 * 
 * Giriş yapmış kullanıcının bilgilerini döndürür
 * Giriş yapılmamışsa boş bir yanıt döner
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return Response.json({
        authenticated: false,
        user: null
      });
    }
    
    // Hassas bilgileri filtreleyerek yanıtta döndür
    const safeUser = {
      userId: user.userId,
      id: user.userId,
      email: user.email,
      username: user.username,
      role: user.role,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      isAdmin: user.role === 'ADMIN',
      authenticated: true
    };
    
    // Return user in a "user" property to match frontend expectations
    return Response.json({
      authenticated: true,
      user: safeUser
    });
  } catch (error) {
    console.error('Error in user endpoint:', error);
    return Response.json(
      { error: 'Kullanıcı bilgileri alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 