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

    // Parse request body and validation first
    const body = await request.json();
    const parse = UploadSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { error: parse.error.errors[0]?.message || 'Geçersiz medya verisi.' },
        { status: 400 }
      );
    }
    const { images } = parse.data;

    // Special handling for temporary uploads (when projectId is 'temp')
    // This handles the case when user is uploading images before project creation
    if (projectId === 'temp') {
      const temporaryUploads = [];
      
      // Only upload to cloudinary but don't save to DB yet
      for (const image of images) {
        const { base64, altText } = image;
        if (!base64) continue;
        
        try {
          // Upload to Cloudinary with a generic temp folder
          const { url, publicId } = await uploadImage(
            base64,
            `projects/temp/${user.userId}`
          );
          // Return the uploads without saving to DB
          temporaryUploads.push({
            url,
            publicId,
            altText: altText || null,
            isTemporary: true
          });
        } catch (error) {
          console.error('Error uploading temporary image:', error);
        }
      }
      
      if (temporaryUploads.length === 0) {
        return NextResponse.json(
          { error: 'Görsel yüklenirken bir hata oluştu' },
          { status: 500 }
        );
      }
      
      return NextResponse.json(temporaryUploads, { status: 201 });
    }

    // Regular flow for existing projects
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

    // Get current media count for this project
    const currentMediaCount = await typedPrisma.media.count({
      where: { projectId },
    });

    // Validate number of images
    if (images.length + currentMediaCount > MAX_FILES) {
      return NextResponse.json(
        { 
          error: `Çok fazla görsel. Proje başına en fazla ${MAX_FILES} görsel yüklenebilir. ${MAX_FILES - currentMediaCount} görsel daha yükleyebilirsiniz.` 
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
        { error: 'Hiçbir görsel yüklenemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json(uploadedMedia, { status: 201 });
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { error: 'Medya yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
} 