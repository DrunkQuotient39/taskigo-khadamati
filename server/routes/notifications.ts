import { Router } from 'express';
import { firebaseAuthenticate } from '../middleware/firebaseAuth';
import { storage } from '../storage';

const router = Router();

// Get current user's notifications
router.get('/', firebaseAuthenticate as any, async (req: any, res: any) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'User not authenticated' });

    let notifications = await storage.getNotifications(userId);
    // If admin, include global admin notifications addressed to 'admin'
    if ((req as any).user?.role === 'admin') {
      try {
        const adminGlobal = await storage.getNotifications('admin' as any);
        notifications = [...notifications, ...adminGlobal];
      } catch {}
    }

    res.json({
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.post('/:id/read', firebaseAuthenticate as any, async (req: any, res: any) => {
  try {
    const notificationId = parseInt(req.params.id);
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'User not authenticated' });

    // Optional: verify ownership here when DB has relations
    if ((storage as any).markNotificationAsRead) {
      await (storage as any).markNotificationAsRead(notificationId);
    } else if ((storage as any).updateNotification) {
      await (storage as any).updateNotification(notificationId, { isRead: true });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

export default router;


