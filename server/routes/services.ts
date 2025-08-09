import { Router } from 'express';
import { storage } from '../storage';
import { authenticate, authorize, optionalAuth, AuthRequest } from '../middleware/auth';
import { validate, serviceValidation } from '../middleware/security';
import { body } from 'express-validator';

const router = Router();

// Get all services (public with optional auth for personalization)
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { 
      category, 
      search, 
      priceRange, 
      sortBy = 'rating',
      location,
      limit = 20,
      offset = 0
    } = req.query;

    const services = await storage.getServices({
      category: category as string,
      search: search as string,
      priceRange: priceRange as string,
      sortBy: sortBy as string
    });

    // Filter by location if provided (simplified)
    let filteredServices = services;
    if (location) {
      filteredServices = services.filter(service => 
        service.location?.toLowerCase().includes((location as string).toLowerCase())
      );
    }

    // Apply pagination
    const startIndex = parseInt(offset as string);
    const limitNum = parseInt(limit as string);
    const paginatedServices = filteredServices.slice(startIndex, startIndex + limitNum);

    // Get service categories for filtering
    const categories = await storage.getServiceCategories();

    res.json({
      services: paginatedServices,
      categories,
      totalCount: filteredServices.length,
      hasMore: startIndex + limitNum < filteredServices.length,
      filters: {
        category,
        search,
        priceRange,
        sortBy,
        location
      }
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ message: 'Failed to get services' });
  }
});

// Create new service (providers only)
router.post('/create', authenticate, authorize('provider'), validate([
  serviceValidation.title,
  serviceValidation.description,
  serviceValidation.price,
  serviceValidation.categoryId
]), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    
    // Verify provider exists and is approved
    const provider = await storage.getProvider(userId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider profile not found' });
    }

    if (provider.approvalStatus !== 'approved') {
      return res.status(403).json({ message: 'Provider must be approved to create services' });
    }

    const {
      title,
      titleAr,
      description,
      descriptionAr,
      price,
      priceType = 'hourly',
      duration,
      categoryId,
      location,
      images = [],
      availability = {},
      tags = []
    } = req.body;

    const service = await storage.createService({
      providerId: userId,
      categoryId,
      title,
      titleAr,
      description,
      descriptionAr,
      price: price.toString(),
      priceType,
      duration,
      location,
      images,
      availability,
      status: 'pending', // Requires admin approval
      rating: "0.00",
      reviewCount: 0,
      isActive: true
    });

    // Update provider service count
    await storage.updateProvider(provider.id, {
      serviceCount: provider.serviceCount + 1
    });

    // Log service creation
    await storage.createSystemLog({
      level: 'info',
      category: 'service',
      message: `New service created: ${title}`,
      userId,
      metadata: { 
        action: 'create',
        serviceId: service.id,
        categoryId,
        price
      }
    });

    res.status(201).json({
      message: 'Service created successfully and is pending approval',
      service: {
        id: service.id,
        title: service.title,
        description: service.description,
        price: service.price,
        status: service.status
      }
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ message: 'Failed to create service' });
  }
});

// Get service by ID (public)
router.get('/:id', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const serviceId = parseInt(req.params.id);
    
    const service = await storage.getService(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Get provider info
    const provider = await storage.getProvider(service.providerId);
    
    // Get service reviews
    const reviews = await storage.getReviews(serviceId);
    
    // Get service images
    const images = await storage.getServiceImages(serviceId);

    res.json({
      service: {
        ...service,
        provider: provider ? {
          businessName: provider.businessName,
          city: provider.city,
          ratings: provider.ratings
        } : null,
        images,
        reviews: reviews.slice(0, 5), // Latest 5 reviews
        totalReviews: reviews.length
      }
    });
  } catch (error) {
    console.error('Get service by ID error:', error);
    res.status(500).json({ message: 'Failed to get service' });
  }
});

// Update service (provider only)
router.put('/:id', authenticate, authorize('provider'), validate([
  body('title').optional().trim().isLength({ min: 5, max: 100 }),
  body('description').optional().trim().isLength({ min: 20, max: 1000 }),
  body('price').optional().isDecimal({ decimal_digits: '0,2' }),
]), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const serviceId = parseInt(req.params.id);

    const service = await storage.getService(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.providerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }

    const updatedService = await storage.updateService(serviceId, {
      ...req.body,
      price: req.body.price ? req.body.price.toString() : undefined,
      status: 'pending', // Requires re-approval after updates
      updatedAt: new Date()
    });

    // Log service update
    await storage.createSystemLog({
      level: 'info',
      category: 'service',
      message: `Service updated: ${service.title}`,
      userId,
      metadata: { 
        action: 'update',
        serviceId,
        changes: req.body
      }
    });

    res.json({
      message: 'Service updated successfully and is pending approval',
      service: updatedService
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ message: 'Failed to update service' });
  }
});

// Delete service (provider only)
router.delete('/:id', authenticate, authorize('provider'), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const serviceId = parseInt(req.params.id);

    const service = await storage.getService(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.providerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }

    // Check if there are active bookings
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

    // Soft delete by setting isActive to false
    await storage.updateService(serviceId, {
      isActive: false,
      status: 'inactive'
    });

    // Update provider service count
    const provider = await storage.getProvider(userId);
    if (provider && provider.serviceCount > 0) {
      await storage.updateProvider(provider.id, {
        serviceCount: provider.serviceCount - 1
      });
    }

    // Log service deletion
    await storage.createSystemLog({
      level: 'info',
      category: 'service',
      message: `Service deleted: ${service.title}`,
      userId,
      metadata: { 
        action: 'delete',
        serviceId
      }
    });

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ message: 'Failed to delete service' });
  }
});

// Add service image
router.post('/:id/images', authenticate, authorize('provider'), validate([
  body('imageUrl').isURL().withMessage('Valid image URL required'),
  body('alt').optional().trim(),
  body('isPrimary').optional().isBoolean()
]), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const serviceId = parseInt(req.params.id);

    const service = await storage.getService(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.providerId !== userId) {
      return res.status(403).json({ message: 'Not authorized to modify this service' });
    }

    const { imageUrl, alt, isPrimary = false } = req.body;

    // If this is set as primary, unset other primary images
    if (isPrimary) {
      const existingImages = await storage.getServiceImages(serviceId);
      for (const img of existingImages) {
        if (img.isPrimary) {
          await storage.updateServiceImage(img.id, { isPrimary: false });
        }
      }
    }

    const image = await storage.createServiceImage({
      serviceId,
      imageUrl,
      alt,
      isPrimary,
      sortOrder: 0
    });

    res.status(201).json({
      message: 'Image added successfully',
      image
    });
  } catch (error) {
    console.error('Add service image error:', error);
    res.status(500).json({ message: 'Failed to add image' });
  }
});

// Get service recommendations based on user preferences
router.post('/recommendations', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { preferences, location, budget, category } = req.body;
    const userId = req.user?.id;

    // Get all services
    const services = await storage.getServices();
    
    // Basic filtering
    let filteredServices = services.filter(s => s.status === 'approved' && s.isActive);
    
    if (category) {
      filteredServices = filteredServices.filter(s => s.categoryId.toString() === category.toString());
    }
    
    if (budget) {
      filteredServices = filteredServices.filter(s => parseFloat(s.price) <= parseFloat(budget));
    }
    
    if (location) {
      filteredServices = filteredServices.filter(s => 
        s.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Sort by rating and review count
    filteredServices.sort((a, b) => {
      const aScore = parseFloat(a.rating || '0') * (a.reviewCount || 1);
      const bScore = parseFloat(b.rating || '0') * (b.reviewCount || 1);
      return bScore - aScore;
    });

    // Log recommendation request
    if (userId) {
      await storage.createAiLog({
        userId,
        query: JSON.stringify({ preferences, location, budget, category }),
        response: `Found ${filteredServices.length} recommended services`,
        intent: 'recommend',
        language: req.user?.language || 'en',
        model: 'basic_filter'
      });
    }

    res.json({
      recommendations: filteredServices.slice(0, 10), // Top 10
      totalFound: filteredServices.length,
      filters: { location, budget, category }
    });
  } catch (error) {
    console.error('Service recommendations error:', error);
    res.status(500).json({ message: 'Failed to get recommendations' });
  }
});

export default router;