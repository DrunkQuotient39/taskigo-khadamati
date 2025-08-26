import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, AlertCircle, ArrowLeft, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import ScrollReveal from '@/components/common/ScrollReveal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { Link } from 'wouter';

interface BookingDetailProps {
  messages: any;
}

export default function BookingDetail({ messages }: BookingDetailProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  
  // Get booking ID from URL
  const [, params] = useRoute('/my-bookings/:id');
  const bookingId = params?.id;

  // Mock booking data for testing notifications (IDs 123, 124, 125)
  const getMockBooking = () => {
    // Mock data for the "Booking Confirmed" notification
    if (bookingId === '123') {
      return {
        id: 123,
        serviceId: 456,
        service: {
          id: 456,
          title: 'AC Repair - Quick Fix',
          titleAr: 'إصلاح التكييف - إصلاح سريع',
          price: '80.00',
          imageUrl: '/images/services/ac-repair.jpg'
        },
        providerId: 789,
        provider: {
          id: 789,
          businessName: 'CoolFix AC Services',
          email: 'info@coolfix.example.com',
          phone: '+1234567890'
        },
        clientId: user?.id,
        scheduledDate: '2024-03-10',
        scheduledTime: '14:30',
        duration: 120,
        clientAddress: '123 Main St, Beirut, Lebanon',
        clientPhone: '+9611234567',
        totalAmount: '80.00',
        status: 'accepted',  // This one is "accepted" to match the notification
        paymentStatus: 'pending',
        specialInstructions: 'The AC unit is on the second floor, access through main staircase.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    // Mock data for the "New Message" notification
    else if (bookingId === '124') {
      return {
        id: 124,
        serviceId: 457,
        service: {
          id: 457,
          title: 'AC Repair - Complete Service',
          titleAr: 'إصلاح التكييف - خدمة كاملة',
          price: '150.00',
          imageUrl: '/images/services/ac-repair-full.jpg'
        },
        providerId: 789,
        provider: {
          id: 789,
          businessName: 'CoolFix AC Services',
          email: 'info@coolfix.example.com',
          phone: '+1234567890'
        },
        clientId: user?.id,
        scheduledDate: '2024-03-15',
        scheduledTime: '10:00',
        duration: 180,
        clientAddress: '456 Park Ave, Beirut, Lebanon',
        clientPhone: '+9611234567',
        totalAmount: '150.00',
        status: 'accepted',
        paymentStatus: 'paid',
        specialInstructions: 'Please call 10 minutes before arrival.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    // Mock data for the "Service Reminder" notification
    else if (bookingId === '125') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return {
        id: 125,
        serviceId: 458,
        service: {
          id: 458,
          title: 'Home Cleaning - Standard',
          titleAr: 'تنظيف المنزل - قياسي',
          price: '60.00',
          imageUrl: '/images/services/cleaning.jpg'
        },
        providerId: 790,
        provider: {
          id: 790,
          businessName: 'CleanPro Services',
          email: 'service@cleanpro.example.com',
          phone: '+9611234568'
        },
        clientId: user?.id,
        scheduledDate: tomorrow.toISOString().split('T')[0],  // Tomorrow
        scheduledTime: '09:00',
        duration: 180,
        clientAddress: '789 Beach Rd, Beirut, Lebanon',
        clientPhone: '+9611234567',
        totalAmount: '60.00',
        status: 'pending',
        paymentStatus: 'pending',
        specialInstructions: 'Please bring eco-friendly cleaning supplies.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    return null;
  };
  
  // Check if we need to return mock data
  const mockBooking = getMockBooking();
  
  // Always enable the query even if no user is logged in (for mock data)
  const mockEnabled = !!bookingId && (bookingId === '123' || bookingId === '124' || bookingId === '125');

  // Fetch booking details
  const { data: booking, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/bookings', bookingId],
    queryFn: async () => {
      // Return mock data for test IDs regardless of login status
      if (mockBooking) {
        console.log("Returning mock booking data for ID:", bookingId);
        // Delay a bit to simulate network request
        await new Promise(r => setTimeout(r, 500));
        return mockBooking;
      }
      
      if (!user?.id || !bookingId) return null;
      
      const fbUser = auth.currentUser;
      if (!fbUser) return null;
      
      try {
        const idToken = await fbUser.getIdToken(true);
        const res = await fetch(`/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${idToken}` },
          credentials: 'include',
        });
        
        if (!res.ok) {
          throw new Error('Failed to fetch booking details');
        }
        
        const data = await res.json();
        return data.booking;
      } catch (error) {
        console.error('Error fetching booking:', error);
        throw error;
      }
    },
    // Enable for either real authenticated users OR mock bookings
    enabled: (!!user?.id && !!bookingId) || mockEnabled,
    retry: 1,
  });

  // Handle booking cancellation
  const handleCancelBooking = async () => {
    if (!booking || !cancelReason || cancelReason.length < 10) {
      toast({
        title: 'Invalid reason',
        description: 'Please provide a detailed reason for cancellation (at least 10 characters)',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const fbUser = auth.currentUser;
      if (!fbUser) return;
      
      const idToken = await fbUser.getIdToken(true);
      const res = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        credentials: 'include',
        body: JSON.stringify({ cancellationReason: cancelReason }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to cancel booking');
      }
      
      toast({
        title: 'Booking Cancelled',
        description: 'Your booking has been cancelled successfully',
      });
      
      setCancelDialog(false);
      setCancelReason('');
      refetch();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel booking',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: messages.my_bookings?.status?.pending || 'Pending' },
      accepted: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: messages.my_bookings?.status?.accepted || 'Accepted' },
      in_progress: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: messages.my_bookings?.status?.in_progress || 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800 border-green-200', label: messages.my_bookings?.status?.completed || 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-200', label: messages.my_bookings?.status?.cancelled || 'Cancelled' },
    };
    
    const config = statusMap[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status };
    
    return (
      <Badge className={`${config.color} border`}>
        {config.label}
      </Badge>
    );
  };

  const getPaymentBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      paid: { color: 'bg-green-100 text-green-800 border-green-200', label: messages.my_bookings?.payment_status?.paid || 'Paid' },
      pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: messages.my_bookings?.payment_status?.pending || 'Pending' },
      failed: { color: 'bg-red-100 text-red-800 border-red-200', label: messages.my_bookings?.payment_status?.failed || 'Failed' },
      refunded: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: messages.my_bookings?.payment_status?.refunded || 'Refunded' },
    };
    
    const config = statusMap[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status };
    
    return (
      <Badge variant="outline" className={`${config.color} border`}>
        {config.label}
      </Badge>
    );
  };

  // Show error message if booking cannot be found
  if (error) {
    return (
      <div className="min-h-screen pt-20 pb-12 bg-khadamati-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center bg-white p-8 rounded-lg shadow-sm">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-khadamati-dark mb-2">Booking Not Found</h2>
            <p className="text-khadamati-gray mb-6">The booking you're looking for could not be found or you don't have permission to view it.</p>
            <Link href="/my-bookings">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to My Bookings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state with more debugging info
  if (isLoading || !booking) {
    console.log("Booking data:", { bookingId, mockBooking, isLoading, user });
    return (
      <div className="min-h-screen pt-20 pb-12 bg-khadamati-light">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/my-bookings" className="inline-flex items-center text-khadamati-blue hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {messages.my_bookings?.title || 'My Bookings'}
          </Link>
          <h1 className="text-3xl font-bold text-khadamati-dark mb-4">
            {messages.my_bookings?.booking_details || 'Booking Details'}
          </h1>
          <p className="text-khadamati-gray mb-8">
            Booking #{bookingId}
          </p>
          
          <Card className="bg-white shadow overflow-hidden">
            <CardContent className="p-6 md:p-8 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-khadamati-blue mb-4"></div>
              <p className="text-khadamati-gray">Loading booking details...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-khadamati-light">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/my-bookings" className="inline-flex items-center text-khadamati-blue hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {messages.my_bookings?.title || 'My Bookings'}
          </Link>
          <ScrollReveal>
            <h1 className="text-3xl font-bold text-khadamati-dark">
              {messages.my_bookings?.booking_details || 'Booking Details'}
            </h1>
            <p className="text-khadamati-gray">
              Booking #{booking.id}
            </p>
          </ScrollReveal>
        </div>
        
        {/* Removed ScrollReveal that might be causing rendering issues */}
        <div className="mb-6">
          <Card className="bg-white shadow overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-khadamati-dark">
                  {booking.service?.title || 'Service Booking'}
                </h2>
                {getStatusBadge(booking.status)}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-khadamati-gray mb-2">
                    {messages.my_bookings?.date_time || 'Date & Time'}
                  </h3>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-khadamati-blue mr-2" />
                    <div>
                      <div className="text-khadamati-dark">
                        {new Date(booking.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 text-khadamati-blue mr-2" />
                        <span className="text-khadamati-gray">{booking.scheduledTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {booking.duration && (
                  <div>
                    <h3 className="text-sm font-semibold text-khadamati-gray mb-2">
                      {messages.my_bookings?.duration || 'Duration'}
                    </h3>
                    <div className="text-khadamati-dark">
                      {booking.duration} minutes
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-semibold text-khadamati-gray mb-2">
                    {messages.my_bookings?.location || 'Location'}
                  </h3>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-khadamati-blue mr-2 mt-0.5" />
                    <div className="text-khadamati-dark">
                      {booking.clientAddress}
                    </div>
                  </div>
                </div>
                
                {booking.clientPhone && (
                  <div>
                    <h3 className="text-sm font-semibold text-khadamati-gray mb-2">
                      {messages.my_bookings?.phone || 'Phone'}
                    </h3>
                    <div className="text-khadamati-dark">
                      {booking.clientPhone}
                    </div>
                  </div>
                )}
                
                <div className="md:col-span-2">
                  <h3 className="text-sm font-semibold text-khadamati-gray mb-2">
                    {messages.my_bookings?.provider || 'Provider'}
                  </h3>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-khadamati-blue text-white flex items-center justify-center mr-3">
                      {booking.provider?.businessName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <div className="text-khadamati-dark font-medium">
                        {booking.provider?.businessName || 'Not assigned yet'}
                      </div>
                      {booking.provider?.email && (
                        <div className="text-sm text-khadamati-gray">
                          {booking.provider.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {booking.specialInstructions && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-semibold text-khadamati-gray mb-2">
                      {messages.my_bookings?.special_instructions || 'Special Instructions'}
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-md text-khadamati-dark">
                      {booking.specialInstructions}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-khadamati-dark mb-4">
                  {messages.my_bookings?.payment || 'Payment'}
                </h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-khadamati-gray">
                      {messages.my_bookings?.total_amount || 'Total Amount'}
                    </span>
                    <span className="text-xl font-bold text-khadamati-dark">${booking.totalAmount}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-khadamati-gray">
                      {messages.my_bookings?.payment_status_label || 'Payment Status'}
                    </span>
                    {getPaymentBadge(booking.paymentStatus)}
                  </div>
                </div>
              </div>
              
              {booking.cancellationReason && (
                <div className="mt-6 bg-red-50 p-4 rounded-md">
                  <div className="flex items-center mb-2 text-red-700">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <h3 className="font-semibold">Cancellation Reason</h3>
                  </div>
                  <p className="text-red-700">{booking.cancellationReason}</p>
                </div>
              )}
              
              {/* Action buttons section */}
              <div className="mt-8 border-t pt-6 flex flex-wrap gap-4 justify-end">
                {/* Show cancel button for pending or accepted bookings */}
                {(booking.status === 'pending' || booking.status === 'accepted') && (
                  <Button 
                    variant="destructive" 
                    onClick={() => setCancelDialog(true)}
                    className="flex items-center"
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {messages.my_bookings?.cancel_booking || 'Cancel Booking'}
                  </Button>
                )}
                
                {/* Show reschedule button for pending or accepted bookings */}
                {(booking.status === 'pending' || booking.status === 'accepted') && (
                  <Button 
                    variant="outline"
                    className="flex items-center"
                    onClick={() => toast({
                      title: messages.general?.coming_soon || "Coming Soon",
                      description: messages.general?.feature_in_development || "This feature is under development",
                    })}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {messages.my_bookings?.reschedule || 'Reschedule'}
                  </Button>
                )}
                
                {/* Show contact provider button for all active bookings */}
                {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                  <Button 
                    variant="secondary"
                    className="flex items-center"
                    onClick={() => window.location.href = `/chat?provider=${booking.provider?.id || ''}&booking=${booking.id || ''}`}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {messages.my_bookings?.contact_provider || 'Contact Provider'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialog} onOpenChange={(open) => !open && setCancelDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{messages.my_bookings?.cancel_booking || 'Cancel Booking'}</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancellation. This will help us improve our services.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="cancelReason" className="text-sm font-medium text-gray-700">
                {messages.my_bookings?.cancel_reason || 'Cancellation Reason'} (minimum 10 characters)
              </label>
              <textarea
                id="cancelReason"
                className="w-full rounded-md border border-gray-300 p-3 min-h-[100px]"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please explain why you're cancelling this booking..."
              />
              {cancelReason && cancelReason.length < 10 && (
                <p className="text-xs text-red-500">Reason must be at least 10 characters</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-4">
              <Button variant="outline" onClick={() => setCancelDialog(false)}>
                {messages.common?.cancel || 'Back'}
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancelBooking}
                disabled={!cancelReason || cancelReason.length < 10}
              >
                {messages.my_bookings?.cancel_confirm || 'Confirm Cancellation'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
