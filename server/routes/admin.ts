import { Router } from 'express';
import { storage } from '../storage';
import { authorize, AuthRequest } from '../middleware/auth';
import { firebaseAuthenticate } from '../middleware/firebaseAuth';
import { db } from '../db';
import { serviceAnalyticsDaily, services as servicesTable } from '../../shared/schema';
import { and, eq, gte, lte } from 'drizzle-orm';
import { validate } from '../middleware/security';
import { body } from 'express-validator';
// Import seed route
import seedRouter from './admin/seed';

const router = Router();

// All admin routes require authentication and admin role
router.use(firebaseAuthenticate as any);
router.use(authorize('admin'));

// Mount the seed route
router.use(seedRouter);

// Get admin dashboard stats
router.get('/stats', async (req: AuthRequest, res) => {
  try {
    // Get basic counts
    const users = await storage.getUsers();
    const services = await storage.getServices();
    const bookings = await storage.getBookings();
    const providers = await storage.getProviders();
    const payments = await storage.getPayments();
    const reviews = await storage.getReviews();

    // Calculate stats
    const totalUsers = users.length;
    const totalProviders = providers.length;
    const pendingProviders = providers.filter(p => p.approvalStatus === 'pending').length;
    const approvedProviders = providers.filter(p => p.approvalStatus === 'approved').length;
    
    const totalServices = services.length;
    const activeServices = services.filter(s => s.isActive && s.status === 'approved').length;
    const pendingServices = services.filter(s => s.status === 'pending').length;
    
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter(b => b.status === 'pending').length;
    const completedBookings = bookings.filter(b => b.status === 'completed').length;
    const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
    
    const totalRevenue = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);
    
    const totalPlatformFees = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.platformFee || '0'), 0);

    const totalReviews = reviews.length;
    const averageRating = reviews.length > 0 ? 
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentBookings = bookings.filter(b => 
      new Date(b.createdAt) > thirtyDaysAgo
    ).length;
    
    const recentUsers = users.filter(u => 
      new Date(u.createdAt) > thirtyDaysAgo
    ).length;

    res.json({
      overview: {
        totalUsers,
        totalProviders,
        totalServices,
        totalBookings,
        totalRevenue: totalRevenue.toFixed(2),
        totalPlatformFees: totalPlatformFees.toFixed(2)
      },
      providers: {
        total: totalProviders,
        pending: pendingProviders,
        approved: approvedProviders,
        rejected: providers.filter(p => p.approvalStatus === 'rejected').length
      },
      services: {
        total: totalServices,
        active: activeServices,
        pending: pendingServices,
        inactive: services.filter(s => !s.isActive).length
      },
      bookings: {
        total: totalBookings,
        pending: pendingBookings,
        completed: completedBookings,
        cancelled: cancelledBookings,
        inProgress: bookings.filter(b => b.status === 'in_progress').length
      },
      reviews: {
        total: totalReviews,
        averageRating: averageRating.toFixed(1)
      },
      recentActivity: {
        newBookings: recentBookings,
        newUsers: recentUsers
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ message: 'Failed to get admin statistics' });
  }
});

// Get all users with filtering
router.get('/users', async (req: AuthRequest, res) => {
  try {
    const { role, status, search, limit = 50, offset = 0 } = req.query;
    
    let users = await storage.getUsers();
    
    // Apply filters
    if (role) {
      users = users.filter(u => u.role === role);
    }
    
    if (status === 'active') {
      users = users.filter(u => u.isActive);
    } else if (status === 'inactive') {
      users = users.filter(u => !u.isActive);
    }
    
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      users = users.filter(u => 
        u.email?.toLowerCase().includes(searchLower) ||
        u.firstName?.toLowerCase().includes(searchLower) ||
        u.lastName?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const startIndex = parseInt(offset as string);
    const limitNum = parseInt(limit as string);
    const paginatedUsers = users.slice(startIndex, startIndex + limitNum);

    res.json({
      users: paginatedUsers,
      totalCount: users.length,
      hasMore: startIndex + limitNum < users.length
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
});

// Ban/unban user
router.put('/ban-user', validate([
  body('userId').notEmpty().withMessage('User ID required'),
  body('banned').isBoolean().withMessage('Banned status required'),
  body('reason').optional().trim().isLength({ max: 500 })
]), async (req: AuthRequest, res) => {
  try {
    const { userId, banned, reason } = req.body;
    const adminUserId = req.user!.id;

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot ban admin users' });
    }

    const updatedUser = await storage.updateUser(userId, {
      isActive: !banned
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'Failed to update user' });
    }

    // Create notification for user
    await storage.createNotification({
      userId,
      title: banned ? 'Account Suspended' : 'Account Restored',
      message: banned ? 
        `Your account has been suspended. ${reason || ''}` : 
        'Your account has been restored.',
      type: 'system',
      metadata: {
        action: banned ? 'banned' : 'unbanned',
        adminUserId,
        reason: reason || null
      }
    });

    // Log admin action
    await storage.createSystemLog({
      level: 'info',
      category: 'admin',
      message: `User ${banned ? 'banned' : 'unbanned'}: ${user.email}`,
      userId: adminUserId,
      metadata: {
        action: banned ? 'ban_user' : 'unban_user',
        targetUserId: userId,
        reason: reason || null
      }
    });

    res.json({
      message: `User ${banned ? 'banned' : 'unbanned'} successfully`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        isActive: updatedUser.isActive
      }
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Failed to update user status' });
  }
});

// Approve provider
router.post('/approve-provider', validate([
  body('providerId').isInt({ min: 1 }).withMessage('Valid provider ID required'),
  body('approved').isBoolean().withMessage('Approval status required'),
  body('notes').optional().trim().isLength({ max: 500 })
]), async (req: AuthRequest, res) => {
  try {
    const { providerId, approved, notes } = req.body;
    const adminUserId = req.user!.id;

      const targetProvider = await storage.getProviderById(providerId);
  
  if (!targetProvider) {
    return res.status(404).json({ message: 'Provider not found' });
  }

    const newStatus = approved ? 'approved' : 'rejected';
    const updatedProvider = await storage.updateProvider(providerId, {
      approvalStatus: newStatus
    });

    if (!updatedProvider) {
      return res.status(404).json({ message: 'Failed to update provider' });
    }

    // Create notification for provider
    await storage.createNotification({
      userId: targetProvider.userId,
      title: approved ? 'Provider Application Approved' : 'Provider Application Rejected',
      message: approved ? 
        'Congratulations! Your provider application has been approved. You can now create services.' :
        `Your provider application has been rejected. ${notes || ''}`,
      type: 'system',
      metadata: {
        action: newStatus,
        adminUserId,
        notes: notes || null
      }
    });

    // If approved, update user role to provider
    if (approved) {
      await storage.updateUser(targetProvider.userId, {
        role: 'provider'
      });
    }

    // Log admin action
    await storage.createSystemLog({
      level: 'info',
      category: 'admin',
      message: `Provider ${newStatus}: ${targetProvider.businessName}`,
      userId: adminUserId,
      metadata: {
        action: `${newStatus}_provider`,
        providerId,
        businessName: targetProvider.businessName,
        notes: notes || null
      }
    });

    res.json({
      message: `Provider ${newStatus} successfully`,
      provider: {
        id: updatedProvider.id,
        businessName: updatedProvider.businessName,
        approvalStatus: updatedProvider.approvalStatus
      }
    });
  } catch (error) {
    console.error('Approve provider error:', error);
    res.status(500).json({ message: 'Failed to update provider status' });
  }
});

// Delete/hide service
router.delete('/delete-service/:id', async (req: AuthRequest, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    const adminUserId = req.user!.id;

    const service = await storage.getService(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check for active bookings
    const bookings = await storage.getBookings();
    const activeBookings = bookings.filter(b => 
      b.serviceId === serviceId && ['pending', 'accepted', 'in_progress'].includes(b.status)
    );

    if (activeBookings.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete service with active bookings',
        activeBookings: activeBookings.length
      });
    }

    // Soft delete
    const updatedService = await storage.updateService(serviceId, {
      isActive: false,
      status: 'inactive'
    });

    // Notify provider
    await storage.createNotification({
      userId: service.providerId,
      title: 'Service Removed',
      message: `Your service "${service.title}" has been removed by admin.`,
      type: 'system',
      metadata: {
        action: 'service_removed',
        adminUserId,
        serviceId
      }
    });

    // Log admin action
    await storage.createSystemLog({
      level: 'info',
      category: 'admin',
      message: `Service deleted by admin: ${service.title}`,
      userId: adminUserId,
      metadata: {
        action: 'delete_service',
        serviceId,
        providerId: service.providerId
      }
    });

    res.json({
      message: 'Service deleted successfully',
      service: {
        id: serviceId,
        title: service.title,
        status: 'inactive'
      }
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Failed to delete service' });
  }
});

// Get system logs
router.get('/logs', async (req: AuthRequest, res) => {
  try {
    const { level, category, limit = 100, offset = 0 } = req.query;

    const logs = await storage.getSystemLogs({
      level: level as string,
      category: category as string
    });

    // Apply pagination
    const startIndex = parseInt(offset as string);
    const limitNum = parseInt(limit as string);
    const paginatedLogs = logs
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(startIndex, startIndex + limitNum);

    res.json({
      logs: paginatedLogs,
      totalCount: logs.length,
      hasMore: startIndex + limitNum < logs.length
    });
  } catch (error) {
    console.error('Get admin logs error:', error);
    res.status(500).json({ message: 'Failed to get system logs' });
  }
});

// Get analytics data
router.get('/analytics', async (req: AuthRequest, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const users = await storage.getUsers();
    const bookings = await storage.getBookings();
    const payments = await storage.getPayments();
    const services = await storage.getServices();

    // Filter data by period
    const periodBookings = bookings.filter(b => new Date(b.createdAt) >= startDate);
    const periodUsers = users.filter(u => new Date(u.createdAt) >= startDate);
    const periodPayments = payments.filter(p => new Date(p.createdAt) >= startDate);
    const periodServices = services.filter(s => new Date(s.createdAt) >= startDate);

    // Calculate metrics
    const totalRevenue = periodPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.amount || '0'), 0);

    const platformFees = periodPayments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + parseFloat(p.platformFee || '0'), 0);

    // Group by day for trends
    const dailyStats = {};
    const days = Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      dailyStats[dateStr] = {
        bookings: 0,
        users: 0,
        revenue: 0,
        services: 0
      };
    }

    // Populate daily stats
    periodBookings.forEach(booking => {
      const date = new Date(booking.createdAt).toISOString().split('T')[0];
      if (dailyStats[date]) dailyStats[date].bookings++;
    });

    periodUsers.forEach(user => {
      const date = new Date(user.createdAt).toISOString().split('T')[0];
      if (dailyStats[date]) dailyStats[date].users++;
    });

    periodPayments.filter(p => p.status === 'paid').forEach(payment => {
      const date = new Date(payment.createdAt).toISOString().split('T')[0];
      if (dailyStats[date]) {
        dailyStats[date].revenue += parseFloat(payment.amount || '0');
      }
    });

    periodServices.forEach(service => {
      const date = new Date(service.createdAt).toISOString().split('T')[0];
      if (dailyStats[date]) dailyStats[date].services++;
    });

    res.json({
      period,
      summary: {
        totalBookings: periodBookings.length,
        totalUsers: periodUsers.length,
        totalRevenue: totalRevenue.toFixed(2),
        platformFees: platformFees.toFixed(2),
        totalServices: periodServices.length,
        completionRate: periodBookings.length > 0 ? 
          (periodBookings.filter(b => b.status === 'completed').length / periodBookings.length * 100).toFixed(1) : '0'
      },
      dailyTrends: Object.entries(dailyStats).map(([date, stats]) => ({
        date,
        ...stats
      }))
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Failed to get analytics data' });
  }
});

// Services analytics with date range
router.get('/analytics/services', async (req: AuthRequest, res) => {
  try {
    const { start, end, serviceId } = req.query as { start?: string; end?: string; serviceId?: string };
    const startDate = start ? new Date(start) : new Date(new Date().toISOString().split('T')[0]);
    const endDate = end ? new Date(end) : new Date();
    const dateKeyStart = startDate.toISOString().split('T')[0];
    const dateKeyEnd = endDate.toISOString().split('T')[0];

    // Build where clause
    const where = [
      gte(serviceAnalyticsDaily.dateKey, dateKeyStart),
      lte(serviceAnalyticsDaily.dateKey, dateKeyEnd),
    ];
    if (serviceId) where.push(eq(serviceAnalyticsDaily.serviceId, parseInt(serviceId)));

    // Query daily analytics
    const rows = await db.select().from(serviceAnalyticsDaily)
      .where(and(...where));

    // Group by serviceId and dateKey
    const byService: Record<string, any> = {};
    for (const r of rows) {
      const key = String(r.serviceId);
      if (!byService[key]) byService[key] = { serviceId: r.serviceId, totalViews: 0, totalUnique: 0, daily: [] as any[] };
      byService[key].totalViews += r.views || 0;
      byService[key].totalUnique += r.uniqueViews || 0;
      byService[key].daily.push({ date: r.dateKey, views: r.views || 0, uniqueViews: r.uniqueViews || 0 });
    }

    // Attach basic service info
    const serviceIds = Object.values(byService).map((s: any) => s.serviceId);
    if (serviceIds.length > 0) {
      const svcRows = await db.select().from(servicesTable).where(eq(servicesTable.id, serviceIds[0] as any));
      // Note: Drizzle needs an 'in' variant; keeping single fetch minimal for MVP
      if (svcRows.length && byService[String(svcRows[0].id)]) {
        byService[String(svcRows[0].id)].serviceTitle = svcRows[0].title;
      }
    }

    res.json({
      range: { start: dateKeyStart, end: dateKeyEnd },
      results: Object.values(byService),
    });
  } catch (error) {
    console.error('Admin services analytics error:', error);
    res.status(500).json({ message: 'Failed to get services analytics' });
  }
});

// Get pending approvals
router.get('/pending-approvals', async (req: AuthRequest, res) => {
  try {
    // Get pending providers
    const providers = await storage.getProviders({ status: 'pending' });
    
    // Get pending services
    const services = await storage.getServices();
    const pendingServices = services.filter(s => s.status === 'pending');

    // Get pending bookings that need attention
    const bookings = await storage.getBookings();
    const pendingBookings = bookings.filter(b => b.status === 'pending');

    res.json({
      providers: providers.map(p => ({
        id: p.id,
        businessName: p.businessName,
        city: p.city,
        businessType: p.businessType,
        createdAt: p.createdAt
      })),
      services: pendingServices.slice(0, 20).map(s => ({
        id: s.id,
        title: s.title,
        providerId: s.providerId,
        price: s.price,
        createdAt: s.createdAt
      })),
      bookings: pendingBookings.slice(0, 10).map(b => ({
        id: b.id,
        serviceId: b.serviceId,
        totalAmount: b.totalAmount,
        scheduledDate: b.scheduledDate,
        createdAt: b.createdAt
      })),
      counts: {
        pendingProviders: providers.length,
        pendingServices: pendingServices.length,
        pendingBookings: pendingBookings.length
      }
    });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ message: 'Failed to get pending approvals' });
  }
});

export default router;