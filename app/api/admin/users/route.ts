import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';

// Directly handle auth in this route for better debugging
export async function GET(req: NextRequest) {
  try {
    // Check authentication and admin status directly
    const user = await getCurrentUser(req);
    console.log('Auth check in admin/users API:', user ? `User: ${user.email} Role: ${user.role}` : 'Not authenticated');
    
    if (!user) {
      return Response.json({ error: 'Kimlik doğrulama gerekli' }, { status: 401 });
    }
    
    if (user.role !== 'ADMIN') {
      return Response.json({ error: 'Bu işlem için admin yetkileri gereklidir' }, { status: 403 });
    }
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        status: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    console.log(`Found ${users.length} users`);
    return Response.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return Response.json({ error: 'Kullanıcılar alınırken bir hata oluştu' }, { status: 500 });
  }
}

// Use withAuth middleware for POST operations
export const POST = withAuth(
  async (req: NextRequest) => {
    try {
      const body = await req.json();
      const { userId, role, action } = body;
      
      // Rol değiştirme isteği
      if (action === 'changeRole' || !action) {
        if (!userId || !role || !['USER', 'ADMIN'].includes(role)) {
          return Response.json({ error: 'Geçersiz kullanıcı ID veya rol' }, { status: 400 });
        }
        
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { role },
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            status: true,
          },
        });
        
        return Response.json(updatedUser);
      }
      
      // Durum değiştirme isteği
      if (action === 'changeStatus') {
        if (!userId || !body.status || !['active', 'suspended'].includes(body.status)) {
          return Response.json({ error: 'Geçersiz kullanıcı ID veya durum' }, { status: 400 });
        }
        
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: { status: body.status },
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            status: true,
          },
        });
        
        return Response.json(updatedUser);
      }
      
      // Kullanıcı silme isteği
      if (action === 'deleteUser') {
        if (!userId) {
          return Response.json({ error: 'Geçersiz kullanıcı ID' }, { status: 400 });
        }
        
        await prisma.user.delete({
          where: { id: userId }
        });
        
        return Response.json({ success: true, message: 'Kullanıcı silindi' });
      }
      
      return Response.json({ error: 'Geçersiz istek' }, { status: 400 });
    } catch (error) {
      console.error('Error updating user:', error);
      return Response.json({ error: 'Kullanıcı güncellenirken bir hata oluştu' }, { status: 500 });
    }
  },
  { adminOnly: true } // Sadece admin kullanıcılar erişebilir
); 