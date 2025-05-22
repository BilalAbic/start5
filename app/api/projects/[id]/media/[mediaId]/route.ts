import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { deleteImage } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';

// Type assertion for Prisma
const typedPrisma = prisma as unknown as PrismaClient & {
  media: any;
};

// DELETE /api/projects/[id]/media/[mediaId] - Delete media from a project
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string; mediaId: string }> }
) {
  const params = await props.params;
  try {
    const { id: projectId, mediaId } = params;

    // Verify user is authenticated
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check media exists and belongs to project
    const media = await typedPrisma.media.findUnique({
      where: { id: mediaId },
      include: { project: true },
    });

    if (!media) {
      return NextResponse.json(
        { error: 'Media not found' },
        { status: 404 }
      );
    }

    // Verify the media belongs to the specified project
    if (media.projectId !== projectId) {
      return NextResponse.json(
        { error: 'Media does not belong to this project' },
        { status: 400 }
      );
    }

    // Check project ownership
    if (media.project.userId !== user.userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete from Cloudinary
    try {
      await deleteImage(media.publicId);
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
      // Continue with deletion from database even if Cloudinary delete fails
    }

    // Delete media from database
    await typedPrisma.media.delete({
      where: { id: mediaId },
    });

    return NextResponse.json(
      { message: 'Media deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
} 