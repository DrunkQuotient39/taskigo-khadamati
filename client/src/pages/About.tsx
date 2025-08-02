import { CheckCircle, Users, Globe, Shield, Award, Clock, Heart, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ScrollReveal from '@/components/common/ScrollReveal';
import AnimatedCounter from '@/components/common/AnimatedCounter';

export default function About() {
  const teamMembers = [
    {
      name: 'Sarah Al-Rashid',
      role: 'CEO & Founder',
      bio: 'Former operations director at major logistics company. Passionate about connecting communities through technology.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop&crop=face',
      experience: '12+ years'
    },
    {
      name: 'Ahmed Hassan',
      role: 'CTO',
      bio: 'Tech visionary with expertise in scalable platforms. Previously led engineering teams at top fintech companies.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      experience: '15+ years'
    },
    {
      name: 'Fatima Al-Zahra',
      role: 'Head of Operations',
      bio: 'Service excellence expert ensuring quality standards across all our marketplace interactions.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop&crop=face',
      experience: '10+ years'
    },
    {
      name: 'Omar Khalil',
      role: 'Customer Success Director',
      bio: 'Dedicated to creating exceptional experiences for both service providers and customers on our platform.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      experience: '8+ years'
    }
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Safety',
      description: 'Every service provider undergoes thorough background checks and skill verification before joining our platform.'
    },
    {
      icon: Heart,
      title: 'Community First',
      description: 'We believe in building strong local communities by connecting neighbors with trusted professionals.'
    },
    {
      icon: Globe,
      title: 'Cultural Bridge',
      description: 'Supporting both Arabic and English speakers, making services accessible to diverse communities.'
    },
    {
      icon: Award,
      title: 'Excellence Standard',
      description: 'Maintaining the highest quality standards through continuous training and performance monitoring.'
    }
  ];

  const milestones = [
    { year: '2020', event: 'Taskego founded with a vision to revolutionize local services' },
    { year: '2021', event: 'Reached 500+ verified service providers across major cities' },
    { year: '2022', event: 'Launched bilingual platform supporting Arabic and English' },
    { year: '2023', event: 'Expanded to 12+ service categories with 1000+ providers' },
    { year: '2024', event: 'Achieved 50,000+ completed bookings and 4.9★ average rating' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h1 className="text-4xl md:text-6xl font-black mb-6">
              About Taskego
            </h1>
            <p className="text-xl md:text-2xl font-bold max-w-3xl mx-auto mb-8">
              We're revolutionizing how people connect with trusted local service providers. 
              From home cleaning to tech support, we make quality services accessible to everyone.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black mb-2">
                  <AnimatedCounter end={1200} suffix="+" />
                </div>
                <div className="text-lg font-bold">Verified Providers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black mb-2">
                  <AnimatedCounter end={50000} suffix="+" />
                </div>
                <div className="text-lg font-bold">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black mb-2">
                  <AnimatedCounter end={12} suffix="+" />
                </div>
                <div className="text-lg font-bold">Service Categories</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black mb-2">4.9⭐</div>
                <div className="text-lg font-bold">Average Rating</div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollReveal>
              <h2 className="text-4xl font-black text-gray-900 mb-6">Our Mission</h2>
              <p className="text-xl text-gray-800 font-bold mb-6">
                To create the most trusted and comprehensive service marketplace that empowers local professionals 
                and provides exceptional experiences for customers across the Middle East and beyond.
              </p>
              <p className="text-lg text-gray-700 font-medium mb-8">
                We started Taskego because we believe everyone deserves access to reliable, high-quality services. 
                Whether you're a busy professional, a growing family, or a business owner, finding trustworthy 
                service providers shouldn't be a challenge.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span className="font-bold text-gray-800">Licensed & Insured</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span className="font-bold text-gray-800">24/7 Customer Support</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span className="font-bold text-gray-800">Satisfaction Guarantee</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                  <span className="font-bold text-gray-800">Transparent Pricing</span>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <img 
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop" 
                alt="Team working together" 
                className="rounded-2xl shadow-xl"
              />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-4xl font-black text-gray-900 text-center mb-12">Our Core Values</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="bg-white shadow-lg border-0 h-full hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <value.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-4">{value.title}</h3>
                    <p className="text-gray-700 font-medium">{value.description}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-4xl font-black text-gray-900 text-center mb-12">Meet Our Leadership Team</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="text-xl font-black text-gray-900 mb-2">{member.name}</h3>
                    <Badge className="bg-orange-500 text-white mb-3">{member.role}</Badge>
                    <p className="text-gray-700 font-medium text-sm mb-3">{member.bio}</p>
                    <div className="text-blue-600 font-bold text-sm">{member.experience} Experience</div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-4xl font-black text-gray-900 text-center mb-12">Our Journey</h2>
          </ScrollReveal>
          <div className="space-y-8">
            {milestones.map((milestone, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full flex items-center justify-center mr-6 shadow-lg">
                    <span className="text-white font-black text-lg">{milestone.year}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-bold text-gray-900">{milestone.event}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-4xl font-black mb-6">Join the Taskego Community</h2>
            <p className="text-xl font-bold mb-8">
              Whether you're looking for services or want to offer your skills, 
              we're here to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/services" 
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-black text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                Find Services
              </a>
              <a 
                href="/providers/dashboard" 
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-black text-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Become a Provider
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}