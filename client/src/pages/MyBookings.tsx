import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Clock, MapPin, ChevronRight, Check, X, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ScrollReveal from '@/components/common/ScrollReveal';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';

interface MyBookingsProps {
  messages: any;
}

export default function MyBookings({ messages }: MyBookingsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Fetch bookings when user is authenticated
  const { data: bookings = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/bookings/client', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const fbUser = auth.currentUser;
      if (!fbUser) return [];
      
      const idToken = await fbUser.getIdToken(true);
      const res = await fetch(`/api/bookings/client/${user.id}`, {
        headers: { Authorization: `Bearer ${idToken}` },
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch bookings');
      }
      
      const data = await res.json();
      return data.bookings || [];
    },
    enabled: !!user?.id,
  });

  // Get booking details
  const fetchBookingDetails = async (bookingId: number) => {
    try {
      const fbUser = auth.currentUser;
      if (!fbUser) return;
      
      const idToken = await fbUser.getIdToken(true);
      const res = await fetch(`/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${idToken}` },
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch booking details');
      }
      
      const data = await res.json();
      setSelectedBooking(data.booking);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load booking details',
        variant: 'destructive',
      });
    }
  };

  // Cancel booking
  const handleCancelBooking = async () => {
    if (!selectedBooking || !cancelReason || cancelReason.length < 10) {
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
      const res = await fetch(`/api/bookings/${selectedBooking.id}/cancel`, {
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
      setSelectedBooking(null);
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
      pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Pending' },
      accepted: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Accepted' },
      in_progress: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Cancelled' },
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
      paid: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Paid' },
      pending: { color: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Pending' },
      failed: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Failed' },
      refunded: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'Refunded' },
    };
    
    const config = statusMap[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: status };
    
    return (
      <Badge variant="outline" className={`${config.color} border`}>
        {config.label}
      </Badge>
    );
  };

  const filterBookingsByStatus = (status: string | string[]) => {
    return bookings.filter((booking: any) => 
      Array.isArray(status) ? status.includes(booking.status) : booking.status === status
    );
  };

  const pendingBookings = filterBookingsByStatus(['pending', 'accepted', 'in_progress']);
  const completedBookings = filterBookingsByStatus('completed');
  const cancelledBookings = filterBookingsByStatus('cancelled');

  return (
    <div className="min-h-screen pt-20 pb-12 bg-khadamati-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <ScrollReveal>
            <h1 className="text-4xl font-bold text-khadamati-dark mb-4">
              {messages.my_bookings?.title || 'My Bookings'}
            </h1>
            <p className="text-xl text-khadamati-gray">
              {messages.my_bookings?.description || 'Manage all your bookings in one place.'}
            </p>
          </ScrollReveal>
        </div>

        <ScrollReveal delay={100}>
          <Tabs defaultValue="upcoming" className="mb-12">
            <TabsList className="mb-8">
              <TabsTrigger value="upcoming" className="text-base px-6 py-3">
                {messages.my_bookings?.tabs?.upcoming || 'Upcoming'} ({pendingBookings.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-base px-6 py-3">
                {messages.my_bookings?.tabs?.completed || 'Completed'} ({completedBookings.length})
              </TabsTrigger>
              <TabsTrigger value="cancelled" className="text-base px-6 py-3">
                {messages.my_bookings?.tabs?.cancelled || 'Cancelled'} ({cancelledBookings.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="upcoming" className="space-y-4">
              {isLoading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-khadamati-blue mx-auto"></div>
                  <p className="mt-4 text-khadamati-gray">Loading bookings...</p>
                </div>
              ) : pendingBookings.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-lg shadow-sm">
                  <CalendarIcon className="h-12 w-12 text-khadamati-gray mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-khadamati-dark mb-2">No Upcoming Bookings</h3>
                  <p className="text-khadamati-gray">You don't have any upcoming bookings at the moment.</p>
                  <Button className="mt-6 bg-khadamati-blue hover:bg-blue-700" onClick={() => window.location.href = '/services'}>
                    Book a Service
                  </Button>
                </div>
              ) : (
                pendingBookings.map((booking: any) => (
                  <Card key={booking.id} className="bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="p-6 flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-khadamati-dark">
                                {booking.service?.title || 'Service Booking'}
                              </h3>
                              <p className="text-khadamati-gray text-sm">
                                {booking.provider?.businessName || 'Provider'}
                              </p>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>
                          
                          <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-khadamati-gray">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2 text-khadamati-gray">
                              <Clock className="h-4 w-4" />
                              <span>{booking.scheduledTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-khadamati-gray">
                              <MapPin className="h-4 w-4" />
                              <span>{booking.clientAddress}</span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-khadamati-dark font-semibold">${booking.totalAmount}</span>
                              <span className="text-khadamati-gray text-sm ml-2">
                                {getPaymentBadge(booking.paymentStatus)}
                              </span>
                            </div>
                            <Button 
                              variant="ghost" 
                              className="text-khadamati-blue hover:bg-blue-50" 
                              onClick={() => fetchBookingDetails(booking.id)}
                            >
                              View Details <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </div>
                        </div>
                        
                        {booking.status === 'pending' && (
                          <div className="bg-gray-50 p-4 md:p-6 flex flex-row md:flex-col justify-center items-center gap-3">
                            <Button variant="ghost" className="w-full text-red-500 hover:bg-red-50 hover:text-red-600" 
                              onClick={() => {
                                setSelectedBooking(booking);
                                setCancelDialog(true);
                              }}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="completed" className="space-y-4">
              {isLoading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-khadamati-blue mx-auto"></div>
                  <p className="mt-4 text-khadamati-gray">Loading bookings...</p>
                </div>
              ) : completedBookings.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-lg shadow-sm">
                  <Check className="h-12 w-12 text-khadamati-gray mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-khadamati-dark mb-2">No Completed Bookings</h3>
                  <p className="text-khadamati-gray">You haven't completed any bookings yet.</p>
                </div>
              ) : (
                completedBookings.map((booking: any) => (
                  <Card key={booking.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-khadamati-dark">
                            {booking.service?.title || 'Service Booking'}
                          </h3>
                          <p className="text-khadamati-gray text-sm">
                            {booking.provider?.businessName || 'Provider'}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-khadamati-gray">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-khadamati-dark font-semibold">${booking.totalAmount}</span>
                          <span className="text-khadamati-gray text-sm ml-2">
                            {getPaymentBadge(booking.paymentStatus)}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          className="text-khadamati-blue hover:bg-blue-50" 
                          onClick={() => fetchBookingDetails(booking.id)}
                        >
                          View Details <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="cancelled" className="space-y-4">
              {isLoading ? (
                <div className="py-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-khadamati-blue mx-auto"></div>
                  <p className="mt-4 text-khadamati-gray">Loading bookings...</p>
                </div>
              ) : cancelledBookings.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-lg shadow-sm">
                  <X className="h-12 w-12 text-khadamati-gray mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-khadamati-dark mb-2">No Cancelled Bookings</h3>
                  <p className="text-khadamati-gray">You haven't cancelled any bookings.</p>
                </div>
              ) : (
                cancelledBookings.map((booking: any) => (
                  <Card key={booking.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-khadamati-dark">
                            {booking.service?.title || 'Service Booking'}
                          </h3>
                          <p className="text-khadamati-gray text-sm">
                            {booking.provider?.businessName || 'Provider'}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="space-y-2 mb-6">
                        <div className="flex items-center gap-2 text-khadamati-gray">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        {booking.cancellationReason && (
                          <div className="bg-red-50 p-3 rounded-md text-sm text-red-700 mt-2">
                            <div className="font-semibold mb-1 flex items-center">
                              <AlertCircle className="h-4 w-4 mr-2" />
                              Reason for cancellation:
                            </div>
                            <p>{booking.cancellationReason}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-khadamati-dark font-semibold">${booking.totalAmount}</span>
                          <span className="text-khadamati-gray text-sm ml-2">
                            {getPaymentBadge(booking.paymentStatus)}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          className="text-khadamati-blue hover:bg-blue-50" 
                          onClick={() => fetchBookingDetails(booking.id)}
                        >
                          View Details <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </ScrollReveal>
      </div>

      {/* Booking Details Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedBooking && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Booking Details</DialogTitle>
                <DialogDescription>
                  Booking #{selectedBooking.id}
                </DialogDescription>
              </DialogHeader>
              
              <div className="mt-6 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-khadamati-dark">
                    {selectedBooking.service?.title || 'Service Booking'}
                  </h3>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-khadamati-gray mb-2">Date & Time</h4>
                    <div className="text-khadamati-dark">
                      {new Date(selectedBooking.scheduledDate).toLocaleDateString()} at {selectedBooking.scheduledTime}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-khadamati-gray mb-2">Duration</h4>
                    <div className="text-khadamati-dark">
                      {selectedBooking.duration} minutes
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-khadamati-gray mb-2">Location</h4>
                    <div className="text-khadamati-dark">
                      {selectedBooking.clientAddress}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-khadamati-gray mb-2">Phone</h4>
                    <div className="text-khadamati-dark">
                      {selectedBooking.clientPhone}
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h4 className="text-sm font-semibold text-khadamati-gray mb-2">Provider</h4>
                    <div className="text-khadamati-dark">
                      {selectedBooking.provider?.businessName || 'Not assigned yet'}
                      {selectedBooking.provider?.city && ` · ${selectedBooking.provider?.city}`}
                    </div>
                  </div>
                  
                  {selectedBooking.specialInstructions && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-semibold text-khadamati-gray mb-2">Special Instructions</h4>
                      <div className="text-khadamati-dark p-3 bg-gray-50 rounded-md">
                        {selectedBooking.specialInstructions}
                      </div>
                    </div>
                  )}
                  
                  <div className="md:col-span-2 border-t pt-4 mt-2">
                    <h4 className="text-sm font-semibold text-khadamati-gray mb-2">Payment</h4>
                    <div className="flex justify-between">
                      <div className="text-khadamati-dark">Total Amount</div>
                      <div className="font-semibold">${selectedBooking.totalAmount}</div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <div className="text-khadamati-gray">Payment Status</div>
                      <div>{getPaymentBadge(selectedBooking.paymentStatus)}</div>
                    </div>
                  </div>
                  
                  {selectedBooking.cancellationReason && (
                    <div className="md:col-span-2 bg-red-50 p-3 rounded-md text-sm text-red-700 mt-2">
                      <div className="font-semibold mb-1 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Reason for cancellation:
                      </div>
                      <p>{selectedBooking.cancellationReason}</p>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-6 flex justify-end">
                  {selectedBooking.status === 'pending' && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setSelectedBooking(selectedBooking);
                        setCancelDialog(true);
                      }}
                      className="mr-4"
                    >
                      Cancel Booking
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setSelectedBooking(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Cancel Booking Dialog */}
      <Dialog open={cancelDialog} onOpenChange={(open) => !open && setCancelDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancellation. This will help us improve our services.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="cancelReason" className="text-sm font-medium text-gray-700">
                Cancellation Reason (minimum 10 characters)
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
                Back
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleCancelBooking}
                disabled={!cancelReason || cancelReason.length < 10}
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
