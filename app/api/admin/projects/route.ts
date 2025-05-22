import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, errorResponse } from '@/lib/api';
import { PrismaClient, Project } from '@prisma/client';

// Type assertion for Prisma
const typedPrisma = prisma as unknown as PrismaClient & {
  project: PrismaClient['project'];
};

// GET /api/admin/projects - Tüm projeleri listele (sadece admin)
export const GET = withAuth(
  async (_req: NextRequest) => {
    try {
      const projects = await typedPrisma.project.findMany({
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
      const { projectId, featured, isPublic, isPinned } = await req.json();
      
      if (!projectId) {
        return errorResponse('Geçersiz proje ID', 400);
      }
      
      // Prepare data object based on which parameters were provided
      const updateData: any = {};
      
      // Add isFeatured to update data if featured parameter is provided
      if (featured !== undefined) {
        updateData.isFeatured = featured === true;
      }
      
      // Add isPublic to update data if isPublic parameter is provided
      if (isPublic !== undefined) {
        updateData.isPublic = isPublic === true;
      }
      
      // Add isPinned to update data if isPinned parameter is provided
      if (isPinned !== undefined) {
        updateData.isPinned = isPinned === true;
      }
      
      // Update the project with the prepared data
      const updatedProject = await typedPrisma.project.update({
        where: { id: projectId },
        data: updateData
      });
      
      return Response.json(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
      return errorResponse('Proje güncellenirken bir hata oluştu', 500);
    }
  },
  { adminOnly: true } // Sadece admin kullanıcılar erişebilir
);

// DELETE /api/admin/projects - Projeyi sil (sadece admin)
export const DELETE = withAuth(
  async (req: NextRequest) => {
    try {
      const { searchParams } = new URL(req.url);
      const projectId = searchParams.get('id');
      
      if (!projectId) {
        return errorResponse('Geçersiz proje ID', 400);
      }
      
      // Projeyi sil
      await typedPrisma.project.delete({
        where: { id: projectId },
      });
      
      return Response.json({ success: true, message: 'Proje başarıyla silindi' });
    } catch (error) {
      console.error('Error deleting project:', error);
      return errorResponse('Proje silinirken bir hata oluştu', 500);
    }
  },
  { adminOnly: true } // Sadece admin kullanıcılar erişebilir
); 