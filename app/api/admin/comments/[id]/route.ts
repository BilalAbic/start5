import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id;

    if (!commentId) {
      return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
    }

    // Yorumun var olup olmadığını kontrol et (isteğe bağlı, Prisma hatası zaten bunu yapar)
    const existingComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: 'Comment deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting comment:', error);
    // Prisma bilinen hata kodlarını kontrol et (örn: P2025 Kayıt bulunamadı)
    if ((error as any).code === 'P2025') {
        return NextResponse.json({ error: 'Comment not found or already deleted' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
  }
}

// İsteğe bağlı: Yorum güncelleme (PUT) ve tek yorum getirme (GET) endpoint'leri buraya eklenebilir.
// export async function PUT(...) { ... }
// export async function GET(...) { ... } 