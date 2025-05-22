import { prisma } from '@/lib/prisma';

type NotificationType = 'report' | 'project' | 'general';

/**
 * Create a new notification for a user
 */
export async function createNotification({
  userId,
  type,
  message,
  link
}: {
  userId: string;
  type: NotificationType;
  message: string;
  link?: string;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        message,
        link,
      }
    });
    
    return { success: true, notification };
  } catch (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }
}

/**
 * Create a notification for all users with a specific role
 */
export async function createNotificationForRole({
  role,
  type,
  message,
  link
}: {
  role: 'USER' | 'ADMIN';
  type: NotificationType;
  message: string;
  link?: string;
}) {
  try {
    const users = await prisma.user.findMany({
      where: { role },
      select: { id: true }
    });
    
    const notifications = await Promise.all(
      users.map(user => 
        prisma.notification.create({
          data: {
            userId: user.id,
            type,
            message,
            link,
          }
        })
      )
    );
    
    return { success: true, count: notifications.length };
  } catch (error) {
    console.error('Error creating notifications for role:', error);
    return { success: false, error };
  }
}

/**
 * Mark all notifications as read for a specific user
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        status: 'unread'
      },
      data: {
        status: 'read'
      }
    });
    
    return { success: true, count: result.count };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error };
  }
} 