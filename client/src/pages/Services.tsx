import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import ServiceGrid from '@/components/services/ServiceGrid';
import ScrollReveal from '@/components/common/ScrollReveal';
import { Skeleton } from '@/components/ui/skeleton';

interface ServicesProps {
  messages: any;
}

export default function Services({ messages }: ServicesProps) {
  const [location] = useLocation();
  
  // Mock data - in real app, this would come from API
  const mockServices = [
    {
      id: 1,
      title: 'Premium House Cleaning',
      description: 'Deep cleaning service for your home with eco-friendly products',
      price: '35',
      priceType: 'hourly',
      rating: '4.9',
      reviewCount: 127,
      provider: {
        name: 'Sarah Johnson',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face'
      },
      location: 'Downtown',
      duration: 120,
      category: 'cleaning',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=400&fit=crop',
      createdAt: '2024-01-15T10:00:00Z'
    },
    {
      id: 2,
      title: 'Emergency Plumbing',
      description: '24/7 emergency plumbing services for urgent repairs',
      price: '45',
      priceType: 'hourly',
      rating: '4.8',
      reviewCount: 89,
      provider: {
        name: 'Ahmed Hassan',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      },
      location: 'Citywide',
      duration: 60,
      category: 'plumbing',
      image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800&h=400&fit=crop',
      createdAt: '2024-01-10T14:30:00Z'
    },
    {
      id: 3,
      title: 'Electrical Installation',
      description: 'Licensed electrical installations and safety inspections',
      price: '55',
      priceType: 'hourly',
      rating: '4.9',
      reviewCount: 156,
      provider: {
        name: 'Maria Rodriguez',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
      },
      location: 'Residential Areas',
      duration: 90,
      category: 'electrical',
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=400&fit=crop',
      createdAt: '2024-01-08T09:15:00Z'
    },
    {
      id: 4,
      title: 'Express Delivery',
      description: 'Same-day delivery service for packages and documents',
      price: '15',
      priceType: 'fixed',
      rating: '4.7',
      reviewCount: 203,
      provider: {
        name: 'David Wilson',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      },
      location: 'Metro Area',
      duration: 30,
      category: 'delivery',
      image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&h=400&fit=crop',
      createdAt: '2024-01-12T16:45:00Z'
    },
    {
      id: 5,
      title: 'Home Maintenance',
      description: 'General repairs and maintenance for residential properties',
      price: '30',
      priceType: 'hourly',
      rating: '4.6',
      reviewCount: 94,
      provider: {
        name: 'James Thompson',
        image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face'
      },
      location: 'Suburban Areas',
      duration: 180,
      category: 'maintenance',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&h=400&fit=crop',
      createdAt: '2024-01-05T11:20:00Z'
    },
    {
      id: 6,
      title: 'Interior Painting',
      description: 'Professional interior painting with premium quality paints',
      price: '35',
      priceType: 'hourly',
      rating: '4.8',
      reviewCount: 112,
      provider: {
        name: 'Lisa Anderson',
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
      },
      location: 'Residential',
      duration: 240,
      category: 'painting',
      image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=400&fit=crop',
      createdAt: '2024-01-03T13:30:00Z'
    }
  ];

  const mockCategories = [
    { id: 1, name: 'cleaning', displayName: 'Cleaning' },
    { id: 2, name: 'plumbing', displayName: 'Plumbing' },
    { id: 3, name: 'electrical', displayName: 'Electrical' },
    { id: 4, name: 'delivery', displayName: 'Delivery' },
    { id: 5, name: 'maintenance', displayName: 'Maintenance' },
    { id: 6, name: 'painting', displayName: 'Painting' },
  ];

  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services'],
    queryFn: () => Promise.resolve(mockServices),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: () => Promise.resolve(mockCategories),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleServiceBook = (serviceId: number) => {
    // In real app, this would navigate to booking page with service ID
    console.log(`Booking service ${serviceId}`);
    // useLocation()[1](`/booking?service=${serviceId}`);
  };

  if (servicesLoading || categoriesLoading) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <ScrollReveal>
            <h1 className="text-4xl font-bold text-khadamati-dark mb-4">
              {messages.services_page?.title || 'All Services'}
            </h1>
            <p className="text-xl text-khadamati-gray max-w-2xl mx-auto">
              {messages.services_page?.description || 'Find the perfect service provider for your needs.'}
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={200}>
          <ServiceGrid
            services={services || []}
            categories={categories || []}
            onServiceBook={handleServiceBook}
            messages={messages}
          />
        </ScrollReveal>
      </div>
    </div>
  );
}
