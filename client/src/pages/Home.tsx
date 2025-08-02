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
              <div className="text-4xl font-bold text-yellow-bright mb-2">
                <AnimatedCounter end={4.9} suffix="" />⭐
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {serviceCategories.map((category, index) => (
              <ScrollReveal key={category.id} delay={index * 100}>
                <Link href={category.href}>
                  <Card className="card-hover bg-white rounded-2xl shadow-lg border-0 h-full cursor-pointer">
                    <CardContent className="p-8 text-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                        <span className="text-2xl">{category.icon}</span>
                      </div>
                      <h3 className="text-xl font-black text-gray-900 mb-3">
                        {category.name}
                      </h3>
                      <p className="text-gray-700 mb-4 text-base font-bold">
                        {category.description}
                      </p>
                      <div className="text-white font-black text-base bg-orange-500 px-4 py-2 rounded-full shadow-lg">
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
                <Button size="lg" className="px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white font-black text-lg shadow-xl border-2 border-blue-800 transition-all duration-300 transform hover:scale-105">
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
              <h2 className="text-4xl font-black text-gray-900 mb-4">
                {messages.how_it_works?.title || 'How It Works'}
              </h2>
              <p className="text-xl text-gray-700 max-w-2xl mx-auto font-bold">
                {messages.how_it_works?.description || 'Get your service in just a few simple steps.'}
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <ScrollReveal className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-white text-3xl font-black">1</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">
                {messages.how_it_works?.step1?.title || 'Choose Your Service'}
              </h3>
              <p className="text-gray-800 font-bold text-lg">
                {messages.how_it_works?.step1?.description || 'Browse through 12+ service categories and find exactly what you need for your home or business'}
              </p>
            </ScrollReveal>

            <ScrollReveal className="text-center" delay={200}>
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-white text-3xl font-black">2</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">
                {messages.how_it_works?.step2?.title || 'Book & Schedule'}
              </h3>
              <p className="text-gray-800 font-bold text-lg">
                {messages.how_it_works?.step2?.description || 'Choose your preferred date and time, get matched with verified professionals instantly'}
              </p>
            </ScrollReveal>

            <ScrollReveal className="text-center" delay={400}>
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                <span className="text-white text-3xl font-black">3</span>
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">
                {messages.how_it_works?.step3?.title || 'Enjoy Quality Service'}
              </h3>
              <p className="text-gray-800 font-bold text-lg">
                {messages.how_it_works?.step3?.description || 'Experienced professionals arrive on time and deliver exceptional results with satisfaction guaranteed'}
              </p>
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
