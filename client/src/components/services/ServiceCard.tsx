import { Star, Clock, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ServiceCardProps {
  id: number;
  title: string;
  description: string;
  price: string;
  priceType: string;
  rating: number;
  reviewCount: number;
  provider: {
    name: string;
    image?: string;
  };
  location: string;
  duration?: number;
  category: string;
  image?: string;
  onBook?: () => void;
  messages: any;
}

export default function ServiceCard({
  id,
  title,
  description,
  price,
  priceType,
  rating,
  reviewCount,
  provider,
  location,
  duration,
  category,
  image,
  onBook,
  messages,
}: ServiceCardProps) {
  const formatPrice = (price: string, type: string) => {
    const amount = parseFloat(price);
    if (type === 'hourly') {
      return `$${amount}/hr`;
    } else if (type === 'fixed') {
      return `$${amount}`;
    }
    return `$${amount}`;
  };

  return (
    <Card className="card-hover bg-white rounded-2xl shadow-lg overflow-hidden border-0">
      {/* Service Image */}
      {image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-white text-khadamati-dark">
              {category}
            </Badge>
          </div>
        </div>
      )}

      <CardContent className="p-6">
        {/* Service Info */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-khadamati-dark line-clamp-2">
            {title}
          </h3>
          <span className="text-lg font-bold text-khadamati-blue ml-2">
            {formatPrice(price, priceType)}
          </span>
        </div>

        <p className="text-khadamati-gray text-sm mb-4 line-clamp-2">
          {description}
        </p>

        {/* Service Details */}
        <div className="flex items-center gap-4 mb-4 text-sm text-khadamati-gray">
          {duration && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{duration} min</span>
            </div>
          )}
          {location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{location}</span>
            </div>
          )}
        </div>

        {/* Provider Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={provider.image} alt={provider.name} />
              <AvatarFallback>
                {provider.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-khadamati-dark text-sm">
                {provider.name}
              </div>
              <div className="flex items-center gap-1 text-xs text-khadamati-gray">
                <Star className="h-3 w-3 fill-khadamati-yellow text-khadamati-yellow" />
                <span>{rating}</span>
                <span>({reviewCount} reviews)</span>
              </div>
            </div>
          </div>

          <Button
            onClick={onBook}
            className="bg-khadamati-blue hover:bg-blue-700 text-white"
            size="sm"
          >
            {messages.services_page?.book || 'Book'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
