import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, DollarSign, Star, Briefcase, TrendingUp, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ScrollReveal from '@/components/common/ScrollReveal';
import AnimatedCounter from '@/components/common/AnimatedCounter';

interface ProviderDashboardProps {
  messages: any;
}

export default function ProviderDashboard({ messages }: ProviderDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Check if user is authenticated and is an approved provider
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Redirect to login if not authenticated
        setLocation('/login?redirect=/provider-dashboard');
      } else if (user.role !== 'provider') {
        // If user is authenticated but not an approved provider, redirect to pending approval
        setLocation('/pending-approval');
      }
    }
  }, [user, isLoading, setLocation]);

  // Live data from API
  const { data: stats } = useQuery({
    queryKey: ['/api/provider/stats'],
    queryFn: async () => {
      const res = await fetch('/api/provider/stats', { credentials: 'include' });
      return res.json();
    }
  });

  const { data: recentBookings } = useQuery({
    queryKey: ['/api/provider/bookings', selectedPeriod],
    queryFn: async () => {
      const res = await fetch(`/api/provider/bookings?period=${selectedPeriod}`, { credentials: 'include' });
      return res.json();
    }
  });

  const { data: services } = useQuery({
    queryKey: ['/api/provider/services'],
    queryFn: async () => {
      const res = await fetch('/api/provider/services', { credentials: 'include' });
      return res.json();
    }
  });

  

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  // Show loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen bg-khadamati-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 bg-khadamati-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <ScrollReveal>
            <h1 className="text-4xl font-bold text-khadamati-dark mb-4">
              {messages.provider_dashboard?.title || 'Provider Dashboard'}
            </h1>
            <p className="text-xl text-khadamati-gray">
              {messages.provider_dashboard?.description || 'Manage your services and bookings.'}
            </p>
          </ScrollReveal>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <ScrollReveal>
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-khadamati-gray text-sm font-medium">
                      {messages.provider_dashboard?.stats?.total_bookings || 'Total Bookings'}
                    </p>
                    <p className="text-3xl font-bold text-khadamati-dark">
                      <AnimatedCounter end={stats?.totalBookings || 0} />
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-khadamati-blue rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-khadamati-gray text-sm font-medium">
                      {messages.provider_dashboard?.stats?.earnings || 'Total Earnings'}
                    </p>
                    <p className="text-3xl font-bold text-khadamati-dark">
                      $<AnimatedCounter end={stats?.totalEarnings || 0} />
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-khadamati-success rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-khadamati-gray text-sm font-medium">
                      {messages.provider_dashboard?.stats?.rating || 'Average Rating'}
                    </p>
                    <p className="text-3xl font-bold text-khadamati-dark">
                      <AnimatedCounter end={stats?.averageRating || 0} suffix="" />
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-khadamati-yellow rounded-lg flex items-center justify-center">
                    <Star className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-khadamati-gray text-sm font-medium">
                      {messages.provider_dashboard?.stats?.active_services || 'Active Services'}
                    </p>
                    <p className="text-3xl font-bold text-khadamati-dark">
                      <AnimatedCounter end={stats?.activeServices || 0} />
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-khadamati-info rounded-lg flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Recent Bookings */}
        <ScrollReveal delay={400}>
          <Card className="bg-white shadow-lg border-0 mb-12">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold text-khadamati-dark">
                  {messages.provider_dashboard?.recent_bookings || 'Recent Bookings'}
                </CardTitle>
                <Button variant="outline" size="sm">
                  {messages.provider_dashboard?.view_all || 'View All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{messages.provider_dashboard?.table?.client || 'Client'}</TableHead>
                      <TableHead>{messages.provider_dashboard?.table?.service || 'Service'}</TableHead>
                      <TableHead>{messages.provider_dashboard?.table?.date || 'Date'}</TableHead>
                      <TableHead>{messages.provider_dashboard?.table?.status || 'Status'}</TableHead>
                      <TableHead>{messages.provider_dashboard?.table?.amount || 'Amount'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentBookings?.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={booking.clientAvatar} alt={booking.clientName} />
                              <AvatarFallback>
                                {booking.clientName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{booking.clientName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{booking.service}</TableCell>
                        <TableCell>{booking.date}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(booking.status)}>
                            {getStatusLabel(booking.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">${booking.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* Service Management */}
        <ScrollReveal delay={500}>
          <Card className="bg-white shadow-lg border-0">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold text-khadamati-dark">
                  {messages.provider_dashboard?.services || 'My Services'}
                </CardTitle>
                <Button className="bg-khadamati-blue hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  {messages.provider_dashboard?.add_service || 'Add Service'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services?.map((service) => (
                  <Card key={service.id} className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-khadamati-dark mb-2">
                            {service.title}
                          </h3>
                          <p className="text-khadamati-gray text-sm mb-3">
                            {service.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-khadamati-gray">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {service.bookings} bookings
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-khadamati-yellow" />
                              {service.rating}
                            </span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-khadamati-blue">
                          ${service.price}/{service.priceType === 'hourly' ? 'hour' : 'job'}
                        </span>
                        <Badge className={service.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {service.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </div>
  );
}
