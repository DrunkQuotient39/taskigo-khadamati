import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, MapPin, User, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import ScrollReveal from '@/components/common/ScrollReveal';

interface BookingProps {
  messages: any;
}

const bookingSchema = z.object({
  serviceType: z.string().min(1, 'Please select a service type'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time'),
  location: z.string().min(1, 'Please enter your location'),
  details: z.string().optional(),
  phone: z.string().min(1, 'Please enter your phone number'),
  email: z.string().email('Please enter a valid email address'),
  name: z.string().min(1, 'Please enter your name'),
});

type BookingForm = z.infer<typeof bookingSchema>;

export default function Booking({ messages }: BookingProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      serviceType: '',
      date: '',
      time: '',
      location: '',
      details: '',
      phone: '',
      email: '',
      name: '',
    },
  });

  // Prefill from URL query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const serviceType = params.get('serviceType');
    const date = params.get('date');
    const time = params.get('time');
    const location = params.get('location');
    const details = params.get('details');
    if (serviceType) form.setValue('serviceType', serviceType);
    if (date) form.setValue('date', date);
    if (time) form.setValue('time', time);
    if (location) form.setValue('location', location);
    if (details) form.setValue('details', details);
  }, [form]);

  const onSubmit = async (data: BookingForm) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would make an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Booking Confirmed!',
        description: 'Your service has been booked successfully. You will receive a confirmation email shortly.',
      });
      
      form.reset();
    } catch (error) {
      toast({
        title: 'Booking Failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceTypes = [
    { value: 'cleaning', label: messages.services?.cleaning?.title || 'Cleaning' },
    { value: 'plumbing', label: messages.services?.plumbing?.title || 'Plumbing' },
    { value: 'electrical', label: messages.services?.electrical?.title || 'Electrical' },
    { value: 'delivery', label: messages.services?.delivery?.title || 'Delivery' },
    { value: 'maintenance', label: messages.services?.maintenance?.title || 'Maintenance' },
    { value: 'painting', label: messages.services?.painting?.title || 'Painting' },
    { value: 'gardening', label: messages.services?.gardening?.title || 'Gardening' },
    { value: 'tutoring', label: messages.services?.tutoring?.title || 'Tutoring' },
  ];

  const timeSlots = [
    { value: '09:00', label: '09:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '13:00', label: '01:00 PM' },
    { value: '14:00', label: '02:00 PM' },
    { value: '15:00', label: '03:00 PM' },
    { value: '16:00', label: '04:00 PM' },
    { value: '17:00', label: '05:00 PM' },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 bg-khadamati-light">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <ScrollReveal>
            <h1 className="text-4xl font-bold text-khadamati-dark mb-4">
              {messages.booking_page?.title || 'Book a Service'}
            </h1>
            <p className="text-xl text-khadamati-gray">
              {messages.booking_page?.description || 'Schedule your service in just a few clicks.'}
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={200}>
          <Card className="bg-white shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-khadamati-blue to-khadamati-yellow text-white">
              <CardTitle className="text-2xl font-bold">
                Service Booking Form
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Full Name
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name..." {...field} />
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
                          <FormLabel className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {messages.booking_page?.email || 'Email Address'}
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {messages.booking_page?.phone || 'Phone Number'}
                        </FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="Your phone number..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Service Selection */}
                  <FormField
                    control={form.control}
                    name="serviceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {messages.booking_page?.service_type || 'Service Type'}
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={messages.booking_page?.select_service || 'Select a service...'} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {serviceTypes.map((service) => (
                              <SelectItem key={service.value} value={service.value}>
                                {service.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Date & Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {messages.booking_page?.date || 'Date'}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="date" 
                              min={new Date().toISOString().split('T')[0]}
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {messages.booking_page?.time || 'Time'}
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={messages.booking_page?.select_time || 'Select time...'} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeSlots.map((slot) => (
                                <SelectItem key={slot.value} value={slot.value}>
                                  {slot.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Location */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {messages.booking_page?.location || 'Location'}
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your address..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Additional Details */}
                  <FormField
                    control={form.control}
                    name="details"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {messages.booking_page?.details || 'Additional Details'}
                        </FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your service requirements..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-khadamati-blue hover:bg-blue-700 text-white font-semibold text-lg"
                    >
                      {isSubmitting ? 'Processing...' : (messages.booking_page?.submit || 'Book Service')}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}
