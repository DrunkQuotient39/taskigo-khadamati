import { Router } from 'express';
import { storage } from '../storage';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { validate, bookingValidation } from '../middleware/security';
import { body } from 'express-validator';

const router = Router();

// All booking routes require authentication
router.use(authenticate);

// Create new booking (clients only)
router.post('/create', authorize('client'), validate([
  bookingValidation.serviceId,
  bookingValidation.scheduledDate,
  bookingValidation.scheduledTime,
  bookingValidation.clientAddress,
  bookingValidation.clientPhone
]), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const {
      serviceId,
      scheduledDate,
      scheduledTime,
      duration,
      clientAddress,
      clientPhone,
      specialInstructions
    } = req.body;

    // Get service details
    const service = await storage.getService(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.status !== 'approved' || !service.isActive) {
      return res.status(400).json({ message: 'Service is not available for booking' });
    }

    // Calculate total amount
    const servicePrice = parseFloat(service.price);
    const bookingDuration = duration || service.duration || 60; // Default 1 hour
    let totalAmount = servicePrice;
    
    if (service.priceType === 'hourly') {
      totalAmount = servicePrice * (bookingDuration / 60);
    }

    const booking = await storage.createBooking({
      clientId: userId,
      serviceId,
      providerId: service.providerId,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      duration: bookingDuration,
      totalAmount: totalAmount.toString(),
      clientAddress,
      clientPhone,
      specialInstructions,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Create notification for provider
    await storage.createNotification({
      userId: service.providerId,
      title: 'New Booking Request',
      message: `You have a new booking request for ${service.title}`,
      type: 'booking',
      metadata: {
        bookingId: booking.id,
        serviceId: booking.serviceId,
        scheduledDate: scheduledDate,
        totalAmount: totalAmount.toString()
      }
    });

    // Log booking creation
    await storage.createSystemLog({
      level: 'info',
      category: 'booking',
      message: `New booking created for service: ${service.title}`,
      userId,
      metadata: {
        action: 'create',
        bookingId: booking.id,
        serviceId,
        providerId: service.providerId,
        totalAmount: totalAmount.toString()
      }
    });

    // TODO: Send email/SMS notifications

    res.status(201).json({
      message: 'Booking created successfully',
      booking: {
        id: booking.id,
        serviceTitle: service.title,
        scheduledDate: booking.scheduledDate,
        scheduledTime: booking.scheduledTime,
        totalAmount: booking.totalAmount,
        status: booking.status,
        paymentStatus: booking.paymentStatus
      }
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Failed to create booking' });
  }
});

// Get user bookings (client bookings)
router.get('/client/:clientId', async (req: AuthRequest, res) => {
  try {
    const clientId = req.params.clientId;
    const userId = req.user!.id;
    
    // Users can only see their own bookings unless they're admin
    if (userId !== clientId && req.user!.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { status, limit = 20, offset = 0 } = req.query;
    
    const allBookings = await storage.getBookings();
    let userBookings = allBookings.filter(booking => booking.clientId === clientId);
    
    // Filter by status if provided
    if (status && typeof status === 'string') {
      userBookings = userBookings.filter(booking => booking.status === status);
    }

    // Apply pagination
    const startIndex = parseInt(offset as string);
    const limitNum = parseInt(limit as string);
    const paginatedBookings = userBookings.slice(startIndex, startIndex + limitNum);

    // Enhance bookings with service details
    const enhancedBookings = await Promise.all(
      paginatedBookings.map(async (booking) => {
        const service = await storage.getService(booking.serviceId);
        const provider = service ? await storage.getProvider(service.providerId) : null;
        
        return {
          ...booking,
          service: service ? {
            id: service.id,
            title: service.title,
            titleAr: service.titleAr
          } : null,
          provider: provider ? {
            businessName: provider.businessName,
            city: provider.city
          } : null
        };
      })
    );

    res.json({
      bookings: enhancedBookings,
      totalCount: userBookings.length,
      hasMore: startIndex + limitNum < userBookings.length
    });
  } catch (error) {
    console.error('Get client bookings error:', error);
    res.status(500).json({ message: 'Failed to get bookings' });
  }
});

// Update booking status (providers and admins)
router.put('/:id/status', validate([
  body('status').isIn(['pending', 'accepted', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Valid status required'),
  body('notes').optional().trim().isLength({ max: 500 })
]), async (req: AuthRequest, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const { status, notes } = req.body;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    const booking = await storage.getBooking(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check permissions
    const canUpdate = userRole === 'admin' || 
                     (userRole === 'provider' && booking.providerId === userId) ||
                     (userRole === 'client' && booking.clientId === userId && status === 'cancelled');

    if (!canUpdate) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    // Additional status validation based on role
    if (userRole === 'client' && status !== 'cancelled') {
      return res.status(400).json({ message: 'Clients can only cancel bookings' });
    }

    // Update booking
    const updateData: any = { status };
    if (notes) updateData.specialInstructions = notes;
    if (status === 'completed') updateData.completedAt = new Date();

    const updatedBooking = await storage.updateBooking(bookingId, updateData);
    if (!updatedBooking) {
      return res.status(404).json({ message: 'Failed to update booking' });
    }

    // Create notifications
    let notificationUserId = '';
    let notificationMessage = '';

    if (userRole === 'provider') {
      notificationUserId = booking.clientId;
      notificationMessage = `Your booking status has been updated to: ${status}`;
    } else if (userRole === 'client') {
      notificationUserId = booking.providerId;
      notificationMessage = `Booking has been ${status} by the client`;
    }

    if (notificationUserId) {
      await storage.createNotification({
        userId: notificationUserId,
        title: 'Booking Status Update',
        message: notificationMessage,
        type: 'booking',
        metadata: {
          bookingId: booking.id,
          newStatus: status,
          updatedBy: userId
        }
      });
    }

    // Log status change
    await storage.createSystemLog({
      level: 'info',
      category: 'booking',
      message: `Booking status updated: ${booking.id} -> ${status}`,
      userId,
      metadata: {
        action: 'status_update',
        bookingId: booking.id,
        oldStatus: booking.status,
        newStatus: status,
        role: userRole
      }
    });

    res.json({
      message: 'Booking status updated successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ message: 'Failed to update booking status' });
  }
});

// Cancel booking
router.post('/:id/cancel', validate([
  body('cancellationReason').trim().isLength({ min: 10, max: 500 })
    .withMessage('Cancellation reason must be 10-500 characters')
]), async (req: AuthRequest, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const { cancellationReason } = req.body;
    const userId = req.user!.id;

    const booking = await storage.getBooking(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user can cancel this booking
    const canCancel = booking.clientId === userId || 
                     booking.providerId === userId || 
                     req.user!.role === 'admin';

    if (!canCancel) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    // Check if booking can be cancelled
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ message: 'Booking cannot be cancelled' });
    }

    // Update booking
    const updatedBooking = await storage.updateBooking(bookingId, {
      status: 'cancelled',
      cancellationReason,
      updatedAt: new Date()
    });

    // Process refund if payment was made
    if (booking.paymentStatus === 'paid') {
      // TODO: Process refund through payment gateway
      await storage.updateBooking(bookingId, {
        paymentStatus: 'refunded'
      });
    }

    // Create notifications
    const otherUserId = booking.clientId === userId ? booking.providerId : booking.clientId;
    const role = booking.clientId === userId ? 'client' : 'provider';

    await storage.createNotification({
      userId: otherUserId,
      title: 'Booking Cancelled',
      message: `A booking has been cancelled by the ${role}. Reason: ${cancellationReason}`,
      type: 'booking',
      metadata: {
        bookingId: booking.id,
        cancelledBy: userId,
        reason: cancellationReason
      }
    });

    // Log cancellation
    await storage.createSystemLog({
      level: 'info',
      category: 'booking',
      message: `Booking cancelled: ${booking.id}`,
      userId,
      metadata: {
        action: 'cancel',
        bookingId: booking.id,
        reason: cancellationReason,
        cancelledBy: role
      }
    });

    res.json({
      message: 'Booking cancelled successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Failed to cancel booking' });
  }
});

// Get booking details
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const userId = req.user!.id;

    const booking = await storage.getBooking(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check permissions
    const canView = booking.clientId === userId || 
                   booking.providerId === userId || 
                   req.user!.role === 'admin';

    if (!canView) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get related data
    const service = await storage.getService(booking.serviceId);
    const provider = service ? await storage.getProvider(service.providerId) : null;
    const client = await storage.getUser(booking.clientId);

    // Get booking payment info
    const payments = await storage.getPayments({ bookingId: booking.id });

    res.json({
      booking: {
        ...booking,
        service: service ? {
          id: service.id,
          title: service.title,
          titleAr: service.titleAr,
          description: service.description,
          price: service.price,
          priceType: service.priceType
        } : null,
        provider: provider ? {
          businessName: provider.businessName,
          city: provider.city,
          ratings: provider.ratings
        } : null,
        client: client ? {
          firstName: client.firstName,
          lastName: client.lastName,
          language: client.language
        } : null,
        payments: payments || []
      }
    });
  } catch (error) {
    console.error('Get booking details error:', error);
    res.status(500).json({ message: 'Failed to get booking details' });
  }
});

export default router;