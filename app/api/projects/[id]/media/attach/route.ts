import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Type assertion for Prisma
const typedPrisma = prisma as unknown as PrismaClient & {
  project: any;
  media: any;
};

// Schema for validating media attachment requests
const AttachMediaSchema = z.object({
  mediaItems: z.array(z.object({
    url: z.string().url('Geçerli bir URL olmalı'),
    publicId: z.string().min(1, 'Public ID gerekli'),
    altText: z.string().nullable().optional(),
  })).min(1, 'En az bir medya öğesi gerekli'),
});

// POST /api/projects/[id]/media/attach - Attach media items that were uploaded temporarily
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Properly extract the ID from context params
    const { id: projectId } = (await context.params);

    // Verify user is authenticated
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Lütfen giriş yapın.' },
        { status: 401 }
      );
    }

    // Check project ownership
    const project = await typedPrisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Proje bulunamadı' },
        { status: 404 }
      );
    }

    if (project.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    // Parse request body and validate
    const body = await request.json();
    const parse = AttachMediaSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { error: parse.error.errors[0]?.message || 'Geçersiz medya verisi.' },
        { status: 400 }
      );
    }
    const { mediaItems } = parse.data;

    // Get current media count for this project
    const currentMediaCount = await typedPrisma.media.count({
      where: { projectId },
    });

    // Check if adding these would exceed the maximum
    const MAX_MEDIA = 10;
    if (mediaItems.length + currentMediaCount > MAX_MEDIA) {
      return NextResponse.json(
        { 
          error: `Çok fazla görsel. Proje başına en fazla ${MAX_MEDIA} görsel yüklenebilir.` 
        },
        { status: 400 }
      );
    }

    // Create the media records for this project
    const createdMedia = await Promise.all(
      mediaItems.map(async (item) => {
        return typedPrisma.media.create({
          data: {
            projectId,
            url: item.url,
            publicId: item.publicId,
            altText: item.altText || null,
          },
        });
      })
    );

    return NextResponse.json(createdMedia, { status: 201 });
  } catch (error) {
    console.error('Error attaching media to project:', error);
    return NextResponse.json(
      { error: 'Medya eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 