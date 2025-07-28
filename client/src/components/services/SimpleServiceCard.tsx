import React from 'react';
import { Star, Clock, MapPin, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SimpleServiceCardProps {
  service: {
    id: number;
    title: string;
    description: string;
    price: number;
    priceType: string;
    rating: number;
    location: string;
    duration: number;
    images?: string[];
    provider: {
      name: string;
      avatar?: string;
      rating: number;
      completedJobs: number;
      verified: boolean;
    };
    category: {
      name: string;
      icon: string;
      color: string;
    };
  };
  onBook: (serviceId: number) => void;
  onViewDetails: (serviceId: number) => void;
}

export default function SimpleServiceCard({ service, onBook, onViewDetails }: SimpleServiceCardProps) {
  return (
    <Card className="h-full overflow-hidden bg-white border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
      {/* Header with Category Icon and Rating */}
      <div 
        className="h-32 relative bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center"
        style={{ 
          background: `linear-gradient(135deg, ${service.category.color}15 0%, ${service.category.color}30 100%)`
        }}
      >
        <div className="text-4xl">{service.category.icon}</div>
        
        {/* Rating Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-white text-gray-900">
            <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
            {service.rating}
          </Badge>
        </div>
        
        {/* Price */}
        <div className="absolute top-3 right-3">
          <div className="bg-khadamati-blue text-white px-3 py-1 rounded-full text-sm font-semibold">
            ${service.price}/{service.priceType}
          </div>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
          {service.title}
        </CardTitle>
        <p className="text-sm text-gray-600 line-clamp-2">
          {service.description}
        </p>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Service Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {service.duration}min
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {service.location}
          </div>
        </div>

        {/* Provider Info */}
        <div className="flex items-center gap-2 mb-4">
          <Avatar className="w-8 h-8">
            <AvatarImage src={service.provider.avatar} />
            <AvatarFallback className="text-xs bg-khadamati-blue text-white">
              {service.provider.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-gray-700 truncate">
                {service.provider.name}
              </span>
              {service.provider.verified && (
                <Shield className="w-3 h-3 text-blue-500" />
              )}
            </div>
            <div className="text-xs text-gray-500">
              {service.provider.completedJobs} jobs completed
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(service.id);
            }}
          >
            Details
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-khadamati-blue hover:bg-khadamati-blue/90 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onBook(service.id);
            }}
          >
            Book Now
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}