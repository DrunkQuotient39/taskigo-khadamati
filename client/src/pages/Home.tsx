import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Star, Clock, Shield, Users, CheckCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ScrollReveal from '@/components/common/ScrollReveal';
import AnimatedCounter from '@/components/common/AnimatedCounter';

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
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black bg-opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ScrollReveal>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span>{messages.hero?.title || 'Professional Services'}</span>
                <br />
                <span className="text-khadamati-yellow">
                  {messages.hero?.subtitle || 'At Your Fingertips'}
                </span>
              </h1>
            </ScrollReveal>
            
            <ScrollReveal delay={200}>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
                {messages.hero?.description || 'Connect with trusted local service providers for all your home and business needs. From cleaning to repairs, we\'ve got you covered.'}
              </p>
            </ScrollReveal>
            
            <ScrollReveal delay={400}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/services">
                  <Button size="lg" className="px-8 py-4 bg-khadamati-yellow text-khadamati-dark font-semibold hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105">
                    {messages.hero?.cta?.book || 'Book a Service'}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/provider-signup">
                  <Button size="lg" variant="outline" className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-khadamati-dark font-semibold transition-all duration-300">
                    {messages.hero?.cta?.provider || 'Become a Provider'}
                  </Button>
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <ScrollReveal className="text-center">
              <div className="text-4xl font-bold text-khadamati-blue mb-2">
                <AnimatedCounter end={1200} suffix="+" />
              </div>
              <div className="text-khadamati-gray">{messages.stats?.providers || 'Service Providers'}</div>
            </ScrollReveal>
            
            <ScrollReveal className="text-center" delay={100}>
              <div className="text-4xl font-bold text-khadamati-blue mb-2">
                <AnimatedCounter end={15000} suffix="+" />
              </div>
              <div className="text-khadamati-gray">{messages.stats?.bookings || 'Completed Bookings'}</div>
            </ScrollReveal>
            
            <ScrollReveal className="text-center" delay={200}>
              <div className="text-4xl font-bold text-khadamati-blue mb-2">
                <AnimatedCounter end={4.9} suffix="" />
              </div>
              <div className="text-khadamati-gray">{messages.stats?.rating || 'Average Rating'}</div>
            </ScrollReveal>
            
            <ScrollReveal className="text-center" delay={300}>
              <div className="text-4xl font-bold text-khadamati-blue mb-2">
                <AnimatedCounter end={25} suffix="+" />
              </div>
              <div className="text-khadamati-gray">{messages.stats?.cities || 'Cities Covered'}</div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceCategories.map((category, index) => (
              <ScrollReveal key={category.id} delay={index * 100}>
                <Link href={category.href}>
                  <Card className="card-hover bg-white rounded-2xl shadow-lg border-0 h-full cursor-pointer">
                    <CardContent className="p-8 text-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                        <span className="text-2xl">{category.icon}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-khadamati-dark mb-3">
                        {category.name}
                      </h3>
                      <p className="text-khadamati-gray mb-4 text-sm">
                        {category.description}
                      </p>
                      <div className="text-khadamati-blue font-semibold text-sm">
                        {category.price}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          <div className="text-center mt-12">
            <ScrollReveal>
              <Link href="/services">
                <Button size="lg" className="px-8 py-4 bg-khadamati-blue text-white hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
                  {messages.services?.view_all || 'View All Services'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-4xl font-bold text-khadamati-dark mb-4">
                {messages.how_it_works?.title || 'How It Works'}
              </h2>
              <p className="text-xl text-khadamati-gray max-w-2xl mx-auto">
                {messages.how_it_works?.description || 'Get your service in just a few simple steps.'}
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <ScrollReveal className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-khadamati-blue to-khadamati-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold text-khadamati-dark mb-3">
                {messages.how_it_works?.step1?.title || 'Choose Service'}
              </h3>
              <p className="text-khadamati-gray">
                {messages.how_it_works?.step1?.description || 'Browse our categories and select the service you need'}
              </p>
            </ScrollReveal>

            <ScrollReveal className="text-center" delay={200}>
              <div className="w-20 h-20 bg-gradient-to-br from-khadamati-blue to-khadamati-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold text-khadamati-dark mb-3">
                {messages.how_it_works?.step2?.title || 'Book & Pay'}
              </h3>
              <p className="text-khadamati-gray">
                {messages.how_it_works?.step2?.description || 'Select your preferred time and complete the booking'}
              </p>
            </ScrollReveal>

            <ScrollReveal className="text-center" delay={400}>
              <div className="w-20 h-20 bg-gradient-to-br from-khadamati-blue to-khadamati-yellow rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold text-khadamati-dark mb-3">
                {messages.how_it_works?.step3?.title || 'Get Service'}
              </h3>
              <p className="text-khadamati-gray">
                {messages.how_it_works?.step3?.description || 'Professional service provider arrives at your location'}
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-khadamati-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-4xl font-bold text-khadamati-dark mb-4">
                What Our Customers Say
              </h2>
              <p className="text-xl text-khadamati-gray">
                Real feedback from our satisfied customers
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal>
            <Card className="bg-white shadow-xl border-0">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-khadamati-yellow fill-current" />
                  ))}
                </div>
                <blockquote className="text-xl text-khadamati-dark mb-8 italic">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="flex items-center justify-center space-x-4">
                  <img
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-khadamati-dark">
                      {testimonials[currentTestimonial].name}
                    </div>
                    <div className="text-khadamati-gray text-sm">
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
                  index === currentTestimonial ? 'bg-khadamati-blue' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-khadamati-blue to-khadamati-yellow text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-4xl font-bold mb-4">
              {messages.cta?.title || 'Ready to Get Started?'}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              {messages.cta?.description || 'Join thousands of satisfied customers who trust Taskego for their service needs.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="px-8 py-4 bg-white text-khadamati-blue hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">
                  {messages.cta?.download_app || 'Get Started Now'}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-khadamati-blue transition-all duration-300">
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
