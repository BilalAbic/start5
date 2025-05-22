// ---
// Gelişmiş güvenlik ve validasyon için eklemeler:
// - Zod ile input validasyonu
// ---

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Shared type definitions
export interface ProjectInput {
  title: string;
  description: string;
  githubUrl: string;
  demoUrl?: string | null;
  isPublic: boolean;
  tags: string[];
  status: 'GELISTIRILIYOR' | 'YAYINDA' | 'ARSIVDE';
  isPinned?: boolean;
  version?: string | null;
}

// Validation schema
const ProjectSchema = z.object({
  title: z.string()
    .min(3, 'Proje adı en az 3 karakter olmalı.')
    .max(100, 'Proje adı çok uzun.'),
  description: z.string()
    .min(1, 'Açıklama gerekli.')
    .max(500, 'Açıklama 500 karakterden uzun olamaz.'),
  githubUrl: z.string()
    .url('Geçerli bir URL giriniz.')
    .refine(
      url => url.startsWith('https://github.com/'),
      'GitHub URL gereklidir ve https://github.com/ ile başlamalıdır.'
    ),
  demoUrl: z.string()
    .url('Geçerli bir demo URL giriniz.')
    .optional()
    .nullable(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  status: z.enum(['GELISTIRILIYOR', 'YAYINDA', 'ARSIVDE'])
    .default('GELISTIRILIYOR'),
  isPinned: z.boolean().optional().default(false),
  version: z.string().optional().nullable(),
});

// Project type definition
interface ProjectWithMedia {
  id: string;
  userId: string;
  title: string;
  description: string;
  githubUrl: string;
  demoUrl: string | null;
  isPublic: boolean;
  status: string;
  tags: string[];
  createdAt: Date;
  media: Array<{
    id: string;
    projectId: string;
    url: string;
    publicId: string;
    altText: string | null;
    createdAt: Date;
  }>;
}

// Type for raw SQL query result
interface ProjectRawResult {
  id: string;
}

// Helper function to handle errors
const handleError = (error: unknown) => {
  console.error('Error:', error);
  if (error instanceof z.ZodError) {
    const [firstError] = error.errors;
    return NextResponse.json(
      {
        error: firstError?.message || 'Geçersiz proje verisi.',
        field: firstError?.path[0] || 'form',
        errors: error.errors
      },
      { status: 400 }
    );
  }
  
  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  
  return NextResponse.json(
    { error: 'Beklenmeyen bir hata oluştu' },
    { status: 500 }
  );
};

// Helper function to check project ownership
const checkProjectOwnership = async (projectId: string, userId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true }
  });

  if (!project) {
    throw new Error('Proje bulunamadı');
  }

  if (project.userId !== userId) {
    throw new Error('Bu işlem için yetkiniz yok');
  }

  return project;
};

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Lütfen giriş yapın.' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const parse = ProjectSchema.safeParse(body);
    if (!parse.success) {
      return handleError(parse.error);
    }
    
    const { title, description, githubUrl, demoUrl, isPublic, tags, status, isPinned, version } = parse.data;

    // Check for duplicate project title
    const existingProject = await prisma.project.findFirst({
      where: {
        userId: user.userId,
        title: { equals: title, mode: 'insensitive' }
      }
    });

    if (existingProject) {
      return NextResponse.json(
        { 
          error: 'Bu isimde bir projeniz zaten var.',
          field: 'title'
        },
        { status: 400 }
      );
    }

    // Create project
    const newProject = await prisma.project.create({
      data: {
        userId: user.userId,
        title,
        description,
        githubUrl,
        demoUrl,
        isPublic,
        status,
        tags,
        isPinned: isPinned || false,
        version: version || null,
      }
    });

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

// GET /api/projects - Get all projects for the current user
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Lütfen giriş yapın.' },
        { status: 401 }
      );
    }

    // Get projects with media
    const projects = await prisma.project.findMany({
      where: { userId: user.userId },
      include: {
        media: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format dates and add additional fields
    const formattedProjects = projects.map(project => ({
      ...project,
      formattedDate: new Date(project.createdAt).toLocaleDateString('tr-TR')
    }));

    return NextResponse.json(formattedProjects);
  } catch (error) {
    return handleError(error);
  }
} 