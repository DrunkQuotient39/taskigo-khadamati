import { 
  users, 
  services, 
  serviceCategories, 
  bookings, 
  reviews, 
  notifications,
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
  type InsertNotification
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private services: Map<number, Service>;
  private serviceCategories: Map<number, ServiceCategory>;
  private bookings: Map<number, Booking>;
  private reviews: Map<number, Review>;
  private notifications: Map<number, Notification>;
  private pendingApprovals: Map<number, any>;
  private currentUserId: number;
  private currentServiceId: number;
  private currentCategoryId: number;
  private currentBookingId: number;
  private currentReviewId: number;
  private currentNotificationId: number;
  private currentApprovalId: number;

  constructor() {
    this.users = new Map();
    this.services = new Map();
    this.serviceCategories = new Map();
    this.bookings = new Map();
    this.reviews = new Map();
    this.notifications = new Map();
    this.pendingApprovals = new Map();
    this.currentUserId = 1;
    this.currentServiceId = 1;
    this.currentCategoryId = 1;
    this.currentBookingId = 1;
    this.currentReviewId = 1;
    this.currentNotificationId = 1;
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
      const category = Array.from(this.serviceCategories.values()).find(cat => 
        cat.name.toLowerCase() === filters.category?.toLowerCase()
      );
      if (category) {
        services = services.filter(service => service.categoryId === category.id);
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
        id: insertUser.id || crypto.randomUUID(),
        email: insertUser.email || null,
        firstName: insertUser.firstName || null,
        lastName: insertUser.lastName || null,
        profileImageUrl: insertUser.profileImageUrl || null,
        role: insertUser.role || 'client',
        language: insertUser.language || 'en',
        isVerified: insertUser.isVerified || false,
        isActive: insertUser.isActive || true,
      })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
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
      .values(insertCategory)
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
    let baseQuery = db.select().from(services).where(eq(services.isActive, true));
    
    if (filters?.category) {
      baseQuery = baseQuery.where(eq(services.categoryId, parseInt(filters.category)));
    }
    
    if (filters?.search) {
      baseQuery = baseQuery.where(
        and(
          ilike(services.title, `%${filters.search}%`),
          ilike(services.description, `%${filters.search}%`)
        )
      );
    }
    
    if (filters?.sortBy === 'price-low') {
      return await baseQuery.orderBy(asc(services.price));
    } else if (filters?.sortBy === 'price-high') {
      return await baseQuery.orderBy(desc(services.price));
    } else if (filters?.sortBy === 'rating') {
      return await baseQuery.orderBy(desc(services.rating));
    } else {
      return await baseQuery.orderBy(desc(services.createdAt));
    }
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db
      .insert(services)
      .values(insertService)
      .returning();
    return service;
  }

  async updateService(id: number, serviceData: Partial<Service>): Promise<Service | undefined> {
    const [service] = await db
      .update(services)
      .set({ ...serviceData, updatedAt: new Date() })
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
      .values(insertBooking)
      .returning();
    return booking;
  }

  async updateBooking(id: number, bookingData: Partial<Booking>): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set({ ...bookingData, updatedAt: new Date() })
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
      .values(insertReview)
      .returning();
    return review;
  }

  async getServiceReviews(serviceId: number): Promise<Review[]> {
    return await db.select().from(reviews).where(eq(reviews.serviceId, serviceId)).orderBy(desc(reviews.createdAt));
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    return await db.select().from(notifications).orderBy(desc(notifications.createdAt));
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, id));
    return notification || undefined;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
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
}

export const storage = new MemStorage();
