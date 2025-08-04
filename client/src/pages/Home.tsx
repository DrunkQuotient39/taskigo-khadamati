import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowRight, Star, Clock, Shield, Users, CheckCircle, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
      <section className="py-20 bg-gradient-to-br from-blue-600 to-slate-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-black mb-6">
              {messages.hero?.title || 'Professional Services at Your Fingertips'}
            </h1>
            <p className="text-xl font-bold mb-8 max-w-3xl mx-auto">
              {messages.hero?.subtitle || 'Connect with verified local service providers for all your home and business needs'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/services">
                <Button size="lg" className="px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 transition-all duration-300 font-black text-lg" data-testid="button-get-started">
                  Get Started Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300 font-black text-lg" data-testid="button-learn-more">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {serviceCategories.map((category) => (
              <Link key={category.id} href={category.href}>
                <Card className="bg-white rounded-xl shadow-lg border-0 h-full cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:scale-105" data-testid={`card-service-${category.id}`}>
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {category.description}
                    </p>
                    <div className="text-white font-bold text-sm bg-gradient-to-r from-blue-600 to-slate-600 px-3 py-2 rounded-full">
                      {category.price}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trust our platform.
            </p>
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
        </div>
      </section>
    </div>
  );
}