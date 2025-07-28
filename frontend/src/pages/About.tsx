import { CheckCircle, Users, Award, Globe, Heart, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ScrollReveal from '@/components/common/ScrollReveal';
import AnimatedCounter from '@/components/common/AnimatedCounter';

interface AboutProps {
  messages: any;
}

export default function About({ messages }: AboutProps) {
  const values = [
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: messages.about_page?.values?.quality || 'Quality',
      description: 'We ensure the highest standards of service quality through rigorous vetting and continuous monitoring.',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: messages.about_page?.values?.trust || 'Trust',
      description: 'Building lasting relationships through transparency, reliability, and consistent service delivery.',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: messages.about_page?.values?.innovation || 'Innovation',
      description: 'Leveraging cutting-edge technology to create seamless experiences for our users.',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: messages.about_page?.values?.customer || 'Customer Focus',
      description: 'Putting our customers first in everything we do, from platform design to service delivery.',
      color: 'bg-red-100 text-red-600'
    }
  ];

  const milestones = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'Taskego was founded with a vision to revolutionize the local services industry.'
    },
    {
      year: '2021',
      title: 'First 100 Providers',
      description: 'Reached our first milestone of 100 verified service providers on the platform.'
    },
    {
      year: '2022',
      title: 'Multi-Language Support',
      description: 'Launched Arabic language support to serve our diverse community better.'
    },
    {
      year: '2023',
      title: 'AI Integration',
      description: 'Introduced AI-powered matching to connect customers with the best service providers.'
    },
    {
      year: '2024',
      title: 'Regional Expansion',
      description: 'Expanded to 25+ cities across the region with 1000+ active providers.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face',
      bio: 'Former McKinsey consultant with 10+ years in technology and operations.'
    },
    {
      name: 'Ahmed Hassan',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face',
      bio: 'Tech leader with experience at Google and Microsoft, passionate about AI and user experience.'
    },
    {
      name: 'Maria Rodriguez',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face',
      bio: 'Operations expert with a background in scaling marketplace businesses across emerging markets.'
    },
    {
      name: 'David Chen',
      role: 'Head of Product',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face',
      bio: 'Product strategist with experience building consumer-facing platforms at scale.'
    }
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 bg-white">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-khadamati-blue to-khadamati-yellow text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ScrollReveal>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {messages.about_page?.title || 'About Taskego'}
              </h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto">
                {messages.about_page?.description || 'Learn more about our mission to connect people with trusted service providers.'}
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-khadamati-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ScrollReveal>
              <Card className="bg-white shadow-xl border-0 h-full">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-khadamati-blue rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-khadamati-dark">
                      {messages.about_page?.mission?.title || 'Our Mission'}
                    </h2>
                  </div>
                  <p className="text-lg text-khadamati-gray text-center leading-relaxed">
                    {messages.about_page?.mission?.description || 'To make professional services accessible, reliable, and convenient for everyone.'}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="bg-white shadow-xl border-0 h-full">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-khadamati-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                      <Globe className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-khadamati-dark">
                      {messages.about_page?.vision?.title || 'Our Vision'}
                    </h2>
                  </div>
                  <p className="text-lg text-khadamati-gray text-center leading-relaxed">
                    {messages.about_page?.vision?.description || 'To become the leading platform for local service providers and customers.'}
                  </p>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <ScrollReveal className="text-center">
              <div className="text-4xl font-bold text-khadamati-blue mb-2">
                <AnimatedCounter end={1200} suffix="+" />
              </div>
              <div className="text-khadamati-gray">Active Providers</div>
            </ScrollReveal>
            
            <ScrollReveal className="text-center" delay={100}>
              <div className="text-4xl font-bold text-khadamati-blue mb-2">
                <AnimatedCounter end={25000} suffix="+" />
              </div>
              <div className="text-khadamati-gray">Happy Customers</div>
            </ScrollReveal>
            
            <ScrollReveal className="text-center" delay={200}>
              <div className="text-4xl font-bold text-khadamati-blue mb-2">
                <AnimatedCounter end={50000} suffix="+" />
              </div>
              <div className="text-khadamati-gray">Services Completed</div>
            </ScrollReveal>
            
            <ScrollReveal className="text-center" delay={300}>
              <div className="text-4xl font-bold text-khadamati-blue mb-2">
                <AnimatedCounter end={25} suffix="+" />
              </div>
              <div className="text-khadamati-gray">Cities Served</div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-khadamati-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-4xl font-bold text-khadamati-dark mb-4">
                {messages.about_page?.values?.title || 'Our Values'}
              </h2>
              <p className="text-xl text-khadamati-gray max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="bg-white shadow-lg border-0 h-full">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${value.color}`}>
                        {value.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-khadamati-dark mb-3">
                          {value.title}
                        </h3>
                        <p className="text-khadamati-gray leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-4xl font-bold text-khadamati-dark mb-4">
                Our Journey
              </h2>
              <p className="text-xl text-khadamati-gray">
                Key milestones in our growth story
              </p>
            </ScrollReveal>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-khadamati-blue"></div>
            
            {milestones.map((milestone, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className={`flex items-center mb-12 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <Card className="bg-white shadow-lg border-0">
                      <CardContent className="p-6">
                        <Badge className="mb-2 bg-khadamati-yellow text-khadamati-dark">
                          {milestone.year}
                        </Badge>
                        <h3 className="text-xl font-semibold text-khadamati-dark mb-2">
                          {milestone.title}
                        </h3>
                        <p className="text-khadamati-gray">
                          {milestone.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="w-4 h-4 bg-khadamati-blue rounded-full relative z-10 border-4 border-white shadow-lg"></div>
                  <div className="w-1/2"></div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-khadamati-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-4xl font-bold text-khadamati-dark mb-4">
                Meet Our Team
              </h2>
              <p className="text-xl text-khadamati-gray max-w-2xl mx-auto">
                The passionate people behind Taskego
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="bg-white shadow-lg border-0 text-center">
                  <CardContent className="p-8">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h3 className="text-xl font-semibold text-khadamati-dark mb-2">
                      {member.name}
                    </h3>
                    <p className="text-khadamati-blue font-medium mb-4">
                      {member.role}
                    </p>
                    <p className="text-khadamati-gray text-sm leading-relaxed">
                      {member.bio}
                    </p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
