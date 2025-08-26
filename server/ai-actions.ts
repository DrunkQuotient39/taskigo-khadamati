/**
 * AI Action Handler
 * This module enables the AI assistant to perform actions like booking services,
 * cancelling bookings, and accessing real-time data from the database.
 */

import { storage } from './storage';
import { db } from './db';
import { sql } from 'drizzle-orm';

export interface AIActionRequest {
  action: string;
  parameters: Record<string, any>;
  userId?: string;  // User ID if authenticated
  sessionId: string;  // Chat session ID for tracking
  confirmationToken?: string;  // Required for confirmed actions
}

export interface AIActionResponse {
  success: boolean;
  requiresConfirmation?: boolean;
  confirmationToken?: string;
  confirmationMessage?: string;
  result?: any;
  error?: string;
}

/**
 * Process AI actions with proper validation and security checks
 */
export async function processAIAction(request: AIActionRequest): Promise<AIActionResponse> {
  try {
    // Validate request
    if (!request.action) {
      return { success: false, error: 'Missing action parameter' };
    }
    
    // Handle different action types
    switch (request.action) {
      case 'getServices':
        return await getServices(request);
      
      case 'getServiceDetails':
        return await getServiceDetails(request);
      
      case 'getAnalytics':
        return await getAnalytics(request);
        
      case 'createBooking':
        return await createBooking(request);
        
      case 'cancelBooking':
        return await cancelBooking(request);
        
      default:
        return { 
          success: false, 
          error: `Unsupported action: ${request.action}` 
        };
    }
  } catch (error: any) {
    console.error('AI action error:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

/**
 * Get available services, optionally filtered
 */
async function getServices(request: AIActionRequest): Promise<AIActionResponse> {
  try {
    const { category, location, priceRange, limit = 5 } = request.parameters;
    
    // Fetch services with optional filters
    let services = await storage.getServices();
    
    // Apply filters
    if (category) {
      const categories = await storage.getServiceCategories();
      const categoryMatch = categories.find(c => 
        c.name.toLowerCase().includes(category.toLowerCase()) ||
        (c.nameAr && c.nameAr.includes(category))
      );
      
      if (categoryMatch) {
        services = services.filter(s => s.categoryId === categoryMatch.id);
      }
    }
    
    if (location) {
      services = services.filter(s => 
        s.location && s.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(Number);
      if (!isNaN(min)) {
        services = services.filter(s => parseFloat(s.price) >= min);
      }
      if (!isNaN(max)) {
        services = services.filter(s => parseFloat(s.price) <= max);
      }
    }
    
    // Return limited results
    return {
      success: true,
      result: {
        services: services
          .slice(0, limit)
          .map(s => ({
            id: s.id,
            title: s.title,
            titleAr: s.titleAr,
            price: s.price,
            priceType: s.priceType,
            location: s.location,
            categoryId: s.categoryId,
            rating: s.rating,
            reviewCount: s.reviewCount
          }))
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get detailed information about a specific service
 */
async function getServiceDetails(request: AIActionRequest): Promise<AIActionResponse> {
  try {
    const { serviceId, serviceTitle } = request.parameters;
    
    let service;
    if (serviceId) {
      service = await storage.getService(Number(serviceId));
    } else if (serviceTitle) {
      const services = await storage.getServices();
      service = services.find(s => 
        s.title.toLowerCase().includes(serviceTitle.toLowerCase()) ||
        (s.titleAr && s.titleAr.includes(serviceTitle))
      );
    }
    
    if (!service) {
      return { success: false, error: 'Service not found' };
    }
    
    // Get provider details
    const provider = await storage.getProvider(service.providerId);
    
    // Get category
    const categories = await storage.getServiceCategories();
    const category = categories.find(c => c.id === service.categoryId);
    
    return {
      success: true,
      result: {
        service: {
          ...service,
          providerName: provider?.businessName || 'Unknown Provider',
          categoryName: category?.name || 'Uncategorized'
        }
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Get analytics data for services
 */
async function getAnalytics(request: AIActionRequest): Promise<AIActionResponse> {
  try {
    const { serviceId, period = '30d' } = request.parameters;
    
    if (!request.userId) {
      return { success: false, error: 'Authentication required' };
    }
    
    // Check if user has appropriate permissions
    const user = await storage.getUser(request.userId);
    if (!user || (user.role !== 'admin' && user.role !== 'provider')) {
      return { success: false, error: 'Insufficient permissions' };
    }
    
    // Determine date range
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }
    
    // Query analytics
    let analyticsData;
    if (serviceId) {
      // Get analytics for specific service
      analyticsData = await db.execute(sql`
        SELECT date_key, SUM(views) as total_views, SUM(unique_views) as total_unique_views
        FROM service_analytics_daily
        WHERE service_id = ${serviceId}
          AND date_key >= ${startDate.toISOString().split('T')[0]}
        GROUP BY date_key
        ORDER BY date_key
      `);
    } else {
      // Get aggregated analytics across services
      analyticsData = await db.execute(sql`
        SELECT date_key, SUM(views) as total_views, SUM(unique_views) as total_unique_views
        FROM service_analytics_daily
        WHERE date_key >= ${startDate.toISOString().split('T')[0]}
        GROUP BY date_key
        ORDER BY date_key
      `);
    }
    
    return {
      success: true,
      result: {
        period,
        analytics: analyticsData
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Create a new booking
 * Requires user confirmation
 */
async function createBooking(request: AIActionRequest): Promise<AIActionResponse> {
  try {
    const { 
      serviceId, 
      scheduledDate, 
      scheduledTime, 
      clientAddress, 
      clientPhone,
      specialInstructions
    } = request.parameters;
    
    // Validate required parameters
    if (!serviceId) {
      return { success: false, error: 'Service ID is required' };
    }
    
    if (!scheduledDate || !scheduledTime) {
      return { success: false, error: 'Scheduled date and time are required' };
    }
    
    if (!clientAddress) {
      return { success: false, error: 'Client address is required' };
    }
    
    // User must be authenticated
    if (!request.userId) {
      return { success: false, error: 'Authentication required to book a service' };
    }
    
    // Get service details
    const service = await storage.getService(Number(serviceId));
    if (!service) {
      return { success: false, error: 'Service not found' };
    }
    
    // If not confirmed yet, generate confirmation token
    if (!request.confirmationToken) {
      const confirmationToken = generateConfirmationToken();
      
      // Store pending booking temporarily
      await storage.createSystemLog({
        level: 'info',
        category: 'ai_booking',
        message: `AI booking confirmation requested: ${service.title}`,
        userId: request.userId,
        metadata: {
          serviceId,
          scheduledDate,
          scheduledTime,
          clientAddress,
          clientPhone,
          specialInstructions,
          confirmationToken,
          sessionId: request.sessionId
        }
      });
      
      // Return confirmation request to user
      return {
        success: true,
        requiresConfirmation: true,
        confirmationToken,
        confirmationMessage: `I'd like to book "${service.title}" for you on ${scheduledDate} at ${scheduledTime}. The service will be provided at ${clientAddress}. Would you like me to confirm this booking?`
      };
    }
    
    // Booking was confirmed by user, create it
    const newBooking = await storage.createBooking({
      clientId: request.userId,
      serviceId: Number(serviceId),
      providerId: service.providerId,
      scheduledDate: new Date(scheduledDate),
      scheduledTime: scheduledTime,
      duration: service.duration || 60, // Default to 60 minutes
      clientAddress,
      clientPhone: clientPhone || '',
      totalAmount: service.price,
      specialInstructions: specialInstructions || '',
      status: 'pending',
      paymentStatus: 'pending'
    });
    
    return {
      success: true,
      result: {
        bookingId: newBooking.id,
        message: `Booking created successfully! Your booking ID is #${newBooking.id}.`
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Cancel an existing booking
 * Requires user confirmation
 */
async function cancelBooking(request: AIActionRequest): Promise<AIActionResponse> {
  try {
    const { bookingId, reason } = request.parameters;
    
    // Validate
    if (!bookingId) {
      return { success: false, error: 'Booking ID is required' };
    }
    
    // User must be authenticated
    if (!request.userId) {
      return { success: false, error: 'Authentication required to cancel a booking' };
    }
    
    // Get booking
    const booking = await storage.getBooking(Number(bookingId));
    if (!booking) {
      return { success: false, error: 'Booking not found' };
    }
    
    // Check if booking belongs to user
    if (booking.clientId !== request.userId) {
      return { success: false, error: 'You do not have permission to cancel this booking' };
    }
    
    // Check if booking can be cancelled (not completed or already cancelled)
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return { success: false, error: `Booking cannot be cancelled (status: ${booking.status})` };
    }
    
    // If not confirmed yet, generate confirmation token
    if (!request.confirmationToken) {
      const confirmationToken = generateConfirmationToken();
      
      // Store pending cancellation temporarily
      await storage.createSystemLog({
        level: 'info',
        category: 'ai_booking_cancel',
        message: `AI booking cancellation requested: Booking #${bookingId}`,
        userId: request.userId,
        metadata: {
          bookingId,
          reason,
          confirmationToken,
          sessionId: request.sessionId
        }
      });
      
      // Return confirmation request to user
      return {
        success: true,
        requiresConfirmation: true,
        confirmationToken,
        confirmationMessage: `I'll cancel your booking #${bookingId} for you. Please confirm that you want to cancel this booking.`
      };
    }
    
    // Cancellation confirmed, proceed
    const cancellationReason = reason || 'Cancelled via AI assistant';
    
    const updatedBooking = await storage.updateBooking(Number(bookingId), {
      status: 'cancelled',
      cancellationReason
    });
    
    if (!updatedBooking) {
      return {
        success: false,
        error: 'Failed to update booking status'
      };
    }
    
    return {
      success: true,
      result: {
        bookingId: updatedBooking.id,
        message: `Booking #${updatedBooking.id} has been cancelled successfully.`
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate a secure confirmation token
 */
function generateConfirmationToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
