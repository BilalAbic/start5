import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';

// Type assertion for Prisma
const typedPrisma = prisma as unknown as PrismaClient & {
  project: any;
};

// GET /api/public-projects/featured - Get featured projects selected by admin
export async function GET(request: NextRequest) {
  try {
    // Get query parameter for limit (default to 3)
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') ? 
      parseInt(url.searchParams.get('limit')!) : 3;
    
    // Get featured projects
    const featuredProjects = await typedPrisma.project.findMany({
      where: {
        isFeatured: true,
        isPublic: true, // Only show public projects
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          }
        },
        media: {
          // Only include necessary fields for thumbnails
          select: {
            id: true,
            url: true,
            altText: true,
          },
          take: 1, // Take first media as thumbnail
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json(featuredProjects);
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    return NextResponse.json(
      { error: 'Featured projects could not be fetched' },
      { status: 500 }
    );
  }
} 