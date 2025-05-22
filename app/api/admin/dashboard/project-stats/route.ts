import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/api';

// API endpoint for detailed project statistics
export const GET = withAuth(
  async (req: NextRequest) => {
    try {
      // Get projects grouped by status
      const statusStats = await prisma.project.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      });

      // Get projects by visibility
      const visibilityStats = await prisma.project.groupBy({
        by: ['isPublic'],
        _count: {
          id: true,
        },
      });
      
      // Get monthly project creation counts for the last 6 months - without raw SQL
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      sixMonthsAgo.setDate(1); // Start from the 1st day of the month
      
      // Get all projects created in the last 6 months
      const recentProjects = await prisma.project.findMany({
        where: {
          createdAt: {
            gte: sixMonthsAgo
          }
        },
        select: {
          createdAt: true
        },
        orderBy: {
          createdAt: 'asc'
        }
      });
      
      // Process the data to group by month
      const monthlyTrends = processMonthlyTrends(recentProjects);

      // Get the total number of users and projects
      const [totalUsers, totalProjects] = await Promise.all([
        prisma.user.count(),
        prisma.project.count(),
      ]);

      // Calculate the average projects per user
      const avgProjectsPerUser = totalUsers > 0 ? totalProjects / totalUsers : 0;

      return Response.json({
        statusStats: statusStats.map(stat => ({
          status: stat.status,
          count: stat._count.id,
        })),
        visibilityStats: {
          public: visibilityStats.find(stat => stat.isPublic === true)?._count.id || 0,
          private: visibilityStats.find(stat => stat.isPublic === false)?._count.id || 0,
        },
        monthlyTrends,
        userProjectRatio: {
          totalUsers,
          totalProjects,
          avgProjectsPerUser,
        },
      });
    } catch (error) {
      console.error('Error fetching project statistics:', error);
      return Response.json(
        { error: 'Proje istatistikleri alınırken bir hata oluştu' },
        { status: 500 }
      );
    }
  },
  { adminOnly: true } // Only admin users can access this endpoint
);

// Helper function to process projects and group them by month
function processMonthlyTrends(projects: Array<{ createdAt: Date }>) {
  const monthlyData: Record<string, number> = {};
  
  // Group projects by month
  projects.forEach(project => {
    // Create a key in format YYYY-MM
    const date = new Date(project.createdAt);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    // Increment the count for this month
    if (monthlyData[monthKey]) {
      monthlyData[monthKey]++;
    } else {
      monthlyData[monthKey] = 1;
    }
  });
  
  // Convert the record to the required array format
  const result = Object.entries(monthlyData).map(([monthKey, count]) => {
    // Convert the key to a full date string (using the first day of the month)
    const [year, month] = monthKey.split('-');
    const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    
    return {
      month: monthDate.toISOString(),
      count
    };
  });
  
  // Sort by date
  return result.sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
} 