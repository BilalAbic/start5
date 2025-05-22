import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/api';
import { getCurrentUser } from '@/lib/auth';

// Admin dashboard API endpoint - returns statistics
export const GET = withAuth(
  async (req: NextRequest) => {
    try {
      // Get current date and date 7 days ago for recent projects calculation
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);

      // Run all queries in parallel for better performance
      const [totalUsers, totalProjects, activePublicProjects, recentProjects] = await Promise.all([
        // Count all users
        prisma.user.count(),
        
        // Count all projects
        prisma.project.count(),
        
        // Count public and active projects
        prisma.project.count({
          where: {
            isPublic: true,
            status: 'YAYINDA',
          },
        }),
        
        // Count projects created in the last 7 days
        prisma.project.count({
          where: {
            createdAt: {
              gte: sevenDaysAgo,
            },
          },
        }),
      ]);

      return Response.json({
        totalUsers,
        totalProjects,
        activePublicProjects,
        recentProjects,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return Response.json(
        { error: 'İstatistikler alınırken bir hata oluştu' },
        { status: 500 }
      );
    }
  },
  { adminOnly: true } // Only admin users can access this endpoint
); 