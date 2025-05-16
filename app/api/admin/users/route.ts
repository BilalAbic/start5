import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/api';

// GET /api/admin/users - Tüm kullanıcıları listele (sadece admin)
export const GET = withAuth(
  async (req: NextRequest) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          // Hassas bilgileri göndermiyoruz (password)
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return Response.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      return Response.json({ error: 'Kullanıcılar alınırken bir hata oluştu' }, { status: 500 });
    }
  },
  { adminOnly: true } // Sadece admin kullanıcılar erişebilir
);

// POST /api/admin/users/role - Kullanıcı rolünü değiştir (sadece admin)
export const POST = withAuth(
  async (req: NextRequest) => {
    try {
      const { userId, role } = await req.json();
      
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
        },
      });
      
      return Response.json(updatedUser);
    } catch (error) {
      console.error('Error updating user role:', error);
      return Response.json({ error: 'Kullanıcı rolü güncellenirken bir hata oluştu' }, { status: 500 });
    }
  },
  { adminOnly: true } // Sadece admin kullanıcılar erişebilir
); 