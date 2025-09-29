import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import authorize from '../middleware/auth';
import { firebaseAuthenticate } from '../middleware/firebaseAuth';
import { validate } from '../middleware/security';
import { body } from 'express-validator';
import admin from 'firebase-admin';
import { audit } from '../middleware/audit';
import { log } from '../middleware/log';
import { getFirestore } from '../storage/firestore';
import { pool } from '../db';

const router = Router();

// All admin routes require authentication and admin role
router.use(firebaseAuthenticate as any);
router.use(authorize('admin'));

// Get admin dashboard stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const users = await storage.getUsers();
    const services = await storage.getServices();
    const bookings = await storage.getBookings();
    const providers = await storage.getProviders();
    const payments = await storage.getPayments();
    const reviews = await storage.getReviews();

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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentBookings = bookings.filter(b => {
      const createdAt = b.createdAt ? new Date(b.createdAt) : null;
      return createdAt && createdAt > thirtyDaysAgo;
    }).length;
    
    const recentUsers = users.filter(u => {
      const createdAt = u.createdAt ? new Date(u.createdAt) : null;
      return createdAt && createdAt > thirtyDaysAgo;
    }).length;

    res.json({
      totalUsers,
      activeProviders: approvedProviders,
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
// Admin create service that is immediately approved and public
router.post('/services', async (req: Request, res: Response) => {
  try {
    const adminUid = (req as any).user?.id;
    const { title, description, price, categoryId = 1, location = '', images = [] } = req.body || {};
    if (!title || !description || !price) {
      return res.status(400).json({ message: 'title, description, price are required' });
    }
    const service = await storage.createService({
      providerId: adminUid,
      categoryId,
      title,
      description,
      price: String(price),
      priceType: 'fixed',
      duration: 60,
      location,
      images,
      status: 'approved',
      rating: '5.0',
      reviewCount: 0,
      isActive: true,
    } as any);
    return res.status(201).json({ message: 'Service created', service });
  } catch (e: any) {
    return res.status(500).json({ message: 'Failed to create service', error: e?.message });
  }
});

// Revoke provider (admin)
router.post('/applications/:uid/revoke', async (req: Request, res: Response) => {
  const { uid } = req.params;
  const requestId = (req as any).requestId;
  try {
    const fs = getFirestore();
    if (fs) {
      await fs.doc(`provider_applications/${uid}`).set({ status: 'rejected', reviewedAt: Date.now(), reviewerUid: (req as any).user?.id }, { merge: true });
    }
    try { await storage.updateUser(uid, { role: 'client' } as any); } catch {}
    try { if (pool) await (pool as any).query(`UPDATE providers SET status='rejected', approved_at=NULL WHERE uid=$1`, [uid]); } catch {}
    return res.json({ message: 'Provider access revoked' });
  } catch (e: any) {
    return res.status(500).json({ message: 'Failed to revoke', error: e?.message });
  }
});


// Get all users with filtering
router.get('/users', async (req: Request, res: Response) => {
  try {
    const { role, status, search, limit = 50, offset = 0 } = req.query;

    // Fetch all users and dedupe by id|email on server side
    const raw = await storage.getUsers();
    const seen = new Set<string>();
    let users = raw.filter(u => {
      const key = `${u.id || ''}|${(u.email || '').toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (role) {
      users = users.filter(u => u.role === role);
    }

    if (status === 'active') {
      users = users.filter(u => u.isActive);
    } else if (status === 'inactive') {
      users = users.filter(u => !u.isActive);
    }

    if (search && typeof search === 'string') {
      const s = search.toLowerCase();
      users = users.filter(u =>
        (u.email || '').toLowerCase().includes(s) ||
        (u.firstName || '').toLowerCase().includes(s) ||
        (u.lastName || '').toLowerCase().includes(s)
      );
    }

    // Augment presence info using sessions if available
    const withPresence = await Promise.all(users.map(async (u) => {
      try {
        const sessions = await storage.getUserSessions?.(u.id);
        const recent = Array.isArray(sessions) ? sessions
          .filter(s => s.isActive)
          .sort((a, b) => new Date(b.lastActivity || b.createdAt || 0).getTime() - new Date(a.lastActivity || a.createdAt || 0).getTime()) : [];
        const last = recent[0]?.lastActivity || recent[0]?.createdAt || null;
        const isOnline = last ? (Date.now() - new Date(last as any).getTime()) < 5 * 60 * 1000 : false;
        return { ...u, lastActiveAt: last, isOnline };
      } catch {
        return { ...u, isOnline: false } as any;
      }
    }));

    const startIndex = parseInt(offset as string);
    const limitNum = parseInt(limit as string);
    const paginatedUsers = withPresence.slice(startIndex, startIndex + limitNum);

    res.json({
      users: paginatedUsers,
      totalCount: withPresence.length,
      hasMore: startIndex + limitNum < withPresence.length
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ message: 'Failed to get users' });
  }
});

// List all provider applications (archive) with documents if Firestore configured
router.get('/applications', async (req: Request, res: Response) => {
  try {
    const fs = getFirestore();
    let applications: any[] = [];
    if (fs) {
      const snapshot = await fs.collection('provider_applications').get();
      applications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // Also include legacy providers awaiting or processed from storage as a fallback archive
    const providers = await storage.getProviders();
    const legacy = providers.map(p => ({
      id: String(p.id || p.userId),
      userId: p.userId,
      companyName: (p as any).businessName,
      status: p.approvalStatus || 'pending',
      createdAt: p.createdAt,
      source: 'storage'
    }));

    // Prefer Firestore if present; merge unique by userId/id
    const merged: Record<string, any> = {};
    for (const a of [...applications, ...legacy]) {
      const key = String(a.userId || a.id);
      if (!merged[key]) merged[key] = a;
    }

    const list = Object.values(merged);
    res.json({ applications: list, totalCount: list.length });
  } catch (e) {
    console.error('List applications error:', e);
    res.status(500).json({ message: 'Failed to list applications' });
  }
});

// Ban/unban user
router.put('/ban-user', validate([
  body('userId').notEmpty().withMessage('User ID required'),
  body('banned').isBoolean().withMessage('Banned status required'),
  body('reason').optional().trim().isLength({ max: 500 })
]), async (req: Request, res: Response) => {
  try {
    const { userId, banned, reason } = req.body;
    const adminUserId = (req as any).user?.id;

    if (!adminUserId) {
      return res.status(401).json({ message: 'Admin user not found' });
    }

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

// Get pending approvals
router.get('/pending-approvals', async (req: Request, res: Response) => {
  try {
    // Get pending provider applications from Firestore
    const fs = getFirestore();
    let pendingApplications: any[] = [];
    
    if (fs) {
      try {
        const appsSnapshot = await fs.collection('provider_applications')
          .where('status', '==', 'pending')
          .get();
        
        pendingApplications = appsSnapshot.docs.map(doc => ({
          id: doc.id, // This is the Firebase UID
          userId: doc.id, // Also the Firebase UID
          businessName: doc.data()?.companyName || 'Unknown Company',
          city: doc.data()?.city || 'Unknown City',
          businessType: doc.data()?.businessType || 'Unknown Type',
          businessDocs: doc.data()?.extraDocs || [],
          idCardImageUrl: doc.data()?.idCardImageUrl || null,
          createdAt: doc.data()?.createdAt || Date.now(),
          isApplication: true // Flag to indicate this is from Firestore
        }));
      } catch (e) {
        log('warn', 'admin.pending_approvals.firestore_fail', { error: (e as any)?.message });
      }
    }
    
    // Get pending providers from storage system (legacy)
    const storageProviders = await storage.getProviders({ status: 'pending' });
    const legacyProviders = storageProviders.map(p => ({
      id: p.id,
      userId: p.userId,
      businessName: p.businessName,
      city: p.city,
      businessType: p.businessType,
      businessDocs: p.businessDocs || [],
      createdAt: p.createdAt,
      isApplication: false // Flag to indicate this is from storage
    }));
    
    // Combine both sources, prioritizing Firestore applications
    const allProviders = [...pendingApplications, ...legacyProviders];
    
    // Get pending services
    const services = await storage.getServices();
    const pendingServices = services.filter(s => s.status === 'pending');

    // Get pending bookings that need attention
    const bookings = await storage.getBookings();
    const pendingBookings = bookings.filter(b => b.status === 'pending');

    res.json({
      providers: allProviders,
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
        pendingProviders: allProviders.length,
        pendingServices: pendingServices.length,
        pendingBookings: pendingBookings.length
      }
    });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ message: 'Failed to get pending approvals' });
  }
});

// Get application detail
router.get('/applications/:uid', async (req: Request, res: Response) => {
  const { uid } = req.params;
  const requestId = (req as any).requestId;
  
  try {
    log('info', 'admin.applications.detail.start', { requestId, uid });
    
    const fs = getFirestore();
    if (!fs) {
      log('error', 'admin.applications.detail.firestore_unavailable', { requestId, uid });
      return res.status(503).json({ error: 'Firestore not configured' });
    }
    
    const snap = await fs.doc(`provider_applications/${uid}`).get();
    if (!snap.exists) {
      log('warn', 'admin.applications.detail.not_found', { requestId, uid });
      return res.status(404).json({ error: 'Application not found' });
    }
    
    const data = snap.data();
    log('info', 'admin.applications.detail.ok', { requestId, uid });
    
    return res.json({ uid, ...data });
  } catch (err: any) {
    log('error', 'admin.applications.detail.fail', { 
      requestId, 
      uid, 
      error: err?.message,
      code: err?.code 
    });
    return res.status(500).json({ error: 'Failed to load application' });
  }
});

// Approve provider application
router.post('/applications/:uid/approve', async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    // Normalize approved (may arrive as string)
    const approved = typeof req.body?.approved === 'boolean'
      ? req.body.approved
      : String(req.body?.approved).toLowerCase() === 'true';
    const reason = req.body?.reason;
    const adminUserId = (req as any).user?.id;
    const requestId = (req as any).requestId;

    if (!adminUserId) {
      return res.status(401).json({ message: 'Admin user not found' });
    }

    log('info', 'admin.approve.start', { requestId, uid, approved, route: req.originalUrl });

    // Firestore guard
    const fs = getFirestore();
    if (!fs) {
      log('error', 'admin.approve.firestore_unavailable', { requestId, uid });
      return res.status(500).json({ message: 'Firestore not available' });
    }

    const appDoc = await fs.doc(`provider_applications/${uid}`).get();
    if (!appDoc.exists) {
      log('warn', 'admin.approve.application_not_found', { requestId, uid });
      return res.status(404).json({ message: 'Application not found' });
    }

    const appData = appDoc.data();
    const newStatus = approved ? 'approved' : 'rejected';

    // 1) Firestore update
    log('info', 'admin.approve.step', { requestId, uid, step: 'firestore_update', route: req.originalUrl });
    await fs.doc(`provider_applications/${uid}`).set({
      status: newStatus,
      reviewedAt: Date.now(),
      reviewerUid: adminUserId,
      reason: reason || null
    }, { merge: true });
    log('info', 'admin.approve.step', { requestId, uid, step: 'firestore_update', status: 'ok' });

    if (approved) {
      // 2) Set Firebase custom claims (preserve existing)
      log('info', 'admin.approve.step', { requestId, uid, step: 'claims_set' });
      try {
        const userRecord = await admin.auth().getUser(uid);
        const existingClaims = userRecord.customClaims || {};
        const newClaims = { ...existingClaims, provider: true };
        await admin.auth().setCustomUserClaims(uid, newClaims);
        log('info', 'admin.approve.step', { requestId, uid, step: 'claims_set', status: 'ok' });
      } catch (e: any) {
        // Do not fail the entire approval if claims update fails locally
        log('error', 'admin.approve.step', { 
          requestId, uid, step: 'claims_set', status: 'fail',
          name: e?.name, code: e?.code, error: e?.message 
        });
      }

      // 3) Ensure user exists in storage and set role
      log('info', 'admin.approve.step', { requestId, uid, step: 'role_update' });
      try {
        // Try update first
        const updated = await storage.updateUser(uid, { role: 'provider', isActive: true });
        if (!updated) {
          // Upsert minimal user record if not present (common when user hasn't logged in yet)
          await storage.upsertUser({
            id: uid,
            email: (appData?.email as string) || null as any,
            firstName: (appData?.firstName as string) || 'Provider',
            lastName: (appData?.lastName as string) || '',
            role: 'provider',
            isVerified: true,
            isActive: true,
          } as any);
        }
        log('info', 'admin.approve.step', { requestId, uid, step: 'role_update', status: 'ok' });
      } catch (e: any) {
        log('warn', 'admin.approve.step', { 
          requestId, 
          uid, 
          step: 'role_update', 
          status: 'fail',
          error: e?.message 
        });
        // Don't fail the whole request if role update fails
      }

      // 4) Neon upsert
      log('info', 'admin.approve.step', { requestId, uid, step: 'neon_upsert' });
      try {
        if (pool) {
          await (pool as any).query(
            `INSERT INTO providers (uid, company_name, status, approved_at)
             VALUES ($1, $2, 'approved', NOW())
             ON CONFLICT (uid) DO UPDATE SET 
               status = 'approved',
               approved_at = NOW()`,
            [uid, appData?.companyName || '']
          );
          log('info', 'admin.approve.step', { requestId, uid, step: 'neon_upsert', status: 'ok' });
        } else {
          log('warn', 'admin.approve.step', { 
            requestId, 
            uid, 
            step: 'neon_upsert', 
            status: 'skipped',
            reason: 'pool_not_available'
          });
        }
      } catch (e: any) {
        log('error', 'admin.approve.step', { requestId, uid, step: 'neon_upsert', status: 'fail', name: e?.name, code: e?.code, error: e?.message });
      }

      // Set header to trigger client-side claims refresh
      res.setHeader('X-Action', 'claims-updated');
    } else {
      // If rejected, also update Neon providers table
      try {
        if (pool) {
          await (pool as any).query(
            `INSERT INTO providers (uid, company_name, status, approved_at)
             VALUES ($1, $2, 'rejected', NULL)
             ON CONFLICT (uid) DO UPDATE SET 
               status = 'rejected',
               approved_at = NULL`,
            [uid, appData?.companyName || '']
          );
        }
      } catch (e: any) {
        log('warn', 'admin.approve.neon_reject_upsert.fail', { 
          requestId, 
          uid, 
          error: (e as any)?.message 
        });
      }
    }

    // Step 5: Create notification for the applicant (ensure user exists first to avoid FK failure)
    log('info', 'admin.approve.step', { requestId, uid, step: 'notification_create' });
    try {
      try {
        const user = await storage.getUser(uid);
        if (!user) {
          await storage.upsertUser({ id: uid, role: approved ? 'provider' : 'client', isVerified: true, isActive: true } as any);
        }
      } catch {}
      const notification = await storage.createNotification({
        userId: uid,
        title: approved ? 'Provider Application Approved' : 'Provider Application Rejected',
        message: approved ? 
          'Congratulations! Your provider application has been approved. You can now create services.' :
          `Your provider application has been rejected. ${reason ? `Reason: ${reason}` : ''}`,
        type: 'system',
        metadata: {
          action: newStatus,
          adminUserId,
          reason: reason || null
        }
      });
      log('info', 'admin.approve.step', { 
        requestId, 
        uid, 
        step: 'notification_create', 
        status: 'ok',
        notificationId: notification.id
      });
    } catch (e) {
      log('error', 'admin.approve.step', { 
        requestId, 
        uid, 
        step: 'notification_create',
        status: 'fail',
        error: (e as any)?.message,
        stack: (e as any)?.stack
      });
    }

    // Step 6: Audit log
    log('info', 'admin.approve.step', { requestId, uid, step: 'audit_row' });
    await audit({
      requestId,
      actorUid: adminUserId,
      action: approved ? 'provider.application.approve' : 'provider.application.reject',
      targetUid: uid,
      resultCode: 'ok',
      details: { 
        companyName: appData?.companyName,
        reason: reason || null
      },
    });
    log('info', 'admin.approve.step', { requestId, uid, step: 'audit_row', status: 'ok' });

    log('info', 'admin.approve.end', { requestId, uid, approved });

    res.setHeader('X-Action', approved ? 'claims-updated' : 'no-action');
    res.json({
      message: `Provider application ${approved ? 'approved' : 'rejected'} successfully`,
      application: {
        uid,
        status: newStatus,
        companyName: appData?.companyName
      }
    });

  } catch (error: any) {
    const requestId = (req as any).requestId;
    const uid = req.params.uid;
    
    log('error', 'admin.approve.fail', { 
      requestId, 
      uid,
      name: error?.name,
      code: error?.code,
      error: error?.message,
      stack: error?.stack
    });

    // Audit log for failure
    try {
      await audit({
        requestId,
        actorUid: (req as any).user?.id || 'unknown',
        action: 'provider.application.approve',
        targetUid: uid,
        resultCode: 'fail',
        details: { 
          error: error.message,
          code: error.code
        },
      });
    } catch (auditError) {
      log('error', 'admin.approve.audit_fail', { 
        requestId, 
        uid, 
        auditError: (auditError as any)?.message 
      });
    }

    res.status(500).json({ 
      message: 'Failed to process application approval', 
      requestId 
    });
  }
});

// Approve or reject a service (admin)
router.post('/services/:id/approve', async (req: Request, res: Response) => {
  try {
    const serviceId = parseInt(req.params.id);
    const approved = typeof req.body?.approved === 'boolean'
      ? req.body.approved
      : String(req.body?.approved).toLowerCase() === 'true';
    const requestId = (req as any).requestId;

    if (isNaN(serviceId)) {
      return res.status(400).json({ message: 'Invalid service ID' });
    }

    const service = await storage.getService(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const newStatus = approved ? 'approved' : 'rejected';
    await storage.updateService(serviceId, { status: newStatus, updatedAt: new Date() });

    try {
      await storage.createSystemLog({
        level: 'info',
        category: 'service',
        message: `Service ${newStatus}: ${service.title}`,
        userId: (req as any).user?.id,
        metadata: { action: 'admin_approval', serviceId, approved }
      });
    } catch {}

    return res.json({ message: `Service ${newStatus} successfully` });
  } catch (error: any) {
    console.error('Admin service approval error:', error);
    return res.status(500).json({ message: 'Failed to update service status' });
  }
});

// Reject provider application
router.post('/applications/:uid/reject', async (req: Request, res: Response) => {
  const { uid } = req.params;
  const { reason = '' } = req.body || {};
  const requestId = (req as any).requestId;
  
  try {
    log('info', 'admin.reject.start', { requestId, uid, reason });
    
    const fs = getFirestore();
    if (!fs) {
      log('error', 'admin.reject.firestore_unavailable', { requestId, uid });
      return res.status(503).json({ error: 'Firestore not configured' });
    }
    
    // Update Firestore status
    await fs.doc(`provider_applications/${uid}`).update({
      status: 'rejected',
      reviewedAt: Date.now(),
      reviewerUid: (req as any).user?.id,
      reason: reason,
    });
    
    // Reflect in Neon as rejected
    try {
      if (pool) {
        await (pool as any).query(
          `INSERT INTO providers (uid, company_name, status, approved_at, updated_at)
           VALUES ($1, $2, 'rejected', NULL, NOW())
           ON CONFLICT (uid) DO UPDATE SET 
             status='rejected', 
             approved_at=NULL,
             updated_at=NOW()`,
          [uid, '']
        );
        log('info', 'admin.reject.neon_update.ok', { requestId, uid });
      }
    } catch (e: any) {
      log('warn', 'admin.reject.neon_update.fail', { 
        requestId, 
        uid, 
        error: e?.message 
      });
    }
    
    // Audit log
    await audit({
      requestId,
      actorUid: (req as any).user?.id || 'unknown',
      action: 'provider.application.reject',
      targetUid: uid,
      resultCode: 'ok',
      details: { reason }
    });
    
    log('info', 'admin.reject.ok', { requestId, uid });
    return res.json({ ok: true });
  } catch (err: any) {
    log('error', 'admin.reject.fail', { 
      requestId, 
      uid, 
      name: err?.name,
      code: err?.code,
      error: err?.message,
      stack: err?.stack
    });
    return res.status(500).json({ error: 'Failed to reject application' });
  }
});

export default router;