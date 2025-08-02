import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageCircle, Headphones, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ScrollReveal from '@/components/common/ScrollReveal';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    type: 'general'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We\'ll get back to you within 24 hours.');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactMethods = [
    {
      icon: Phone,
      title: '24/7 Phone Support',
      description: 'Speak directly with our customer success team',
      contact: '+971-4-XXX-XXXX',
      hours: 'Available 24/7',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Send us detailed questions or feedback',
      contact: 'support@taskego.com',
      hours: 'Response within 2 hours',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Get instant help through our chat system',
      contact: 'Available on website',
      hours: '6 AM - 12 AM daily',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Headphones,
      title: 'WhatsApp Support',
      description: 'Message us on WhatsApp for quick assistance',
      contact: '+971-5X-XXX-XXXX',
      hours: '8 AM - 10 PM daily',
      color: 'from-green-600 to-teal-600'
    }
  ];

  const offices = [
    {
      city: 'Dubai',
      address: 'Business Bay Tower, Level 25, Dubai, UAE',
      phone: '+971-4-XXX-XXXX',
      hours: 'Sun-Thu: 9 AM - 6 PM',
      isMain: true
    },
    {
      city: 'Abu Dhabi',
      address: 'Corniche Plaza, Floor 12, Abu Dhabi, UAE',
      phone: '+971-2-XXX-XXXX',
      hours: 'Sun-Thu: 9 AM - 6 PM',
      isMain: false
    },
    {
      city: 'Riyadh',
      address: 'King Fahd District, Tower 3, Riyadh, KSA',
      phone: '+966-11-XXX-XXXX',
      hours: 'Sun-Thu: 9 AM - 6 PM',
      isMain: false
    }
  ];

  const faqItems = [
    {
      question: 'How quickly can I get a service provider?',
      answer: 'Most bookings can be scheduled within 24-48 hours. Emergency services are available within 2-4 hours.'
    },
    {
      question: 'Are all service providers verified?',
      answer: 'Yes, every provider undergoes background checks, skill verification, and insurance validation before joining.'
    },
    {
      question: 'What if I\'m not satisfied with the service?',
      answer: 'We offer a 100% satisfaction guarantee. Contact us within 24 hours and we\'ll make it right.'
    },
    {
      question: 'Do you serve commercial businesses?',
      answer: 'Absolutely! We provide services for both residential and commercial clients with dedicated business support.'
    },
    {
      question: 'Can I cancel or reschedule my booking?',
      answer: 'Yes, you can cancel or reschedule up to 2 hours before your appointment through our app or by calling support.'
    },
    {
      question: 'How do I become a service provider?',
      answer: 'Apply through our Provider Portal. After verification and training, you can start accepting bookings.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h1 className="text-4xl md:text-6xl font-black mb-6">Get in Touch</h1>
            <p className="text-xl md:text-2xl font-bold max-w-3xl mx-auto mb-8">
              We're here to help 24/7. Whether you need support, have questions, 
              or want to partner with us - we'd love to hear from you.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge className="bg-white text-blue-600 px-4 py-2 text-lg font-bold">
                <Clock className="h-5 w-5 mr-2" />
                24/7 Support Available
              </Badge>
              <Badge className="bg-white text-blue-600 px-4 py-2 text-lg font-bold">
                <Globe className="h-5 w-5 mr-2" />
                Arabic & English
              </Badge>
              <Badge className="bg-white text-blue-600 px-4 py-2 text-lg font-bold">
                <Shield className="h-5 w-5 mr-2" />
                Verified Support Team
              </Badge>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-4xl font-black text-gray-900 text-center mb-12">How Can We Help You?</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactMethods.map((method, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-all duration-300 h-full">
                  <CardContent className="p-8 text-center">
                    <div className={`w-16 h-16 bg-gradient-to-br ${method.color} rounded-full flex items-center justify-center mx-auto mb-6`}>
                      <method.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-3">{method.title}</h3>
                    <p className="text-gray-700 font-medium mb-4">{method.description}</p>
                    <div className="text-blue-600 font-bold mb-2">{method.contact}</div>
                    <div className="text-sm text-gray-600 font-medium">{method.hours}</div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Offices */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <ScrollReveal>
              <Card className="bg-white shadow-xl border-0">
                <CardHeader>
                  <CardTitle className="text-3xl font-black text-gray-900">Send Us a Message</CardTitle>
                  <p className="text-gray-700 font-medium">We'll respond within 2 hours during business hours</p>
                </CardHeader>
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Full Name *</label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number</label>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full"
                          placeholder="+971-XX-XXX-XXXX"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Email Address *</label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Inquiry Type</label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="support">Customer Support</option>
                        <option value="provider">Become a Provider</option>
                        <option value="business">Business Partnership</option>
                        <option value="technical">Technical Issue</option>
                        <option value="feedback">Feedback & Suggestions</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Subject *</label>
                      <Input
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full"
                        placeholder="Brief description of your inquiry"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Message *</label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full"
                        placeholder="Please provide details about your inquiry..."
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black text-lg py-3 shadow-lg"
                    >
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Office Locations */}
            <div className="space-y-8">
              <ScrollReveal delay={200}>
                <h3 className="text-3xl font-black text-gray-900 mb-8">Our Office Locations</h3>
              </ScrollReveal>
              
              {offices.map((office, index) => (
                <ScrollReveal key={index} delay={300 + index * 100}>
                  <Card className="bg-white shadow-lg border-0">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h4 className="text-xl font-black text-gray-900">{office.city}</h4>
                        {office.isMain && (
                          <Badge className="bg-orange-500 text-white">Main Office</Badge>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-gray-600 mr-3 mt-1" />
                          <span className="text-gray-700 font-medium">{office.address}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-5 w-5 text-gray-600 mr-3" />
                          <span className="text-gray-700 font-medium">{office.phone}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-5 w-5 text-gray-600 mr-3" />
                          <span className="text-gray-700 font-medium">{office.hours}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-4xl font-black text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          </ScrollReveal>
          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="bg-gray-50 shadow-lg border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-black text-gray-900 mb-3">{item.question}</h3>
                    <p className="text-gray-700 font-medium">{item.answer}</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Contact */}
      <section className="py-16 bg-gradient-to-br from-red-500 to-orange-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-black mb-4">Need Emergency Service?</h2>
            <p className="text-xl font-bold mb-6">
              For urgent plumbing, electrical, or security issues, contact our emergency hotline
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="tel:+971800TASKEGO" 
                className="bg-white text-red-600 px-8 py-4 rounded-lg font-black text-lg hover:bg-gray-100 transition-colors shadow-lg flex items-center"
              >
                <Phone className="h-6 w-6 mr-3" />
                +971-800-TASKEGO
              </a>
              <Badge className="bg-white text-red-600 px-4 py-2 text-lg font-bold">
                Available 24/7
              </Badge>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}