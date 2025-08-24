import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ScrollReveal from '@/components/common/ScrollReveal';
import InteractiveServiceCard from '@/components/services/InteractiveServiceCard';
import SimpleServiceCard from '@/components/services/SimpleServiceCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, MapPin, Clock, Search, Filter, ArrowRight, Users, Grid, List } from 'lucide-react';

interface ServicesProps {
  messages: any;
}

export default function Services({ messages }: ServicesProps) {
  const [location] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'category' | 'list'>('category');

  // Fetch live categories and services
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/service-categories'],
    queryFn: async () => {
      const res = await fetch('/api/service-categories', { credentials: 'include' });
      return res.json();
    }
  });

  const { data: servicesData = [] } = useQuery({
    queryKey: ['/api/services', selectedCategory, searchTerm, priceRange, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (searchTerm) params.set('search', searchTerm);
      if (priceRange !== 'all') params.set('priceRange', priceRange);
      if (sortBy) params.set('sortBy', sortBy);
      const res = await fetch(`/api/services?${params.toString()}`, { credentials: 'include' });
      return res.json();
    }
  });

  // Normalize services list from API (supports { services: [...] } or [...])
  const servicesList = Array.isArray(servicesData)
    ? servicesData
    : (servicesData && Array.isArray(servicesData.services) ? servicesData.services : []);

  // Group services by category
  const servicesByCategory = servicesList.reduce((acc: any, service: any) => {
    const category = categories.find((cat: any) => cat.id === service.categoryId);
    if (!category) return acc;
    
    if (!acc[category.name]) {
      acc[category.name] = {
        category,
        services: []
      };
    }
    acc[category.name].services.push(service);
    return acc;
  }, {});

  const handleBookService = (serviceId: number) => {
    console.log('Booking service', serviceId);
    window.location.href = `/booking?service=${serviceId}`;
  };

  const handleViewDetails = (serviceId: number) => {
    window.location.href = `/service/${serviceId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ScrollReveal>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {messages.services?.title || 'Our Services'}
            </h1>
            <p className="text-gray-600 mb-6">
              {messages.services?.subtitle || 'Find professional services from trusted providers'}
            </p>
          </ScrollReveal>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={messages.services?.search || 'Search services...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                 {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="0-25">$0 - $25</SelectItem>
                <SelectItem value="25-50">$25 - $50</SelectItem>
                <SelectItem value="50-100">$50 - $100</SelectItem>
                <SelectItem value="100+">$100+</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'category' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('category')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'category' ? (
          // Category View - Hierarchical Structure
          <div className="space-y-12">
            {Object.entries(servicesByCategory).map(([categoryName, categoryData]: [string, any]) => (
              <ScrollReveal key={categoryName}>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  {/* Category Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                       style={{ backgroundColor: (categoryData.category.color || '#3B82F6') + '20' }}
                      >
                        {categoryData.category.icon}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {categoryData.category.name}
                        </h2>
                        <p className="text-gray-600">
                          {categoryData.category.description}
                        </p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {categoryData.services.length} Providers
                    </Badge>
                  </div>

                  {/* Services Grid with Interactive Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryData.services.map((service: any) => {
                      // Transform service data to match InteractiveServiceCard props
                      const transformedService = {
                        ...service,
                        provider: {
                          name: service.provider?.name || 'Professional Provider',
                          nameAr: service.provider?.nameAr || '',
                          avatar: service.provider?.avatar || '',
                          rating: service.provider?.rating || 4.8,
                          completedJobs: service.provider?.completedJobs || 150,
                          verified: service.provider?.verified || true
                        },
                        category: {
                          name: categoryData.category.name,
                          nameAr: categoryData.category.nameAr || '',
                          icon: categoryData.category.icon,
                          color: categoryData.category.color || '#3B82F6'
                        },
                        rating: service.rating || 4.8,
                        location: service.location || 'Your area',
                        duration: service.duration || 60
                      };
                      
                      return (
                        <ScrollReveal key={service.id} delay={50}>
                          <SimpleServiceCard
                            service={transformedService}
                            onBook={handleBookService}
                            onViewDetails={handleViewDetails}
                          />
                        </ScrollReveal>
                      );
                    })}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          // List View - Traditional Grid (from live services)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicesList.map((service: any) => {
              const categoryForService = categories.find((cat: any) => cat.id === service.categoryId);
              const transformedService = {
                ...service,
                provider: {
                  name: service.provider?.name || 'Professional Provider',
                  nameAr: service.provider?.nameAr || '',
                  avatar: service.provider?.avatar || '',
                  rating: service.provider?.rating || 4.8,
                  completedJobs: service.provider?.completedJobs || 150,
                  verified: service.provider?.verified || true
                },
                category: {
                  name: categoryForService?.name || 'Service',
                  nameAr: categoryForService?.nameAr || '',
                  icon: categoryForService?.icon || '🔧',
                  color: categoryForService?.color || '#3B82F6'
                },
                rating: service.rating || 4.8,
                location: service.location || 'Your area',
                duration: service.duration || 60
              };

              return (
                <ScrollReveal key={service.id}>
                  <SimpleServiceCard
                    service={transformedService}
                    onBook={handleBookService}
                    onViewDetails={handleViewDetails}
                  />
                </ScrollReveal>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}