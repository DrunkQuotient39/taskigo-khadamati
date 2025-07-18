import { 
  users, 
  services, 
  serviceCategories, 
  bookings, 
  reviews, 
  notifications,
  type User, 
  type InsertUser,
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

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User | undefined>;
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

    // Mock services
    const mockServices = [
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
      },
      {
        providerId: 2,
        categoryId: 2,
        title: 'Emergency Plumbing',
        description: '24/7 emergency plumbing services for urgent repairs',
        price: '45.00',
        priceType: 'hourly',
        duration: 60,
        location: 'Citywide',
        status: 'approved',
        rating: '4.8',
        reviewCount: 89,
      },
    ];

    mockServices.forEach(service => {
      const s: Service = {
        id: this.currentServiceId++,
        ...service,
        titleAr: null,
        descriptionAr: null,
        images: [],
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

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      isVerified: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
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
        user.firstName.toLowerCase().includes(searchLower) ||
        user.lastName.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
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

export const storage = new MemStorage();
