import { Router } from 'express';
import { storage } from '../../storage';
import { firebaseAuthenticate } from '../../middleware/firebaseAuth';
import { authorize } from '../../middleware/auth';

const router = Router();

// Require Firebase authentication and admin role
router.use(firebaseAuthenticate as any);
router.use(authorize('admin'));

// Seed test data
router.post('/seed', async (req, res) => {
  try {
    const adminUserId = req.user!.id;
    
    // 1. Create service categories if needed
    const existingCategories = await storage.getServiceCategories();
    if (existingCategories.length < 3) {
      const categories = [
        { 
          name: 'Cleaning', 
          nameAr: 'تنظيف', 
          description: 'Home and office cleaning services', 
          descriptionAr: 'خدمات تنظيف المنازل والمكاتب',
          icon: '🧹', 
          color: '#3B82F6', 
          isActive: true 
        },
        { 
          name: 'AC Repair', 
          nameAr: 'إصلاح التكييف', 
          description: 'Air conditioning repair and maintenance', 
          descriptionAr: 'إصلاح وصيانة مكيفات الهواء',
          icon: '❄️', 
          color: '#06B6D4', 
          isActive: true 
        },
        { 
          name: 'Delivery', 
          nameAr: 'توصيل', 
          description: 'Quick delivery services', 
          descriptionAr: 'خدمات التوصيل السريع',
          icon: '🚚', 
          color: '#EF4444', 
          isActive: true 
        },
        { 
          name: 'Electrical', 
          nameAr: 'كهرباء', 
          description: 'Electrical repairs and installations', 
          descriptionAr: 'إصلاح وتركيب الأنظمة الكهربائية',
          icon: '⚡', 
          color: '#F59E0B', 
          isActive: true 
        },
        { 
          name: 'Plumbing', 
          nameAr: 'سباكة', 
          description: 'Plumbing repairs and installations', 
          descriptionAr: 'إصلاح وتركيب السباكة',
          icon: '🔧', 
          color: '#10B981', 
          isActive: true 
        }
      ];
      
      for (const category of categories) {
        const existing = existingCategories.find(c => c.name === category.name);
        if (!existing) {
          await storage.createServiceCategory(category as any);
        }
      }
      
      console.log('Created test categories');
    }
    
    // 2. Create a test provider if none exists
    const providers = await storage.getProviders();
    let testProviderId = '';
    
    if (providers.length === 0) {
      // Create a provider user first
      const providerUser = await storage.createUser({
        id: `test-provider-${Date.now()}`,
        email: 'testprovider@taskigo.net',
        firstName: 'Test',
        lastName: 'Provider',
        role: 'provider',
        language: 'en',
        isVerified: true,
        isActive: true
      });
      
      // Then create the provider profile
      const provider = await storage.createProvider({
        userId: providerUser.id,
        businessName: 'Test Provider Services',
        businessNameAr: 'خدمات اختبار المزود',
        phone: '+1234567890',
        businessEmail: 'provider@taskigo.net',
        businessType: 'General Services',
        businessDescription: 'Test provider for development and testing',
        address: '123 Test Street',
        city: 'Beirut',
        country: 'Lebanon',
        languages: ['en', 'ar'],
        approvalStatus: 'approved',
        ratings: '4.8',
        reviews: 25
      });
      
      testProviderId = provider.id.toString();
      console.log('Created test provider');
    } else {
      // Use the first available provider
      testProviderId = providers[0].id.toString();
    }
    
    // 3. Create sample services
    const services = await storage.getServices();
    const categories = await storage.getServiceCategories();
    
    if (services.length < 5) {
      // Find category IDs
      const findCategory = (name: string) => {
        const category = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
        return category ? category.id : categories[0].id;
      };
      
      const sampleServices = [
        {
          title: 'Basic Home Cleaning',
          titleAr: 'تنظيف منزلي أساسي',
          description: 'Standard 2-hour cleaning service for apartments and small homes. Includes dusting, vacuuming, mopping, and bathroom cleaning.',
          descriptionAr: 'خدمة تنظيف قياسية لمدة ساعتين للشقق والمنازل الصغيرة. تشمل إزالة الغبار والتنظيف بالمكنسة والممسحة وتنظيف الحمام.',
          price: '30.00',
          priceType: 'hourly',
          duration: 120, // minutes
          categoryId: findCategory('Cleaning'),
          location: 'Beirut',
          isActive: true,
          status: 'approved',
          rating: '4.8',
          reviewCount: 42,
          providerId: testProviderId
        },
        {
          title: 'Deep Cleaning',
          titleAr: 'تنظيف عميق',
          description: 'Comprehensive deep cleaning service for homes and offices. Includes all basic cleaning plus deep cleaning of kitchen appliances, cabinets, and hard-to-reach areas.',
          descriptionAr: 'خدمة تنظيف شاملة للمنازل والمكاتب. تشمل كل التنظيف الأساسي بالإضافة إلى التنظيف العميق لأجهزة المطبخ والخزائن والمناطق التي يصعب الوصول إليها.',
          price: '50.00',
          priceType: 'hourly',
          duration: 240, // minutes
          categoryId: findCategory('Cleaning'),
          location: 'Beirut',
          isActive: true,
          status: 'approved',
          rating: '4.9',
          reviewCount: 38,
          providerId: testProviderId
        },
        {
          title: 'AC Repair - Quick Fix',
          titleAr: 'إصلاح سريع للتكييف',
          description: 'Quick diagnosis and repair of common air conditioner problems. Includes inspection, minor repairs, and refrigerant top-up if needed.',
          descriptionAr: 'تشخيص سريع وإصلاح لمشاكل مكيف الهواء الشائعة. يشمل الفحص والإصلاحات البسيطة وإعادة تعبئة غاز التبريد إذا لزم الأمر.',
          price: '50.00',
          priceType: 'fixed',
          duration: 60, // minutes
          categoryId: findCategory('AC Repair'),
          location: 'Beirut',
          isActive: true,
          status: 'approved',
          rating: '4.7',
          reviewCount: 25,
          providerId: testProviderId
        },
        {
          title: 'AC Full Service',
          titleAr: 'خدمة تكييف كاملة',
          description: 'Complete air conditioning service including deep cleaning, filter replacement, and full system check. Ideal for annual maintenance.',
          descriptionAr: 'خدمة تكييف هواء كاملة تشمل التنظيف العميق واستبدال الفلتر وفحص النظام بالكامل. مثالية للصيانة السنوية.',
          price: '80.00',
          priceType: 'fixed',
          duration: 120, // minutes
          categoryId: findCategory('AC Repair'),
          location: 'Beirut',
          isActive: true,
          status: 'approved',
          rating: '4.9',
          reviewCount: 19,
          providerId: testProviderId
        },
        {
          title: 'Same-day Delivery',
          titleAr: 'توصيل في نفس اليوم',
          description: 'Fast delivery service within the city. Perfect for documents, small packages, and urgent items.',
          descriptionAr: 'خدمة توصيل سريعة داخل المدينة. مثالية للمستندات والطرود الصغيرة والعناصر العاجلة.',
          price: '12.00',
          priceType: 'fixed',
          duration: 60, // minutes
          categoryId: findCategory('Delivery'),
          location: 'Beirut',
          isActive: true,
          status: 'approved',
          rating: '4.6',
          reviewCount: 60,
          providerId: testProviderId
        },
        {
          title: 'Electrical Repairs',
          titleAr: 'إصلاحات كهربائية',
          description: 'Professional electrical repair service for residential and commercial properties. Includes outlet repairs, light fixture installation, and more.',
          descriptionAr: 'خدمة إصلاح كهربائية احترافية للعقارات السكنية والتجارية. تشمل إصلاحات المنافذ وتركيب تجهيزات الإضاءة والمزيد.',
          price: '45.00',
          priceType: 'hourly',
          duration: 60, // minutes
          categoryId: findCategory('Electrical'),
          location: 'Beirut',
          isActive: true,
          status: 'approved',
          rating: '4.8',
          reviewCount: 32,
          providerId: testProviderId
        },
        {
          title: 'Plumbing Service',
          titleAr: 'خدمة السباكة',
          description: 'Expert plumbing services for leaks, clogs, and installations. Fast response and professional work guaranteed.',
          descriptionAr: 'خدمات سباكة خبيرة للتسريبات والانسدادات والتركيبات. استجابة سريعة وعمل احترافي مضمون.',
          price: '40.00',
          priceType: 'hourly',
          duration: 60, // minutes
          categoryId: findCategory('Plumbing'),
          location: 'Beirut',
          isActive: true,
          status: 'approved',
          rating: '4.7',
          reviewCount: 28,
          providerId: testProviderId
        }
      ];
      
      for (const service of sampleServices) {
        // Check if service already exists
        const existing = services.find(s => s.title === service.title);
        if (!existing) {
          await storage.createService(service as any);
        }
      }
      
      console.log('Created sample services');
    }
    
    // 4. Create sample bookings if needed
    const bookings = await storage.getBookings();
    
    if (bookings.length < 3) {
      // Get a client user or create one
      const users = await storage.getUsers();
      let clientUser = users.find(u => u.role === 'client');
      
      if (!clientUser) {
        clientUser = await storage.createUser({
          id: `test-client-${Date.now()}`,
          email: 'testclient@taskigo.net',
          firstName: 'Test',
          lastName: 'Client',
          role: 'client',
          language: 'en',
          isVerified: true,
          isActive: true
        });
      }
      
      // Create sample bookings with different statuses
      const servicesList = await storage.getServices();
      
      if (servicesList.length > 0) {
        const sampleBookings = [
          {
            clientId: clientUser.id,
            serviceId: servicesList[0].id,
            providerId: servicesList[0].providerId,
            scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            scheduledTime: '10:00',
            duration: servicesList[0].duration || 60,
            clientAddress: '123 Test Address, Beirut',
            clientPhone: '+1234567890',
            totalAmount: servicesList[0].price,
            specialInstructions: 'This is a test booking. Please bring all necessary equipment.',
            status: 'pending',
            paymentStatus: 'pending'
          },
          {
            clientId: clientUser.id,
            serviceId: servicesList[1].id,
            providerId: servicesList[1].providerId,
            scheduledDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
            scheduledTime: '14:00',
            duration: servicesList[1].duration || 60,
            clientAddress: '456 Sample Street, Beirut',
            clientPhone: '+1234567890',
            totalAmount: servicesList[1].price,
            specialInstructions: 'Please call before arriving.',
            status: 'accepted',
            paymentStatus: 'pending'
          },
          {
            clientId: clientUser.id,
            serviceId: servicesList[2].id,
            providerId: servicesList[2].providerId,
            scheduledDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            scheduledTime: '16:00',
            duration: servicesList[2].duration || 60,
            clientAddress: '789 Demo Road, Beirut',
            clientPhone: '+1234567890',
            totalAmount: servicesList[2].price,
            specialInstructions: '',
            status: 'completed',
            paymentStatus: 'paid'
          }
        ];
        
        for (const booking of sampleBookings) {
          await storage.createBooking(booking as any);
        }
        
        console.log('Created sample bookings');
        
        // Create a payment for the completed booking
        if (servicesList[2]) {
          await storage.createPayment({
            bookingId: 3, // This assumes the completed booking is the third one created
            userId: clientUser.id,
            providerId: servicesList[2].providerId,
            method: 'card',
            amount: servicesList[2].price,
            currency: 'USD',
            status: 'paid',
            txnId: `test-${Date.now()}`,
            platformFee: (parseFloat(servicesList[2].price) * 0.1).toString(),
            metadata: {
              cardDetails: JSON.stringify({last4: '4242'}),
              completedAt: new Date().toISOString()
            }
          });
          
          console.log('Created sample payment');
        }
      }
    }
    
    // 5. Create a pending provider application
    const pendingProviders = await storage.getProviders({ status: 'pending' });
    
    if (pendingProviders.length === 0) {
      // Create a user for the pending provider
      const pendingUser = await storage.createUser({
        id: `pending-provider-${Date.now()}`,
        email: 'pendingprovider@taskigo.net',
        firstName: 'Pending',
        lastName: 'Provider',
        role: 'client', // Start as client until approved
        language: 'en',
        isVerified: true,
        isActive: true
      });
      
      // Create the pending provider
      await storage.createProvider({
        userId: pendingUser.id,
        businessName: 'Pending Provider Business',
        businessNameAr: 'اسم الشركة قيد الانتظار',
        phone: '+9876543210',
        businessEmail: 'pending@taskigo.net',
        businessType: 'Handyman Services',
        businessDescription: 'This is a pending provider waiting for admin approval.',
        address: '456 Pending Avenue',
        city: 'Beirut',
        country: 'Lebanon',
        languages: ['en'],
        approvalStatus: 'pending',
        ratings: null,
        reviews: 0
      });
      
      // Create notification for the admin
      await storage.createNotification({
        userId: adminUserId,
        title: 'New Provider Application',
        message: 'A new provider "Pending Provider Business" has applied and is waiting for approval.',
        type: 'admin',
        metadata: {
          action: 'provider_approval',
          businessName: 'Pending Provider Business',
          businessType: 'Handyman Services'
        }
      });
      
      console.log('Created pending provider application');
    }
    
    res.json({
      message: 'Test data seeded successfully',
      created: {
        categories: existingCategories.length < 3,
        provider: providers.length === 0,
        services: services.length < 5,
        bookings: bookings.length < 3,
        pendingProvider: pendingProviders.length === 0
      }
    });
    
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ message: 'Failed to seed test data', error: (error as Error).message });
  }
});

export default router;
