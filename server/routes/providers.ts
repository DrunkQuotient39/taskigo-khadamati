import { Router, Request } from 'express';
import { firebaseAuthenticate } from '../middleware/firebaseAuth';
import authorize from '../middleware/auth';
import { validate } from '../middleware/security';
import { body } from 'express-validator';
import { log } from '../middleware/log';
import { audit } from '../middleware/audit';
import { getFirestore } from '../storage/firestore';
import { pool } from '../db';
import { uploadDataUrlToFirebase, isFirebaseStorageConfigured } from '../lib/uploads';
import { storage } from '../storage';

const router = Router();

// Apply to become a provider
router.post('/apply', firebaseAuthenticate, async (req, res) => {
  const requestId = (req as any).requestId;
  const uid = (req as any).user?.id || (req as any).firebaseUser?.uid;
  
  if (!uid) {
    log('error', 'provider.apply.unauthorized', { requestId });
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    log('info', 'provider.apply.start', { requestId, uid });
    
    // Accept both legacy and new payload shapes
    const body = req.body || {};
    let companyName = body.companyName || body.businessName;
    let nationalId = body.nationalId || body.licenseNumber || '';
    let idCardImageUrl = body.idCardImageUrl as string | undefined;
    const city = body.city || body.businessAddress;
    const businessType = body.businessType || body.serviceCategory;
    const phone = body.phone;
    const address = body.address || body.businessAddress;
    const businessDocs = Array.isArray(body.businessDocs) ? body.businessDocs : [];
    let extraDocs: string[] = Array.isArray(body.extraDocs) ? body.extraDocs : [];

    // If docs come as data URLs, upload to Firebase Storage and collect URLs
    if (!idCardImageUrl || businessDocs.length > 0) {
      const storageConfigured = isFirebaseStorageConfigured();
      log('info', 'provider.apply.docs_detected', { requestId, uid, docsCount: businessDocs.length, storageConfigured });
      if (storageConfigured) {
        for (const doc of businessDocs) {
          if (doc?.dataUrl && typeof doc.dataUrl === 'string' && doc.dataUrl.startsWith('data:')) {
            try {
              const url = await uploadDataUrlToFirebase(doc.dataUrl, { folder: `provider_docs/${uid}` });
              // First id_card becomes primary id image if not set
              if (!idCardImageUrl && (doc.type === 'id_card' || !doc.type)) {
                idCardImageUrl = url;
              } else {
                extraDocs.push(url);
              }
            } catch (e) {
              log('warn', 'provider.apply.upload_fail', { requestId, error: (e as any)?.message, fallback: true });
              // Fallback to raw provided data
              if (!idCardImageUrl && (doc.type === 'id_card' || !doc.type)) {
                idCardImageUrl = doc.dataUrl || doc.url || idCardImageUrl;
              } else if (doc?.url) {
                extraDocs.push(doc.url);
              }
            }
          } else if (doc?.url && typeof doc.url === 'string') {
            if (!idCardImageUrl && (doc.type === 'id_card' || !doc.type)) {
              idCardImageUrl = doc.url;
            } else {
              extraDocs.push(doc.url);
            }
          } else if (doc?.text) {
            // Text docs are not uploaded; can be stored separately if needed
          }
        }
      } else {
        // No Firebase Storage: fall back to provided URLs or data URLs
        for (const doc of businessDocs) {
          if (!idCardImageUrl && (doc?.type === 'id_card' || !doc?.type)) {
            idCardImageUrl = doc?.url || doc?.dataUrl || idCardImageUrl;
          } else if (doc?.url) {
            extraDocs.push(doc.url);
          }
        }
      }
      log('info', 'provider.apply.docs_processed', { requestId, uid, hasIdCardUrl: !!idCardImageUrl, extraDocsCount: extraDocs.length });
    }

    // Validate required fields
    if (!companyName || !idCardImageUrl) {
      log('warn', 'provider.apply.validation_fail', { 
        requestId, 
        uid, 
        missing: [
          !companyName ? 'companyName' : null,
          !idCardImageUrl ? 'idCardImageUrl' : null,
        ].filter(Boolean)
      });
      return res.status(400).json({ 
        error: 'Missing required fields: companyName, idCardImageUrl' 
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

    // Sanitize optional fields and arrays for Firestore (no undefined values)
    const cleanedExtraDocs = (extraDocs || []).filter((x: any) => typeof x === 'string' && x.length > 0);
    const applicationData: Record<string, any> = {
      uid,
      companyName: String(companyName),
      idCardImageUrl: String(idCardImageUrl),
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    if (nationalId) applicationData.nationalId = String(nationalId);
    if (cleanedExtraDocs.length > 0) applicationData.extraDocs = cleanedExtraDocs;
    if (city) applicationData.city = String(city);
    if (businessType) applicationData.businessType = String(businessType);
    if (phone) applicationData.phone = String(phone);
    if (address) applicationData.address = String(address);

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
]), async (req: Request, res: any) => {
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
]), async (req: Request, res: any) => {
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