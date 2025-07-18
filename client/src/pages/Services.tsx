import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ScrollReveal from '@/components/common/ScrollReveal';
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

  // Fetch service categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/service-categories'],
  });

  // Fetch services with filters
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services', selectedCategory, searchTerm, priceRange, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      if (priceRange !== 'all') params.append('priceRange', priceRange);
      if (sortBy) params.append('sortBy', sortBy);
      
      const response = await fetch(`/api/services?${params}`);
      return response.json();
    },
  });

  // Group services by category for hierarchical display
  const servicesByCategory = services?.reduce((acc: any, service: any) => {
    const category = categories?.find((cat: any) => cat.id === service.categoryId);
    if (!category) return acc;
    
    if (!acc[category.name]) {
      acc[category.name] = {
        category,
        services: []
      };
    }
    acc[category.name].services.push(service);
    return acc;
  }, {}) || {};

  const handleBookService = (serviceId: number) => {
    console.log('Booking service', serviceId);
    // Handle booking logic here
  };

  if (servicesLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-96">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
                {categories?.map((category: any) => (
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
                        style={{ backgroundColor: categoryData.category.color + '20' }}
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

                  {/* Services Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryData.services.map((service: any) => (
                      <Card key={service.id} className="hover:shadow-md transition-shadow duration-200">
                        <div className="aspect-w-16 aspect-h-9 mb-4">
                          <img
                            src={service.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=400&fit=crop'}
                            alt={service.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        </div>
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{service.title}</CardTitle>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-medium">{service.rating}</span>
                            </div>
                          </div>
                          <CardDescription className="text-sm">
                            {service.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {service.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {service.duration} min
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-khadamati-blue">
                              ${service.price}
                              <span className="text-sm font-normal text-gray-600">
                                /{service.priceType}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              className="bg-khadamati-yellow text-khadamati-dark hover:bg-yellow-500"
                              onClick={() => handleBookService(service.id)}
                            >
                              Book Now
                              <ArrowRight className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          // List View - Traditional Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services?.map((service: any) => (
              <ScrollReveal key={service.id}>
                <Card className="hover:shadow-md transition-shadow duration-200">
                  <div className="aspect-w-16 aspect-h-9 mb-4">
                    <img
                      src={service.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=400&fit=crop'}
                      alt={service.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{service.title}</CardTitle>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{service.rating}</span>
                      </div>
                    </div>
                    <CardDescription className="text-sm">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {service.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {service.duration} min
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-khadamati-blue">
                        ${service.price}
                        <span className="text-sm font-normal text-gray-600">
                          /{service.priceType}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-khadamati-yellow text-khadamati-dark hover:bg-yellow-500"
                        onClick={() => handleBookService(service.id)}
                      >
                        Book Now
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}