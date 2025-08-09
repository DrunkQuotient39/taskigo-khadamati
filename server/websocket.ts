import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { storage } from './storage';
import { verifyToken } from './middleware/auth';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export class WebSocketService {
  private io: SocketServer;
  private connectedUsers: Map<string, AuthenticatedSocket> = new Map();

  constructor(server: HttpServer) {
    this.io = new SocketServer(server, {
      cors: {
        origin: process.env.NODE_ENV === 'development' ? 
          ['http://localhost:3000', 'http://localhost:5000'] : 
          [/\.replit\.app$/, /\.repl\.co$/],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware for WebSocket
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = verifyToken(token) as any;
        const user = await storage.getUser(decoded.id);
        
        if (!user || !user.isActive) {
          return next(new Error('Invalid user or account disabled'));
        }

        socket.userId = user.id;
        socket.userRole = user.role;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User connected: ${socket.userId} (${socket.userRole})`);
      
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket);
        
        // Join user-specific room
        socket.join(`user:${socket.userId}`);
        
        // Join role-specific rooms
        if (socket.userRole) {
          socket.join(`role:${socket.userRole}`);
        }
        
        // Send initial data
        this.sendInitialData(socket);
      }

      // Handle booking-related events
      this.setupBookingEvents(socket);
      
      // Handle chat events
      this.setupChatEvents(socket);
      
      // Handle provider events
      this.setupProviderEvents(socket);
      
      // Handle admin events
      this.setupAdminEvents(socket);

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
        }
      });
    });
  }

  private async sendInitialData(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    try {
      // Send unread notifications count
      const notifications = await storage.getNotifications(socket.userId);
      const unreadCount = notifications.filter(n => !n.isRead).length;
      
      socket.emit('notifications:count', { unread: unreadCount });

      // Send role-specific initial data
      if (socket.userRole === 'provider') {
        const provider = await storage.getProvider(socket.userId);
        if (provider) {
          const bookings = await storage.getProviderBookings();
          const myBookings = bookings.filter(b => b.providerId === socket.userId);
          const pendingBookings = myBookings.filter(b => b.status === 'pending').length;
          
          socket.emit('provider:pending_bookings', { count: pendingBookings });
        }
      }

      if (socket.userRole === 'admin') {
        const providers = await storage.getProviders({ status: 'pending' });
        const services = await storage.getServices();
        const pendingServices = services.filter(s => s.status === 'pending').length;
        
        socket.emit('admin:pending_approvals', { 
          providers: providers.length,
          services: pendingServices
        });
      }
    } catch (error) {
      console.error('Error sending initial data:', error);
    }
  }

  private setupBookingEvents(socket: AuthenticatedSocket) {
    // Join booking room when viewing specific booking
    socket.on('booking:join', (bookingId: number) => {
      socket.join(`booking:${bookingId}`);
    });

    // Leave booking room
    socket.on('booking:leave', (bookingId: number) => {
      socket.leave(`booking:${bookingId}`);
    });

    // Handle booking status updates
    socket.on('booking:status_update', async (data: { bookingId: number; status: string; notes?: string }) => {
      try {
        const booking = await storage.getBooking(data.bookingId);
        if (!booking) return;

        // Verify permissions
        const canUpdate = socket.userRole === 'admin' || 
                         (socket.userRole === 'provider' && booking.providerId === socket.userId) ||
                         (socket.userRole === 'client' && booking.clientId === socket.userId);

        if (!canUpdate) return;

        // Update booking
        const updatedBooking = await storage.updateBooking(data.bookingId, {
          status: data.status,
          ...(data.notes && { specialInstructions: data.notes })
        });

        // Notify all users in booking room
        this.io.to(`booking:${data.bookingId}`).emit('booking:updated', {
          booking: updatedBooking,
          updatedBy: socket.userId
        });

        // Send notification to other party
        const otherUserId = booking.clientId === socket.userId ? booking.providerId : booking.clientId;
        this.sendNotificationToUser(otherUserId, {
          title: 'Booking Status Update',
          message: `Booking status changed to: ${data.status}`,
          type: 'booking',
          data: { bookingId: data.bookingId }
        });

      } catch (error) {
        socket.emit('error', { message: 'Failed to update booking status' });
      }
    });
  }

  private setupChatEvents(socket: AuthenticatedSocket) {
    // Join chat conversation
    socket.on('chat:join', (conversationId: number) => {
      socket.join(`chat:${conversationId}`);
    });

    // Leave chat conversation
    socket.on('chat:leave', (conversationId: number) => {
      socket.leave(`chat:${conversationId}`);
    });

    // Handle new message
    socket.on('chat:message', async (data: { 
      conversationId: number; 
      message: string; 
      type?: string 
    }) => {
      try {
        // Create message in database
        const message = await storage.createChatMessage({
          conversationId: data.conversationId,
          senderId: socket.userId!,
          message: data.message,
          messageType: data.type || 'text',
          isRead: false
        });

        // Broadcast to conversation room
        this.io.to(`chat:${data.conversationId}`).emit('chat:new_message', {
          message,
          sender: {
            id: socket.userId,
            role: socket.userRole
          }
        });

        // Update conversation last activity
        await storage.updateChatConversation(data.conversationId, {
          lastMessageAt: new Date(),
          isActive: true
        });

      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Mark messages as read
    socket.on('chat:mark_read', async (data: { conversationId: number }) => {
      try {
        const messages = await storage.getChatMessages(data.conversationId);
        const unreadMessages = messages.filter(m => !m.isRead && m.senderId !== socket.userId);
        
        // Mark messages as read (would need to add this method to storage)
        // await storage.markChatMessagesRead(data.conversationId, socket.userId!);

        socket.emit('chat:messages_read', { conversationId: data.conversationId });
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });
  }

  private setupProviderEvents(socket: AuthenticatedSocket) {
    if (socket.userRole !== 'provider') return;

    // Handle service availability updates
    socket.on('provider:availability_update', async (data: { 
      serviceId: number; 
      availability: any 
    }) => {
      try {
        const service = await storage.getService(data.serviceId);
        if (!service || service.providerId !== socket.userId) return;

        await storage.updateService(data.serviceId, {
          availability: data.availability
        });

        // Notify clients who might be interested
        socket.broadcast.emit('service:availability_updated', {
          serviceId: data.serviceId,
          availability: data.availability
        });

      } catch (error) {
        socket.emit('error', { message: 'Failed to update availability' });
      }
    });

    // Handle location updates
    socket.on('provider:location_update', async (data: { latitude: number; longitude: number }) => {
      // Store provider's current location (you'd need to add location fields to provider schema)
      socket.broadcast.emit('provider:location_updated', {
        providerId: socket.userId,
        location: data
      });
    });
  }

  private setupAdminEvents(socket: AuthenticatedSocket) {
    if (socket.userRole !== 'admin') return;

    // Handle admin actions
    socket.on('admin:approve_provider', async (data: { providerId: number; approved: boolean }) => {
      try {
        const providers = await storage.getProviders();
        const provider = providers.find(p => p.id === data.providerId);
        
        if (!provider) return;

        await storage.updateProvider(data.providerId, {
          approvalStatus: data.approved ? 'approved' : 'rejected'
        });

        // Notify provider
        this.sendNotificationToUser(provider.userId, {
          title: data.approved ? 'Application Approved' : 'Application Rejected',
          message: data.approved ? 
            'Your provider application has been approved!' :
            'Your provider application has been rejected.',
          type: 'system'
        });

        // Broadcast to all admins
        this.io.to('role:admin').emit('admin:provider_status_changed', {
          providerId: data.providerId,
          status: data.approved ? 'approved' : 'rejected'
        });

      } catch (error) {
        socket.emit('error', { message: 'Failed to update provider status' });
      }
    });
  }

  // Public methods for sending notifications
  public async sendNotificationToUser(userId: string, notification: {
    title: string;
    message: string;
    type: string;
    data?: any;
  }) {
    try {
      // Save notification to database
      const savedNotification = await storage.createNotification({
        userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        metadata: notification.data || {}
      });

      // Send real-time notification
      const userSocket = this.connectedUsers.get(userId);
      if (userSocket) {
        userSocket.emit('notification:new', savedNotification);
      }

      // Also send to user room in case of multiple connections
      this.io.to(`user:${userId}`).emit('notification:new', savedNotification);

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  public notifyBookingUpdate(bookingId: number, booking: any, updatedBy: string) {
    this.io.to(`booking:${bookingId}`).emit('booking:updated', {
      booking,
      updatedBy
    });
  }

  public notifyServiceUpdate(serviceId: number, service: any) {
    this.io.emit('service:updated', { service });
  }

  public broadcastSystemMessage(message: string, type: 'info' | 'warning' | 'error' = 'info') {
    this.io.emit('system:message', { message, type });
  }

  public getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  public getUserConnectionStatus(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}

export let wsService: WebSocketService | null = null;

export function initializeWebSocket(server: HttpServer): WebSocketService {
  wsService = new WebSocketService(server);
  return wsService;
}