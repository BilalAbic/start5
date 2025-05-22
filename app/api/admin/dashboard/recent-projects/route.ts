import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/api';

// API endpoint to get the most recent projects with user information
export const GET = withAuth(
  async (req: NextRequest) => {
    try {
      // Get the date 7 days ago for recent projects
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get recent projects with user information
      const recentProjects = await prisma.project.findMany({
        where: {
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
        select: {
          id: true,
          title: true,
          description: true,
          githubUrl: true,
          demoUrl: true,
          isPublic: true,
          status: true,
          createdAt: true,
          user: {
            select: {
              username: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10, // Limit to 10 most recent projects
      });

      return Response.json(recentProjects);
    } catch (error) {
      console.error('Error fetching recent projects:', error);
      return Response.json(
        { error: 'Son projeler alınırken bir hata oluştu' },
        { status: 500 }
      );
    }
  },
  { adminOnly: true } // Only admin users can access this endpoint
); 