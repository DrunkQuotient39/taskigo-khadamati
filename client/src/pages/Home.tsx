import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Star, Clock, Shield, Users, CheckCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ScrollReveal from '@/components/common/ScrollReveal';
import AnimatedCounter from '@/components/common/AnimatedCounter';
import ParallaxHero from '@/components/common/ParallaxHero';

interface HomeProps {
  messages: any;
}

export default function Home({ messages }: HomeProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const serviceCategories = [
    {
      id: 1,
      name: messages.services?.cleaning?.title || 'Cleaning',
      description: messages.services?.cleaning?.description || 'Professional house and office cleaning services',
      icon: '🧹',
      color: 'from-blue-500 to-purple-600',
      price: 'Starting from $25',
      href: '/services?category=cleaning'
    },
    {
      id: 2,
      name: messages.services?.plumbing?.title || 'Plumbing',
      description: messages.services?.plumbing?.description || 'Expert plumbing repairs and installations',
      icon: '🔧',
      color: 'from-green-500 to-teal-600',
      price: 'Starting from $40',
      href: '/services?category=plumbing'
    },
    {
      id: 3,
      name: messages.services?.electrical?.title || 'Electrical',
      description: messages.services?.electrical?.description || 'Licensed electrical services and repairs',
      icon: '⚡',
      color: 'from-blue-500 to-slate-600',
      price: 'Starting from $50',
      href: '/services?category=electrical'
    },
    {
      id: 4,
      name: messages.services?.delivery?.title || 'Delivery',
      description: messages.services?.delivery?.description || 'Fast and reliable delivery services',
      icon: '🚚',
      color: 'from-red-500 to-pink-600',
      price: 'Starting from $15',
      href: '/services?category=delivery'
    },
    {
      id: 5,
      name: messages.services?.maintenance?.title || 'Maintenance',
      description: messages.services?.maintenance?.description || 'General maintenance and handyman services',
      icon: '🔨',
      color: 'from-indigo-500 to-purple-600',
      price: 'Starting from $30',
      href: '/services?category=maintenance'
    },
    {
      id: 6,
      name: messages.services?.painting?.title || 'Painting',
      description: messages.services?.painting?.description || 'Professional interior and exterior painting',
      icon: '🎨',
      color: 'from-emerald-500 to-green-600',
      price: 'Starting from $35',
      href: '/services?category=painting'
    },
    {
      id: 7,
      name: messages.services?.gardening?.title || 'Gardening',
      description: messages.services?.gardening?.description || 'Professional garden care and landscaping',
      icon: '🌱',
      color: 'from-green-500 to-emerald-600',
      price: 'Starting from $45',
      href: '/services?category=gardening'
    },
    {
      id: 8,
      name: messages.services?.tutoring?.title || 'Tutoring',
      description: messages.services?.tutoring?.description || 'Expert academic tutoring and coaching',
      icon: '🎓',
      color: 'from-purple-500 to-indigo-600',
      price: 'Starting from $30',
      href: '/services?category=tutoring'
    },
    {
      id: 9,
      name: messages.services?.automotive?.title || 'Auto Services',
      description: messages.services?.automotive?.description || 'Professional car maintenance and repair',
      icon: '🚗',
      color: 'from-gray-500 to-slate-600',
      price: 'Starting from $60',
      href: '/services?category=automotive'
    },
    {
      id: 10,
      name: messages.services?.petcare?.title || 'Pet Care',
      description: messages.services?.petcare?.description || 'Professional pet sitting and care services',
      icon: '🐕',
      color: 'from-orange-500 to-red-600',
      price: 'Starting from $20',
      href: '/services?category=petcare'
    },
    {
      id: 11,
      name: messages.services?.fitness?.title || 'Personal Training',
      description: messages.services?.fitness?.description || 'Professional fitness and wellness coaching',
      icon: '💪',
      color: 'from-red-500 to-pink-600',
      price: 'Starting from $40',
      href: '/services?category=fitness'
    },
    {
      id: 12,
      name: messages.services?.tech?.title || 'Tech Support',
      description: messages.services?.tech?.description || 'Computer and technology assistance',
      icon: '💻',
      color: 'from-blue-500 to-cyan-600',
      price: 'Starting from $35',
      href: '/services?category=tech'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Homeowner',
      content: 'Taskego made finding a reliable cleaner so easy. The quality of service exceeded my expectations!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Ahmed Hassan',
      role: 'Business Owner',
      content: 'As a service provider, Taskego has helped me grow my business and connect with amazing clients.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    },
    {
      name: 'Maria Rodriguez',
      role: 'Property Manager',
      content: 'The platform is incredibly user-friendly and the providers are thoroughly vetted. Highly recommended!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Enhanced Parallax Hero Section */}
      <ParallaxHero 
        messages={messages}
        onGetStarted={() => window.location.assign('/services')}
        onWatchDemo={() => window.location.assign('/chat')}
      />

      {/* MASSIVE Stats Section */}
      <section className="py-20 bg-gradient-to-br from-slate-800 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-5xl font-black mb-4">TASKEGO BY THE NUMBERS</h2>
              <p className="text-2xl font-bold max-w-4xl mx-auto">
                THE LARGEST SERVICE PLATFORM IN THE MIDDLE EAST WITH UNMATCHED REACH AND QUALITY
              </p>
            </ScrollReveal>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-8">
            <div className="text-center bg-white/10 backdrop-blur-lg p-4 rounded-xl" data-testid="stat-providers">
              <div className="text-3xl font-black text-blue-300 mb-1">
                <AnimatedCounter end={1200} suffix="+" />
              </div>
              <div className="text-white font-bold text-xs">SERVICE PROVIDERS</div>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-lg p-4 rounded-xl" data-testid="stat-customers">
              <div className="text-3xl font-black text-slate-300 mb-1">
                <AnimatedCounter end={50000} suffix="+" />
              </div>
              <div className="text-white font-bold text-xs">HAPPY CUSTOMERS</div>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-lg p-4 rounded-xl" data-testid="stat-services">
              <div className="text-3xl font-black text-blue-200 mb-1">
                <AnimatedCounter end={125000} suffix="+" />
              </div>
              <div className="text-white font-bold text-xs">SERVICES COMPLETED</div>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-lg p-4 rounded-xl" data-testid="stat-satisfaction">
              <div className="text-3xl font-black text-yellow-300 mb-1">98%</div>
              <div className="text-white font-bold text-xs">SATISFACTION RATE</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-lg border-0 text-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Clock className="h-8 w-8 text-blue-300 mr-3" />
                  <h3 className="text-xl font-black">24/7 AVAILABILITY</h3>
                </div>
                <p className="text-gray-200 font-bold mb-4">
                  ROUND-THE-CLOCK SERVICE BOOKING AND CUSTOMER SUPPORT FOR ALL YOUR URGENT NEEDS
                </p>
                <ul className="space-y-2 text-sm font-bold">
                  <li>• EMERGENCY SERVICES</li>
                  <li>• INSTANT BOOKING</li>
                  <li>• LIVE CHAT SUPPORT</li>
                  <li>• REAL-TIME TRACKING</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-0 text-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-8 w-8 text-green-300 mr-3" />
                  <h3 className="text-xl font-black">VERIFIED PROVIDERS</h3>
                </div>
                <p className="text-gray-200 font-bold mb-4">
                  ALL SERVICE PROVIDERS UNDERGO RIGOROUS BACKGROUND CHECKS AND SKILL VERIFICATION
                </p>
                <ul className="space-y-2 text-sm font-bold">
                  <li>• BACKGROUND CHECKS</li>
                  <li>• SKILL VERIFICATION</li>
                  <li>• INSURANCE COVERAGE</li>
                  <li>• QUALITY GUARANTEES</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-0 text-white">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Users className="h-8 w-8 text-purple-300 mr-3" />
                  <h3 className="text-xl font-black">MOBILE APP</h3>
                </div>
                <p className="text-gray-200 font-bold mb-4">
                  AWARD-WINNING MOBILE APPLICATION WITH ADVANCED FEATURES AND SEAMLESS USER EXPERIENCE
                </p>
                <ul className="space-y-2 text-sm font-bold">
                  <li>• GPS TRACKING</li>
                  <li>• OFFLINE CAPABILITY</li>
                  <li>• PUSH NOTIFICATIONS</li>
                  <li>• BIOMETRIC AUTHENTICATION</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl text-center mt-8">
            <h3 className="text-3xl font-black mb-6">DEVELOPMENT METRICS</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-black mb-2">50+</div>
                <div className="font-bold">ENGINEERS</div>
              </div>
              <div>
                <div className="text-3xl font-black mb-2">1M+</div>
                <div className="font-bold">LINES OF CODE</div>
              </div>
              <div>
                <div className="text-3xl font-black mb-2">99.9%</div>
                <div className="font-bold">CODE COVERAGE</div>
              </div>
              <div>
                <div className="text-3xl font-black mb-2">24/7</div>
                <div className="font-bold">MONITORING</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {messages.services?.title || 'Our Services'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {messages.services?.description || 'Explore our wide range of professional services designed to make your life easier.'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {serviceCategories.map((category) => (
              <Link key={category.id} href={category.href}>
                <Card className="bg-white rounded-xl shadow-lg border-0 h-full cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105" data-testid={`card-service-${category.id}`}>
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <span className="text-lg">{category.icon}</span>
                    </div>
                    <h3 className="text-base font-black text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-gray-700 text-xs font-medium mb-2 leading-tight">
                      {category.description}
                    </p>
                    <div className="text-white font-black text-xs bg-gradient-to-r from-blue-600 to-slate-600 px-2 py-1 rounded-full shadow-lg mb-2">
                      {category.price}
                    </div>
                    <div className="text-xs text-gray-500 font-bold">
                      {category.id <= 3 ? '500+' : category.id <= 6 ? '300+' : category.id <= 9 ? '200+' : '150+'} PROVIDERS
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="mt-16">
            <div className="bg-gradient-to-br from-blue-600 to-slate-600 p-8 rounded-3xl text-white text-center mb-8">
              <h3 className="text-3xl font-black mb-4">EXCLUSIVE SERVICE PACKAGES</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/20 backdrop-blur-lg p-6 rounded-xl">
                  <h4 className="text-xl font-black mb-3">BASIC BUNDLE</h4>
                  <div className="text-2xl font-black mb-2">$199/month</div>
                  <ul className="space-y-2 text-sm font-bold">
                    <li>✓ 10 HOURS OF CLEANING</li>
                    <li>✓ 5 HOURS OF MAINTENANCE</li>
                    <li>✓ PRIORITY BOOKING</li>
                    <li>✓ 24/7 SUPPORT</li>
                  </ul>
                </div>
                <div className="bg-white/30 backdrop-blur-lg p-6 rounded-xl border-2 border-blue-400">
                  <div className="bg-blue-400 text-white px-3 py-1 rounded-full text-xs font-black mb-3 inline-block">MOST POPULAR</div>
                  <h4 className="text-xl font-black mb-3">PREMIUM BUNDLE</h4>
                  <div className="text-2xl font-black mb-2">$399/month</div>
                  <ul className="space-y-2 text-sm font-bold">
                    <li>✓ 20 HOURS OF ANY SERVICE</li>
                    <li>✓ UNLIMITED DELIVERY</li>
                    <li>✓ VIP SUPPORT</li>
                    <li>✓ SAME-DAY BOOKING</li>
                  </ul>
                </div>
                <div className="bg-white/20 backdrop-blur-lg p-6 rounded-xl">
                  <h4 className="text-xl font-black mb-3">ENTERPRISE</h4>
                  <div className="text-2xl font-black mb-2">CUSTOM</div>
                  <ul className="space-y-2 text-sm font-bold">
                    <li>✓ UNLIMITED SERVICES</li>
                    <li>✓ DEDICATED MANAGER</li>
                    <li>✓ CUSTOM INTEGRATIONS</li>
                    <li>✓ SLA GUARANTEES</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="text-center bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-black text-blue-600 mb-1">INSTANT</div>
                <div className="text-sm font-bold text-gray-700">BOOKING CONFIRMATION</div>
              </div>
              <div className="text-center bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-black text-blue-600 mb-1">SECURE</div>
                <div className="text-sm font-bold text-gray-700">PAYMENT PROCESSING</div>
              </div>
              <div className="text-center bg-slate-50 p-4 rounded-lg">
                <div className="text-2xl font-black text-slate-600 mb-1">LIVE</div>
                <div className="text-sm font-bold text-gray-700">TRACKING & UPDATES</div>
              </div>
              <div className="text-center bg-slate-50 p-4 rounded-lg">
                <div className="text-2xl font-black text-slate-600 mb-1">GUARANTEED</div>
                <div className="text-sm font-bold text-gray-700">SATISFACTION</div>
              </div>
            </div>

            <div className="text-center">
              <div className="mb-8">
                <h4 className="text-2xl font-black text-gray-900 mb-4">ALL 12 SERVICE CATEGORIES AVAILABLE 24/7</h4>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm font-bold">
                  <div>🧹 CLEANING SERVICES</div>
                  <div>🔧 PLUMBING REPAIRS</div>
                  <div>⚡ ELECTRICAL WORK</div>
                  <div>🚚 DELIVERY SERVICES</div>
                  <div>🔨 MAINTENANCE</div>
                  <div>🎨 PAINTING SERVICES</div>
                  <div>🌱 GARDENING</div>
                  <div>🎓 TUTORING</div>
                  <div>🚗 AUTO SERVICES</div>
                  <div>🐕 PET CARE</div>
                  <div>💪 PERSONAL TRAINING</div>
                  <div>💻 TECH SUPPORT</div>
                </div>
              </div>
              <Link href="/services">
                <Button size="lg" className="px-12 py-6 bg-gradient-to-r from-blue-600 to-slate-600 hover:from-blue-700 hover:to-slate-700 text-white font-black text-xl shadow-2xl border-0 transition-all duration-300 transform hover:scale-105 mr-4" data-testid="button-view-services">
                  VIEW ALL 12+ SERVICE CATEGORIES
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </Link>
              <Button size="lg" className="px-12 py-6 bg-white text-blue-600 hover:bg-gray-100 font-black text-xl shadow-2xl border-2 border-blue-600 transition-all duration-300 transform hover:scale-105" data-testid="button-download-app">
                DOWNLOAD MOBILE APP
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What Our Customers Say
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Join thousands of satisfied customers who trust our platform.
              </p>
            </ScrollReveal>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="bg-gray-50 border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  {[...Array(testimonials[currentTestimonial]?.rating || 5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg text-gray-700 mb-6 italic">
                  "{testimonials[currentTestimonial]?.content}"
                </blockquote>
                <div className="flex items-center justify-center">
                  <img
                    src={testimonials[currentTestimonial]?.image}
                    alt={testimonials[currentTestimonial]?.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div className="text-left">
                    <div className="font-bold text-gray-900" data-testid={`text-testimonial-name-${currentTestimonial}`}>
                      {testimonials[currentTestimonial]?.name}
                    </div>
                    <div className="text-gray-600" data-testid={`text-testimonial-role-${currentTestimonial}`}>
                      {testimonials[currentTestimonial]?.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-slate-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-4xl font-black mb-4">
              {messages.cta?.title || 'Ready to Get Started?'}
            </h2>
            <p className="text-xl font-bold mb-8 max-w-2xl mx-auto">
              {messages.cta?.description || 'Join thousands of satisfied customers who trust Taskego for their service needs.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services">
                <Button size="lg" className="px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 font-black text-lg" data-testid="button-cta-start">
                  {messages.cta?.download_app || 'Get Started Now'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300 font-black text-lg" data-testid="button-cta-learn">
                  {messages.cta?.learn_more || 'Learn More'}
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}