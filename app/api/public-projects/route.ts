import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';

// Type assertion for Prisma
const typedPrisma = prisma as unknown as PrismaClient & {
  project: any;
};

// GET /api/public-projects - Get all public projects from all users with pagination
export async function GET(request: NextRequest) {
  try {
    // Get query parameters for pagination and filtering
    const url = new URL(request.url);
    const page = url.searchParams.get('page') ? 
      parseInt(url.searchParams.get('page')!) : 1;
    const limit = url.searchParams.get('limit') ? 
      parseInt(url.searchParams.get('limit')!) : 24;
    const tag = url.searchParams.get('tag');
    const search = url.searchParams.get('search');
    
    // Calculate offset for pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isPublic: true,
    };

    // Add tag filtering if specified
    if (tag) {
      where.tags = {
        has: tag
      };
    }

    // Add search filtering if specified
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    // Execute count query to get total
    const totalCount = await typedPrisma.project.count({
      where,
    });

    // Execute main query with pagination
    const projects = await typedPrisma.project.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            // Don't include sensitive user data
          }
        },
        media: {
          // Only include necessary fields for thumbnails
          select: {
            id: true,
            url: true,
            altText: true,
          },
          // Limit to first few media items for thumbnails
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    // Return paginated response with metadata
    return NextResponse.json({
      projects,
      pagination: {
        total: totalCount,
        page,
        limit,
        pageCount: Math.ceil(totalCount / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching public projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public projects' },
      { status: 500 }
    );
  }
} 