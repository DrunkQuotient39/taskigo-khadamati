import React from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Star, Clock, MapPin, Phone, MessageCircle, Share2, Heart, Calendar, DollarSign, User, Badge, Shield, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge as UIBadge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Messages } from '@/lib/i18n';

interface ServiceDetailProps {
  messages: Messages;
}

export default function ServiceDetail({ messages }: ServiceDetailProps) {
  const { slug } = useParams();

  // Mock service data - in real app, fetch based on slug
  const service = {
    id: 1,
    title: "Professional House Cleaning",
    titleAr: "تنظيف منزلي محترف",
    description: "Complete house cleaning service with professional equipment and eco-friendly products. We handle everything from deep cleaning to regular maintenance.",
    descriptionAr: "خدمة تنظيف منزلي شاملة بمعدات احترافية ومنتجات صديقة للبيئة. نتولى كل شيء من التنظيف العميق إلى الصيانة الدورية.",
    price: 45,
    priceType: "hourly",
    duration: 120,
    rating: 4.8,
    reviewCount: 156,
    images: [
      "/api/placeholder/600/400",
      "/api/placeholder/600/400",
      "/api/placeholder/600/400"
    ],
    provider: {
      id: "provider-1",
      name: "Sarah Johnson",
      nameAr: "سارة جونسون",
      avatar: "/api/placeholder/100/100",
      rating: 4.9,
      reviewCount: 234,
      completedJobs: 189,
      responseTime: "2 hours",
      languages: ["English", "Arabic"],
      verified: true,
      joinedDate: "2023-01-15"
    },
    features: [
      "Professional equipment included",
      "Eco-friendly products",
      "Flexible scheduling",
      "Satisfaction guarantee",
      "Insured service"
    ],
    featuresAr: [
      "معدات احترافية مدرجة",
      "منتجات صديقة للبيئة",
      "جدولة مرنة",
      "ضمان الرضا",
      "خدمة مؤمنة"
    ],
    availability: {
      monday: ["9:00", "17:00"],
      tuesday: ["9:00", "17:00"],
      wednesday: ["9:00", "17:00"],
      thursday: ["9:00", "17:00"],
      friday: ["9:00", "15:00"],
      saturday: ["10:00", "16:00"],
      sunday: []
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-800"
    >
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div variants={itemVariants} className="mb-6">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            {(messages.backToServices as string) || "Back to Services"}
          </Button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden">
                <div className="relative h-96 bg-gradient-to-br from-khadamati-blue/10 to-khadamati-yellow/10">
                  <motion.img
                    src={service.images[0]}
                    alt={service.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button size="sm" variant="secondary" className="backdrop-blur-sm bg-white/80">
                      <Heart className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="backdrop-blur-sm bg-white/80">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <UIBadge className="bg-khadamati-blue text-white">
                      <Star className="w-3 h-3 mr-1" />
                      {service.rating}
                    </UIBadge>
                    <UIBadge variant="secondary" className="backdrop-blur-sm bg-white/80">
                      {service.reviewCount} reviews
                    </UIBadge>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Service Details */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {service.title}
                      </h1>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {service.duration} minutes
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ${service.price}/{service.priceType}
                        </div>
                      </div>
                    </div>
                    <UIBadge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      Available Today
                    </UIBadge>
                  </div>

                  <Tabs defaultValue="description" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="description">Description</TabsTrigger>
                      <TabsTrigger value="features">Features</TabsTrigger>
                      <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="description" className="mt-4">
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {service.description}
                      </p>
                    </TabsContent>
                    
                    <TabsContent value="features" className="mt-4">
                      <ul className="space-y-2">
                        {service.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Badge className="w-4 h-4 text-khadamati-blue" />
                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                    
                    <TabsContent value="reviews" className="mt-4">
                      <div className="space-y-4">
                        {[1, 2, 3].map((review) => (
                          <div key={review} className="border rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback>JD</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-sm">John Doe</div>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Excellent service! Very professional and thorough cleaning.
                            </p>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Provider Card */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={service.provider.avatar} />
                      <AvatarFallback>{service.provider.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{service.provider.name}</h3>
                        {service.provider.verified && (
                          <Shield className="w-4 h-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {service.provider.rating} ({service.provider.reviewCount} reviews)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Completed Jobs</div>
                      <div className="font-semibold">{service.provider.completedJobs}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 dark:text-gray-400">Response Time</div>
                      <div className="font-semibold">{service.provider.responseTime}</div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-3">
                    <Button className="w-full bg-khadamati-blue hover:bg-khadamati-blue/90">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Now
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Chat
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4 mr-1" />
                        Call
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Quick Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price Range</span>
                      <span className="font-semibold">${service.price - 10} - ${service.price + 10}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-semibold">{service.duration} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category</span>
                      <span className="font-semibold">Cleaning</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location</span>
                      <span className="font-semibold">Your Area</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Similar Services */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Similar Services</h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                        <div className="w-12 h-12 bg-gradient-to-br from-khadamati-blue/20 to-khadamati-yellow/20 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="font-medium text-sm">Deep Cleaning Service</div>
                          <div className="text-xs text-gray-600">$55/hour</div>
                          <div className="flex items-center gap-1 text-xs">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            4.7
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}