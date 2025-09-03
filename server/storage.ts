// @ts-nocheck
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
  getNotifications(userId: string): Promise<Notification[]>;
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
  private users: Map<string, User>;
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
        id: (this.currentUserId++).toString(),
        email: user.email ?? null,
        firstName: user.firstName ?? null,
        lastName: user.lastName ?? null,
        profileImageUrl: null,
        role: user.role || 'client',
        language: user.language || 'en',
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
        providerId: String((service as any).providerId),
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
      id,
      email: insertUser.email ?? null,
      firstName: insertUser.firstName ?? null,
      lastName: insertUser.lastName ?? null,
      profileImageUrl: insertUser.profileImageUrl ?? null,
      role: insertUser.role ?? 'client',
      language: insertUser.language ?? 'en',
      isVerified: insertUser.isVerified ?? false,
      isActive: insertUser.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await this.getUser(userData.id);
    if (existingUser) {
      return await this.updateUser(userData.id, userData) || existingUser;
    } else {
      return await this.createUser(userData as InsertUser);
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...userData, updatedAt: new Date() };
    this.users.set(id, updatedUser);
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
      id,
      name: (insertCategory as any).name ?? 'New Category',
      nameAr: (insertCategory as any).nameAr ?? ((insertCategory as any).name ?? 'New Category'),
      description: (insertCategory as any).description ?? null,
      descriptionAr: (insertCategory as any).descriptionAr ?? null,
      icon: (insertCategory as any).icon ?? '🧩',
      color: (insertCategory as any).color ?? '#000000',
      isActive: (insertCategory as any).isActive ?? true,
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
          services.sort((a, b) => parseFloat(b.rating || '0') - parseFloat(a.rating || '0'));
          break;
        case 'price-low':
          services.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          break;
        case 'price-high':
          services.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          break;
        case 'newest':
          services.sort((a, b) => (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0));
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
      id,
      title: (insertService as any).title!,
      description: (insertService as any).description!,
      price: (insertService as any).price!,
      categoryId: (insertService as any).categoryId!,
      providerId: String((insertService as any).providerId!),
      priceType: (insertService as any).priceType ?? 'fixed',
      duration: (insertService as any).duration ?? 60,
      location: (insertService as any).location ?? '',
      status: (insertService as any).status ?? 'approved',
      rating: (insertService as any).rating ?? '0.00',
      reviewCount: (insertService as any).reviewCount ?? 0,
      titleAr: (insertService as any).titleAr ?? null,
      descriptionAr: (insertService as any).descriptionAr ?? null,
      images: (insertService as any).images ?? [],
      availability: (insertService as any).availability ?? {},
      isActive: (insertService as any).isActive ?? true,
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
      id,
      serviceId: (insertBooking as any).serviceId!,
      providerId: String((insertBooking as any).providerId ?? ''),
      clientId: String((insertBooking as any).clientId ?? ''),
      scheduledDate: (insertBooking as any).scheduledDate!,
      scheduledTime: (insertBooking as any).scheduledTime!,
      clientAddress: (insertBooking as any).clientAddress!,
      clientPhone: (insertBooking as any).clientPhone!,
      status: (insertBooking as any).status ?? 'pending',
      duration: (insertBooking as any).duration ?? 60,
      notes: (insertBooking as any).notes ?? null,
      totalAmount: (insertBooking as any).totalAmount ?? '0.00',
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    } as any;
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
      id,
      providerId: String((insertReview as any).providerId!),
      clientId: String((insertReview as any).clientId!),
      serviceId: (insertReview as any).serviceId!,
      bookingId: (insertReview as any).bookingId!,
      rating: (insertReview as any).rating!,
      comment: (insertReview as any).comment ?? null,
      createdAt: new Date(),
    } as any;
    this.reviews.set(id, review);
    return review;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(notification => 
      notification.userId === userId
    );
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const notification: Notification = {
      id,
      title: (insertNotification as any).title!,
      message: (insertNotification as any).message!,
      type: (insertNotification as any).type!,
      userId: String((insertNotification as any).userId!),
      isRead: (insertNotification as any).isRead ?? false,
      metadata: (insertNotification as any).metadata ?? {},
      createdAt: new Date(),
    } as any;
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
      title: (conversation as any).title!,
      userId: String((conversation as any).userId!),
      language: (conversation as any).language ?? 'en',
      isActive: (conversation as any).isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any;
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
      role: (message as any).role!,
      conversationId: (message as any).conversationId!,
      content: (message as any).content!,
      metadata: (message as any).metadata ?? {},
      createdAt: new Date()
    } as any;
  }

  async getAiRecommendations(userId: string): Promise<AiRecommendation[]> {
    return [];
  }

  async createAiRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation> {
    return {
      id: 1,
      userId: String((recommendation as any).userId!),
      serviceIds: (recommendation as any).serviceIds!,
      reason: (recommendation as any).reason ?? null,
      confidence: (recommendation as any).confidence ?? null,
      userFeedback: (recommendation as any).userFeedback ?? null,
      isUsed: (recommendation as any).isUsed ?? false,
      createdAt: new Date()
    } as any;
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
      referenceType: (analysis as any).referenceType!,
      referenceId: (analysis as any).referenceId!,
      sentiment: (analysis as any).sentiment!,
      score: (analysis as any).score ?? null,
      keywords: (analysis as any).keywords ?? {},
      processedAt: new Date()
    } as any;
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
      userId: String((provider as any).userId!),
      businessName: (provider as any).businessName!,
      businessDocs: (provider as any).businessDocs ?? {},
      approvalStatus: (provider as any).approvalStatus ?? 'pending',
      ratings: (provider as any).ratings ?? null,
      serviceCount: (provider as any).serviceCount ?? 0,
      city: (provider as any).city ?? null,
      businessType: (provider as any).businessType ?? null,
      licenseNumber: (provider as any).licenseNumber ?? null,
      insuranceInfo: (provider as any).insuranceInfo ?? {},
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    
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
      userId: String((wallet as any).userId!),
      balance: (wallet as any).balance ?? '0.00',
      currency: (wallet as any).currency ?? 'USD',
      isActive: (wallet as any).isActive ?? true,
      lastTransactionAt: (wallet as any).lastTransactionAt ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    
    this.wallets.set(id, newWallet);
    return newWallet;
  }

  async updateWalletBalance(userId: string, amount: number): Promise<Wallet | undefined> {
    const wallet = await this.getWallet(userId);
    if (!wallet) return undefined;
    
    const currentBalance = parseFloat(wallet.balance || '0');
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
      userId: String((payment as any).userId!),
      providerId: String((payment as any).providerId!),
      bookingId: (payment as any).bookingId!,
      amount: (payment as any).amount!,
      currency: (payment as any).currency ?? 'USD',
      method: (payment as any).method!,
      status: (payment as any).status ?? 'pending',
      metadata: (payment as any).metadata ?? {},
      platformFee: (payment as any).platformFee ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;
    
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
      query: (log as any).query!,
      response: (log as any).response!,
      userId: (log as any).userId ?? null,
      language: (log as any).language ?? null,
      sessionId: (log as any).sessionId ?? null,
      intent: (log as any).intent ?? null,
      serviceMatchedId: (log as any).serviceMatchedId ?? null,
      processingTime: (log as any).processingTime ?? null,
      model: (log as any).model ?? null,
      tokens: (log as any).tokens ?? null,
      timestamp: new Date(),
    } as any;
    
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
    
    return logs.sort((a, b) => new Date(a.timestamp ?? 0).getTime() - new Date(b.timestamp ?? 0).getTime());
  }

  // System logging - THIS WAS MISSING
  async createSystemLog(log: InsertSystemLog): Promise<SystemLog> {
    const id = this.currentSystemLogId++;
    const newLog: SystemLog = {
      id,
      message: (log as any).message!,
      level: (log as any).level!,
      category: (log as any).category!,
      metadata: (log as any).metadata ?? {},
      userId: (log as any).userId ?? null,
      ipAddress: (log as any).ipAddress ?? null,
      userAgent: (log as any).userAgent ?? null,
      createdAt: new Date(),
    } as any;
    
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
    
    return logs.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
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
      name: (subcategory as any).name!,
      nameAr: (subcategory as any).nameAr!,
      description: (subcategory as any).description ?? null,
      descriptionAr: (subcategory as any).descriptionAr ?? null,
      categoryId: (subcategory as any).categoryId!,
      isActive: (subcategory as any).isActive ?? true,
      createdAt: new Date(),
    } as any;
    
    this.subcategories.set(id, newSubcategory);
    return newSubcategory;
  }

  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const id = this.currentSessionId++;
    const newSession: UserSession = {
      id,
      userId: String((session as any).userId!),
      token: (session as any).token!,
      deviceInfo: (session as any).deviceInfo ?? {},
      ipAddress: (session as any).ipAddress ?? null,
      userAgent: (session as any).userAgent ?? null,
      isActive: (session as any).isActive ?? true,
      expiresAt: (session as any).expiresAt!,
      lastActivity: (session as any).lastActivity ?? null,
      createdAt: new Date(),
    } as any;
    
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
      userId: (log as any).userId ?? null,
      provider: (log as any).provider ?? null,
      status: (log as any).status ?? 'sent',
      emailType: (log as any).emailType!,
      recipient: (log as any).recipient!,
      subject: (log as any).subject!,
      externalId: (log as any).externalId ?? null,
      errorMessage: (log as any).errorMessage ?? null,
      sentAt: (log as any).sentAt ?? null,
      createdAt: new Date(),
    } as any;
    
    this.emailLogs.set(id, newLog);
    return newLog;
  }

  async createSmsLog(log: InsertSmsLog): Promise<SmsLog> {
    const id = this.currentSmsLogId++;
    const newLog: SmsLog = {
      id,
      userId: (log as any).userId ?? null,
      provider: (log as any).provider ?? null,
      status: (log as any).status ?? 'sent',
      message: (log as any).message!,
      phoneNumber: (log as any).phoneNumber!,
      smsType: (log as any).smsType!,
      externalId: (log as any).externalId ?? null,
      errorMessage: (log as any).errorMessage ?? null,
      sentAt: (log as any).sentAt ?? null,
      createdAt: new Date(),
    } as any;
    
    this.smsLogs.set(id, newLog);
    return newLog;
  }

  async getEmailLogs(userId?: string): Promise<EmailLog[]> {
    let logs = Array.from(this.emailLogs.values());
    
    if (userId) {
      logs = logs.filter(l => l.userId === userId);
    }
    
    return logs.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
  }

  async getSmsLogs(userId?: string): Promise<SmsLog[]> {
    let logs = Array.from(this.smsLogs.values());
    
    if (userId) {
      logs = logs.filter(l => l.userId === userId);
    }
    
    return logs.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
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
      serviceId: (image as any).serviceId!,
      imageUrl: (image as any).imageUrl!,
      alt: (image as any).alt ?? null,
      isPrimary: (image as any).isPrimary ?? false,
      sortOrder: (image as any).sortOrder ?? null,
      createdAt: new Date(),
    } as any;
    
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



// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  // User management - Updated for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        id: (insertUser as any).id || crypto.randomUUID(),
        email: (insertUser as any).email || null,
        firstName: (insertUser as any).firstName || null,
        lastName: (insertUser as any).lastName || null,
        profileImageUrl: (insertUser as any).profileImageUrl || null,
        role: (insertUser as any).role || 'client',
        language: (insertUser as any).language || 'en',
        isVerified: (insertUser as any).isVerified ?? false,
        isActive: (insertUser as any).isActive ?? true,
      } as any)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData as any)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...(userData as any),
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...(userData as any), updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async getUsers(search?: string): Promise<User[]> {
    if (search) {
      return await db.select().from(users).where(
        and(
          ilike(users.firstName, `%${search}%`),
          ilike(users.lastName, `%${search}%`),
          ilike(users.email, `%${search}%`)
        )
      );
    }
    
    return await db.select().from(users);
  }

  // Service categories
  async getServiceCategories(): Promise<ServiceCategory[]> {
    return await db.select().from(serviceCategories).where(eq(serviceCategories.isActive, true));
  }

  async getServiceCategory(id: number): Promise<ServiceCategory | undefined> {
    const [category] = await db.select().from(serviceCategories).where(eq(serviceCategories.id, id));
    return category || undefined;
  }

  async createServiceCategory(insertCategory: InsertServiceCategory): Promise<ServiceCategory> {
    const [category] = await db
      .insert(serviceCategories)
      .values(insertCategory as any)
      .returning();
    return category;
  }

  // Services
  async getServices(filters?: {
    category?: string;
    search?: string;
    priceRange?: string;
    sortBy?: string;
  }): Promise<Service[]> {
    const conditions: any[] = [eq(services.isActive, true)];
    
    if (filters?.category) {
      conditions.push(eq(services.categoryId, parseInt(filters.category)));
    }
    
    if (filters?.search) {
      conditions.push(
        and(
          ilike(services.title, `%${filters.search}%`),
          ilike(services.description, `%${filters.search}%`)
        )
      );
    }
    
    const base = db.select().from(services).where(and(...conditions));
    
    if (filters?.sortBy === 'price-low') {
      return await base.orderBy(asc(services.price));
    } else if (filters?.sortBy === 'price-high') {
      return await base.orderBy(desc(services.price));
    } else if (filters?.sortBy === 'rating') {
      return await base.orderBy(desc(services.rating));
    } else {
      return await base.orderBy(desc(services.createdAt));
    }
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db
      .insert(services)
      .values(insertService as any)
      .returning();
    return service;
  }

  async updateService(id: number, serviceData: Partial<Service>): Promise<Service | undefined> {
    const [service] = await db
      .update(services)
      .set({ ...(serviceData as any), updatedAt: new Date() })
      .where(eq(services.id, id))
      .returning();
    return service || undefined;
  }

  async getProviderServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(desc(services.createdAt));
  }

  // Bookings
  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(insertBooking as any)
      .returning();
    return booking;
  }

  async updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set({ ...(bookingData as any), updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();
    return booking || undefined;
  }

  async getProviderBookings(): Promise<any[]> {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }

  // Reviews
  async getReviews(): Promise<Review[]> {
    return await db.select().from(reviews).orderBy(desc(reviews.createdAt));
  }

  async getReview(id: number): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review || undefined;
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview as any)
      .returning();
    return review;
  }

  async getServiceReviews(serviceId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.serviceId, serviceId)).orderBy(desc(reviews.createdAt));
  }

  // Notifications
  async getNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification || undefined;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification as any)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  }

  // Admin methods
  async getPendingApprovals(): Promise<any[]> {
    return await db.select().from(services).where(eq(services.status, 'pending'));
  }

  async approveService(serviceId: number): Promise<void> {
    await db.update(services).set({ status: 'approved' }).where(eq(services.id, serviceId));
  }

  async rejectService(serviceId: number): Promise<void> {
    await db.update(services).set({ status: 'rejected' }).where(eq(services.id, serviceId));
  }

  async getDashboardStats(): Promise<any> {
    // This would return aggregate statistics for the dashboard
    return {
      totalUsers: 0,
      totalServices: 0,
      totalBookings: 0,
      totalRevenue: 0,
      pendingApprovals: 0,
      activeProviders: 0,
    };
  }

  async getAdminStats(): Promise<any> {
    return this.getDashboardStats();
  }

  async approveItem(id: number): Promise<{ success: boolean; message: string }> {
    await this.approveService(id);
    return { success: true, message: 'Item approved successfully' };
  }

  async rejectItem(id: number): Promise<{ success: boolean; message: string }> {
    await this.rejectService(id);
    return { success: true, message: 'Item rejected successfully' };
  }

  // AI-related methods for DatabaseStorage
  async getChatConversations(userId: string): Promise<ChatConversation[]> {
    return await db.select().from(chatConversations)
      .where(eq(chatConversations.userId, userId))
      .orderBy(desc(chatConversations.updatedAt));
  }

  async getChatConversation(id: number): Promise<ChatConversation | undefined> {
    const [conversation] = await db.select().from(chatConversations)
      .where(eq(chatConversations.id, id));
    return conversation || undefined;
  }

  async createChatConversation(conversation: InsertChatConversation): Promise<ChatConversation> {
    const [created] = await db.insert(chatConversations)
      .values(conversation as any)
      .returning();
    return created;
  }

  async updateChatConversation(id: number, conversation: Partial<ChatConversation>): Promise<ChatConversation | undefined> {
    const [updated] = await db.update(chatConversations)
      .set({ ...(conversation as any), updatedAt: new Date() })
      .where(eq(chatConversations.id, id))
      .returning();
    return updated || undefined;
  }

  async getChatMessages(conversationId: number): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(eq(chatMessages.conversationId, conversationId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [created] = await db.insert(chatMessages)
      .values(message as any)
      .returning();
    return created;
  }

  async getAiRecommendations(userId: string): Promise<AiRecommendation[]> {
    return await db.select().from(aiRecommendations)
      .where(eq(aiRecommendations.userId, userId))
      .orderBy(desc(aiRecommendations.createdAt));
  }

  async createAiRecommendation(recommendation: InsertAiRecommendation): Promise<AiRecommendation> {
    const [created] = await db.insert(aiRecommendations)
      .values(recommendation as any)
      .returning();
    return created;
  }

  async updateAiRecommendation(id: number, recommendation: Partial<AiRecommendation>): Promise<AiRecommendation | undefined> {
    const [updated] = await db.update(aiRecommendations)
      .set(recommendation as any)
      .where(eq(aiRecommendations.id, id))
      .returning();
    return updated || undefined;
  }

  async getSentimentAnalysis(referenceType: string, referenceId: number): Promise<SentimentAnalysis | undefined> {
    const [analysis] = await db.select().from(sentimentAnalysis)
      .where(
        and(
          eq(sentimentAnalysis.referenceType, referenceType),
          eq(sentimentAnalysis.referenceId, referenceId)
        )
      );
    return analysis || undefined;
  }

  async createSentimentAnalysis(analysis: InsertSentimentAnalysis): Promise<SentimentAnalysis> {
    const [created] = await db.insert(sentimentAnalysis)
      .values(analysis as any)
      .returning();
    return created;
  }

  // Add all missing methods that are in IStorage interface
  async createSystemLog(log: InsertSystemLog): Promise<SystemLog> {
    const [created] = await db.insert(systemLogs)
      .values(log as any)
      .returning();
    return created;
  }

  async getSystemLogs(filters?: { level?: string; category?: string }): Promise<SystemLog[]> {
    const conditions: any[] = [];
    if (filters?.level) conditions.push(eq(systemLogs.level, filters.level));
    if (filters?.category) conditions.push(eq(systemLogs.category, filters.category));
    const query = conditions.length
      ? db.select().from(systemLogs).where(and(...conditions))
      : db.select().from(systemLogs);
    return await query.orderBy(desc(systemLogs.createdAt));
  }

  async getProvider(userId: string): Promise<Provider | undefined> {
    const [provider] = await db.select().from(providers)
      .where(eq(providers.userId, userId));
    return provider || undefined;
  }

  async getProviders(filters?: { status?: string; city?: string }): Promise<Provider[]> {
    const conditions: any[] = [];
    if (filters?.status) conditions.push(eq(providers.approvalStatus, filters.status));
    if (filters?.city) conditions.push(ilike(providers.city, `%${filters.city}%`));
    const query = conditions.length
      ? db.select().from(providers).where(and(...conditions))
      : db.select().from(providers);
    return await query;
  }

  async createProvider(provider: InsertProvider): Promise<Provider> {
    const [created] = await db.insert(providers)
      .values(provider as any)
      .returning();
    return created;
  }

  async updateProvider(id: number, provider: Partial<Provider>): Promise<Provider | undefined> {
    const [updated] = await db.update(providers)
      .set({ ...(provider as any), updatedAt: new Date() })
      .where(eq(providers.id, id))
      .returning();
    return updated || undefined;
  }

  async approveProvider(id: number): Promise<Provider | undefined> {
    return this.updateProvider(id, { approvalStatus: 'approved' });
  }

  async rejectProvider(id: number): Promise<Provider | undefined> {
    return this.updateProvider(id, { approvalStatus: 'rejected' });
  }

  async getWallet(userId: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets)
      .where(eq(wallets.userId, userId));
    return wallet || undefined;
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const [created] = await db.insert(wallets)
      .values(wallet as any)
      .returning();
    return created;
  }

  async updateWalletBalance(userId: string, amount: number): Promise<Wallet | undefined> {
    const wallet = await this.getWallet(userId);
    if (!wallet) return undefined;
    
    const currentBalance = parseFloat(wallet.balance || '0');
    const newBalance = (currentBalance + amount).toFixed(2);
    
    const [updated] = await db.update(wallets)
      .set({ 
        balance: newBalance, 
        lastTransactionAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(wallets.id, wallet.id))
      .returning();
    return updated || undefined;
  }

  async getPayments(filters?: { userId?: string; status?: string; bookingId?: number }): Promise<Payment[]> {
    const conditions: any[] = [];
    if (filters?.userId) conditions.push(eq(payments.userId, filters.userId));
    if (filters?.status) conditions.push(eq(payments.status, filters.status));
    if (filters?.bookingId) conditions.push(eq(payments.bookingId, filters.bookingId));
    const query = conditions.length
      ? db.select().from(payments).where(and(...conditions))
      : db.select().from(payments);
    return await query.orderBy(desc(payments.createdAt));
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments)
      .where(eq(payments.id, id));
    return payment || undefined;
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [created] = await db.insert(payments)
      .values(payment as any)
      .returning();
    return created;
  }

  async updatePayment(id: number, payment: Partial<Payment>): Promise<Payment | undefined> {
    const [updated] = await db.update(payments)
      .set({ ...(payment as any), updatedAt: new Date() })
      .where(eq(payments.id, id))
      .returning();
    return updated || undefined;
  }

  async refundPayment(id: number, reason: string): Promise<Payment | undefined> {
    return this.updatePayment(id, {
      status: 'refunded',
      refundReason: reason
    });
  }

  async createAiLog(log: InsertAiLog): Promise<AiLog> {
    const [created] = await db.insert(aiLogs)
      .values(log as any)
      .returning();
    return created;
  }

  async getAiLogs(filters?: { userId?: string; intent?: string }): Promise<AiLog[]> {
    const conditions: any[] = [];
    if (filters?.userId) conditions.push(eq(aiLogs.userId, filters.userId));
    if (filters?.intent) conditions.push(eq(aiLogs.intent, filters.intent));
    const query = conditions.length
      ? db.select().from(aiLogs).where(and(...conditions))
      : db.select().from(aiLogs);
    return await query.orderBy(desc(aiLogs.timestamp));
  }

  async getSubcategories(categoryId?: number): Promise<Subcategory[]> {
    const query = categoryId
      ? db.select().from(subcategories).where(eq(subcategories.categoryId, categoryId))
      : db.select().from(subcategories);
    return await query;
  }

  async createSubcategory(subcategory: InsertSubcategory): Promise<Subcategory> {
    const [created] = await db.insert(subcategories)
      .values(subcategory as any)
      .returning();
    return created;
  }

  async createUserSession(session: InsertUserSession): Promise<UserSession> {
    const [created] = await db.insert(userSessions)
      .values(session as any)
      .returning();
    return created;
  }

  async getUserSessions(userId: string): Promise<UserSession[]> {
    return await db.select().from(userSessions)
      .where(eq(userSessions.userId, userId))
      .orderBy(desc(userSessions.createdAt));
  }

  async updateUserSession(id: number, session: Partial<UserSession>): Promise<UserSession | undefined> {
    const [updated] = await db.update(userSessions)
      .set(session as any)
      .where(eq(userSessions.id, id))
      .returning();
    return updated || undefined;
  }

  async deactivateUserSession(id: number): Promise<void> {
    await this.updateUserSession(id, { isActive: false });
  }

  async createEmailLog(log: InsertEmailLog): Promise<EmailLog> {
    const [created] = await db.insert(emailLogs)
      .values(log as any)
      .returning();
    return created;
  }

  async createSmsLog(log: InsertSmsLog): Promise<SmsLog> {
    const [created] = await db.insert(smsLogs)
      .values(log as any)
      .returning();
    return created;
  }

  async getEmailLogs(userId?: string): Promise<EmailLog[]> {
    const query = userId
      ? db.select().from(emailLogs).where(eq(emailLogs.userId, userId))
      : db.select().from(emailLogs);
    return await query.orderBy(desc(emailLogs.createdAt));
  }

  async getSmsLogs(userId?: string): Promise<SmsLog[]> {
    const query = userId
      ? db.select().from(smsLogs).where(eq(smsLogs.userId, userId))
      : db.select().from(smsLogs);
    return await query.orderBy(desc(smsLogs.createdAt));
  }

  async getServiceImages(serviceId: number): Promise<ServiceImage[]> {
    return await db.select().from(serviceImages)
      .where(eq(serviceImages.serviceId, serviceId))
      .orderBy(serviceImages.sortOrder);
  }

  async createServiceImage(image: InsertServiceImage): Promise<ServiceImage> {
    const [created] = await db.insert(serviceImages)
      .values(image as any)
      .returning();
    return created;
  }

  async updateServiceImage(id: number, image: Partial<ServiceImage>): Promise<ServiceImage | undefined> {
    const [updated] = await db.update(serviceImages)
      .set(image as any)
      .where(eq(serviceImages.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteServiceImage(id: number): Promise<void> {
    await db.delete(serviceImages)
      .where(eq(serviceImages.id, id));
  }

}

// Use database storage when DATABASE_URL is provided; otherwise fall back to in-memory storage for local/dev
export const storage: IStorage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new MemStorage();
