import { Router, Request } from 'express';
import { firebaseAuthenticate } from '../middleware/firebaseAuth';
import authorize from '../middleware/auth';
import { validate } from '../middleware/security';
import { body } from 'express-validator';
import { log } from '../middleware/log';
import { audit } from '../middleware/audit';
import { getFirestore } from '../storage/firestore';
import { pool } from '../db';

const router = Router();

// Apply to become a provider
router.post('/apply', firebaseAuthenticate, async (req, res) => {
  const requestId = (req as any).requestId;
  const uid = (req as any).user?.uid;
  
  if (!uid) {
    log('error', 'provider.apply.unauthorized', { requestId });
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    log('info', 'provider.apply.start', { requestId, uid });
    
    const {
      companyName,
      nationalId,
      idCardImageUrl,
      extraDocs = [],
      city,
      businessType,
      phone,
      address
    } = req.body;

    // Validate required fields
    if (!companyName || !nationalId || !idCardImageUrl) {
      log('warn', 'provider.apply.validation_fail', { 
        requestId, 
        uid, 
        missing: ['companyName', 'nationalId', 'idCardImageUrl'].filter(f => !req.body[f])
      });
      return res.status(400).json({ 
        error: 'Missing required fields: companyName, nationalId, idCardImageUrl' 
      });
    }

    // Get Firestore instance
    const fs = getFirestore();
    if (!fs) {
      log('error', 'provider.apply.firestore_unavailable', { requestId, uid });
      return res.status(500).json({ error: 'Firestore not available' });
    }

    // Check if application already exists
    const existingDoc = await fs.doc(`provider_applications/${uid}`).get();
    if (existingDoc.exists) {
      const existingData = existingDoc.data();
      if (existingData?.status === 'pending') {
        log('warn', 'provider.apply.already_pending', { requestId, uid });
        return res.status(409).json({ error: 'Application already submitted and pending review' });
      }
      if (existingData?.status === 'approved') {
        log('warn', 'provider.apply.already_approved', { requestId, uid });
        return res.status(409).json({ error: 'You are already an approved provider' });
      }
    }

    // Create the application document
    const applicationData = {
      uid,
      companyName,
      nationalId,
      idCardImageUrl,
      extraDocs,
      city,
      businessType,
      phone,
      address,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    await fs.doc(`provider_applications/${uid}`).set(applicationData);
    
    log('info', 'provider.apply.firestore_ok', { requestId, uid });

    // Also upsert into Neon providers table for consistency
    try {
      if (pool) {
        await (pool as any).query(
          `INSERT INTO providers (uid, company_name, status, created_at, updated_at)
           VALUES ($1, $2, 'pending', NOW(), NOW())
           ON CONFLICT (uid) DO UPDATE SET 
             company_name = EXCLUDED.company_name,
             status = 'pending',
             updated_at = NOW()`,
          [uid, companyName]
        );
        log('info', 'provider.apply.neon_upsert.ok', { requestId, uid });
      }
    } catch (e: any) {
      log('warn', 'provider.apply.neon_upsert.fail', { 
        requestId, 
        uid, 
        error: e?.message 
      });
      // Don't fail the whole request if Neon upsert fails
    }

    // Audit log
    await audit({
      requestId,
      actorUid: uid,
      action: 'provider.apply',
      targetUid: uid,
      resultCode: 'ok',
      details: { companyName, city, businessType }
    });

    log('info', 'provider.apply.success', { requestId, uid });

    res.json({ 
      message: 'Application submitted successfully for review',
      applicationId: uid
    });

  } catch (error: any) {
    log('error', 'provider.apply.fail', { 
      requestId, 
      uid, 
      error: error.message,
      code: error.code,
      stack: error.stack
    });

    // Audit log for failure
    try {
      await audit({
        requestId,
        actorUid: uid,
        action: 'provider.apply',
        targetUid: uid,
        resultCode: 'fail',
        details: { error: error.message }
      });
    } catch (auditError) {
      log('error', 'provider.apply.audit_fail', { 
        requestId, 
        uid, 
        auditError: (auditError as any)?.message 
      });
    }

    res.status(500).json({ 
      error: 'Failed to submit application',
      requestId 
    });
  }
});

// Get my services (for providers)
router.get('/my-services', authorize('provider'), async (req: Request, res) => {
  try {
    const userId = (req as any).user?.id;
    
    // Get provider profile first
    const provider = await storage.getProvider(userId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    const services = await storage.getProviderServices();
    
    // Filter services for this provider
    const myServices = services.filter(service => service.providerId === userId);
    
    res.json({
      services: myServices,
      totalCount: myServices.length
    });
  } catch (error) {
    console.error('Get my services error:', error);
    res.status(500).json({ message: 'Failed to get services' });
  }
});

// Get provider bookings
router.get('/bookings', authorize('provider'), async (req: Request, res) => {
  try {
    const userId = (req as any).user?.id;
    const { status, limit = 20, offset = 0 } = req.query;

    const bookings = await storage.getProviderBookings();
    
    // Filter bookings for this provider
    let providerBookings = bookings.filter(booking => booking.providerId === userId);
    
    // Filter by status if provided
    if (status && typeof status === 'string') {
      providerBookings = providerBookings.filter(booking => booking.status === status);
    }

    // Apply pagination
    const startIndex = parseInt(offset as string);
    const limitNum = parseInt(limit as string);
    const paginatedBookings = providerBookings.slice(startIndex, startIndex + limitNum);

    res.json({
      bookings: paginatedBookings,
      totalCount: providerBookings.length,
      hasMore: startIndex + limitNum < providerBookings.length
    });
  } catch (error) {
    console.error('Get provider bookings error:', error);
    res.status(500).json({ message: 'Failed to get bookings' });
  }
});

// Update service status (for providers)
router.put('/service-status', authorize('provider'), validate([
  body('serviceId').isInt({ min: 1 }).withMessage('Valid service ID required'),
  body('status').isIn(['active', 'inactive', 'pending']).withMessage('Valid status required'),
]), async (req: Request, res) => {
  try {
    const userId = (req as any).user?.id;
    const { serviceId, status } = req.body;

    // Get the service to verify ownership
    const service = await storage.getService(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.providerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }

    const updatedService = await storage.updateService(serviceId, { status });
    
    if (!updatedService) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Log status change
    await storage.createSystemLog({
      level: 'info',
      category: 'service',
      message: `Service status updated: ${service.title} -> ${status}`,
      userId,
      metadata: { 
        action: 'status_update',
        serviceId,
        oldStatus: service.status,
        newStatus: status
      }
    });

    res.json({
      message: 'Service status updated successfully',
      service: updatedService
    });
  } catch (error) {
    console.error('Update service status error:', error);
    res.status(500).json({ message: 'Failed to update service status' });
  }
});

// Get provider dashboard stats
router.get('/dashboard-stats', authorize('provider'), async (req: Request, res) => {
  try {
    const userId = (req as any).user?.id;

    // Get provider profile
    const provider = await storage.getProvider(userId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    // Get provider services
    const services = await storage.getProviderServices();
    const myServices = services.filter(s => s.providerId === userId);

    // Get provider bookings
    const bookings = await storage.getProviderBookings();
    const myBookings = bookings.filter(b => b.providerId === userId);

    // Calculate stats
    const totalServices = myServices.length;
    const activeServices = myServices.filter(s => s.status === 'active').length;
    const totalBookings = myBookings.length;
    const completedBookings = myBookings.filter(b => b.status === 'completed').length;
    const pendingBookings = myBookings.filter(b => b.status === 'pending').length;
    
    // Calculate total earnings (simplified)
    const totalEarnings = myBookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + parseFloat(b.totalAmount || '0'), 0);

    // Calculate average rating
    const ratings = myServices
      .map(s => parseFloat(s.rating || '0'))
      .filter(r => r > 0);
    const averageRating = ratings.length > 0 ? 
      ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;

    res.json({
      provider: {
        id: provider.id,
        businessName: provider.businessName,
        approvalStatus: provider.approvalStatus,
        city: provider.city,
        ratings: parseFloat(provider.ratings || '0')
      },
      stats: {
        totalServices,
        activeServices,
        totalBookings,
        completedBookings,
        pendingBookings,
        totalEarnings: totalEarnings.toFixed(2),
        averageRating: averageRating.toFixed(1),
        serviceCount: provider.serviceCount
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to get dashboard stats' });
  }
});

// Update provider profile
router.put('/profile', authorize('provider'), validate([
  body('businessName').optional().trim().isLength({ min: 2, max: 100 }),
  body('city').optional().trim().isLength({ min: 2, max: 50 }),
  body('businessType').optional().trim(),
]), async (req: Request, res) => {
  try {
    const userId = (req as any).user?.id;
    
    const provider = await storage.getProvider(userId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    const updatedProvider = await storage.updateProvider(provider.id, req.body);
    
    if (!updatedProvider) {
      return res.status(404).json({ message: 'Failed to update provider profile' });
    }

    // Log profile update
    await storage.createSystemLog({
      level: 'info',
      category: 'provider',
      message: `Provider profile updated`,
      userId,
      metadata: { 
        action: 'profile_update',
        changes: req.body
      }
    });

    res.json({
      message: 'Provider profile updated successfully',
      provider: updatedProvider
    });
  } catch (error) {
    console.error('Update provider profile error:', error);
    res.status(500).json({ message: 'Failed to update provider profile' });
  }
});

export default router;