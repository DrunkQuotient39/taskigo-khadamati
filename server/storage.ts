import { 
  users, 
  services, 
  serviceCategories, 
  bookings, 
  reviews, 
  notifications,
  chatConversations,
  chatMessages,
  aiRecommendations,
  sentimentAnalysis,
  providers,
  wallets,
  payments,
  aiLogs,
  subcategories,
  userSessions,
  emailLogs,
  smsLogs,
  systemLogs,
  serviceImages,
  type User, 
  type InsertUser,
  type UpsertUser,
  type Service,
  type InsertService,
  type ServiceCategory,
  type InsertServiceCategory,
  type Booking,
  type InsertBooking,
  type Review,
  type InsertReview,
  type Notification,
  type InsertNotification,
  type ChatConversation,
  type InsertChatConversation,
  type ChatMessage,
  type InsertChatMessage,
  type AiRecommendation,
  type InsertAiRecommendation,
  type SentimentAnalysis,
  type InsertSentimentAnalysis,
  type Provider,
  type InsertProvider,
  type Wallet,
  type InsertWallet,
  type Payment,
  type InsertPayment,
  type AiLog,
  type InsertAiLog,
  type Subcategory,
  type InsertSubcategory,
  type UserSession,
  type InsertUserSession,
  type EmailLog,
  type InsertEmailLog,
  type SmsLog,
  type InsertSmsLog,
  type SystemLog,
  type InsertSystemLog,
  type ServiceImage,
  type InsertServiceImage
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, like, ilike } from "drizzle-orm";

export interface IStorage {
  // User management - Updated for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  getUsers(search?: string): Promise<User[]>;

  // Service categories
  getServiceCategories(): Promise<ServiceCategory[]>;
  getServiceCategory(id: number): Promise<ServiceCategory | undefined>;
  createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory>;

  // Services
  getServices(filters?: {
    category?: string;
    search?: string;
    priceRange?: string;
    sortBy?: string;
  }): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<Service>): Promise<Service | undefined>;
  getProviderServices(): Promise<Service[]>;

  // Bookings
  getBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<Booking>): Promise<Booking | undefined>;
  getProviderBookings(): Promise<any[]>;

  // Reviews
  getReviews(serviceId?: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Notifications
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;

  // Admin functions
  getAdminStats(): Promise<any>;
  getPendingApprovals(): Promise<any[]>;
  approveItem(id: number): Promise<any>;
  rejectItem(id: number): Promise<any>;

  // AI-related functions
  // Chat conversations
  getChatConversations(userId: string): Promise<ChatConversation[]>;
  getChatConversation(id: number): Promise<ChatConversation | undefined>;
  createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation>;
  updateChatConversation(id: number, conversation: Partial<ChatConversation>): Promise<ChatConversation | undefined>;
  
  // Chat messages
  getChatMessages(conversationId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // AI recommendations
  getAiRecommendations(userId: string): Promise<AiRecommendation[]>;
  createAiRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation>;
  updateAiRecommendation(id: number, recommendation: Partial<AiRecommendation>): Promise<AiRecommendation | undefined>;
  
  // Sentiment analysis
  getSentimentAnalysis(referenceType: string, referenceId: number): Promise<SentimentAnalysis | undefined>;
  createSentimentAnalysis(analysis: InsertSentimentAnalysis): Promise<SentimentAnalysis>;

  // Provider management
  getProvider(userId: string): Promise<Provider | undefined>;
  getProviders(filters?: { status?: string; city?: string }): Promise<Provider[]>;
  createProvider(provider: InsertProvider): Promise<Provider>;
  updateProvider(id: number, provider: Partial<Provider>): Promise<Provider | undefined>;
  approveProvider(id: number): Promise<Provider | undefined>;
  rejectProvider(id: number): Promise<Provider | undefined>;

  // Wallet management
  getWallet(userId: string): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(userId: string, amount: number): Promise<Wallet | undefined>;

  // Payment processing
  getPayments(filters?: { userId?: string; status?: string }): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<Payment>): Promise<Payment | undefined>;
  refundPayment(id: number, reason: string): Promise<Payment | undefined>;

  // AI logging
  createAiLog(log: InsertAiLog): Promise<AiLog>;
  getAiLogs(filters?: { userId?: string; intent?: string }): Promise<AiLog[]>;

  // Subcategories
  getSubcategories(categoryId?: number): Promise<Subcategory[]>;
  createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory>;

  // Session management
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  getUserSessions(userId: string): Promise<UserSession[]>;
  updateUserSession(id: number, session: Partial<UserSession>): Promise<UserSession | undefined>;
  deactivateUserSession(id: number): Promise<void>;

  // Email & SMS logging
  createEmailLog(log: InsertEmailLog): Promise<EmailLog>;
  createSmsLog(log: InsertSmsLog): Promise<SmsLog>;
  getEmailLogs(userId?: string): Promise<EmailLog[]>;
  getSmsLogs(userId?: string): Promise<SmsLog[]>;

  // System logging
  createSystemLog(log: InsertSystemLog): Promise<SystemLog>;
  getSystemLogs(filters?: { level?: string; category?: string }): Promise<SystemLog[]>;

  // Service images
  getServiceImages(serviceId: number): Promise<ServiceImage[]>;
  createServiceImage(image: InsertServiceImage): Promise<ServiceImage>;
  updateServiceImage(id: number, image: Partial<ServiceImage>): Promise<ServiceImage | undefined>;
  deleteServiceImage(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private services: Map<number, Service>;
  private serviceCategories: Map<number, ServiceCategory>;
  private bookings: Map<number, Booking>;
  private reviews: Map<number, Review>;
  private notifications: Map<number, Notification>;
  private providers: Map<number, Provider>;
  private wallets: Map<number, Wallet>;
  private payments: Map<number, Payment>;
  private aiLogs: Map<number, AiLog>;
  private subcategories: Map<number, Subcategory>;
  private userSessions: Map<number, UserSession>;
  private emailLogs: Map<number, EmailLog>;
  private smsLogs: Map<number, SmsLog>;
  private systemLogs: Map<number, SystemLog>;
  private serviceImages: Map<number, ServiceImage>;
  private pendingApprovals: Map<number, any>;
  private currentUserId: number;
  private currentServiceId: number;
  private currentCategoryId: number;
  private currentBookingId: number;
  private currentReviewId: number;
  private currentNotificationId: number;
  private currentProviderId: number;
  private currentWalletId: number;
  private currentPaymentId: number;
  private currentAiLogId: number;
  private currentSubcategoryId: number;
  private currentSessionId: number;
  private currentEmailLogId: number;
  private currentSmsLogId: number;
  private currentSystemLogId: number;
  private currentServiceImageId: number;
  private currentApprovalId: number;

  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.serviceCategories = new Map();
    this.bookings = new Map();
    this.reviews = new Map();
    this.notifications = new Map();
    this.providers = new Map();
    this.wallets = new Map();
    this.payments = new Map();
    this.aiLogs = new Map();
    this.subcategories = new Map();
    this.userSessions = new Map();
    this.emailLogs = new Map();
    this.smsLogs = new Map();
    this.systemLogs = new Map();
    this.serviceImages = new Map();
    this.pendingApprovals = new Map();
    
    this.currentUserId = 1;
    this.currentServiceId = 1;
    this.currentCategoryId = 1;
    this.currentBookingId = 1;
    this.currentReviewId = 1;
    this.currentNotificationId = 1;
    this.currentProviderId = 1;
    this.currentWalletId = 1;
    this.currentPaymentId = 1;
    this.currentAiLogId = 1;
    this.currentSubcategoryId = 1;
    this.currentSessionId = 1;
    this.currentEmailLogId = 1;
    this.currentSmsLogId = 1;
    this.currentSystemLogId = 1;
    this.currentServiceImageId = 1;
    this.currentApprovalId = 1;

    // Initialize with mock data
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock service categories
    const mockCategories = [
      { name: 'Cleaning', nameAr: 'تنظيف', description: 'Professional cleaning services', descriptionAr: 'خدمات تنظيف احترافية', icon: '🧹', color: '#3B82F6', isActive: true },
      { name: 'Plumbing', nameAr: 'سباكة', description: 'Plumbing repairs and installations', descriptionAr: 'إصلاحات وتركيبات السباكة', icon: '🔧', color: '#10B981', isActive: true },
      { name: 'Electrical', nameAr: 'كهرباء', description: 'Electrical services and repairs', descriptionAr: 'خدمات كهربائية وإصلاحات', icon: '⚡', color: '#F59E0B', isActive: true },
      { name: 'Delivery', nameAr: 'توصيل', description: 'Fast delivery services', descriptionAr: 'خدمات توصيل سريعة', icon: '🚚', color: '#EF4444', isActive: true },
      { name: 'Maintenance', nameAr: 'صيانة', description: 'General maintenance services', descriptionAr: 'خدمات صيانة عامة', icon: '🔨', color: '#8B5CF6', isActive: true },
      { name: 'Painting', nameAr: 'دهان', description: 'Professional painting services', descriptionAr: 'خدمات دهان احترافية', icon: '🎨', color: '#06B6D4', isActive: true },
    ];

    mockCategories.forEach(category => {
      const cat: ServiceCategory = {
        id: this.currentCategoryId++,
        ...category,
        description: category.description || null,
        descriptionAr: category.descriptionAr || null,
        isActive: category.isActive ?? true,
        createdAt: new Date(),
      };
      this.serviceCategories.set(cat.id, cat);
    });

    // Mock users
    const mockUsers = [
      { email: 'sarah@example.com', firstName: 'Sarah', lastName: 'Johnson', role: 'provider', language: 'en' },
      { email: 'ahmed@example.com', firstName: 'Ahmed', lastName: 'Hassan', role: 'provider', language: 'ar' },
      { email: 'john@example.com', firstName: 'John', lastName: 'Smith', role: 'client', language: 'en' },
    ];

    mockUsers.forEach(user => {
      const u: User = {
        id: this.currentUserId++,
        ...user,
        role: user.role || 'client',
        language: user.language || 'en',
        password: 'hashedpassword',
        phone: null,
        profileImage: null,
        isVerified: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(u.id, u);
    });

    // Mock services with multiple providers per category
    const mockServices = [
      // House Cleaning Services
      {
        providerId: 1,
        categoryId: 1,
        title: 'Premium House Cleaning',
        description: 'Deep cleaning service for your home with eco-friendly products',
        price: '35.00',
        priceType: 'hourly',
        duration: 120,
        location: 'Downtown',
        status: 'approved',
        rating: '4.9',
        reviewCount: 127,
        images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=400&fit=crop'],
      },
      {
        providerId: 2,
        categoryId: 1,
        title: 'Express Cleaning Service',
        description: 'Quick and efficient home cleaning for busy professionals',
        price: '28.00',
        priceType: 'hourly',
        duration: 90,
        location: 'City Center',
        status: 'approved',
        rating: '4.7',
        reviewCount: 89,
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop'],
      },
      {
        providerId: 3,
        categoryId: 1,
        title: 'Deep Clean Specialists',
        description: 'Thorough deep cleaning with specialized equipment',
        price: '42.00',
        priceType: 'hourly',
        duration: 180,
        location: 'Suburbs',
        status: 'approved',
        rating: '4.8',
        reviewCount: 156,
        images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=400&fit=crop'],
      },
      // Plumbing Services
      {
        providerId: 4,
        categoryId: 2,
        title: 'Emergency Plumbing',
        description: '24/7 emergency plumbing services for urgent repairs',
        price: '45.00',
        priceType: 'hourly',
        duration: 60,
        location: 'Citywide',
        status: 'approved',
        rating: '4.8',
        reviewCount: 203,
        images: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&h=400&fit=crop'],
      },
      {
        providerId: 5,
        categoryId: 2,
        title: 'Residential Plumbing Pro',
        description: 'Expert residential plumbing installation and repair',
        price: '40.00',
        priceType: 'hourly',
        duration: 90,
        location: 'Residential Areas',
        status: 'approved',
        rating: '4.9',
        reviewCount: 134,
        images: ['https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=400&fit=crop'],
      },
      // Electrical Services
      {
        providerId: 6,
        categoryId: 3,
        title: 'Licensed Electrician',
        description: 'Professional electrical installations and safety inspections',
        price: '55.00',
        priceType: 'hourly',
        duration: 90,
        location: 'Metro Area',
        status: 'approved',
        rating: '4.9',
        reviewCount: 178,
        images: ['https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=400&fit=crop'],
      },
      {
        providerId: 7,
        categoryId: 3,
        title: 'Home Electrical Solutions',
        description: 'Comprehensive electrical services for residential properties',
        price: '48.00',
        priceType: 'hourly',
        duration: 120,
        location: 'Suburban Areas',
        status: 'approved',
        rating: '4.7',
        reviewCount: 92,
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop'],
      },
      // Delivery Services
      {
        providerId: 8,
        categoryId: 4,
        title: 'Express Delivery',
        description: 'Same-day delivery service for packages and documents',
        price: '15.00',
        priceType: 'fixed',
        duration: 30,
        location: 'City Center',
        status: 'approved',
        rating: '4.6',
        reviewCount: 267,
        images: ['https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=400&fit=crop'],
      },
      {
        providerId: 9,
        categoryId: 4,
        title: 'Food & Grocery Delivery',
        description: 'Fast food and grocery delivery to your doorstep',
        price: '12.00',
        priceType: 'fixed',
        duration: 45,
        location: 'Metro Area',
        status: 'approved',
        rating: '4.5',
        reviewCount: 189,
        images: ['https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&h=400&fit=crop'],
      },
      // Maintenance Services
      {
        providerId: 10,
        categoryId: 5,
        title: 'Home Maintenance Pro',
        description: 'General repairs and maintenance for residential properties',
        price: '30.00',
        priceType: 'hourly',
        duration: 180,
        location: 'Residential Areas',
        status: 'approved',
        rating: '4.8',
        reviewCount: 145,
        images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=400&fit=crop'],
      },
      {
        providerId: 11,
        categoryId: 5,
        title: 'Handyman Services',
        description: 'Skilled handyman for all your home repair needs',
        price: '25.00',
        priceType: 'hourly',
        duration: 120,
        location: 'Citywide',
        status: 'approved',
        rating: '4.6',
        reviewCount: 78,
        images: ['https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=800&h=400&fit=crop'],
      },
      // Painting Services
      {
        providerId: 12,
        categoryId: 6,
        title: 'Interior Painting Experts',
        description: 'Professional interior painting with premium quality paints',
        price: '35.00',
        priceType: 'hourly',
        duration: 240,
        location: 'Metro Area',
        status: 'approved',
        rating: '4.9',
        reviewCount: 198,
        images: ['https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=400&fit=crop'],
      },
      {
        providerId: 13,
        categoryId: 6,
        title: 'Exterior Painting Service',
        description: 'Weather-resistant exterior painting for homes and buildings',
        price: '38.00',
        priceType: 'hourly',
        duration: 300,
        location: 'Residential Areas',
        status: 'approved',
        rating: '4.7',
        reviewCount: 124,
        images: ['https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&h=400&fit=crop'],
      },
    ];

    mockServices.forEach(service => {
      const s: Service = {
        id: this.currentServiceId++,
        ...service,
        status: service.status || 'approved',
        duration: service.duration || 60,
        titleAr: null,
        descriptionAr: null,
        images: service.images || [],
        availability: {},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.services.set(s.id, s);
    });

    // Mock pending approvals
    const mockApprovals = [
      {
        name: 'David Wilson',
        type: 'provider',
        service: 'Electrical Services',
        date: '2024-01-20',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      },
      {
        name: 'Lisa Anderson',
        type: 'service',
        service: 'Pet Grooming',
        date: '2024-01-18',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
      },
    ];

    mockApprovals.forEach(approval => {
      const a = {
        id: this.currentApprovalId++,
        ...approval,
      };
      this.pendingApprovals.set(a.id, a);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.id === id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = (this.currentUserId++).toString();
    const user: User = {
      ...insertUser,
      id,
      isVerified: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(this.currentUserId - 1, user);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await this.getUser(userData.id);
    if (existingUser) {
      return await this.updateUser(userData.id, userData) || existingUser;
    } else {
      return await this.createUser(userData);
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData, updatedAt: new Date() };
    const numericId = Array.from(this.users.entries()).find(([_, u]) => u.id === id)?.[0];
    if (numericId) {
      this.users.set(numericId, updatedUser);
    }
    return updatedUser;
  }

  async getUsers(search?: string): Promise<User[]> {
    let users = Array.from(this.users.values());
    
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user => 
        (user.firstName?.toLowerCase() || '').includes(searchLower) ||
        (user.lastName?.toLowerCase() || '').includes(searchLower) ||
        (user.email?.toLowerCase() || '').includes(searchLower)
      );
    }

    return users;
  }

  async getServiceCategories(): Promise<ServiceCategory[]> {
    return Array.from(this.serviceCategories.values()).filter(cat => cat.isActive);
  }

  async getServiceCategory(id: number): Promise<ServiceCategory | undefined> {
    return this.serviceCategories.get(id);
  }

  async createServiceCategory(insertCategory: InsertServiceCategory): Promise<ServiceCategory> {
    const id = this.currentCategoryId++;
    const category: ServiceCategory = {
      ...insertCategory,
      id,
      createdAt: new Date(),
    };
    this.serviceCategories.set(id, category);
    return category;
  }

  async getServices(filters?: {
    category?: string;
    search?: string;
    priceRange?: string;
    sortBy?: string;
  }): Promise<Service[]> {
    let services = Array.from(this.services.values()).filter(service => 
      service.isActive && service.status === 'approved'
    );

    if (filters?.category) {
      // Accept category as name or numeric id
      const maybeId = Number(filters.category);
      let categoryId: number | undefined;
      if (!Number.isNaN(maybeId)) {
        categoryId = maybeId;
      } else {
        const category = Array.from(this.serviceCategories.values()).find(cat => 
          cat.name.toLowerCase() === filters.category?.toLowerCase()
        );
        if (category) categoryId = category.id;
      }
      if (categoryId) {
        services = services.filter(service => service.categoryId === categoryId);
      }
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      services = services.filter(service => 
        service.title.toLowerCase().includes(searchLower) ||
        service.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters?.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(p => parseFloat(p));
      services = services.filter(service => {
        const price = parseFloat(service.price);
        if (max) {
          return price >= min && price <= max;
        } else {
          return price >= min;
        }
      });
    }

    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'rating':
          services.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
          break;
        case 'price-low':
          services.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case 'price-high':
          services.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          break;
        case 'newest':
          services.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          break;
      }
    }

    return services;
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const service: Service = {
      ...insertService,
      id,
      rating: '0.00',
      reviewCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.services.set(id, service);
    return service;
  }

  async updateService(id: number, serviceData: Partial<Service>): Promise<Service | undefined> {
    const service = this.services.get(id);
    if (!service) return undefined;

    const updatedService = { ...service, ...serviceData, updatedAt: new Date() };
    this.services.set(id, updatedService);
    return updatedService;
  }

  async getProviderServices(): Promise<Service[]> {
    // Mock provider services - in real app, this would filter by provider ID
    return Array.from(this.services.values()).slice(0, 3);
  }

  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = {
      ...insertBooking,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    const updatedBooking = { ...booking, ...bookingData, updatedAt: new Date() };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async getProviderBookings(): Promise<any[]> {
    // Mock provider bookings
    return [
      {
        id: 1,
        clientName: 'John Smith',
        service: 'House Cleaning',
        date: '2024-01-20',
        status: 'completed',
        amount: 75,
        clientAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      },
      {
        id: 2,
        clientName: 'Emily Johnson',
        service: 'Deep Cleaning',
        date: '2024-01-18',
        status: 'in_progress',
        amount: 120,
        clientAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
      },
    ];
  }

  async getReviews(serviceId?: number): Promise<Review[]> {
    let reviews = Array.from(this.reviews.values());
    if (serviceId) {
      reviews = reviews.filter(review => review.serviceId === serviceId);
    }
    return reviews;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const review: Review = {
      ...insertReview,
      id,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }

  async getNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(notification => 
      notification.userId === userId
    );
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const notification: Notification = {
      ...insertNotification,
      id,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async getAdminStats(): Promise<any> {
    return {
      totalUsers: this.users.size,
      activeProviders: Array.from(this.users.values()).filter(u => u.role === 'provider' && u.isActive).length,
      monthlyBookings: 15842,
      monthlyRevenue: 124578,
    };
  }

  async getPendingApprovals(): Promise<any[]> {
    return Array.from(this.pendingApprovals.values());
  }

  async approveItem(id: number): Promise<any> {
    const item = this.pendingApprovals.get(id);
    if (!item) return null;

    this.pendingApprovals.delete(id);
    return { success: true, message: 'Item approved successfully' };
  }

  async rejectItem(id: number): Promise<any> {
    const item = this.pendingApprovals.get(id);
    if (!item) return null;

    this.pendingApprovals.delete(id);
    return { success: true, message: 'Item rejected successfully' };
  }

  // AI-related methods for MemStorage
  async getChatConversations(userId: string): Promise<ChatConversation[]> {
    return [];
  }

  async getChatConversation(id: number): Promise<ChatConversation | undefined> {
    return undefined;
  }

  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    return {
      id: 1,
      ...conversation,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  async updateChatConversation(id: number, conversation: Partial<ChatConversation>): Promise<ChatConversation | undefined> {
    return undefined;
  }

  async getChatMessages(conversationId: number): Promise<ChatMessage[]> {
    return [];
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    return {
      id: 1,
      ...message,
      createdAt: new Date()
    };
  }

  async getAiRecommendations(userId: string): Promise<AiRecommendation[]> {
    return [];
  }

  async createAiRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation> {
    return {
      id: 1,
      ...recommendation,
      createdAt: new Date()
    };
  }

  async updateAiRecommendation(id: number, recommendation: Partial<AiRecommendation>): Promise<AiRecommendation | undefined> {
    return undefined;
  }

  async getSentimentAnalysis(referenceType: string, referenceId: number): Promise<SentimentAnalysis | undefined> {
    return undefined;
  }

  async createSentimentAnalysis(analysis: InsertSentimentAnalysis): Promise<SentimentAnalysis> {
    return {
      id: 1,
      ...analysis,
      processedAt: new Date()
    };
  }

  // Provider management implementations
  async getProvider(userId: string): Promise<Provider | undefined> {
    return Array.from(this.providers.values()).find(p => p.userId === userId);
  }

  async getProviders(filters?: { status?: string; city?: string }): Promise<Provider[]> {
    let providers = Array.from(this.providers.values());
    
    if (filters?.status) {
      providers = providers.filter(p => p.approvalStatus === filters.status);
    }
    
    if (filters?.city) {
      providers = providers.filter(p => p.city?.toLowerCase().includes(filters.city!.toLowerCase()));
    }
    
    return providers;
  }

  async createProvider(provider: InsertProvider): Promise<Provider> {
    const id = this.currentProviderId++;
    const newProvider: Provider = {
      id,
      ...provider,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.providers.set(id, newProvider);
    return newProvider;
  }

  async updateProvider(id: number, provider: Partial<Provider>): Promise<Provider | undefined> {
    const existing = this.providers.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...provider,
      updatedAt: new Date()
    };
    
    this.providers.set(id, updated);
    return updated;
  }

  async approveProvider(id: number): Promise<Provider | undefined> {
    return this.updateProvider(id, { approvalStatus: 'approved' });
  }

  async rejectProvider(id: number): Promise<Provider | undefined> {
    return this.updateProvider(id, { approvalStatus: 'rejected' });
  }

  // Wallet management
  async getWallet(userId: string): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(w => w.userId === userId);
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const id = this.currentWalletId++;
    const newWallet: Wallet = {
      id,
      ...wallet,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.wallets.set(id, newWallet);
    return newWallet;
  }

  async updateWalletBalance(userId: string, amount: number): Promise<Wallet | undefined> {
    const wallet = await this.getWallet(userId);
    if (!wallet) return undefined;
    
    const currentBalance = parseFloat(wallet.balance);
    const newBalance = (currentBalance + amount).toFixed(2);
    
    const updated = {
      ...wallet,
      balance: newBalance,
      lastTransactionAt: new Date(),
      updatedAt: new Date()
    };
    
    this.wallets.set(wallet.id, updated);
    return updated;
  }

  // Payment processing
  async getPayments(filters?: { userId?: string; status?: string; bookingId?: number }): Promise<Payment[]> {
    let payments = Array.from(this.payments.values());
    
    if (filters?.userId) {
      payments = payments.filter(p => p.userId === filters.userId);
    }
    
    if (filters?.status) {
      payments = payments.filter(p => p.status === filters.status);
    }

    if (filters?.bookingId) {
      payments = payments.filter(p => p.bookingId === filters.bookingId);
    }
    
    return payments;
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const newPayment: Payment = {
      id,
      ...payment,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.payments.set(id, newPayment);
    return newPayment;
  }

  async updatePayment(id: number, payment: Partial<Payment>): Promise<Payment | undefined> {
    const existing = this.payments.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...payment,
      updatedAt: new Date()
    };
    
    this.payments.set(id, updated);
    return updated;
  }

  async refundPayment(id: number, reason: string): Promise<Payment | undefined> {
    return this.updatePayment(id, {
      status: 'refunded',
      refundReason: reason
    });
  }

  // AI logging
  async createAiLog(log: InsertAiLog): Promise<AiLog> {
    const id = this.currentAiLogId++;
    const newLog: AiLog = {
      id,
      ...log,
      timestamp: new Date(),
    };
    
    this.aiLogs.set(id, newLog);
    return newLog;
  }

  async getAiLogs(filters?: { userId?: string; intent?: string }): Promise<AiLog[]> {
    let logs = Array.from(this.aiLogs.values());
    
    if (filters?.userId) {
      logs = logs.filter(l => l.userId === filters.userId);
    }
    
    if (filters?.intent) {
      logs = logs.filter(l => l.intent === filters.intent);
    }
    
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // System logging - THIS WAS MISSING
  async createSystemLog(log: InsertSystemLog): Promise<SystemLog> {
    const id = this.currentSystemLogId++;
    const newLog: SystemLog = {
      id,
      ...log,
      createdAt: new Date(),
    };
    
    this.systemLogs.set(id, newLog);
    return newLog;
  }

  async getSystemLogs(filters?: { level?: string; category?: string }): Promise<SystemLog[]> {
    let logs = Array.from(this.systemLogs.values());
    
    if (filters?.level) {
      logs = logs.filter(l => l.level === filters.level);
    }
    
    if (filters?.category) {
      logs = logs.filter(l => l.category === filters.category);
    }
    
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Other missing implementations
  async getSubcategories(categoryId?: number): Promise<Subcategory[]> {
    let subcategories = Array.from(this.subcategories.values());
    
    if (categoryId) {
      subcategories = subcategories.filter(s => s.categoryId === categoryId);
    }
    
    return subcategories;
  }

  async createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory> {
    const id = this.currentSubcategoryId++;
    const newSubcategory: Subcategory = {
      id,
      ...subcategory,
      createdAt: new Date(),
    };
    
    this.subcategories.set(id, newSubcategory);
    return newSubcategory;
  }

  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const id = this.currentSessionId++;
    const newSession: UserSession = {
      id,
      ...session,
      createdAt: new Date(),
    };
    
    this.userSessions.set(id, newSession);
    return newSession;
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    return Array.from(this.userSessions.values()).filter(s => s.userId === userId);
  }

  async updateUserSession(id: number, session: Partial<UserSession>): Promise<UserSession | undefined> {
    const existing = this.userSessions.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...session
    };
    
    this.userSessions.set(id, updated);
    return updated;
  }

  async deactivateUserSession(id: number): Promise<void> {
    await this.updateUserSession(id, { isActive: false });
  }

  async createEmailLog(log: InsertEmailLog): Promise<EmailLog> {
    const id = this.currentEmailLogId++;
    const newLog: EmailLog = {
      id,
      ...log,
      createdAt: new Date(),
    };
    
    this.emailLogs.set(id, newLog);
    return newLog;
  }

  async createSmsLog(log: InsertSmsLog): Promise<SmsLog> {
    const id = this.currentSmsLogId++;
    const newLog: SmsLog = {
      id,
      ...log,
      createdAt: new Date(),
    };
    
    this.smsLogs.set(id, newLog);
    return newLog;
  }

  async getEmailLogs(userId?: string): Promise<EmailLog[]> {
    let logs = Array.from(this.emailLogs.values());
    
    if (userId) {
      logs = logs.filter(l => l.userId === userId);
    }
    
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getSmsLogs(userId?: string): Promise<SmsLog[]> {
    let logs = Array.from(this.smsLogs.values());
    
    if (userId) {
      logs = logs.filter(l => l.userId === userId);
    }
    
    return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getServiceImages(serviceId: number): Promise<ServiceImage[]> {
    return Array.from(this.serviceImages.values())
      .filter(img => img.serviceId === serviceId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async createServiceImage(image: InsertServiceImage): Promise<ServiceImage> {
    const id = this.currentServiceImageId++;
    const newImage: ServiceImage = {
      id,
      ...image,
      createdAt: new Date(),
    };
    
    this.serviceImages.set(id, newImage);
    return newImage;
  }

  async updateServiceImage(id: number, image: Partial<ServiceImage>): Promise<ServiceImage | undefined> {
    const existing = this.serviceImages.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...image
    };
    
    this.serviceImages.set(id, updated);
    return updated;
  }

  async deleteServiceImage(id: number): Promise<void> {
    this.serviceImages.delete(id);
  }
}

// Use in-memory storage for now (database storage can be added later)
export const storage: IStorage = new MemStorage();