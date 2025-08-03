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
      color: 'from-yellow-500 to-orange-600',
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
      description: messages.services?.gardening?.description || 'Garden maintenance and landscaping services',
      icon: '🌱',
      color: 'from-lime-500 to-green-600',
      price: 'Starting from $28',
      href: '/services?category=gardening'
    },
    {
      id: 8,
      name: messages.services?.tutoring?.title || 'Tutoring',
      description: messages.services?.tutoring?.description || 'Expert tutoring and educational support',
      icon: '🎓',
      color: 'from-cyan-500 to-blue-600',
      price: 'Starting from $20',
      href: '/services?category=tutoring'
    },
    {
      id: 9,
      name: messages.services?.automotive?.title || 'Auto Services',
      description: messages.services?.automotive?.description || 'Car wash, oil change, and basic maintenance',
      icon: '🚗',
      color: 'from-slate-500 to-gray-600',
      price: 'Starting from $45',
      href: '/services?category=automotive'
    },
    {
      id: 10,
      name: messages.services?.petcare?.title || 'Pet Care',
      description: messages.services?.petcare?.description || 'Pet sitting, walking, grooming services',
      icon: '🐕',
      color: 'from-amber-500 to-yellow-600',
      price: 'Starting from $22',
      href: '/services?category=petcare'
    },
    {
      id: 11,
      name: messages.services?.fitness?.title || 'Personal Training',
      description: messages.services?.fitness?.description || 'Fitness coaching and personal training sessions',
      icon: '💪',
      color: 'from-red-500 to-orange-600',
      price: 'Starting from $55',
      href: '/services?category=fitness'
    },
    {
      id: 12,
      name: messages.services?.tech?.title || 'Tech Support',
      description: messages.services?.tech?.description || 'Computer repair, setup, and tech consultation',
      icon: '💻',
      color: 'from-violet-500 to-purple-600',
      price: 'Starting from $60',
      href: '/services?category=tech'
    },
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
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
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
            <div className="text-center bg-white/10 backdrop-blur-lg p-4 rounded-xl">
              <div className="text-3xl font-black text-orange-400 mb-1">
                <AnimatedCounter end={1200} suffix="+" />
              </div>
              <div className="text-white font-bold text-xs">SERVICE PROVIDERS</div>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-lg p-4 rounded-xl">
              <div className="text-3xl font-black text-blue-400 mb-1">
                <AnimatedCounter end={50000} suffix="+" />
              </div>
              <div className="text-white font-bold text-xs">HAPPY CUSTOMERS</div>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-lg p-4 rounded-xl">
              <div className="text-3xl font-black text-green-400 mb-1">
                <AnimatedCounter end={125000} suffix="+" />
              </div>
              <div className="text-white font-bold text-xs">SERVICES COMPLETED</div>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-lg p-4 rounded-xl">
              <div className="text-3xl font-black text-yellow-400 mb-1">4.9⭐</div>
              <div className="text-white font-bold text-xs">AVERAGE RATING</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-8">
            <div className="text-center bg-white/10 backdrop-blur-lg p-4 rounded-xl">
              <div className="text-3xl font-black text-purple-400 mb-1">
                <AnimatedCounter end={25} suffix="+" />
              </div>
              <div className="text-white font-bold text-xs">CITIES COVERED</div>
            </div>

            <div className="text-center bg-white/10 backdrop-blur-lg p-4 rounded-xl">
              <div className="text-3xl font-black text-pink-400 mb-1">98%</div>
              <div className="text-white font-bold text-xs">SATISFACTION RATE</div>
            </div>

            <div className="text-center bg-white/10 backdrop-blur-lg p-4 rounded-xl">
              <div className="text-3xl font-black text-indigo-400 mb-1">24/7</div>
              <div className="text-white font-bold text-xs">SUPPORT AVAILABLE</div>
            </div>

            <div className="text-center bg-white/10 backdrop-blur-lg p-4 rounded-xl">
              <div className="text-3xl font-black text-teal-400 mb-1">2HR</div>
              <div className="text-white font-bold text-xs">AVG RESPONSE</div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-8">
            <div className="text-center bg-white/10 backdrop-blur-lg p-4 rounded-xl">
              <div className="text-3xl font-black text-red-400 mb-1">ISO</div>
              <div className="text-white font-bold text-xs">CERTIFIED SECURITY</div>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-lg p-4 rounded-xl">
              <div className="text-3xl font-black text-cyan-400 mb-1">AI</div>
              <div className="text-white font-bold text-xs">POWERED MATCHING</div>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-lg p-4 rounded-xl">
              <div className="text-3xl font-black text-lime-400 mb-1">MENA</div>
              <div className="text-white font-bold text-xs">MARKET LEADER</div>
            </div>
            
            <div className="text-center bg-white/10 backdrop-blur-lg p-4 rounded-xl">
              <div className="text-3xl font-black text-rose-400 mb-1">NEXT</div>
              <div className="text-white font-bold text-xs">UNICORN STATUS</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <ScrollReveal>
              <Card className="bg-gradient-to-br from-orange-600 to-red-600 text-white shadow-2xl border-0">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-black mb-4">MARKET LEADER</h3>
                  <p className="text-lg font-bold mb-4">#1 SERVICE PLATFORM IN THE MIDDLE EAST</p>
                  <div className="space-y-2">
                    <div className="text-sm font-bold">🏆 FASTEST GROWING PLATFORM 2024</div>
                    <div className="text-sm font-bold">🏆 BEST CUSTOMER SERVICE AWARD</div>
                    <div className="text-sm font-bold">🏆 MOST TRUSTED BRAND AWARD</div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Card className="bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl border-0">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-black mb-4">GLOBAL EXPANSION</h3>
                  <p className="text-lg font-bold mb-4">EXPANDING TO 15 NEW COUNTRIES IN 2025</p>
                  <div className="space-y-2">
                    <div className="text-sm font-bold">🌍 EUROPE LAUNCH Q2 2025</div>
                    <div className="text-sm font-bold">🌍 ASIA EXPANSION Q3 2025</div>
                    <div className="text-sm font-bold">🌍 AFRICA ENTRY Q4 2025</div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="bg-gradient-to-br from-green-600 to-teal-600 text-white shadow-2xl border-0">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-black mb-4">TECHNOLOGY LEADER</h3>
                  <p className="text-lg font-bold mb-4">AI-POWERED MATCHING & AUTOMATION</p>
                  <div className="space-y-2">
                    <div className="text-sm font-bold">🤖 SMART PROVIDER MATCHING</div>
                    <div className="text-sm font-bold">🤖 PREDICTIVE SCHEDULING</div>
                    <div className="text-sm font-bold">🤖 AUTOMATED QUALITY CONTROL</div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>

          <div className="text-center">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8">
              <div className="bg-white/20 p-3 rounded-lg">
                <div className="text-2xl font-black text-white mb-1">$50M+</div>
                <div className="text-xs text-white font-bold">REVENUE 2024</div>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <div className="text-2xl font-black text-white mb-1">500+</div>
                <div className="text-xs text-white font-bold">EMPLOYEES</div>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <div className="text-2xl font-black text-white mb-1">15M+</div>
                <div className="text-xs text-white font-bold">APP DOWNLOADS</div>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <div className="text-2xl font-black text-white mb-1">99.9%</div>
                <div className="text-xs text-white font-bold">UPTIME</div>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <div className="text-2xl font-black text-white mb-1">45SEC</div>
                <div className="text-xs text-white font-bold">AVG BOOKING TIME</div>
              </div>
              <div className="bg-white/20 p-3 rounded-lg">
                <div className="text-2xl font-black text-white mb-1">95%</div>
                <div className="text-xs text-white font-bold">RETENTION RATE</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECHNOLOGY STACK */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-5xl font-black mb-4">CUTTING-EDGE TECHNOLOGY</h2>
              <p className="text-2xl font-bold max-w-4xl mx-auto">
                POWERED BY THE LATEST AI, MACHINE LEARNING, AND CLOUD TECHNOLOGIES
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <ScrollReveal>
              <Card className="bg-white/10 backdrop-blur-lg shadow-2xl border-0">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-6">🤖</div>
                  <h3 className="text-2xl font-black mb-4">AI MATCHING ENGINE</h3>
                  <p className="font-bold mb-4">ADVANCED MACHINE LEARNING ALGORITHMS</p>
                  <ul className="space-y-2 text-sm font-medium">
                    <li>• NEURAL NETWORK PROVIDER MATCHING</li>
                    <li>• PREDICTIVE DEMAND FORECASTING</li>
                    <li>• INTELLIGENT PRICING OPTIMIZATION</li>
                    <li>• AUTOMATED QUALITY SCORING</li>
                  </ul>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Card className="bg-white/10 backdrop-blur-lg shadow-2xl border-0">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-6">☁️</div>
                  <h3 className="text-2xl font-black mb-4">CLOUD INFRASTRUCTURE</h3>
                  <p className="font-bold mb-4">SCALABLE ENTERPRISE ARCHITECTURE</p>
                  <ul className="space-y-2 text-sm font-medium">
                    <li>• AWS MULTI-REGION DEPLOYMENT</li>
                    <li>• KUBERNETES ORCHESTRATION</li>
                    <li>• REAL-TIME DATA PROCESSING</li>
                    <li>• 99.9% UPTIME GUARANTEE</li>
                  </ul>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="bg-white/10 backdrop-blur-lg shadow-2xl border-0">
                <CardContent className="p-8 text-center">
                  <div className="text-4xl mb-6">📱</div>
                  <h3 className="text-2xl font-black mb-4">MOBILE FIRST</h3>
                  <p className="font-bold mb-4">NATIVE MOBILE APPLICATIONS</p>
                  <ul className="space-y-2 text-sm font-medium">
                    <li>• REACT NATIVE CROSS-PLATFORM</li>
                    <li>• OFFLINE CAPABILITY</li>
                    <li>• PUSH NOTIFICATIONS</li>
                    <li>• BIOMETRIC AUTHENTICATION</li>
                  </ul>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>

          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl text-center">
            <ScrollReveal>
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
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Services Categories */}
      <section className="py-20 bg-khadamati-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-4xl font-bold text-khadamati-dark mb-4">
                {messages.services?.title || 'Our Services'}
              </h2>
              <p className="text-xl text-khadamati-gray max-w-2xl mx-auto">
                {messages.services?.description || 'Explore our wide range of professional services designed to make your life easier.'}
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {serviceCategories.map((category, index) => (
              <Link key={category.id} href={category.href}>
                <Card className="bg-white rounded-xl shadow-lg border-0 h-full cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
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
                    <div className="text-white font-black text-xs bg-gradient-to-r from-orange-500 to-blue-600 px-2 py-1 rounded-full shadow-lg mb-2">
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
            <ScrollReveal>
              <div className="bg-gradient-to-br from-orange-500 to-blue-600 p-8 rounded-3xl text-white text-center mb-8">
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
                  <div className="bg-white/30 backdrop-blur-lg p-6 rounded-xl border-2 border-yellow-400">
                    <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black mb-3 inline-block">MOST POPULAR</div>
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
                <div className="text-center bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-black text-green-600 mb-1">SECURE</div>
                  <div className="text-sm font-bold text-gray-700">PAYMENT PROCESSING</div>
                </div>
                <div className="text-center bg-orange-50 p-4 rounded-lg">
                  <div className="text-2xl font-black text-orange-600 mb-1">LIVE</div>
                  <div className="text-sm font-bold text-gray-700">TRACKING & UPDATES</div>
                </div>
                <div className="text-center bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-black text-purple-600 mb-1">GUARANTEED</div>
                  <div className="text-sm font-bold text-gray-700">SATISFACTION</div>
                </div>
              </div>

              <div className="text-center">
                <div className="mb-8">
                  <h4 className="text-2xl font-black text-white mb-4">ALL 12 SERVICE CATEGORIES AVAILABLE 24/7</h4>
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
                  <Button size="lg" className="px-12 py-6 bg-gradient-to-r from-orange-500 to-blue-600 hover:from-orange-600 hover:to-blue-700 text-white font-black text-xl shadow-2xl border-0 transition-all duration-300 transform hover:scale-105 mr-4">
                    VIEW ALL 12+ SERVICE CATEGORIES
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </Link>
                <Button size="lg" className="px-12 py-6 bg-white text-blue-600 hover:bg-gray-100 font-black text-xl shadow-2xl border-2 border-blue-600 transition-all duration-300 transform hover:scale-105">
                  DOWNLOAD MOBILE APP
                </Button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* COMPREHENSIVE How It Works */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-5xl font-black text-gray-900 mb-4">
                THE COMPLETE TASKEGO EXPERIENCE
              </h2>
              <p className="text-2xl text-gray-700 max-w-4xl mx-auto font-bold">
                FROM BROWSING TO COMPLETION - EVERY STEP IS DESIGNED FOR MAXIMUM CONVENIENCE AND QUALITY
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <ScrollReveal className="text-center">
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <span className="text-white text-4xl font-black">1</span>
                </div>
                <div className="absolute top-14 left-full w-8 h-1 bg-gray-300 hidden md:block"></div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">BROWSE & DISCOVER</h3>
              <p className="text-gray-800 font-bold text-base mb-4">
                EXPLORE 12+ SERVICE CATEGORIES WITH DETAILED PROVIDER PROFILES, RATINGS, AND REAL-TIME AVAILABILITY
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm font-bold text-blue-600 space-y-1">
                  <div>🔍 ADVANCED SEARCH FILTERS</div>
                  <div>⭐ VERIFIED REVIEWS & RATINGS</div>
                  <div>💰 TRANSPARENT PRICING</div>
                  <div>📍 LOCATION-BASED MATCHING</div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal className="text-center" delay={100}>
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-br from-orange-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <span className="text-white text-4xl font-black">2</span>
                </div>
                <div className="absolute top-14 left-full w-8 h-1 bg-gray-300 hidden md:block"></div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">BOOK INSTANTLY</h3>
              <p className="text-gray-800 font-bold text-base mb-4">
                SECURE YOUR BOOKING IN UNDER 60 SECONDS WITH FLEXIBLE SCHEDULING AND INSTANT CONFIRMATION
              </p>
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="text-sm font-bold text-orange-600 space-y-1">
                  <div>⚡ 45-SECOND BOOKING PROCESS</div>
                  <div>📅 FLEXIBLE DATE & TIME SLOTS</div>
                  <div>💳 SECURE PAYMENT OPTIONS</div>
                  <div>📧 INSTANT CONFIRMATION EMAIL</div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal className="text-center" delay={200}>
              <div className="relative">
                <div className="w-28 h-28 bg-gradient-to-br from-green-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <span className="text-white text-4xl font-black">3</span>
                </div>
                <div className="absolute top-14 left-full w-8 h-1 bg-gray-300 hidden md:block"></div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">TRACK & COMMUNICATE</h3>
              <p className="text-gray-800 font-bold text-base mb-4">
                REAL-TIME TRACKING, DIRECT MESSAGING, AND LIVE UPDATES FROM BOOKING TO COMPLETION
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm font-bold text-green-600 space-y-1">
                  <div>📱 LIVE GPS TRACKING</div>
                  <div>💬 DIRECT PROVIDER CHAT</div>
                  <div>🔔 REAL-TIME NOTIFICATIONS</div>
                  <div>📸 PROGRESS PHOTO UPDATES</div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal className="text-center" delay={300}>
              <div className="w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-white text-4xl font-black">4</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">RATE & ENJOY</h3>
              <p className="text-gray-800 font-bold text-base mb-4">
                RATE YOUR EXPERIENCE, ENJOY GUARANTEED SATISFACTION, AND BOOK AGAIN WITH ONE CLICK
              </p>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm font-bold text-purple-600 space-y-1">
                  <div>⭐ DETAILED RATING SYSTEM</div>
                  <div>✅ 100% SATISFACTION GUARANTEE</div>
                  <div>🔄 EASY REBOOKING OPTIONS</div>
                  <div>🎁 LOYALTY REWARDS PROGRAM</div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-3xl text-white text-center mb-12">
            <ScrollReveal>
              <h3 className="text-3xl font-black mb-6">ADVANCED FEATURES FOR POWER USERS</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-xl font-black mb-3">🤖 AI-POWERED MATCHING</h4>
                  <p className="font-bold">SMART ALGORITHMS MATCH YOU WITH THE PERFECT PROVIDER BASED ON YOUR HISTORY, PREFERENCES, AND REQUIREMENTS</p>
                </div>
                <div>
                  <h4 className="text-xl font-black mb-3">📊 ANALYTICS DASHBOARD</h4>
                  <p className="font-bold">TRACK YOUR SERVICE HISTORY, SPENDING PATTERNS, AND PROVIDER PERFORMANCE WITH DETAILED INSIGHTS</p>
                </div>
                <div>
                  <h4 className="text-xl font-black mb-3">🔄 AUTOMATED SCHEDULING</h4>
                  <p className="font-bold">SET UP RECURRING SERVICES WITH AUTOMATED BOOKING, PAYMENT, AND PROVIDER ROTATION</p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ScrollReveal>
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-3xl font-black text-blue-600 mb-2">2MIN</div>
                <div className="text-sm font-bold text-gray-700">AVERAGE BOOKING TIME</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-3xl font-black text-green-600 mb-2">99.8%</div>
                <div className="text-sm font-bold text-gray-700">ON-TIME ARRIVAL RATE</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-3xl font-black text-orange-600 mb-2">24/7</div>
                <div className="text-sm font-bold text-gray-700">CUSTOMER SUPPORT</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                <div className="text-3xl font-black text-purple-600 mb-2">100%</div>
                <div className="text-sm font-bold text-gray-700">SATISFACTION GUARANTEE</div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* TEAM & COMPANY SHOWCASE */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-5xl font-black mb-4">MEET THE TASKEGO TEAM</h2>
              <p className="text-2xl font-bold max-w-4xl mx-auto">
                500+ DEDICATED PROFESSIONALS WORKING 24/7 TO DELIVER EXCEPTIONAL SERVICE EXPERIENCES
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <ScrollReveal>
              <Card className="bg-white/10 backdrop-blur-lg shadow-2xl border-0 text-center">
                <CardContent className="p-8">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" 
                       alt="CEO" className="w-24 h-24 rounded-full mx-auto mb-4" />
                  <h3 className="text-xl font-black mb-2">AHMAD AL-RASHID</h3>
                  <p className="text-lg font-bold mb-3">CEO & FOUNDER</p>
                  <p className="text-sm font-medium">15+ YEARS IN TECH, FORMER MICROSOFT & GOOGLE EXECUTIVE</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Card className="bg-white/10 backdrop-blur-lg shadow-2xl border-0 text-center">
                <CardContent className="p-8">
                  <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face" 
                       alt="CTO" className="w-24 h-24 rounded-full mx-auto mb-4" />
                  <h3 className="text-xl font-black mb-2">SARA AHMED</h3>
                  <p className="text-lg font-bold mb-3">CTO</p>
                  <p className="text-sm font-medium">AI & MACHINE LEARNING EXPERT, PHD FROM MIT</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="bg-white/10 backdrop-blur-lg shadow-2xl border-0 text-center">
                <CardContent className="p-8">
                  <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" 
                       alt="COO" className="w-24 h-24 rounded-full mx-auto mb-4" />
                  <h3 className="text-xl font-black mb-2">OMAR HASSAN</h3>
                  <p className="text-lg font-bold mb-3">COO</p>
                  <p className="text-sm font-medium">OPERATIONS SCALING SPECIALIST, FORMER MCKINSEY PARTNER</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <Card className="bg-white/10 backdrop-blur-lg shadow-2xl border-0 text-center">
                <CardContent className="p-8">
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face" 
                       alt="CMO" className="w-24 h-24 rounded-full mx-auto mb-4" />
                  <h3 className="text-xl font-black mb-2">LAYLA KHALIL</h3>
                  <p className="text-lg font-bold mb-3">CMO</p>
                  <p className="text-sm font-medium">BRAND STRATEGY EXPERT, FORMER P&G & UNILEVER EXECUTIVE</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal>
              <div className="text-center">
                <h3 className="text-3xl font-black mb-4">🏢 HEADQUARTERS</h3>
                <p className="text-lg font-bold mb-2">DUBAI INTERNATIONAL FINANCIAL CENTRE</p>
                <p className="font-medium">50,000 SQ FT MODERN OFFICE SPACE</p>
                <p className="font-medium">500+ EMPLOYEES ACROSS 5 FLOORS</p>
                <p className="font-medium">24/7 OPERATIONS CENTER</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <div className="text-center">
                <h3 className="text-3xl font-black mb-4">🌍 GLOBAL OFFICES</h3>
                <p className="text-lg font-bold mb-2">12 OFFICES ACROSS MENA REGION</p>
                <p className="font-medium">RIYADH • DOHA • KUWAIT • CAIRO</p>
                <p className="font-medium">AMMAN • BEIRUT • CASABLANCA</p>
                <p className="font-medium">EXPANDING TO LONDON & SINGAPORE</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="text-center">
                <h3 className="text-3xl font-black mb-4">💰 FUNDING & GROWTH</h3>
                <p className="text-lg font-bold mb-2">$100M SERIES C COMPLETED</p>
                <p className="font-medium">BACKED BY SOFTBANK & SEQUOIA</p>
                <p className="font-medium">400% YEAR-OVER-YEAR GROWTH</p>
                <p className="font-medium">UNICORN STATUS BY 2025</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* SECURITY & CERTIFICATIONS */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-5xl font-black text-gray-900 mb-4">ENTERPRISE-GRADE SECURITY</h2>
              <p className="text-2xl text-gray-700 max-w-4xl mx-auto font-bold">
                BANK-LEVEL SECURITY WITH INTERNATIONAL CERTIFICATIONS AND COMPLIANCE STANDARDS
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <ScrollReveal>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 shadow-xl border-0 text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-4">ISO 27001 CERTIFIED</h3>
                  <p className="text-gray-700 font-medium">INTERNATIONAL STANDARD FOR INFORMATION SECURITY MANAGEMENT</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-xl border-0 text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-4">SOC 2 TYPE II</h3>
                  <p className="text-gray-700 font-medium">AUDITED SECURITY CONTROLS FOR SERVICE ORGANIZATIONS</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 shadow-xl border-0 text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-4">GDPR COMPLIANT</h3>
                  <p className="text-gray-700 font-medium">FULL COMPLIANCE WITH EUROPEAN DATA PROTECTION REGULATION</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 shadow-xl border-0 text-center">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-4">PCI DSS LEVEL 1</h3>
                  <p className="text-gray-700 font-medium">HIGHEST LEVEL OF PAYMENT CARD INDUSTRY SECURITY</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-blue-900 p-12 rounded-3xl text-white text-center">
            <ScrollReveal>
              <h3 className="text-4xl font-black mb-8">SECURITY FEATURES & PROTOCOLS</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-2xl font-black mb-4">🔐 DATA ENCRYPTION</h4>
                  <ul className="space-y-2 font-bold">
                    <li>AES-256 ENCRYPTION AT REST</li>
                    <li>TLS 1.3 IN TRANSIT</li>
                    <li>END-TO-END ENCRYPTION</li>
                    <li>ZERO-KNOWLEDGE ARCHITECTURE</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-2xl font-black mb-4">🛡️ ACCESS CONTROL</h4>
                  <ul className="space-y-2 font-bold">
                    <li>MULTI-FACTOR AUTHENTICATION</li>
                    <li>ROLE-BASED PERMISSIONS</li>
                    <li>BIOMETRIC VERIFICATION</li>
                    <li>SESSION MANAGEMENT</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-2xl font-black mb-4">📊 MONITORING</h4>
                  <ul className="space-y-2 font-bold">
                    <li>24/7 SECURITY OPERATIONS CENTER</li>
                    <li>REAL-TIME THREAT DETECTION</li>
                    <li>AUTOMATED INCIDENT RESPONSE</li>
                    <li>CONTINUOUS VULNERABILITY SCANNING</li>
                  </ul>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CUSTOMER SUCCESS STORIES */}
      <section className="py-20 bg-gradient-to-br from-pink-600 to-rose-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-5xl font-black mb-4">CUSTOMER SUCCESS STORIES</h2>
              <p className="text-2xl font-bold max-w-4xl mx-auto">
                REAL STORIES FROM SATISFIED CUSTOMERS ACROSS THE MIDDLE EAST
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <ScrollReveal>
              <Card className="bg-white/10 backdrop-blur-lg shadow-2xl border-0">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face" 
                         alt="Customer" className="w-12 h-12 rounded-full mr-4" />
                    <div>
                      <h4 className="font-black">FATIMA AL-ZAHRA</h4>
                      <p className="text-sm font-bold">DUBAI RESIDENT</p>
                    </div>
                  </div>
                  <p className="font-bold mb-4">"SAVED $5,000 ANNUALLY ON HOME MAINTENANCE"</p>
                  <p className="text-sm font-medium">"Taskego's verified providers helped me maintain my villa at 40% lower cost while ensuring premium quality. The AI matching found perfect specialists every time."</p>
                  <div className="flex text-yellow-400 mt-4">⭐⭐⭐⭐⭐</div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Card className="bg-white/10 backdrop-blur-lg shadow-2xl border-0">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face" 
                         alt="Customer" className="w-12 h-12 rounded-full mr-4" />
                    <div>
                      <h4 className="font-black">MOHAMMED HASSAN</h4>
                      <p className="text-sm font-bold">BUSINESS OWNER</p>
                    </div>
                  </div>
                  <p className="font-bold mb-4">"STREAMLINED OFFICE OPERATIONS COMPLETELY"</p>
                  <p className="text-sm font-medium">"From cleaning to IT support, Taskego handles all our office services. The enterprise dashboard gives us full visibility and control. Game changer for efficiency."</p>
                  <div className="flex text-yellow-400 mt-4">⭐⭐⭐⭐⭐</div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="bg-white/10 backdrop-blur-lg shadow-2xl border-0">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face" 
                         alt="Customer" className="w-12 h-12 rounded-full mr-4" />
                    <div>
                      <h4 className="font-black">AISHA MOHAMED</h4>
                      <p className="text-sm font-bold">WORKING MOTHER</p>
                    </div>
                  </div>
                  <p className="font-bold mb-4">"RECLAIMED 15 HOURS WEEKLY FOR FAMILY"</p>
                  <p className="text-sm font-medium">"Between work and kids, I had no time for household tasks. Taskego's reliable providers handle everything from groceries to repairs. Life-changing convenience."</p>
                  <div className="flex text-yellow-400 mt-4">⭐⭐⭐⭐⭐</div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>

          <div className="text-center">
            <ScrollReveal>
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl">
                <h3 className="text-3xl font-black mb-6">SUCCESS METRICS</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <div className="text-3xl font-black mb-2">98%</div>
                    <div className="font-bold">CUSTOMER SATISFACTION</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black mb-2">$2.5M</div>
                    <div className="font-bold">CUSTOMER SAVINGS</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black mb-2">150K+</div>
                    <div className="font-bold">HOURS SAVED MONTHLY</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black mb-2">4.9★</div>
                    <div className="font-bold">AVERAGE RATING</div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-4xl font-black text-gray-900 mb-4">
                Why Choose Taskego?
              </h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto font-bold">
                We've built the most trusted and comprehensive service platform in the region
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ScrollReveal>
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg border-0 h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-4">100% Verified Providers</h3>
                  <p className="text-gray-700 font-medium">Every service provider undergoes thorough background checks, skill verification, and insurance validation before joining our platform.</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 shadow-lg border-0 h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-4">24/7 Support</h3>
                  <p className="text-gray-700 font-medium">Round-the-clock customer support in both Arabic and English. Emergency services available within 2-4 hours of booking.</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 shadow-lg border-0 h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-4">Satisfaction Guarantee</h3>
                  <p className="text-gray-700 font-medium">Not satisfied with the service? We'll make it right or provide a full refund. Your satisfaction is our top priority.</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 shadow-lg border-0 h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-4">Trusted Community</h3>
                  <p className="text-gray-700 font-medium">Join over 50,000 satisfied customers and 1,200+ professional service providers across the Middle East region.</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={400}>
              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 shadow-lg border-0 h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-4">Premium Quality</h3>
                  <p className="text-gray-700 font-medium">4.9-star average rating with consistent high-quality service delivery. Only the best providers make it to our platform.</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={500}>
              <Card className="bg-gradient-to-br from-teal-50 to-teal-100 shadow-lg border-0 h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ArrowRight className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-4">Instant Booking</h3>
                  <p className="text-gray-700 font-medium">Book services instantly with real-time availability. Schedule for today or plan weeks ahead with our flexible booking system.</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-khadamati-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-4xl font-bold text-dark-readable mb-4">
                What Our Customers Say
              </h2>
              <p className="text-xl text-khadamati-gray font-medium">
                Real feedback from our satisfied customers
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal>
            <Card className="bg-white shadow-xl border-0">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-bright fill-current" />
                  ))}
                </div>
                <blockquote className="text-xl text-dark-readable mb-8 italic font-medium">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="flex items-center justify-center space-x-4">
                  <img
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-dark-readable">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-khadamati-gray text-base font-medium">
                      {testimonials[currentTestimonial].role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentTestimonial(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentTestimonial ? 'bg-yellow-bright' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-4xl font-black text-gray-900 mb-4">Transparent Pricing</h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto font-bold">
                No hidden fees, no surprises. Know exactly what you'll pay before booking.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal>
              <Card className="bg-white shadow-lg border-2 border-gray-200 h-full">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-black text-gray-900 mb-4">Basic Services</h3>
                  <div className="text-4xl font-black text-blue-600 mb-6">$25-50</div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Basic cleaning services
                    </li>
                    <li className="flex items-center text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Simple delivery tasks
                    </li>
                    <li className="flex items-center text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Basic maintenance
                    </li>
                    <li className="flex items-center text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      1-hour minimum
                    </li>
                  </ul>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 shadow-xl border-0 h-full transform scale-105">
                <CardContent className="p-8 text-center text-white">
                  <div className="bg-yellow-400 text-orange-600 px-3 py-1 rounded-full text-sm font-black mb-4 inline-block">
                    MOST POPULAR
                  </div>
                  <h3 className="text-2xl font-black mb-4">Professional Services</h3>
                  <div className="text-4xl font-black mb-6">$50-100</div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center font-medium">
                      <CheckCircle className="h-5 w-5 text-yellow-300 mr-3" />
                      Deep cleaning & maintenance
                    </li>
                    <li className="flex items-center font-medium">
                      <CheckCircle className="h-5 w-5 text-yellow-300 mr-3" />
                      Plumbing & electrical work
                    </li>
                    <li className="flex items-center font-medium">
                      <CheckCircle className="h-5 w-5 text-yellow-300 mr-3" />
                      Professional tutoring
                    </li>
                    <li className="flex items-center font-medium">
                      <CheckCircle className="h-5 w-5 text-yellow-300 mr-3" />
                      Priority support
                    </li>
                  </ul>
                  <Button className="w-full bg-white text-orange-600 hover:bg-gray-100 font-black">
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="bg-white shadow-lg border-2 border-gray-200 h-full">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-black text-gray-900 mb-4">Premium Services</h3>
                  <div className="text-4xl font-black text-blue-600 mb-6">$100+</div>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Specialized technical work
                    </li>
                    <li className="flex items-center text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Personal training sessions
                    </li>
                    <li className="flex items-center text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Complex installations
                    </li>
                    <li className="flex items-center text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      White-glove service
                    </li>
                  </ul>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <div>
                <h2 className="text-4xl font-black mb-6">Get the Taskego Mobile App</h2>
                <p className="text-xl font-bold mb-8">
                  Book services on the go, track your appointments, and manage everything from your smartphone.
                </p>
                <div className="space-y-4 mb-8">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-400 mr-4" />
                    <span className="font-medium">Real-time booking and tracking</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-400 mr-4" />
                    <span className="font-medium">Instant notifications and updates</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-400 mr-4" />
                    <span className="font-medium">Direct chat with service providers</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-green-400 mr-4" />
                    <span className="font-medium">Secure payment processing</span>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <Button className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-6 py-3">
                    Download for iOS
                  </Button>
                  <Button className="bg-white text-gray-900 hover:bg-gray-100 font-bold px-6 py-3">
                    Download for Android
                  </Button>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=600&fit=crop" 
                  alt="Mobile App Screenshot" 
                  className="rounded-3xl shadow-2xl mx-auto max-w-sm"
                />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Stats & Achievements */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-4xl font-black mb-4">Our Impact in Numbers</h2>
              <p className="text-xl font-bold max-w-2xl mx-auto">
                See how we're transforming the service industry across the Middle East
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <ScrollReveal className="text-center">
              <div className="text-5xl font-black mb-2">
                <AnimatedCounter end={125000} suffix="+" />
              </div>
              <div className="text-lg font-bold">Services Completed</div>
            </ScrollReveal>
            
            <ScrollReveal className="text-center" delay={100}>
              <div className="text-5xl font-black mb-2">
                <AnimatedCounter end={25} suffix="+" />
              </div>
              <div className="text-lg font-bold">Cities Covered</div>
            </ScrollReveal>
            
            <ScrollReveal className="text-center" delay={200}>
              <div className="text-5xl font-black mb-2">98%</div>
              <div className="text-lg font-bold">Customer Satisfaction</div>
            </ScrollReveal>
            
            <ScrollReveal className="text-center" delay={300}>
              <div className="text-5xl font-black mb-2">
                <AnimatedCounter end={45} suffix="" />min
              </div>
              <div className="text-lg font-bold">Average Response Time</div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* PRICING & PLANS */}
      <section className="py-20 bg-gradient-to-br from-gray-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-5xl font-black mb-4">COMPREHENSIVE PRICING PLANS</h2>
              <p className="text-2xl font-bold max-w-4xl mx-auto">
                FLEXIBLE PRICING OPTIONS FOR EVERY BUDGET AND REQUIREMENT
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
            <ScrollReveal>
              <Card className="bg-white/10 backdrop-blur-lg shadow-2xl border-0">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-black mb-4">PAY PER USE</h3>
                  <div className="text-4xl font-black mb-4">$0</div>
                  <p className="font-bold mb-6">NO MONTHLY FEES</p>
                  <ul className="space-y-3 text-sm font-medium mb-8">
                    <li>✓ PAY ONLY WHEN YOU BOOK</li>
                    <li>✓ STANDARD PRICING</li>
                    <li>✓ BASIC SUPPORT</li>
                    <li>✓ NO COMMITMENT</li>
                  </ul>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 font-black">SIGN UP FREE</Button>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Card className="bg-white/20 backdrop-blur-lg shadow-2xl border-2 border-yellow-400">
                <CardContent className="p-8 text-center">
                  <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-black mb-4 inline-block">MOST POPULAR</div>
                  <h3 className="text-2xl font-black mb-4">TASKEGO PLUS</h3>
                  <div className="text-4xl font-black mb-4">$29</div>
                  <p className="font-bold mb-6">PER MONTH</p>
                  <ul className="space-y-3 text-sm font-medium mb-8">
                    <li>✓ 15% DISCOUNT ON ALL SERVICES</li>
                    <li>✓ PRIORITY BOOKING</li>
                    <li>✓ 24/7 SUPPORT</li>
                    <li>✓ FREE CANCELLATIONS</li>
                  </ul>
                  <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-black">START TRIAL</Button>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="bg-white/10 backdrop-blur-lg shadow-2xl border-0">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-black mb-4">TASKEGO PRO</h3>
                  <div className="text-4xl font-black mb-4">$99</div>
                  <p className="font-bold mb-6">PER MONTH</p>
                  <ul className="space-y-3 text-sm font-medium mb-8">
                    <li>✓ 25% DISCOUNT ON ALL SERVICES</li>
                    <li>✓ SAME-DAY BOOKING</li>
                    <li>✓ DEDICATED MANAGER</li>
                    <li>✓ UNLIMITED CANCELLATIONS</li>
                  </ul>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 font-black">UPGRADE NOW</Button>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <Card className="bg-white/10 backdrop-blur-lg shadow-2xl border-0">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-black mb-4">ENTERPRISE</h3>
                  <div className="text-4xl font-black mb-4">CUSTOM</div>
                  <p className="font-bold mb-6">TAILORED SOLUTIONS</p>
                  <ul className="space-y-3 text-sm font-medium mb-8">
                    <li>✓ VOLUME DISCOUNTS</li>
                    <li>✓ API INTEGRATION</li>
                    <li>✓ WHITE-LABEL OPTIONS</li>
                    <li>✓ SLA GUARANTEES</li>
                  </ul>
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 font-black">CONTACT SALES</Button>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>

          <div className="text-center">
            <ScrollReveal>
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl">
                <h3 className="text-3xl font-black mb-6">ALL PLANS INCLUDE</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm font-bold">
                  <div>🔒 SECURE PAYMENTS</div>
                  <div>📱 MOBILE APP ACCESS</div>
                  <div>⭐ VERIFIED PROVIDERS</div>
                  <div>💬 IN-APP MESSAGING</div>
                  <div>📍 GPS TRACKING</div>
                  <div>📊 SERVICE HISTORY</div>
                  <div>🏆 QUALITY GUARANTEE</div>
                  <div>🎯 INSTANT MATCHING</div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Detailed Service Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-4xl font-black text-gray-900 mb-4">Service Spotlight</h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto font-bold">
                Discover our most popular services with detailed information, pricing, and customer reviews
              </p>
            </ScrollReveal>
          </div>

          <div className="space-y-16">
            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-black text-gray-900 mb-6">🏠 Home Cleaning Services</h3>
                  <p className="text-lg text-gray-700 font-medium mb-6">
                    Professional home cleaning services that transform your living space. From regular maintenance to deep cleaning, our trained professionals use eco-friendly products and modern equipment.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-black text-blue-600 mb-2">500+</div>
                      <div className="text-gray-700 font-bold">Cleaners Available</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-black text-green-600 mb-2">4.8★</div>
                      <div className="text-gray-700 font-bold">Average Rating</div>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Regular weekly/bi-weekly cleaning
                    </li>
                    <li className="flex items-center text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Deep cleaning and sanitization
                    </li>
                    <li className="flex items-center text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Move-in/move-out cleaning
                    </li>
                    <li className="flex items-center text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Post-construction cleanup
                    </li>
                  </ul>
                  <div className="text-2xl font-black text-blue-600 mb-4">Starting at $25/hour</div>
                </div>
                <div>
                  <img src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop" 
                       alt="Home Cleaning" className="rounded-2xl shadow-xl" />
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <img src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&h=400&fit=crop" 
                       alt="Plumbing Services" className="rounded-2xl shadow-xl" />
                </div>
                <div className="order-1 lg:order-2">
                  <h3 className="text-3xl font-black text-gray-900 mb-6">🔧 Expert Plumbing Services</h3>
                  <p className="text-lg text-gray-700 font-medium mb-6">
                    24/7 emergency plumbing services with licensed professionals. From simple repairs to complete installations, we handle all your plumbing needs with expertise and reliability.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-2xl font-black text-orange-600 mb-2">200+</div>
                      <div className="text-gray-700 font-bold">Licensed Plumbers</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-black text-green-600 mb-2">4.9★</div>
                      <div className="text-gray-700 font-bold">Customer Rating</div>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Emergency leak repairs
                    </li>
                    <li className="flex items-center text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Pipe installation and replacement
                    </li>
                    <li className="flex items-center text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Drain cleaning and unclogging
                    </li>
                    <li className="flex items-center text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Water heater installation
                    </li>
                  </ul>
                  <div className="text-2xl font-black text-orange-600 mb-4">Starting at $45/hour</div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-3xl font-black text-gray-900 mb-6">📚 Professional Tutoring</h3>
                  <p className="text-lg text-gray-700 font-medium mb-6">
                    Personalized tutoring services for all ages and subjects. Our certified tutors help students achieve academic excellence through tailored learning approaches and flexible scheduling.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-black text-purple-600 mb-2">250+</div>
                      <div className="text-gray-700 font-bold">Qualified Tutors</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-black text-green-600 mb-2">95%</div>
                      <div className="text-gray-700 font-bold">Success Rate</div>
                    </div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-center text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Math, Science, and English
                    </li>
                    <li className="flex items-center text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Test preparation (SAT, IELTS)
                    </li>
                    <li className="flex items-center text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Language learning (Arabic/English)
                    </li>
                    <li className="flex items-center text-gray-700 font-medium">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      Online and in-person sessions
                    </li>
                  </ul>
                  <div className="text-2xl font-black text-purple-600 mb-4">Starting at $30/hour</div>
                </div>
                <div>
                  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop" 
                       alt="Tutoring Services" className="rounded-2xl shadow-xl" />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Partnership & Trust Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-4xl font-black text-gray-900 mb-4">Trusted by Leading Companies</h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto font-bold">
                Major businesses across the Middle East trust Taskego for their service needs
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-16">
            <ScrollReveal>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-2xl font-black text-blue-600 mb-2">Emaar</div>
                <div className="text-sm text-gray-600 font-medium">Real Estate</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-2xl font-black text-blue-600 mb-2">ADNOC</div>
                <div className="text-sm text-gray-600 font-medium">Energy</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-2xl font-black text-blue-600 mb-2">Emirates</div>
                <div className="text-sm text-gray-600 font-medium">Airlines</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-2xl font-black text-blue-600 mb-2">SABIC</div>
                <div className="text-sm text-gray-600 font-medium">Chemicals</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={400}>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-2xl font-black text-blue-600 mb-2">Almarai</div>
                <div className="text-sm text-gray-600 font-medium">Food & Beverage</div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={500}>
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-2xl font-black text-blue-600 mb-2">Careem</div>
                <div className="text-sm text-gray-600 font-medium">Technology</div>
              </div>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal>
              <Card className="bg-white shadow-xl border-0 h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-4">Enterprise Security</h3>
                  <p className="text-gray-700 font-medium">Advanced security protocols, data encryption, and compliance with international standards for enterprise clients.</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Card className="bg-white shadow-xl border-0 h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-4">Dedicated Support</h3>
                  <p className="text-gray-700 font-medium">Dedicated account managers and priority support for business clients with custom service agreements.</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="bg-white shadow-xl border-0 h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-4">Premium Quality</h3>
                  <p className="text-gray-700 font-medium">Specially selected top-tier service providers with additional training and certification for enterprise needs.</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Comprehensive FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-4xl font-black text-gray-900 mb-4">Everything You Need to Know</h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto font-bold">
                Comprehensive answers to help you understand our services, pricing, and processes
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ScrollReveal>
                <Card className="bg-gray-50 shadow-lg border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-black text-gray-900 mb-3">How quickly can I book a service?</h3>
                    <p className="text-gray-700 font-medium">Most services can be booked instantly with availability within 2-4 hours. Emergency services are available 24/7 with priority response times.</p>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={100}>
                <Card className="bg-gray-50 shadow-lg border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-black text-gray-900 mb-3">Are service providers insured?</h3>
                    <p className="text-gray-700 font-medium">Yes, all our service providers carry comprehensive insurance coverage and undergo thorough background checks before joining our platform.</p>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <Card className="bg-gray-50 shadow-lg border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-black text-gray-900 mb-3">What payment methods do you accept?</h3>
                    <p className="text-gray-700 font-medium">We accept all major credit cards, digital wallets, bank transfers, and cash payments. All transactions are secure and encrypted.</p>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <Card className="bg-gray-50 shadow-lg border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-black text-gray-900 mb-3">Do you offer business accounts?</h3>
                    <p className="text-gray-700 font-medium">Yes, we offer dedicated business accounts with bulk pricing, priority scheduling, and dedicated account management for corporate clients.</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>

            <div className="space-y-6">
              <ScrollReveal>
                <Card className="bg-gray-50 shadow-lg border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-black text-gray-900 mb-3">Can I cancel or reschedule bookings?</h3>
                    <p className="text-gray-700 font-medium">Yes, you can cancel or reschedule up to 2 hours before your appointment through our app or by calling customer support.</p>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={100}>
                <Card className="bg-gray-50 shadow-lg border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-black text-gray-900 mb-3">What if I'm not satisfied with the service?</h3>
                    <p className="text-gray-700 font-medium">We offer a 100% satisfaction guarantee. If you're not happy, we'll send another provider or provide a full refund within 24 hours.</p>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <Card className="bg-gray-50 shadow-lg border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-black text-gray-900 mb-3">Do you serve all areas in the UAE?</h3>
                    <p className="text-gray-700 font-medium">We currently serve all major cities in UAE, Saudi Arabia, and Qatar with plans to expand to more regions across the Middle East.</p>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <Card className="bg-gray-50 shadow-lg border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-black text-gray-900 mb-3">How do I become a service provider?</h3>
                    <p className="text-gray-700 font-medium">Apply through our Provider Portal, complete the verification process, and start earning. We provide training, support, and marketing tools.</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Location Coverage */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-4xl font-black mb-4">Serving Across the Middle East</h2>
              <p className="text-xl font-bold max-w-3xl mx-auto">
                Professional services available in major cities with local expertise and cultural understanding
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal>
              <Card className="bg-white/10 backdrop-blur-lg shadow-xl border-0">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-black mb-4">🇦🇪 United Arab Emirates</h3>
                  <div className="space-y-3 mb-6">
                    <div className="text-lg font-bold">Dubai • Abu Dhabi • Sharjah</div>
                    <div className="text-lg font-bold">Ajman • Fujairah • RAK</div>
                  </div>
                  <div className="text-3xl font-black mb-2">800+</div>
                  <div className="font-bold">Active Providers</div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Card className="bg-white/10 backdrop-blur-lg shadow-xl border-0">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-black mb-4">🇸🇦 Saudi Arabia</h3>
                  <div className="space-y-3 mb-6">
                    <div className="text-lg font-bold">Riyadh • Jeddah • Dammam</div>
                    <div className="text-lg font-bold">Mecca • Medina • Khobar</div>
                  </div>
                  <div className="text-3xl font-black mb-2">300+</div>
                  <div className="font-bold">Active Providers</div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="bg-white/10 backdrop-blur-lg shadow-xl border-0">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-black mb-4">🇶🇦 Qatar</h3>
                  <div className="space-y-3 mb-6">
                    <div className="text-lg font-bold">Doha • Al Rayyan</div>
                    <div className="text-lg font-bold">Al Wakrah • Lusail</div>
                  </div>
                  <div className="text-3xl font-black mb-2">100+</div>
                  <div className="font-bold">Active Providers</div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* MOBILE APP SHOWCASE */}
      <section className="py-20 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-5xl font-black mb-4">TASKEGO MOBILE EXPERIENCE</h2>
              <p className="text-2xl font-bold max-w-4xl mx-auto">
                DOWNLOAD THE #1 RATED SERVICE APP WITH 15M+ DOWNLOADS AND 4.9★ RATING
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <div>
                <h3 className="text-4xl font-black mb-8">APP FEATURES & BENEFITS</h3>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📱</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-black mb-2">INSTANT BOOKING</h4>
                      <p className="font-bold">Book any service in under 45 seconds with our streamlined mobile interface and one-touch payments</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">📍</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-black mb-2">LIVE GPS TRACKING</h4>
                      <p className="font-bold">Track your service provider in real-time with precise GPS location and estimated arrival times</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">💬</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-black mb-2">DIRECT MESSAGING</h4>
                      <p className="font-bold">Communicate directly with providers through secure in-app messaging with photo sharing</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">🔔</span>
                    </div>
                    <div>
                      <h4 className="text-xl font-black mb-2">SMART NOTIFICATIONS</h4>
                      <p className="font-bold">Get real-time updates on booking confirmations, provider arrivals, and service completions</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="text-center">
                <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl">
                  <h3 className="text-3xl font-black mb-6">DOWNLOAD STATS</h3>
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                      <div className="text-4xl font-black mb-2">15M+</div>
                      <div className="font-bold">TOTAL DOWNLOADS</div>
                    </div>
                    <div>
                      <div className="text-4xl font-black mb-2">4.9★</div>
                      <div className="font-bold">APP STORE RATING</div>
                    </div>
                    <div>
                      <div className="text-4xl font-black mb-2">500K+</div>
                      <div className="font-bold">MONTHLY ACTIVE USERS</div>
                    </div>
                    <div>
                      <div className="text-4xl font-black mb-2">98%</div>
                      <div className="font-bold">USER RETENTION RATE</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Button className="w-full bg-black text-white hover:bg-gray-800 font-black text-lg py-4">
                      📱 DOWNLOAD FOR iOS
                    </Button>
                    <Button className="w-full bg-green-600 text-white hover:bg-green-700 font-black text-lg py-4">
                      🤖 DOWNLOAD FOR ANDROID
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* AWARDS & RECOGNITION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-5xl font-black text-gray-900 mb-4">AWARDS & RECOGNITION</h2>
              <p className="text-2xl text-gray-700 max-w-4xl mx-auto font-bold">
                RECOGNIZED BY INDUSTRY LEADERS AND TRUSTED BY MILLIONS ACROSS THE MIDDLE EAST
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <ScrollReveal>
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-100 shadow-xl border-0 text-center">
                <CardContent className="p-8">
                  <div className="text-4xl mb-4">🏆</div>
                  <h3 className="text-xl font-black text-gray-900 mb-3">MENA STARTUP OF THE YEAR</h3>
                  <p className="text-gray-700 font-medium">2024 MIDDLE EAST BUSINESS AWARDS</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 shadow-xl border-0 text-center">
                <CardContent className="p-8">
                  <div className="text-4xl mb-4">🥇</div>
                  <h3 className="text-xl font-black text-gray-900 mb-3">BEST MOBILE APP</h3>
                  <p className="text-gray-700 font-medium">2024 GULF TECHNOLOGY AWARDS</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="bg-gradient-to-br from-green-50 to-emerald-100 shadow-xl border-0 text-center">
                <CardContent className="p-8">
                  <div className="text-4xl mb-4">⭐</div>
                  <h3 className="text-xl font-black text-gray-900 mb-3">CUSTOMER CHOICE AWARD</h3>
                  <p className="text-gray-700 font-medium">2024 DUBAI BUSINESS EXCELLENCE</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <Card className="bg-gradient-to-br from-purple-50 to-violet-100 shadow-xl border-0 text-center">
                <CardContent className="p-8">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-xl font-black text-gray-900 mb-3">FASTEST GROWING PLATFORM</h3>
                  <p className="text-gray-700 font-medium">2024 ARABIA BUSINESS AWARDS</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-indigo-900 p-12 rounded-3xl text-white text-center">
            <ScrollReveal>
              <h3 className="text-4xl font-black mb-8">MEDIA COVERAGE & PRESS</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-2xl font-black mb-4">📰 MAJOR PUBLICATIONS</h4>
                  <ul className="space-y-2 font-bold">
                    <li>FEATURED IN FORBES MIDDLE EAST</li>
                    <li>GULF NEWS TECH SPOTLIGHT</li>
                    <li>ARAB NEWS BUSINESS SECTION</li>
                    <li>KHALEEJ TIMES STARTUP FEATURE</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-2xl font-black mb-4">📺 TV APPEARANCES</h4>
                  <ul className="space-y-2 font-bold">
                    <li>CNBC ARABIA TECH TALK</li>
                    <li>BLOOMBERG MIDDLE EAST</li>
                    <li>AL ARABIYA BUSINESS</li>
                    <li>DUBAI ONE MORNING SHOW</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-2xl font-black mb-4">🎙️ PODCAST FEATURES</h4>
                  <ul className="space-y-2 font-bold">
                    <li>MENA TECH PODCAST #1</li>
                    <li>STARTUP GRIND DUBAI</li>
                    <li>GULF ENTREPRENEURS SHOW</li>
                    <li>ARAB INNOVATION TALKS</li>
                  </ul>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* GLOBAL EXPANSION & FUTURE */}
      <section className="py-20 bg-gradient-to-br from-indigo-900 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-5xl font-black mb-4">GLOBAL EXPANSION & ROADMAP</h2>
              <p className="text-2xl font-bold max-w-4xl mx-auto">
                OUR AMBITIOUS PLANS TO REVOLUTIONIZE SERVICE MARKETPLACES WORLDWIDE
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
            <ScrollReveal>
              <div>
                <h3 className="text-4xl font-black mb-8">2025 EXPANSION TARGETS</h3>
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
                    <h4 className="text-xl font-black mb-3">🌍 NEW MARKETS</h4>
                    <ul className="space-y-2 font-bold">
                      <li>• TURKEY & CYPRUS (Q1 2025)</li>
                      <li>• PAKISTAN & BANGLADESH (Q2 2025)</li>
                      <li>• NORTH AFRICA EXPANSION (Q3 2025)</li>
                      <li>• SOUTHEAST ASIA ENTRY (Q4 2025)</li>
                    </ul>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
                    <h4 className="text-xl font-black mb-3">🚀 PLATFORM EVOLUTION</h4>
                    <ul className="space-y-2 font-bold">
                      <li>• AI-POWERED PRICE OPTIMIZATION</li>
                      <li>• BLOCKCHAIN PAYMENT SYSTEM</li>
                      <li>• VR SERVICE PREVIEWS</li>
                      <li>• VOICE-ACTIVATED BOOKING</li>
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div>
                <h3 className="text-4xl font-black mb-8">INVESTMENT & GROWTH</h3>
                <div className="space-y-6">
                  <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
                    <h4 className="text-xl font-black mb-3">💰 FUNDING ROUNDS</h4>
                    <ul className="space-y-2 font-bold">
                      <li>• SERIES D: $200M (PLANNED Q2 2025)</li>
                      <li>• SERIES E: $500M (PLANNED 2026)</li>
                      <li>• IPO TARGET: 2027</li>
                      <li>• VALUATION TARGET: $10B</li>
                    </ul>
                  </div>
                  <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
                    <h4 className="text-xl font-black mb-3">📈 GROWTH PROJECTIONS</h4>
                    <ul className="space-y-2 font-bold">
                      <li>• 5M+ ACTIVE USERS BY 2025</li>
                      <li>• 50K+ SERVICE PROVIDERS</li>
                      <li>• $1B+ ANNUAL REVENUE</li>
                      <li>• 25+ COUNTRIES PRESENCE</li>
                    </ul>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="text-center">
            <ScrollReveal>
              <div className="bg-white/10 backdrop-blur-lg p-12 rounded-3xl">
                <h3 className="text-4xl font-black mb-8">JOIN THE REVOLUTION</h3>
                <p className="text-xl font-bold mb-8 max-w-3xl mx-auto">
                  BE PART OF THE FASTEST-GROWING SERVICE PLATFORM THAT'S RESHAPING HOW PEOPLE ACCESS SERVICES GLOBALLY
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <Button className="bg-yellow-400 text-black hover:bg-yellow-300 font-black text-lg py-4">
                    🚀 JOIN AS PROVIDER
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 font-black text-lg py-4">
                    📱 DOWNLOAD APP
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 font-black text-lg py-4">
                    💼 INVEST WITH US
                  </Button>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* COMMUNITY & SOCIAL IMPACT */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-emerald-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-5xl font-black mb-4">COMMUNITY & SOCIAL IMPACT</h2>
              <p className="text-2xl font-bold max-w-4xl mx-auto">
                EMPOWERING COMMUNITIES AND CREATING POSITIVE SOCIAL CHANGE ACROSS THE REGION
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <ScrollReveal>
              <Card className="bg-white/10 backdrop-blur-lg shadow-2xl border-0 text-center">
                <CardContent className="p-8">
                  <div className="text-4xl mb-4">🤝</div>
                  <h3 className="text-xl font-black mb-3">COMMUNITY SUPPORT</h3>
                  <div className="text-3xl font-black mb-2">15K+</div>
                  <p className="font-bold">FAMILIES SUPPORTED</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Card className="bg-white/10 backdrop-blur-lg shadow-2xl border-0 text-center">
                <CardContent className="p-8">
                  <div className="text-4xl mb-4">💼</div>
                  <h3 className="text-xl font-black mb-3">JOB CREATION</h3>
                  <div className="text-3xl font-black mb-2">25K+</div>
                  <p className="font-bold">JOBS CREATED</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="bg-white/10 backdrop-blur-lg shadow-2xl border-0 text-center">
                <CardContent className="p-8">
                  <div className="text-4xl mb-4">🎓</div>
                  <h3 className="text-xl font-black mb-3">SKILLS TRAINING</h3>
                  <div className="text-3xl font-black mb-2">5K+</div>
                  <p className="font-bold">PROVIDERS TRAINED</p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <Card className="bg-white/10 backdrop-blur-lg shadow-2xl border-0 text-center">
                <CardContent className="p-8">
                  <div className="text-4xl mb-4">🌱</div>
                  <h3 className="text-xl font-black mb-3">SUSTAINABILITY</h3>
                  <div className="text-3xl font-black mb-2">30%</div>
                  <p className="font-bold">CARBON REDUCTION</p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>

          <div className="bg-white/10 backdrop-blur-lg p-12 rounded-3xl text-center">
            <ScrollReveal>
              <h3 className="text-4xl font-black mb-8">OUR SOCIAL INITIATIVES</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h4 className="text-2xl font-black mb-4">🏫 EDUCATION PROGRAM</h4>
                  <ul className="space-y-2 font-bold text-left">
                    <li>• FREE DIGITAL SKILLS TRAINING</li>
                    <li>• ENTREPRENEURSHIP WORKSHOPS</li>
                    <li>• WOMEN EMPOWERMENT INITIATIVES</li>
                    <li>• YOUTH MENTORSHIP PROGRAMS</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-2xl font-black mb-4">🌍 SUSTAINABILITY</h4>
                  <ul className="space-y-2 font-bold text-left">
                    <li>• CARBON NEUTRAL OPERATIONS</li>
                    <li>• GREEN SERVICE PROVIDERS</li>
                    <li>• WASTE REDUCTION PROGRAMS</li>
                    <li>• RENEWABLE ENERGY PARTNERS</li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-2xl font-black mb-4">❤️ COMMUNITY CARE</h4>
                  <ul className="space-y-2 font-bold text-left">
                    <li>• FREE SERVICES FOR SENIORS</li>
                    <li>• DISASTER RELIEF SUPPORT</li>
                    <li>• CHARITY PARTNERSHIPS</li>
                    <li>• HEALTHCARE ACCESSIBILITY</li>
                  </ul>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* LIVE PERFORMANCE DASHBOARD */}
      <section className="py-20 bg-gradient-to-br from-red-600 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-5xl font-black mb-4">LIVE PERFORMANCE DASHBOARD</h2>
              <p className="text-2xl font-bold max-w-4xl mx-auto">
                REAL-TIME PLATFORM METRICS AND PERFORMANCE INDICATORS UPDATED EVERY SECOND
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
            <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl text-center">
              <div className="text-2xl font-black text-yellow-400 mb-1">LIVE</div>
              <div className="text-xs font-bold">ACTIVE BOOKINGS</div>
              <div className="text-lg font-black mt-2">2,847</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl text-center">
              <div className="text-2xl font-black text-green-400 mb-1">ONLINE</div>
              <div className="text-xs font-bold">PROVIDERS NOW</div>
              <div className="text-lg font-black mt-2">1,456</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl text-center">
              <div className="text-2xl font-black text-blue-400 mb-1">TODAY</div>
              <div className="text-xs font-bold">SERVICES BOOKED</div>
              <div className="text-lg font-black mt-2">8,923</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl text-center">
              <div className="text-2xl font-black text-purple-400 mb-1">THIS HOUR</div>
              <div className="text-xs font-bold">NEW USERS</div>
              <div className="text-lg font-black mt-2">247</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl text-center">
              <div className="text-2xl font-black text-cyan-400 mb-1">PROCESSING</div>
              <div className="text-xs font-bold">PAYMENTS</div>
              <div className="text-lg font-black mt-2">$147K</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg p-4 rounded-xl text-center">
              <div className="text-2xl font-black text-pink-400 mb-1">AVERAGE</div>
              <div className="text-xs font-bold">RESPONSE TIME</div>
              <div className="text-lg font-black mt-2">1.2 SEC</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <ScrollReveal>
              <Card className="bg-white/10 backdrop-blur-lg shadow-2xl border-0">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-black mb-6">🌍 GLOBAL ACTIVITY MAP</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">UAE</span>
                      <div className="bg-yellow-400 h-3 w-24 rounded-full"></div>
                      <span className="font-black">87%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">SAUDI</span>
                      <div className="bg-green-400 h-3 w-20 rounded-full"></div>
                      <span className="font-black">72%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">QATAR</span>
                      <div className="bg-blue-400 h-3 w-16 rounded-full"></div>
                      <span className="font-black">64%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">KUWAIT</span>
                      <div className="bg-purple-400 h-3 w-14 rounded-full"></div>
                      <span className="font-black">58%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={100}>
              <Card className="bg-white/10 backdrop-blur-lg shadow-2xl border-0">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-black mb-6">📊 TOP SERVICES TODAY</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">🧹 CLEANING</span>
                      <span className="font-black">2,847</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">🚚 DELIVERY</span>
                      <span className="font-black">1,923</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">🔧 PLUMBING</span>
                      <span className="font-black">1,456</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">⚡ ELECTRICAL</span>
                      <span className="font-black">987</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="bg-white/10 backdrop-blur-lg shadow-2xl border-0">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-black mb-6">⚡ SYSTEM STATUS</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold">API RESPONSE</span>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="font-black text-green-400">OPTIMAL</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">DATABASE</span>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="font-black text-green-400">HEALTHY</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">PAYMENTS</span>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="font-black text-green-400">PROCESSING</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold">MOBILE APP</span>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="font-black text-green-400">STABLE</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>

          <div className="text-center">
            <ScrollReveal>
              <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl">
                <h3 className="text-3xl font-black mb-6">PLATFORM HEALTH SCORE</h3>
                <div className="text-6xl font-black text-yellow-400 mb-4">99.7%</div>
                <p className="text-xl font-bold mb-6">ALL SYSTEMS OPERATING AT PEAK PERFORMANCE</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm font-bold">
                  <div>🚀 RESPONSE TIME: 1.2S</div>
                  <div>⚡ UPTIME: 99.9%</div>
                  <div>🔒 SECURITY: 100%</div>
                  <div>📱 MOBILE: 100%</div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-blue-600 text-white">
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
                <Button size="lg" className="px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl font-black text-lg">
                  {messages.cta?.download_app || 'Get Started Now'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300 font-black text-lg">
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
