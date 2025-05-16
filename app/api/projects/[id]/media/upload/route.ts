// ---
// Gelişmiş güvenlik ve validasyon için eklemeler:
// - Zod ile input validasyonu
// ---

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

// Type assertion for Prisma
const typedPrisma = prisma as unknown as PrismaClient & {
  project: any;
  media: any;
};

const MAX_FILES = 10;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const UploadSchema = z.object({
  images: z.array(z.object({
    base64: z.string().min(1, 'Resim verisi eksik.'),
    altText: z.string().optional(),
  })).min(1, 'En az bir resim yüklemelisiniz.'),
});

// POST /api/projects/[id]/media/upload - Upload media to Cloudinary and save to DB
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;

    // Verify user is authenticated
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check project ownership
    const project = await typedPrisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get current media count for this project
    const currentMediaCount = await typedPrisma.media.count({
      where: { projectId },
    });

    // Parse request body ve validasyon
    const body = await request.json();
    const parse = UploadSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { error: parse.error.errors[0]?.message || 'Geçersiz medya verisi.' },
        { status: 400 }
      );
    }
    const { images } = parse.data;

    // Validate number of images
    if (images.length + currentMediaCount > MAX_FILES) {
      return NextResponse.json(
        { 
          error: `Too many images. Maximum ${MAX_FILES} images allowed per project. You can upload ${MAX_FILES - currentMediaCount} more.` 
        },
        { status: 400 }
      );
    }

    const uploadedMedia = [];

    // Process each image
    for (const image of images) {
      const { base64, altText } = image;
      if (!base64) {
        continue;
      }
      try {
        // Upload to Cloudinary
        const { url, publicId } = await uploadImage(
          base64,
          `projects/${projectId}`
        );
        // Create media record
        const media = await typedPrisma.media.create({
          data: {
            projectId,
            url,
            publicId,
            altText: altText || null,
          },
        });
        uploadedMedia.push(media);
      } catch (error) {
        console.error('Error uploading individual image:', error);
      }
    }

    if (uploadedMedia.length === 0) {
      return NextResponse.json(
        { error: 'Failed to upload any images' },
        { status: 500 }
      );
    }

    return NextResponse.json(uploadedMedia, { status: 201 });
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    );
  }
} 