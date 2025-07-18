import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import ScrollReveal from '@/components/common/ScrollReveal';

interface ContactProps {
  messages: any;
}

const contactSchema = z.object({
  name: z.string().min(1, 'Please enter your name'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(1, 'Please enter a subject'),
  message: z.string().min(10, 'Please enter a message with at least 10 characters'),
});

type ContactForm = z.infer<typeof contactSchema>;

export default function Contact({ messages }: ContactProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  const onSubmit = async (data: ContactForm) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Message Sent!',
        description: 'Thank you for your message. We will get back to you soon.',
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: 'Failed to Send',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: messages.contact_page?.address?.title || 'Address',
      content: '123 Business Street, Tech City, TC 12345',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: messages.contact_page?.phone?.title || 'Phone',
      content: '+1 (555) 123-4567',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: <Mail className="h-6 w-6" />,
      title: messages.contact_page?.email?.title || 'Email',
      content: 'support@taskego.com',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: messages.contact_page?.hours?.title || 'Business Hours',
      content: 'Mon - Fri: 9:00 AM - 6:00 PM\nSat - Sun: 10:00 AM - 4:00 PM',
      color: 'bg-orange-100 text-orange-600'
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
                {messages.contact_page?.title || 'Contact Us'}
              </h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto">
                {messages.contact_page?.description || 'We\'re here to help. Get in touch with us for any questions or support.'}
              </p>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-20 bg-khadamati-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="bg-white shadow-lg border-0 text-center h-full">
                  <CardContent className="p-8">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${info.color}`}>
                      {info.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-khadamati-dark mb-3">
                      {info.title}
                    </h3>
                    <p className="text-khadamati-gray whitespace-pre-line">
                      {info.content}
                    </p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <ScrollReveal>
              <Card className="bg-khadamati-light border-0 shadow-xl">
                <CardContent className="p-8">
                  <h2 className="text-3xl font-bold text-khadamati-dark mb-6">
                    {messages.contact_page?.form?.title || 'Send us a message'}
                  </h2>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {messages.contact_page?.form?.name || 'Name'}
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Your name..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {messages.contact_page?.form?.email || 'Email'}
                              </FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="Your email..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {messages.contact_page?.form?.subject || 'Subject'}
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Message subject..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {messages.contact_page?.form?.message || 'Message'}
                            </FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Your message..."
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-khadamati-blue hover:bg-blue-700 text-white font-semibold"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Sending...' : (messages.contact_page?.form?.submit || 'Send Message')}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Map Placeholder */}
            <ScrollReveal delay={200}>
              <Card className="bg-white border-0 shadow-xl h-full">
                <CardContent className="p-0 h-full">
                  <div className="w-full h-full min-h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-khadamati-blue mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-khadamati-dark mb-2">
                        Find Us Here
                      </h3>
                      <p className="text-khadamati-gray">
                        Interactive map would be displayed here
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-khadamati-light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <ScrollReveal>
              <h2 className="text-4xl font-bold text-khadamati-dark mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-khadamati-gray">
                Quick answers to common questions
              </p>
            </ScrollReveal>
          </div>

          <div className="space-y-6">
            {[
              {
                question: 'How do I book a service?',
                answer: 'You can book a service by browsing our services page, selecting your preferred provider, and filling out the booking form with your details and preferred time.'
              },
              {
                question: 'Are all service providers verified?',
                answer: 'Yes, all our service providers go through a comprehensive verification process including background checks, skill assessments, and reference verification.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards, debit cards, and digital payment methods. Payment is processed securely through our platform.'
              },
              {
                question: 'Can I cancel or reschedule my booking?',
                answer: 'Yes, you can cancel or reschedule your booking up to 24 hours before the scheduled time without any charges.'
              }
            ].map((faq, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <Card className="bg-white shadow-lg border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-khadamati-dark mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-khadamati-gray">
                      {faq.answer}
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
