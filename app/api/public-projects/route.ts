import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';

// Type assertion for Prisma
const typedPrisma = prisma as unknown as PrismaClient & {
  project: any;
};

// GET /api/public-projects - Get all public projects from all users
export async function GET(request: NextRequest) {
  try {
    // Get query parameters for potential filtering
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') ? 
      parseInt(url.searchParams.get('limit')!) : undefined;
    
    // Get public projects
    const projects = await typedPrisma.project.findMany({
      where: {
        isPublic: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          }
        },
        media: true, // Include project media for gallery display
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching public projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public projects' },
      { status: 500 }
    );
  }
} 