import { useState } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ServiceCard from './ServiceCard';

interface ServiceGridProps {
  services: any[];
  categories: any[];
  onServiceBook: (serviceId: number) => void;
  messages: any;
}

export default function ServiceGrid({ services, categories, onServiceBook, messages }: ServiceGridProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  const filteredServices = services.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const price = parseFloat(service.price);
    const matchesPrice = priceRange === 'all' ||
                        (priceRange === '0-25' && price <= 25) ||
                        (priceRange === '25-50' && price > 25 && price <= 50) ||
                        (priceRange === '50-100' && price > 50 && price <= 100) ||
                        (priceRange === '100+' && price > 100);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return parseFloat(b.rating) - parseFloat(a.rating);
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-8">
      {/* Search and Filters */}
      <Card className="bg-khadamati-light border-0">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-khadamati-gray" />
              <Input
                placeholder={messages.services_page?.filter?.search || 'Search services...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={messages.services_page?.filter?.category || 'Category'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder={messages.services_page?.filter?.price || 'Price Range'} />
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
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-khadamati-gray">
          {sortedServices.length} services found
        </p>
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          More Filters
        </Button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedServices.map((service) => (
          <ServiceCard
            key={service.id}
            id={service.id}
            title={service.title}
            description={service.description}
            price={service.price}
            priceType={service.priceType}
            rating={parseFloat(service.rating)}
            reviewCount={service.reviewCount}
            provider={service.provider}
            location={service.location}
            duration={service.duration}
            category={service.category}
            image={service.image}
            onBook={() => onServiceBook(service.id)}
            messages={messages}
          />
        ))}
      </div>

      {/* Empty State */}
      {sortedServices.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-khadamati-light rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-12 w-12 text-khadamati-gray" />
          </div>
          <h3 className="text-lg font-semibold text-khadamati-dark mb-2">
            No services found
          </h3>
          <p className="text-khadamati-gray mb-4">
            Try adjusting your search criteria or filters
          </p>
          <Button onClick={() => {
            setSearchTerm('');
            setSelectedCategory('all');
            setPriceRange('all');
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
