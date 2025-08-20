import { Router } from 'express';
import { storage } from '../storage';
import { authorize, AuthRequest } from '../middleware/auth';
import { firebaseAuthenticate } from '../middleware/firebaseAuth';
import { validate } from '../middleware/security';
import { body } from 'express-validator';
import { isFirebaseStorageConfigured, uploadDataUrlToFirebase } from '../lib/uploads';

const router = Router();

// All routes require Firebase authentication
router.use(firebaseAuthenticate as any);

// Provider application
router.post('/apply', validate([
  body('businessName').trim().isLength({ min: 2, max: 100 }).withMessage('Business name must be 2-100 characters'),
  body('city').trim().isLength({ min: 2, max: 50 }).withMessage('City is required'),
  body('businessType').optional().trim(),
  body('licenseNumber').optional().trim(),
  body('businessDocs').optional().isArray().withMessage('businessDocs must be an array'),
  body('businessDocs.*.type').optional().isIn(['id_card','certification','description']).withMessage('Invalid doc type'),
  body('businessDocs.*.dataUrl').optional().isString(),
  body('businessDocs.*.text').optional().isString(),
]), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    // Check if user already has a provider profile
    const existingProvider = await storage.getProvider(userId);
    if (existingProvider) {
      return res.status(400).json({ message: 'Provider profile already exists' });
    }

    const {
      businessName,
      city,
      businessType,
      licenseNumber,
      businessDocs,
      insuranceInfo
    } = req.body;

    // Persist documents to Firebase Storage if configured
    let normalizedDocs = Array.isArray(businessDocs) ? businessDocs : [];
    if (normalizedDocs.length > 0) {
      const useFirebaseStorage = isFirebaseStorageConfigured();
      const uploaded: any[] = [];
      for (const doc of normalizedDocs) {
        if ((doc.type === 'id_card' || doc.type === 'certification') && doc.dataUrl) {
          try {
            if (useFirebaseStorage) {
              const url = await uploadDataUrlToFirebase(doc.dataUrl, { folder: `provider-docs/${userId}` });
              uploaded.push({ type: doc.type, url });
            } else {
              uploaded.push({ type: doc.type, url: doc.dataUrl });
            }
          } catch {
            uploaded.push({ type: doc.type, url: doc.dataUrl });
          }
        } else if (doc.type === 'description' && doc.text) {
          uploaded.push({ type: doc.type, text: doc.text });
        }
      }
      normalizedDocs = uploaded;
    }

    const provider = await storage.createProvider({
      userId,
      businessName,
      city,
      businessType,
      licenseNumber,
      businessDocs: normalizedDocs || [],
      insuranceInfo: insuranceInfo || {},
      approvalStatus: 'pending',
      ratings: "0.00",
      serviceCount: 0
    });

    // Log provider application
    await storage.createSystemLog({
      level: 'info',
      category: 'provider',
      message: `Provider application submitted: ${businessName}`,
      userId,
      metadata: { 
        action: 'apply',
        businessName,
        city
      }
    });

    res.status(201).json({
      message: 'Provider application submitted successfully',
      provider: {
        id: provider.id,
        businessName: provider.businessName,
        approvalStatus: provider.approvalStatus,
        city: provider.city
      }
    });
  } catch (error) {
    console.error('Provider apply error:', error);
    res.status(500).json({ message: 'Failed to submit provider application' });
  }
});

// Get my services (for providers)
router.get('/my-services', authorize('provider'), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
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
router.get('/bookings', authorize('provider'), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
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
]), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
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
router.get('/dashboard-stats', authorize('provider'), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

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
]), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
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