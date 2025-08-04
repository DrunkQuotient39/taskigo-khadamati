const Service = require('../models/Service');
const User = require('../models/User');
const { getGeminiModel, fallbackNLP, isGeminiAvailable } = require('../config/ai');

// Get all services with filtering and search
const getServices = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 12, 
      category, 
      subcategory,
      minPrice, 
      maxPrice, 
      city, 
      search,
      sortBy = 'newest',
      language = 'en'
    } = req.query;

    const query = { 
      status: 'approved', 
      isActive: true 
    };

    // Apply filters
    if (category) query.category = category;
    if (subcategory) query.subcategory = new RegExp(subcategory, 'i');
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Text search
    if (search) {
      query.$or = [
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { tags: new RegExp(search, 'i') }
      ];
      
      // Add Arabic search if available
      if (language === 'ar') {
        query.$or.push(
          { title_ar: new RegExp(search, 'i') },
          { description_ar: new RegExp(search, 'i') }
        );
      }
    }

    // Sorting
    let sort = {};
    switch (sortBy) {
      case 'price_low':
        sort.price = 1;
        break;
      case 'price_high':
        sort.price = -1;
        break;
      case 'rating':
        sort['rating.average'] = -1;
        break;
      case 'popular':
        sort.bookingCount = -1;
        break;
      default:
        sort.createdAt = -1;
    }

    const services = await Service.find(query)
      .populate('providerId', 'name location rating')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const totalCount = await Service.countDocuments(query);

    // Localize service data based on language
    const localizedServices = services.map(service => ({
      ...service.toObject(),
      title: language === 'ar' && service.title_ar ? service.title_ar : service.title,
      description: language === 'ar' && service.description_ar ? service.description_ar : service.description
    }));

    res.json({
      services: localizedServices,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: page * limit < totalCount
      },
      filters: {
        category,
        subcategory,
        minPrice,
        maxPrice,  
        city,
        search,
        sortBy,
        language
      }
    });

  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({
      message: 'Failed to get services',
      error: error.message
    });
  }
};

// Get service categories
const getServiceCategories = async (req, res) => {
  try {
    const { language = 'en' } = req.query;

    const categories = {
      maintenance: {
        name: language === 'ar' ? 'الصيانة' : 'Maintenance',
        subcategories: [
          { key: 'electrical', name: language === 'ar' ? 'الكهرباء' : 'Electrical Repair' },
          { key: 'plumbing', name: language === 'ar' ? 'السباكة' : 'Plumbing' },
          { key: 'ac_fridge', name: language === 'ar' ? 'المكيفات والثلاجات' : 'AC/Fridge' },
          { key: 'carpentry', name: language === 'ar' ? 'النجارة' : 'Carpentry' },
          { key: 'appliances', name: language === 'ar' ? 'الأجهزة المنزلية' : 'Home Appliances' }
        ]
      },
      cleaning: {
        name: language === 'ar' ? 'التنظيف' : 'Cleaning',
        subcategories: [
          { key: 'homes', name: language === 'ar' ? 'المنازل' : 'Homes' },
          { key: 'offices', name: language === 'ar' ? 'المكاتب' : 'Offices' },
          { key: 'carpets', name: language === 'ar' ? 'السجاد' : 'Carpets' },
          { key: 'glass', name: language === 'ar' ? 'الزجاج' : 'Glass Facades' },
          { key: 'water_tanks', name: language === 'ar' ? 'خزانات المياه' : 'Water Tanks' }
        ]
      },
      delivery: {
        name: language === 'ar' ? 'التوصيل' : 'Delivery',
        subcategories: [
          { key: 'furniture', name: language === 'ar' ? 'الأثاث' : 'Furniture' },
          { key: 'documents', name: language === 'ar' ? 'المستندات' : 'Documents' },
          { key: 'packages', name: language === 'ar' ? 'الطرود السريعة' : 'Express Packages' }
        ]
      },
      events: {
        name: language === 'ar' ? 'المناسبات' : 'Events',
        subcategories: [
          { key: 'hospitality', name: language === 'ar' ? 'الضيافة' : 'Hospitality (Coffee, Buffets)' },
          { key: 'tents', name: language === 'ar' ? 'الخيام' : 'Tent Rentals' },
          { key: 'photography', name: language === 'ar' ? 'التصوير' : 'Photography' }
        ]
      },
      care: {
        name: language === 'ar' ? 'الرعاية' : 'Care',
        subcategories: [
          { key: 'elderly', name: language === 'ar' ? 'كبار السن' : 'Elderly' },
          { key: 'babysitting', name: language === 'ar' ? 'رعاية الأطفال' : 'Babysitting' },
          { key: 'patient', name: language === 'ar' ? 'مرافقة المرضى' : 'Patient Companion' }
        ]
      },
      gardens: {
        name: language === 'ar' ? 'الحدائق' : 'Gardens',
        subcategories: [
          { key: 'pest_control', name: language === 'ar' ? 'مكافحة الآفات' : 'Pest Control' },
          { key: 'irrigation', name: language === 'ar' ? 'الري' : 'Irrigation' },
          { key: 'trimming', name: language === 'ar' ? 'تقليم الأشجار' : 'Tree Trimming' }
        ]
      },
      auto: {
        name: language === 'ar' ? 'السيارات' : 'Auto',
        subcategories: [
          { key: 'car_wash', name: language === 'ar' ? 'غسيل السيارات' : 'Car Wash' },
          { key: 'oil_check', name: language === 'ar' ? 'فحص الزيت' : 'Oil Check' },
          { key: 'roadside', name: language === 'ar' ? 'المساعدة على الطريق' : 'Roadside Help' }
        ]
      },
      tech: {
        name: language === 'ar' ? 'التقنية' : 'Tech',
        subcategories: [
          { key: 'laptop_repair', name: language === 'ar' ? 'إصلاح الحاسوب' : 'Laptop Repair' },
          { key: 'wifi_setup', name: language === 'ar' ? 'إعداد الواي فاي' : 'WiFi Setup' },
          { key: 'camera_install', name: language === 'ar' ? 'تركيب الكاميرات' : 'Camera Installation' }
        ]
      },
      admin: {
        name: language === 'ar' ? 'الإدارية' : 'Admin',
        subcategories: [
          { key: 'gov_paperwork', name: language === 'ar' ? 'الأوراق الحكومية' : 'Government Paperwork' },
          { key: 'legal_docs', name: language === 'ar' ? 'الوثائق القانونية' : 'Legal Documents' },
          { key: 'translation', name: language === 'ar' ? 'الترجمة المعتمدة' : 'Certified Translation' }
        ]
      }
    };

    res.json({ categories });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      message: 'Failed to get service categories',
      error: error.message
    });
  }
};

// Get single service details
const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'en' } = req.query;

    const service = await Service.findById(id)
      .populate('providerId', 'name email phone location rating isVerified createdAt');

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Increment view count
    service.viewCount += 1;
    await service.save();

    // Localize service data
    const localizedService = {
      ...service.toObject(),
      title: language === 'ar' && service.title_ar ? service.title_ar : service.title,
      description: language === 'ar' && service.description_ar ? service.description_ar : service.description
    };

    res.json({ service: localizedService });

  } catch (error) {
    console.error('Get service by ID error:', error);
    res.status(500).json({
      message: 'Failed to get service details',
      error: error.message
    });
  }
};

// Create new service (provider only)
const createService = async (req, res) => {
  try {
    const providerId = req.user._id;
    const serviceData = {
      ...req.body,
      providerId,
      status: 'pending' // Services need admin approval
    };

    const service = new Service(serviceData);
    await service.save();

    res.status(201).json({
      message: 'Service created successfully and is pending approval',
      service
    });

  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      message: 'Failed to create service',
      error: error.message
    });
  }
};

// Update service (provider only, own services)
const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user._id;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.providerId.toString() !== providerId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this service' });
    }

    // Update service and set status to pending if significant changes
    const significantFields = ['title', 'description', 'price', 'category'];
    const hasSignificantChanges = significantFields.some(field => 
      req.body[field] && req.body[field] !== service[field]
    );

    const updatedData = {
      ...req.body,
      ...(hasSignificantChanges && { status: 'pending' })
    };

    const updatedService = await Service.findByIdAndUpdate(
      id, 
      updatedData, 
      { new: true, runValidators: true }
    );

    res.json({
      message: hasSignificantChanges 
        ? 'Service updated and is pending re-approval' 
        : 'Service updated successfully',
      service: updatedService
    });

  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      message: 'Failed to update service',
      error: error.message
    });
  }
};

// Delete service (provider only, own services)
const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const providerId = req.user._id;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    if (service.providerId.toString() !== providerId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this service' });
    }

    await Service.findByIdAndDelete(id);

    res.json({ message: 'Service deleted successfully' });

  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      message: 'Failed to delete service',
      error: error.message
    });
  }
};

module.exports = {
  getServices,
  getServiceCategories,
  getServiceById,
  createService,
  updateService,
  deleteService
};