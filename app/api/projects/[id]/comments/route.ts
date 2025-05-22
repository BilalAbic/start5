import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Type assertion for Prisma
const typedPrisma = prisma as unknown as PrismaClient & {
  comment: any;
  project: any;
};

// GET /api/projects/[id]/comments - Get all comments for a project
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;

    // Check if project exists
    const project = await typedPrisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if project is public or user is authorized
    if (!project.isPublic) {
      const currentUser = await getCurrentUser(request);
      if (!currentUser || project.userId !== currentUser.userId) {
        return NextResponse.json(
          { error: 'Unauthorized access to private project comments' },
          { status: 403 }
        );
      }
    }

    // Fetch comments with user info
    const comments = await typedPrisma.comment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/comments - Create a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const currentUser = await getCurrentUser(request);

    // Check if user is authenticated
    if (!currentUser) {
      return NextResponse.json(
        { error: 'You must be logged in to comment' },
        { status: 401 }
      );
    }

    // Check if project exists
    const project = await typedPrisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if project is public or user is authorized
    if (!project.isPublic && project.userId !== currentUser.userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to private project' },
        { status: 403 }
      );
    }

    // Get request body
    const { content } = await request.json();

    // Validate content
    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Comment content cannot be empty' },
        { status: 400 }
      );
    }

    // Create new comment
    const comment = await typedPrisma.comment.create({
      data: {
        content,
        projectId,
        userId: currentUser.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            profileImage: true,
          },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
} 