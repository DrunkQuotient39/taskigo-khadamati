import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, MapPin, User, ArrowRight, Heart, Share2, TrendingUp, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
interface InteractiveServiceCardProps {
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
      nameAr?: string;
      avatar?: string;
      rating: number;
      completedJobs: number;
      verified: boolean;
    };
    category: {
      name: string;
      nameAr?: string;
      icon: string;
      color: string;
    };
  };
  onBook: (serviceId: number) => void;
  onViewDetails: (serviceId: number) => void;
}

export default function InteractiveServiceCard({ service, onBook, onViewDetails }: InteractiveServiceCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const cardVariants = {
    initial: { 
      scale: 1,
      rotateY: 0,
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
    },
    hover: { 
      scale: 1.02,
      rotateY: isFlipped ? 180 : 0,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { duration: 0.3 }
    },
    flipped: {
      rotateY: 180,
      transition: { duration: 0.6 }
    }
  };

  const contentVariants = {
    front: {
      rotateY: 0,
      opacity: 1
    },
    back: {
      rotateY: 180,
      opacity: 1
    }
  };

  const iconVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: 5 },
    tap: { scale: 0.95 }
  };

  const heartVariants = {
    initial: { scale: 1 },
    liked: { scale: 1.2, color: "#ef4444" },
    tap: { scale: 0.8 }
  };

  return (
    <div className="relative h-80 perspective-1000">
      <motion.div
        variants={cardVariants}
        initial="initial"
        whileHover="hover"
        animate={isFlipped ? "flipped" : "initial"}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        style={{ transformStyle: "preserve-3d" }}
        className="w-full h-full cursor-pointer"
      >
        {/* Front Side */}
        <motion.div
          variants={contentVariants}
          animate="front"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(0deg)"
          }}
          className="absolute inset-0"
        >
          <Card className="h-full overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0 shadow-lg">
            <CardContent className="p-0 h-full">
              {/* Header with Image/Icon */}
              <div 
                className="relative h-32 bg-gradient-to-br overflow-hidden"
                style={{ 
                  background: `linear-gradient(135deg, ${service.category.color}20 0%, ${service.category.color}40 100%)`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                
                {/* Category Icon */}
                <div className="absolute top-4 left-4">
                  <motion.div
                    variants={iconVariants}
                    initial="initial"
                    whileHover="hover"
                    whileTap="tap"
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  >
                    <span className="text-2xl">{service.category.icon}</span>
                  </motion.div>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <motion.button
                    variants={heartVariants}
                    initial="initial"
                    animate={isLiked ? "liked" : "initial"}
                    whileTap="tap"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsLiked(!isLiked);
                    }}
                    className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current text-red-500' : ''}`} />
                  </motion.button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-8 h-8 p-0 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Share functionality
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Rating Badge */}
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-white/90 text-gray-900 backdrop-blur-sm">
                    <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {service.rating}
                  </Badge>
                </div>

                {/* Price */}
                <div className="absolute bottom-4 right-4">
                  <div className="bg-khadamati-blue text-white px-3 py-1 rounded-full text-sm font-semibold">
                    ${service.price}/{service.priceType}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {service.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {service.duration}min
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {service.location || "Your area"}
                    </div>
                  </div>

                  {/* Provider Info */}
                  <div className="flex items-center gap-2 mb-4">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={service.provider.avatar} />
                      <AvatarFallback className="text-xs">
                        {service.provider.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
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
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsFlipped(true);
                    }}
                  >
                    Details
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 bg-khadamati-blue hover:bg-khadamati-blue/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      onBook(service.id);
                    }}
                  >
                    Book Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Back Side */}
        <motion.div
          variants={contentVariants}
          animate="back"
          style={{ 
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
          className="absolute inset-0"
        >
          <Card className="h-full bg-gradient-to-br from-khadamati-blue to-khadamati-yellow text-white border-0 shadow-lg">
            <CardContent className="p-4 h-full flex flex-col">
              {/* Back to front button */}
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Service Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFlipped(false);
                  }}
                >
                  ←
                </Button>
              </div>

              <div className="flex-1 space-y-4">
                {/* Key Features */}
                <div>
                  <h4 className="font-medium mb-2">What's Included:</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Professional equipment</li>
                    <li>• Quality guarantee</li>
                    <li>• Flexible scheduling</li>
                    <li>• Insured service</li>
                  </ul>
                </div>

                {/* Provider Stats */}
                <div>
                  <h4 className="font-medium mb-2">Provider Stats:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-white/20 rounded-lg p-2 text-center">
                      <div className="font-semibold">{service.provider.rating}</div>
                      <div className="text-xs opacity-80">Rating</div>
                    </div>
                    <div className="bg-white/20 rounded-lg p-2 text-center">
                      <div className="font-semibold">{service.provider.completedJobs}</div>
                      <div className="text-xs opacity-80">Jobs Done</div>
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <h4 className="font-medium mb-2">Availability:</h4>
                  <div className="text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      Available today
                    </div>
                    <div className="text-xs opacity-80">Next slot: 2:00 PM</div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-2">
                <Button
                  className="w-full bg-white text-khadamati-blue hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(service.id);
                  }}
                >
                  View Full Details
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBook(service.id);
                  }}
                >
                  Book This Service
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Hover Glow Effect */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -inset-1 bg-gradient-to-r from-khadamati-blue to-khadamati-yellow rounded-lg blur opacity-20 -z-10"
          />
        )}
      </AnimatePresence>
    </div>
  );
}