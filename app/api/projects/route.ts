// ---
// Gelişmiş güvenlik ve validasyon için eklemeler:
// - Zod ile input validasyonu
// ---

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const ProjectSchema = z.object({
  title: z.string().min(3, 'Proje adı en az 3 karakter olmalı.'),
  description: z.string().max(500, 'Açıklama 500 karakterden uzun olamaz.'),
  githubUrl: z.string().url('Geçerli bir GitHub URL giriniz.').optional(),
  demoUrl: z.string().url('Geçerli bir demo URL giriniz.').optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['GELISTIRILIYOR', 'YAYINDA', 'ARSIVDE']).optional(),
});

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body ve validasyon
    const body = await request.json();
    const parse = ProjectSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { error: parse.error.errors[0]?.message || 'Geçersiz proje verisi.' },
        { status: 400 }
      );
    }
    const { title, description, githubUrl, demoUrl, isPublic, tags, status } = parse.data;

    // Create project in database
    const project = await prisma.project.create({
      data: {
        userId: user.userId,
        title,
        description,
        githubUrl,
        demoUrl: demoUrl || null,
        isPublic: isPublic || false,
        status: status || 'GELISTIRILIYOR',
        tags: tags || [],
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}

// GET /api/projects - Get all projects for the current user
export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get projects for the current user
    const projects = await prisma.project.findMany({
      where: {
        userId: user.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
} 