import type { 
  User, InsertUser, UpsertUser,
  Service, InsertService,
  ServiceCategory, InsertServiceCategory,
  Booking, InsertBooking,
  Review, InsertReview,
  Notification, InsertNotification,
  SystemLog, InsertSystemLog,
  Provider, InsertProvider
} from "@shared/schema";

// Simple in-memory storage interface
export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(userData: UpsertUser): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User | undefined>;
  getUsers(search?: string): Promise<User[]>;

  // Providers
  getProvider(userId: string): Promise<Provider | undefined>;
  getProviderById(id: number): Promise<Provider | undefined>;
  createProvider(provider: InsertProvider): Promise<Provider>;
  updateProvider(id: number, provider: Partial<Provider>): Promise<Provider | undefined>;
  getProviders(filters?: {status?: string}): Promise<Provider[]>;

  // Services
  getServices(filters?: any): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<Service>): Promise<Service | undefined>;
  deleteService(id: number): Promise<void>;

  // Service Categories
  getServiceCategories(): Promise<ServiceCategory[]>;
  createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory>;

  // Bookings
  getBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<Booking>): Promise<Booking | undefined>;
  getProviderBookings(): Promise<Booking[]>;

  // Reviews
  getReviews(serviceId?: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Notifications
  getNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: number, notification: Partial<Notification>): Promise<Notification | undefined>;

  // System Logs
  createSystemLog(log: InsertSystemLog): Promise<SystemLog>;

  // Admin functions
  getProviderServices(): Promise<Service[]>;
  getAdminStats(): Promise<any>;
  getPendingApprovals(): Promise<any>;
  approveItem(id: number): Promise<any>;
  rejectItem(id: number): Promise<any>;
}

// Simple in-memory implementation
export class SimpleStorage implements IStorage {
  private users = new Map<string, User>();
  private services = new Map<number, Service>();
  private categories = new Map<number, ServiceCategory>();
  private bookings = new Map<number, Booking>();
  private reviews = new Map<number, Review>();
  private notifications = new Map<number, Notification>();
  private logs = new Map<number, SystemLog>();
  private providers = new Map<number, Provider>();

  private currentServiceId = 1;
  private currentCategoryId = 1;
  private currentBookingId = 1;
  private currentReviewId = 1;
  private currentNotificationId = 1;
  private currentLogId = 1;
  private currentProviderId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Add some initial categories
    this.categories.set(1, {
      id: 1,
      name: "Home Cleaning",
      nameAr: "تنظيف المنزل",
      description: "Professional home cleaning services",
      descriptionAr: "خدمات تنظيف منزلية احترافية",
      icon: "🏠",
      color: "#4F46E5",
      isActive: true,
      createdAt: new Date()
    });

    this.categories.set(2, {
      id: 2,
      name: "Plumbing",
      nameAr: "السباكة",
      description: "Professional plumbing services",
      descriptionAr: "خدمات سباكة احترافية",
      icon: "🔧",
      color: "#059669",
      isActive: true,
      createdAt: new Date()
    });

    // Add initial services
    this.services.set(1, {
      id: 1,
      title: "Professional House Cleaning",
      titleAr: "تنظيف منزلي احترافي",
      description: "Complete house cleaning service including all rooms",
      descriptionAr: "خدمة تنظيف منزلية شاملة تتضمن جميع الغرف",
      categoryId: 1,
      providerId: "provider1",
      price: "150.00",
      duration: 180,
      status: "active",
      isActive: true,
      images: [],
      // tags: ["cleaning", "house", "professional"], // TODO: Add tags field to schema
      rating: "4.8",
      reviewCount: 45,
      availability: {},
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: crypto.randomUUID(),
      email: insertUser.email || null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      profileImageUrl: insertUser.profileImageUrl || null,
      role: insertUser.role || 'client',
      language: insertUser.language || 'en',
      isVerified: insertUser.isVerified || false,
      isActive: insertUser.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.users.set(user.id, user);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existing = this.users.get(userData.id);
    if (existing) {
      const updated = { ...existing, ...userData, updatedAt: new Date() };
      this.users.set(userData.id, updated);
      return updated;
    } else {
      return this.createUser(userData);
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const existing = this.users.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...userData, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async getUsers(search?: string): Promise<User[]> {
    const users = Array.from(this.users.values());
    if (!search) return users;
    
    return users.filter(user => 
      user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Service methods
  async getServices(filters?: any): Promise<Service[]> {
    let services = Array.from(this.services.values());
    
    if (filters?.category) {
      services = services.filter(s => s.categoryId === parseInt(filters.category));
    }
    
    return services;
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(service: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const newService: Service = {
      id,
      ...service,
      duration: service.duration || null,
      rating: "0",
      reviewCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.services.set(id, newService);
    return newService;
  }

  async updateService(id: number, service: Partial<Service>): Promise<Service | undefined> {
    const existing = this.services.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...service, updatedAt: new Date() };
    this.services.set(id, updated);
    return updated;
  }

  async deleteService(id: number): Promise<void> {
    this.services.delete(id);
  }

  // Category methods
  async getServiceCategories(): Promise<ServiceCategory[]> {
    return Array.from(this.categories.values());
  }

  async createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory> {
    const id = this.currentCategoryId++;
    const newCategory: ServiceCategory = {
      id,
      ...category,
      description: category.description || null,
      descriptionAr: category.descriptionAr || null,
      isActive: true,
      createdAt: new Date()
    };
    
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Provider methods
  async getProvider(userId: string): Promise<Provider | undefined> {
    // Find provider by userId
    for (const provider of this.providers.values()) {
      if (provider.userId === userId) return provider;
    }
    return undefined;
  }
  
  async deleteProvider(userId: string): Promise<boolean> {
    // Find provider by userId and delete it
    for (const [id, provider] of this.providers.entries()) {
      if (provider.userId === userId) {
        this.providers.delete(id);
        console.log(`Deleted provider profile for user ${userId}`);
        return true;
      }
    }
    return false;
  }
  
  async getProviderById(id: number): Promise<Provider | undefined> {
    return this.providers.get(id);
  }
  
  async createProvider(provider: InsertProvider): Promise<Provider> {
    const id = this.currentProviderId++;
    const newProvider: Provider = {
      id,
      ...provider,
      businessDocs: provider.businessDocs || {},
      ratings: provider.ratings || "0",
      serviceCount: provider.serviceCount || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.providers.set(id, newProvider);
    return newProvider;
  }
  
  async updateProvider(id: number, provider: Partial<Provider>): Promise<Provider | undefined> {
    const existing = this.providers.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...provider, updatedAt: new Date() };
    this.providers.set(id, updated);
    return updated;
  }
  
  async getProviders(filters?: {status?: string}): Promise<Provider[]> {
    let providers = Array.from(this.providers.values());
    
    if (filters?.status) {
      providers = providers.filter(p => p.approvalStatus === filters.status);
    }
    
    return providers;
  }

  // Booking methods
  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const newBooking: Booking = {
      id,
      ...booking,
      status: booking.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null
    };
    
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async updateBooking(id: number, booking: Partial<Booking>): Promise<Booking | undefined> {
    const existing = this.bookings.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...booking, updatedAt: new Date() };
    this.bookings.set(id, updated);
    return updated;
  }

  async getProviderBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  // Review methods
  async getReviews(serviceId?: number): Promise<Review[]> {
    let reviews = Array.from(this.reviews.values());
    if (serviceId) {
      reviews = reviews.filter(r => r.serviceId === serviceId);
    }
    return reviews;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.currentReviewId++;
    const newReview: Review = {
      id,
      ...review,
      comment: review.comment || null,
      createdAt: new Date()
    };
    
    this.reviews.set(id, newReview);
    return newReview;
  }

  // Notification methods
  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => (b.createdAt || new Date()).getTime() - (a.createdAt || new Date()).getTime());
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const newNotification: Notification = {
      id,
      ...notification,
      isRead: false,
      metadata: notification.metadata || {},
      createdAt: new Date()
    };
    
    this.notifications.set(id, newNotification);
    return newNotification;
  }
  
  async updateNotification(id: number, notification: Partial<Notification>): Promise<Notification | undefined> {
    const existing = this.notifications.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...notification };
    this.notifications.set(id, updated);
    return updated;
  }

  // System log methods
  async createSystemLog(log: InsertSystemLog): Promise<SystemLog> {
    const id = this.currentLogId++;
    const newLog: SystemLog = {
      id,
      ...log,
      metadata: log.metadata || {},
      createdAt: new Date()
    };
    
    this.logs.set(id, newLog);
    return newLog;
  }

  // Admin methods
  async getProviderServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getAdminStats(): Promise<any> {
    return {
      totalUsers: this.users.size,
      totalServices: this.services.size,
      totalBookings: this.bookings.size,
      totalReviews: this.reviews.size
    };
  }

  async getPendingApprovals(): Promise<any> {
    const providers = Array.from(this.providers.values()).filter(p => p.approvalStatus === 'pending');
    const services = Array.from(this.services.values()).filter(s => s.status === 'pending');
    return { providers, services };
  }

  async approveItem(id: number): Promise<any> {
    return { success: true, id };
  }

  async rejectItem(id: number): Promise<any> {
    return { success: true, id };
  }
}

export const storage: IStorage = new SimpleStorage();