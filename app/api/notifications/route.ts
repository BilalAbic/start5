import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET /api/notifications - Get all notifications for current user
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Use type assertion to tell TypeScript that notification is available
    const notifications = await (prisma as any).notification.findMany({
      where: {
        userId: user.userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}

// POST /api/notifications - Create a new notification (admin only)
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate required fields
    if (!body.userId || !body.message || !body.type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Use type assertion to tell TypeScript that notification is available
    const notification = await (prisma as any).notification.create({
      data: {
        userId: body.userId,
        message: body.message,
        type: body.type,
        link: body.link || null,
      }
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
  }
} 