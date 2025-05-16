import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse } from '@/lib/api';

// GET /api/admin/projects - Tüm projeleri listele (sadece admin)
export const GET = withAuth(
  async (req: NextRequest) => {
    try {
      const projects = await prisma.project.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return Response.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      return errorResponse('Projeler alınırken bir hata oluştu', 500);
    }
  },
  { adminOnly: true } // Sadece admin kullanıcılar erişebilir
);

// POST /api/admin/projects/feature - Projeyi öne çıkar/kaldır (sadece admin)
export const POST = withAuth(
  async (req: NextRequest) => {
    try {
      const { projectId, featured } = await req.json();
      
      if (!projectId) {
        return errorResponse('Geçersiz proje ID', 400);
      }
      
      // Burada featured alanı eklenecek (schema güncellenmeli)
      const updatedProject = await prisma.project.update({
        where: { id: projectId },
        data: { 
          // featured: featured === true // Schema'ya eklenmeli
          // Geçici çözüm:
          isPublic: featured === true // Şimdilik isPublic alanını kullanıyoruz
        },
      });
      
      return Response.json(updatedProject);
    } catch (error) {
      console.error('Error updating project featured status:', error);
      return errorResponse('Proje öne çıkarma durumu güncellenirken bir hata oluştu', 500);
    }
  },
  { adminOnly: true } // Sadece admin kullanıcılar erişebilir
);

// DELETE /api/admin/projects/:id - Projeyi sil (sadece admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Admin kontrolü
  const adminCheck = await withAuth(async () => new Response(), { adminOnly: true })(req);
  if (adminCheck.status !== 200) {
    return adminCheck;
  }
  
  try {
    const projectId = params.id;
    
    if (!projectId) {
      return errorResponse('Geçersiz proje ID', 400);
    }
    
    // Projeyi sil
    await prisma.project.delete({
      where: { id: projectId },
    });
    
    return Response.json({ success: true, message: 'Proje başarıyla silindi' });
  } catch (error) {
    console.error('Error deleting project:', error);
    return errorResponse('Proje silinirken bir hata oluştu', 500);
  }
} 