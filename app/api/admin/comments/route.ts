import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const getCommentsQuerySchema = z.object({
  page: z.string().optional().default('1').transform(Number),
  limit: z.string().optional().default('10').transform(Number),
  userId: z.string().optional(),
  projectId: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validation = getCommentsQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: validation.error.flatten() }, { status: 400 });
    }

    const { page, limit, userId, projectId, sortBy, sortOrder } = validation.data;

    const whereClause: any = {};
    if (userId) {
      whereClause.userId = userId;
    }
    if (projectId) {
      whereClause.projectId = projectId;
    }

    const comments = await prisma.comment.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        // Potansiyel olarak rapor bilgilerini de dahil edebiliriz.
        // reports: {
        //   select: {
        //     id: true,
        //     reason: true,
        //     status: true,
        //   }
        // }
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalComments = await prisma.comment.count({ where: whereClause });

    return NextResponse.json({
      comments,
      totalPages: Math.ceil(totalComments / limit),
      currentPage: page,
      totalComments,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
} 