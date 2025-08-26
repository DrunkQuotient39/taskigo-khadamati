import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard, Apple, ShieldCheck, Check, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import ScrollReveal from '@/components/common/ScrollReveal';

interface PaymentProps {
  messages: any;
}

const paymentSchema = z.object({
  paymentMethod: z.enum(['card', 'apple_pay']),
  cardNumber: z.string().regex(/^\d{16}$/, 'Must be 16 digits').optional(),
  cardHolder: z.string().min(3, 'Must be at least 3 characters').optional(),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/, 'Must be in MM/YY format').optional(),
  cvv: z.string().regex(/^\d{3,4}$/, 'Must be 3-4 digits').optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

export default function Payment({ messages }: PaymentProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  
  // Get booking data from URL params
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const bookingId = params.get('booking_id');
      const amount = params.get('amount');
      const serviceName = params.get('service');
      
      if (bookingId && amount) {
        setBookingDetails({
          id: bookingId,
          amount: amount,
          serviceName: serviceName || 'Service',
          date: new Date().toLocaleDateString(),
        });
      }
    } catch (error) {
      console.error('Error parsing URL params:', error);
    }
  }, []);

  const form = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: 'card',
      cardNumber: '',
      cardHolder: '',
      expiry: '',
      cvv: '',
    },
  });

  const watchPaymentMethod = form.watch('paymentMethod');

  const onSubmit = async (data: PaymentForm) => {
    setIsSubmitting(true);
    
    try {
      if (!bookingDetails) {
        toast({
          title: 'Missing booking information',
          description: 'Booking details are required to process payment.',
          variant: 'destructive',
        });
        return;
      }
      
      const fbUser = auth.currentUser;
      if (!fbUser) {
        toast({
          title: 'Authentication required',
          description: 'Please sign in to proceed with payment.',
          variant: 'destructive',
        });
        return;
      }
      
      // Process dummy payment
      const idToken = await fbUser.getIdToken(true);
      const method = data.paymentMethod;
      
      // Simulate API call
      setTimeout(async () => {
        try {
          const paymentRes = await fetch('/api/payments/process', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({
              bookingId: bookingDetails.id,
              amount: bookingDetails.amount,
              paymentMethod: method,
              // Include masked card info for demonstration
              cardDetails: method === 'card' ? {
                last4: data.cardNumber?.slice(-4) || '****',
                expiry: data.expiry,
              } : undefined,
            }),
          });
          
          if (!paymentRes.ok) {
            throw new Error('Payment processing failed');
          }
          
          toast({
            title: 'Payment Successful!',
            description: `Your payment of $${bookingDetails.amount} has been processed successfully.`,
          });
          
          // Redirect to success page or booking details
          setTimeout(() => {
            window.location.href = '/my-bookings';
          }, 2000);
        } catch (error) {
          console.error('Payment error:', error);
          toast({
            title: 'Payment Failed',
            description: 'There was an error processing your payment. Please try again.',
            variant: 'destructive',
          });
        } finally {
          setIsSubmitting(false);
        }
      }, 1500); // Simulate network delay
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: 'Form Error',
        description: 'Please check your payment details and try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-khadamati-light">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <ScrollReveal>
            <h1 className="text-4xl font-bold text-khadamati-dark mb-4">
              {messages.payment?.title || 'Payment'}
            </h1>
            <p className="text-xl text-khadamati-gray">
              {messages.payment?.description || 'Complete your payment securely.'}
            </p>
          </ScrollReveal>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <ScrollReveal>
              <Card className="bg-white shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-khadamati-blue to-khadamati-yellow text-white">
                  <CardTitle className="text-2xl font-bold">
                    {messages.payment?.form_title || 'Payment Details'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Payment Method Selection */}
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel>
                              {messages.payment?.method || 'Payment Method'}
                            </FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-3"
                              >
                                <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                                  <RadioGroupItem value="card" id="card" />
                                  <label htmlFor="card" className="flex items-center space-x-2 cursor-pointer flex-1">
                                    <CreditCard className="h-5 w-5 text-khadamati-blue" />
                                    <div>
                                      <div className="font-medium text-gray-900">Credit / Debit Card</div>
                                      <div className="text-sm text-gray-500">Pay with Visa, Mastercard, etc.</div>
                                    </div>
                                  </label>
                                </div>
                                <div className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer">
                                  <RadioGroupItem value="apple_pay" id="apple_pay" />
                                  <label htmlFor="apple_pay" className="flex items-center space-x-2 cursor-pointer flex-1">
                                    <Apple className="h-5 w-5 text-black" />
                                    <div>
                                      <div className="font-medium text-gray-900">Apple Pay</div>
                                      <div className="text-sm text-gray-500">Fast and secure payment</div>
                                    </div>
                                  </label>
                                </div>
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Card Details - Only show if card is selected */}
                      {watchPaymentMethod === 'card' && (
                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="cardNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Card Number</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="•••• •••• •••• ••••"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="cardHolder"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Card Holder Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="John Doe"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="expiry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Expiry Date</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="MM/YY"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="cvv"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CVV</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="password"
                                      placeholder="•••"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      )}
                      
                      {watchPaymentMethod === 'apple_pay' && (
                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                          <Apple className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-gray-700">Apple Pay will be activated when you confirm your payment.</p>
                        </div>
                      )}
                      
                      <div className="p-4 bg-blue-50 rounded-lg flex items-start space-x-2">
                        <Info className="h-5 w-5 text-khadamati-blue mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-700">
                          This is a test payment system. No real payments will be processed.
                          For testing, use "4242424242424242" as the card number, any future date for expiry, and any 3 digits for CVV.
                        </p>
                      </div>
                      
                      <div className="flex items-center pt-4 mt-2">
                        <ShieldCheck className="h-5 w-5 text-khadamati-blue mr-2" />
                        <span className="text-sm text-gray-600">Secure payment processing</span>
                      </div>
                      
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-khadamati-blue hover:bg-blue-700 text-white font-semibold text-lg"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Processing...
                          </div>
                        ) : (
                          <>
                            {messages.payment?.submit || 'Complete Payment'} 
                            {bookingDetails?.amount && `($${bookingDetails.amount})`}
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
          
          {/* Order Summary */}
          <div className="md:col-span-1">
            <ScrollReveal delay={200}>
              <Card className="bg-white shadow-lg border-0">
                <CardHeader className="bg-gray-50 border-b">
                  <CardTitle className="text-lg font-semibold text-khadamati-dark">
                    {messages.payment?.summary || 'Order Summary'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {bookingDetails ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <p className="text-khadamati-gray text-sm">Service</p>
                        <p className="font-medium">{bookingDetails.serviceName || 'Service Booking'}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-khadamati-gray text-sm">Booking ID</p>
                        <p className="font-medium">{bookingDetails.id}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-khadamati-gray text-sm">Date</p>
                        <p className="font-medium">{bookingDetails.date}</p>
                      </div>
                      
                      <div className="border-t pt-4 mt-2">
                        <div className="flex justify-between items-center">
                          <p className="text-khadamati-gray">Subtotal</p>
                          <p className="font-medium">${bookingDetails.amount}</p>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-khadamati-gray">Service Fee</p>
                          <p className="font-medium">$0.00</p>
                        </div>
                        <div className="flex justify-between items-center font-semibold text-lg mt-4">
                          <p>Total</p>
                          <p>${bookingDetails.amount}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                      <p className="text-khadamati-gray">No booking details found.</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => window.location.href = '/booking'}
                      >
                        Create a Booking
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
