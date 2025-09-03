import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// Replit OIDC not used by default anymore
// import { setupAuth, isAuthenticated } from "./replitAuth";
import { firebaseAuthenticate } from './middleware/firebaseAuth';
import { AuthRequest } from './middleware/auth';
import { aiService } from "./ai";
// import { initializeWebSocket } from "./websocket";
import { 
  generalLimiter, 
  securityHeaders, 
  corsOptions, 
  sanitizeInput, 
  logRequest, 
  errorHandler,
  healthCheck
} from "./middleware/security";
import cors from "cors";

// Import route modules
import authRoutes from "./routes/auth";
import providerRoutes from "./routes/providers";
import serviceRoutes from "./routes/services";
import bookingRoutes from "./routes/bookings";
import paymentRoutes from "./routes/payments";
import adminRoutes from "./routes/admin";
import aiRoutes from "./routes/ai";
import aiActionsRoutes from "./routes/ai-actions";
import uploadRoutes from "./routes/uploads";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create HTTP server
  const server = createServer(app);
  
  // Initialize WebSocket
  // const wsService = initializeWebSocket(server);
  
  // Global middleware
  app.use(cors(corsOptions));
  app.use(securityHeaders);
  // Apply rate limiting only to API routes; skip in development to avoid accidental 429s during polling
  if (process.env.NODE_ENV !== 'development') {
    app.use('/api', generalLimiter);
  }
  app.use(sanitizeInput);
  app.use(logRequest);

  // Health check endpoint
  app.get("/health", healthCheck);
  app.get("/api/health", healthCheck);

  // Auth middleware
  // OIDC setup removed (Firebase ID tokens preferred)

  // Auth routes
  // Removed session user route; use /api/auth/me-firebase instead
  // Service Categories Routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getServiceCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/service-categories", async (req, res) => {
    try {
      const categories = await storage.getServiceCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service categories" });
    }
  });

  app.post("/api/categories", async (req, res) => {
    try {
      const category = await storage.createServiceCategory(req.body);
      res.json(category);
    } catch (error) {
      res.status(500).json({ error: "Failed to create category" });
    }
  });

  // AI-powered Chat Routes (Bilingual Assistant)
  app.post("/api/chat-ai/message", async (req, res) => {
    try {
      const { message, language = 'en', conversationHistory = [] } = req.body;
      const userId = (req as any).user?.id || 'anonymous';

      const response = await aiService.chatbotResponse(message, {
        userId,
        language,
        conversationHistory
      });

      res.json({
        response,
        language,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('AI chat error:', error);
      res.status(500).json({ error: "AI chat service temporarily unavailable" });
    }
  });

  // AI Service Recommendations (Smart Matching)
  app.post("/api/ai/recommendations", async (req, res) => {
    try {
      const { query, location, budget, category, language = 'en' } = req.body;
      const userId = (req as any).user?.id || 'anonymous';

      // Get available services
      const services = await storage.getServices({ category });
      const categories = await storage.getServiceCategories();

      const userPreferences = {
        location: location || null,
        budget: budget ? parseFloat(budget) : null,
        preferredCategory: category || null,
        language
      };

      const recommendations = await aiService.generateServiceRecommendations(
        userId,
        userPreferences,
        services,
        categories
      );

      res.json({
        recommendations,
        totalAvailable: services.length
      });
    } catch (error) {
      console.error('AI recommendations error:', error);
      res.status(500).json({ error: "AI recommendation service unavailable" });
    }
  });

  // AI Sentiment Analysis for Reviews
  app.post("/api/ai/sentiment", async (req, res) => {
    try {
      const { text, referenceType, referenceId } = req.body;
      
      const sentimentResult = await aiService.analyzeSentiment(text);
      
      // Save sentiment analysis if reference provided
      if (referenceType && referenceId) {
        await storage.createSentimentAnalysis({
          referenceType,
          referenceId,
          sentiment: sentimentResult.sentiment,
          score: sentimentResult.score.toString(),
          keywords: sentimentResult.keywords
        });
      }
      
      res.json(sentimentResult);
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      res.status(500).json({ error: "Sentiment analysis service unavailable" });
    }
  });

  // AI Pricing Suggestions for Providers
  app.post("/api/ai/pricing", firebaseAuthenticate as any, async (req, res) => {
    try {
      const { serviceType, location, duration } = req.body;
      
      // Get competitor prices from database
      const similarServices = await storage.getServices({ category: serviceType });
      const competitorPrices = similarServices.map(s => parseFloat(s.price)).filter(p => !isNaN(p));
      
      const pricingAnalysis = await aiService.generatePricingSuggestions(
        serviceType,
        location,
        duration,
        competitorPrices
      );
      
      res.json(pricingAnalysis);
    } catch (error) {
      console.error('AI pricing error:', error);
      res.status(500).json({ error: "AI pricing service unavailable" });
    }
  });

  // Payment Processing Routes (simplified for MVP)
  app.post("/api/payments/apple-pay/session", async (req, res) => {
    try {
      // Mock Apple Pay session for development
      res.json({
        merchantSession: {
          epochTimestamp: Date.now(),
          expiresAt: Date.now() + (5 * 60 * 1000),
          merchantSessionIdentifier: 'mock-session',
          merchantIdentifier: 'merchant.com.taskego.app',
          displayName: 'Taskego'
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Apple Pay session creation failed" });
    }
  });

  app.post("/api/payments/apple-pay/process", async (req, res) => {
    try {
      const { amount, bookingId } = req.body;
      // Mock payment processing for development
      res.json({
        message: 'Payment processed successfully',
        paymentId: 'mock-payment-' + Date.now(),
        status: 'completed',
        amount
      });
    } catch (error) {
      res.status(500).json({ error: "Apple Pay processing failed" });
    }
  });

  app.post("/api/payments/intent", async (req, res) => {
    try {
      const { amount, currency = 'USD', paymentMethod } = req.body;
      
      res.json({
        paymentIntentId: 'mock-intent-' + Date.now(),
        clientSecret: 'mock-secret',
        amount,
        currency,
        paymentMethod
      });
    } catch (error) {
      res.status(500).json({ error: "Payment intent creation failed" });
    }
  });

  // Mount route modules
  app.use("/api/auth", authRoutes);
  app.use("/api/providers", providerRoutes);
  app.use("/api/services", serviceRoutes);
  app.use("/api/bookings", bookingRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/ai-actions", aiActionsRoutes);
  app.use("/api/uploads", uploadRoutes);

  app.get("/api/payments/methods/supported", async (req, res) => {
    try {
      res.json({
        supportedMethods: {
          apple_pay: { available: true, processingFee: '2.9% + $0.30' },
          card: { available: true, processingFee: '2.9% + $0.30' },
          bank_transfer: { available: true, processingFee: '1%' },
          wallet: { available: true, processingFee: 'Free' }
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get supported payment methods" });
    }
  });

  // Services Routes
  app.get("/api/services", async (req, res) => {
    try {
      const { category, search, priceRange, sortBy } = req.query;
      const services = await storage.getServices({
        category: category as string,
        search: search as string,
        priceRange: priceRange as string,
        sortBy: sortBy as string,
      });
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  // Service analytics endpoints
  app.get('/api/services/:id/analytics', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ message: 'Invalid service id' });
      const analytics = (await import('./analytics')).getServiceAnalytics(id);
      res.json(analytics || { serviceId: id, views: 0, uniqueViews: 0 });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get service analytics' });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const service = await storage.getService(parseInt(req.params.id));
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const service = await storage.createService(req.body);
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  // Bookings Routes
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const booking = await storage.createBooking(req.body);
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  app.put("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.updateBooking(parseInt(req.params.id), req.body);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ error: "Failed to update booking" });
    }
  });

  // Provider Dashboard Routes
  app.get("/api/provider/stats", async (req, res) => {
    try {
      // Mock provider stats - in real app, this would be calculated from database
      const stats = {
        totalBookings: 247,
        totalEarnings: 8547,
        averageRating: 4.8,
        activeServices: 3,
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch provider stats" });
    }
  });

  app.get("/api/provider/bookings", async (req, res) => {
    try {
      const bookings = await storage.getProviderBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch provider bookings" });
    }
  });

  app.get("/api/provider/services", async (req, res) => {
    try {
      const services = await storage.getProviderServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch provider services" });
    }
  });

  // Admin Panel Routes
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin stats" });
    }
  });

  app.get("/api/admin/pending-approvals", async (req, res) => {
    try {
      const approvals = await storage.getPendingApprovals();
      res.json(approvals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch pending approvals" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const { search } = req.query;
      const users = await storage.getUsers(search as string);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/approve/:id", async (req, res) => {
    try {
      const result = await storage.approveItem(parseInt(req.params.id));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to approve item" });
    }
  });

  app.post("/api/admin/reject/:id", async (req, res) => {
    try {
      const result = await storage.rejectItem(parseInt(req.params.id));
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to reject item" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      // In a real app, this would send an email or store the message
      console.log("Contact form submission:", req.body);
      res.json({ message: "Message sent successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // AI Routes
  // AI Chatbot endpoint
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, conversationId, language = 'en' } = req.body;
      const userId = (req as any).user?.id || 'anonymous';
      
      // Get conversation history if provided
      let conversationHistory: Array<{ role: string; content: string }> = [];
      if (conversationId) {
        const messages = await storage.getChatMessages(conversationId);
        conversationHistory = messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      }
      
      const response = await aiService.chatbotResponse(message, {
        userId,
        language,
        conversationHistory
      });
      
      // Save the conversation
      if (userId !== 'anonymous') {
        let conversation = conversationId 
          ? await storage.getChatConversation(conversationId)
          : null;
        
        if (!conversation) {
          conversation = await storage.createChatConversation({
              userId,
              title: message.substring(0, 50) + '...',
              language
            });
        }
        
        // Save user message
        await storage.createChatMessage({
          conversationId: conversation.id,
          role: 'user',
          content: message,
          metadata: {}
        });
        
        // Save AI response
        await storage.createChatMessage({
          conversationId: conversation.id,
          role: 'assistant',
          content: response,
          metadata: {}
        });
      }
      
      res.json({ response, conversationId: conversationId || null });
    } catch (error) {
      console.error('AI chat error:', error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // AI Service Recommendations
  app.get("/api/ai/recommendations", firebaseAuthenticate as any, async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const { location, budget, category } = req.query;
      
      const user = await storage.getUser(userId);
      const services = await storage.getServices({});
      const categories = await storage.getServiceCategories();
      
      const userPreferences = {
        location: location || null,
        budget: budget ? parseFloat(budget as string) : null,
        preferredCategory: category || null,
        language: user?.language || 'en'
      };
      
      const recommendations = await aiService.generateServiceRecommendations(
        userId,
        userPreferences,
        services,
        categories
      );
      
      // Save recommendations for tracking
      if (recommendations.length > 0) {
        await storage.createAiRecommendation({
          userId,
          serviceIds: recommendations.map(s => s.id) as any,
          reason: 'Generated based on user preferences and service analysis',
          confidence: '0.85'
        });
      }
      
      res.json(recommendations);
    } catch (error) {
      console.error('AI recommendations error:', error);
      res.status(500).json({ error: "Failed to generate recommendations" });
    }
  });

  // Smart Service Search with AI
  app.post("/api/ai/search", async (req, res) => {
    try {
      const { description } = req.body;
      
      const services = await storage.getServices({});
      const categories = await storage.getServiceCategories();
      
      const searchResults = await aiService.matchServicesByDescription(
        description,
        services,
        categories
      );
      
      res.json(searchResults);
    } catch (error) {
      console.error('AI search error:', error);
      res.status(500).json({ error: "Failed to process AI search" });
    }
  });

  // AI Pricing Analysis
  app.post("/api/ai/pricing", async (req, res) => {
    try {
      const { serviceType, location, duration } = req.body;
      
      // Get competitor prices from database
      const similarServices = await storage.getServices({ category: serviceType });
      const competitorPrices = similarServices.map(s => parseFloat(s.price)).filter(p => !isNaN(p));
      
      const pricingAnalysis = await aiService.generatePricingSuggestions(
        serviceType,
        location,
        duration,
        competitorPrices
      );
      
      res.json(pricingAnalysis);
    } catch (error) {
      console.error('AI pricing error:', error);
      res.status(500).json({ error: "Failed to analyze pricing" });
    }
  });

  // Sentiment Analysis for Reviews
  app.post("/api/ai/sentiment", async (req, res) => {
    try {
      const { text, referenceType, referenceId } = req.body;
      
      const sentimentResult = await aiService.analyzeSentiment(text);
      
      // Save sentiment analysis
      if (referenceType && referenceId) {
        await storage.createSentimentAnalysis({
          referenceType,
          referenceId,
          sentiment: sentimentResult.sentiment,
          score: sentimentResult.score.toString(),
          keywords: sentimentResult.keywords
        });
      }
      
      res.json(sentimentResult);
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      res.status(500).json({ error: "Failed to analyze sentiment" });
    }
  });

  // Provider Profile Assessment
  app.get("/api/ai/provider-assessment", async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'provider') {
        return res.status(403).json({ error: "Access denied. Provider role required." });
      }
      
      const providerServices = await storage.getProviderServices();
      const assessment = await aiService.assessProviderProfile(user, providerServices);
      
      res.json(assessment);
    } catch (error) {
      console.error('Provider assessment error:', error);
      res.status(500).json({ error: "Failed to assess provider profile" });
    }
  });

  // Auto-response generation for support
  app.post("/api/ai/auto-response", async (req, res) => {
    try {
      const { query, queryType, context } = req.body;
      
      const response = await aiService.generateAutoResponse(
        query,
        queryType || 'general',
        context || {}
      );
      
      res.json({ response });
    } catch (error) {
      console.error('Auto-response error:', error);
      res.status(500).json({ error: "Failed to generate auto-response" });
    }
  });

  // Get chat conversations for a user
  app.get("/api/ai/conversations", firebaseAuthenticate as any, async (req, res) => {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      const conversations = await storage.getChatConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  // Get messages for a specific conversation
  app.get("/api/ai/conversations/:id/messages", firebaseAuthenticate as any, async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const messages = await storage.getChatMessages(conversationId);
      res.json(messages);
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Feedback on AI recommendations
  app.post("/api/ai/recommendations/:id/feedback", firebaseAuthenticate as any, async (req, res) => {
    try {
      const recommendationId = parseInt(req.params.id);
      const { feedback, isUsed } = req.body;
      
      await storage.updateAiRecommendation(recommendationId, {
        userFeedback: feedback,
        isUsed: isUsed || false
      });
      
      res.json({ message: "Feedback recorded successfully" });
    } catch (error) {
      console.error('Recommendation feedback error:', error);
      res.status(500).json({ error: "Failed to record feedback" });
    }
  });
  
  // User notifications endpoint
  app.get("/api/notifications", firebaseAuthenticate as any, async (req: any, res: any) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      let notifications = await storage.getNotifications(userId);
      // If admin, also include global admin notifications addressed to 'admin'
      if ((req as any).user?.role === 'admin') {
        try {
          const adminGlobal = await storage.getNotifications('admin' as any);
          notifications = [...notifications, ...adminGlobal];
        } catch {}
      }
      
      // Mark all as read (optional - can be a separate endpoint)
      // for (const notification of notifications) {
      //   if (!notification.isRead) {
      //     await storage.updateNotification(notification.id, { isRead: true });
      //   }
      // }
      
      res.json({ 
        notifications,
        unreadCount: notifications.filter(n => !n.isRead).length
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });
  
  // Mark notification as read
  app.post("/api/notifications/:id/read", firebaseAuthenticate as any, async (req: any, res: any) => {
    try {
      const notificationId = parseInt(req.params.id);
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
      }
      
      // In a real implementation, we would verify the notification belongs to this user
      
      // Mark as read - TODO: implement updateNotification method in storage
      // await storage.updateNotification(notificationId, { isRead: true });
      
      res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
      console.error('Mark notification read error:', error);
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Global error handler (last)
  app.use(errorHandler);

  return server;
}
