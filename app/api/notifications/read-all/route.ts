import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// POST /api/notifications/read-all - Mark all notifications as read
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await (prisma as any).notification.updateMany({
      where: {
        userId: user.userId,
        status: 'unread'
      },
      data: {
        status: 'read'
      }
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' }, 
      { status: 500 }
    );
  }
} 