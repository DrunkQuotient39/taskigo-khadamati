import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import ScrollReveal from '@/components/common/ScrollReveal';
import { Check, X, Eye, Users, Building2, Calendar, CreditCard, Star, Bell, Search, Briefcase, TrendingUp, DollarSign } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AnimatedCounter from '@/components/common/AnimatedCounter';

interface AdminPanelProps {
  messages: any;
}

export default function AdminPanel({ messages }: AdminPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [previewDocs, setPreviewDocs] = useState<any[] | null>(null);
  const [location] = useLocation();

  // Live data from API
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error('Not authenticated');
      const idToken = await fbUser.getIdToken(true);
      const res = await fetch('/api/admin/stats', { 
        credentials: 'include',
        headers: { Authorization: `Bearer ${idToken}` }
      });
      return res.json();
    }
  });

  const { data: pending = { providers: [], services: [], counts: {} }, refetch } = useQuery({
    queryKey: ['/api/admin/pending-approvals'],
    queryFn: async () => {
      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error('Not authenticated');
      const idToken = await fbUser.getIdToken(true);
      const res = await fetch('/api/admin/pending-approvals', { 
        credentials: 'include',
        headers: { Authorization: `Bearer ${idToken}` }
      });
      return res.json();
    }
  });

  const { data: usersData } = useQuery({
    queryKey: ['/api/admin/users', searchTerm],
    queryFn: async () => {
      const fbUser = auth.currentUser;
      if (!fbUser) throw new Error('Not authenticated');
      const idToken = await fbUser.getIdToken(true);
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(searchTerm)}`, { 
        credentials: 'include',
        headers: { Authorization: `Bearer ${idToken}` }
      });
      return res.json();
    }
  });
  
  // Ensure users is always an array
  const users = Array.isArray(usersData) ? usersData : 
    (usersData?.users && Array.isArray(usersData.users) ? usersData.users : []);

  const { toast } = useToast();
  
  // Get current user
  useEffect(() => {
    // Check for direct admin access first
    const hasDirectAccess = localStorage.getItem('adminDirectAccess') === 'true';
    
    if (hasDirectAccess) {
      console.log('Using direct admin access');
      setCurrentUser({ email: 'taskigo.khadamati@gmail.com' });
      return;
    }
    
    // Otherwise use Firebase auth
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      }
    });
    return () => unsubscribe();
  }, []);
  
  // Check URL for tab parameter
  useEffect(() => {
    const url = new URL(window.location.href);
    const tabParam = url.searchParams.get('tab');
    if (tabParam && ['dashboard', 'users', 'providers', 'services', 'bookings', 'pending'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);
  
  const approveProvider = async (providerId: string | number, approved: boolean) => {
    try {
      const fbUser = auth.currentUser;
      if (!fbUser) {
        toast({ title: 'Authentication required', description: 'Please log in as admin' });
        return;
      }
      
      const idToken = await fbUser.getIdToken(true);
      // Our backend expects UID in the URL: /api/admin/applications/:uid/approve
      const uid = String(providerId);
      const response = await fetch(`/api/admin/applications/${uid}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        credentials: 'include',
        body: JSON.stringify({ approved: !!approved })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast({ 
          title: approved ? 'Provider approved' : 'Provider rejected',
          description: result.message 
        });
        await refetch();
      } else {
        toast({ 
          title: 'Error', 
          description: result.message || 'Failed to process provider approval'
        });
      }
    } catch (error) {
      console.error('Provider approval error:', error);
      toast({ 
        title: 'Error',
        description: 'Failed to process provider approval'
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'provider':
        return 'bg-yellow-100 text-yellow-800';
      case 'client':
        return 'bg-blue-100 text-blue-800';
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'service':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-khadamati-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <ScrollReveal>
            <h1 className="text-4xl font-bold text-khadamati-dark mb-4">
              {messages.admin_panel?.title || 'Admin Panel'}
            </h1>
            {currentUser && currentUser.email === 'taskigo.khadamati@gmail.com' && (
              <div className="mt-2 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-blue-700 font-medium">Welcome, Taskigo Admin! You have full access to all administrative features.</p>
              </div>
            )}
            <p className="text-xl text-khadamati-gray">
              {messages.admin_panel?.description || 'Platform management and analytics.'}
            </p>
            
            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mt-6 border-b border-gray-200">
              <Button 
                variant={activeTab === 'dashboard' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('dashboard')}
                className={`rounded-none border-b-2 ${activeTab === 'dashboard' ? 'border-blue-500' : 'border-transparent'}`}
              >
                Dashboard
              </Button>
              <Button 
                variant={activeTab === 'users' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('users')}
                className={`rounded-none border-b-2 ${activeTab === 'users' ? 'border-blue-500' : 'border-transparent'}`}
              >
                Users
              </Button>
              <Button 
                variant={activeTab === 'providers' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('providers')}
                className={`rounded-none border-b-2 ${activeTab === 'providers' ? 'border-blue-500' : 'border-transparent'}`}
              >
                Providers
              </Button>
              <Button 
                variant={activeTab === 'services' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('services')}
                className={`rounded-none border-b-2 ${activeTab === 'services' ? 'border-blue-500' : 'border-transparent'}`}
              >
                Services
              </Button>
              <Button 
                variant={activeTab === 'bookings' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('bookings')}
                className={`rounded-none border-b-2 ${activeTab === 'bookings' ? 'border-blue-500' : 'border-transparent'}`}
              >
                Bookings
              </Button>
              <Button 
                variant={activeTab === 'pending' ? 'default' : 'ghost'} 
                onClick={() => setActiveTab('pending')}
                className={`rounded-none border-b-2 ${activeTab === 'pending' ? 'border-blue-500' : 'border-transparent'} relative`}
              >
                Pending Approvals
                {(pending?.providers?.length || 0) > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-khadamati-error text-white">
                    {pending?.providers?.length || 0}
                  </Badge>
                )}
              </Button>
            </div>
          </ScrollReveal>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
              <ScrollReveal>
                <Card className="bg-white shadow-lg border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-khadamati-gray text-sm font-medium">
                          {messages.admin_panel?.stats?.total_users || 'Total Users'}
                        </p>
                        <p className="text-3xl font-bold text-khadamati-dark">
                          <AnimatedCounter end={stats?.totalUsers || 0} />
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-khadamati-blue rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
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
                          {messages.admin_panel?.stats?.active_providers || 'Active Providers'}
                        </p>
                        <p className="text-3xl font-bold text-khadamati-dark">
                          <AnimatedCounter end={stats?.activeProviders || 0} />
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-khadamati-success rounded-lg flex items-center justify-center">
                        <Briefcase className="h-6 w-6 text-white" />
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
                          {messages.admin_panel?.stats?.completed_bookings || 'Completed Bookings'}
                        </p>
                        <p className="text-3xl font-bold text-khadamati-dark">
                          <AnimatedCounter end={stats?.completedBookings || 0} />
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-khadamati-warning rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-white" />
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
                          {messages.admin_panel?.stats?.revenue || 'Revenue'}
                        </p>
                        <p className="text-3xl font-bold text-khadamati-dark">
                          <AnimatedCounter end={stats?.revenue || 0} prefix="$" />
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-khadamati-error rounded-lg flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ScrollReveal>
                <Card className="bg-white shadow-lg border-0 h-full">
                  <CardHeader>
                    <CardTitle className="text-xl text-khadamati-dark">
                      {messages.admin_panel?.recent_users || 'Recent Users'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {users.slice(0, 5).map((user: any) => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.profileImageUrl} alt={user.firstName || ''} />
                              <AvatarFallback>
                                {user.firstName ? user.firstName[0] : ''}
                                {user.lastName ? user.lastName[0] : ''}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-khadamati-dark">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-xs text-khadamati-gray">
                                {user.email}
                              </div>
                            </div>
                          </div>
                          <Badge className={getTypeColor(user.role || 'client')}>
                            {user.role || 'client'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal>
                <Card className="bg-white shadow-lg border-0 h-full">
                  <CardHeader>
                    <CardTitle className="text-xl text-khadamati-dark">
                      {messages.admin_panel?.pending_approvals || 'Pending Approvals'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pending?.providers?.map((provider: any) => (
                      <div key={provider.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {provider.businessName?.substring(0,2) || 'PV'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-khadamati-dark">
                              {provider.businessName}
                            </h3>
                            <p className="text-khadamati-gray text-sm">
                              {provider.city}
                            </p>
                            <p className="text-khadamati-gray text-xs">
                              {new Date(provider.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <a href={`/admin/applications/${provider.userId}`} className="px-3 py-2 rounded border">Review</a>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="secondary" onClick={() => setPreviewDocs(provider.businessDocs || [])}>
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Application Documents</DialogTitle>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-4">
                                {(previewDocs || []).map((doc, idx) => (
                                  <div key={idx} className="space-y-2">
                                    <div className="text-sm text-khadamati-gray">{doc.type}</div>
                                    {doc.url ? (
                                      <img src={doc.url} alt={doc.type} className="w-full h-40 object-cover rounded-md border" />
                                    ) : (
                                      <div className="p-3 rounded-md bg-gray-50 border text-sm break-words">{doc.text || 'No content'}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            size="sm"
                            onClick={() => approveProvider(provider.id, true)}
                            className="bg-khadamati-success hover:bg-green-700 text-white"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {messages.admin_panel?.approve || 'Approve'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => approveProvider(provider.id, false)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            {messages.admin_panel?.reject || 'Reject'}
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pending?.services?.map((service: any) => (
                      <div key={service.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {service.title?.substring(0,2) || 'SV'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-khadamati-dark">
                              {service.title}
                            </h3>
                            <p className="text-khadamati-gray text-sm">
                              New Service - ${service.price}
                            </p>
                            <p className="text-khadamati-gray text-xs">
                              {new Date(service.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                const fbUser = auth.currentUser;
                                if (!fbUser) {
                                  toast({ title: 'Authentication required', description: 'Please log in as admin' });
                                  return;
                                }
                                
                                const idToken = await fbUser.getIdToken(true);
                                const response = await fetch(`/api/admin/services/${service.id}/approve`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
                                  credentials: 'include',
                                  body: JSON.stringify({ approved: true })
                                });
                                
                                const result = await response.json();
                                
                                if (response.ok) {
                                  toast({ 
                                    title: 'Service approved',
                                    description: result.message 
                                  });
                                  await refetch();
                                } else {
                                  toast({ 
                                    title: 'Error', 
                                    description: result.message || 'Failed to approve service'
                                  });
                                }
                              } catch (error) {
                                console.error('Service approval error:', error);
                                toast({ 
                                  title: 'Error',
                                  description: 'Failed to approve service'
                                });
                              }
                            }}
                            className="bg-khadamati-success hover:bg-green-700 text-white"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {messages.admin_panel?.approve || 'Approve'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              try {
                                const fbUser = auth.currentUser;
                                if (!fbUser) {
                                  toast({ title: 'Authentication required', description: 'Please log in as admin' });
                                  return;
                                }
                                
                                const idToken = await fbUser.getIdToken(true);
                                const response = await fetch(`/api/admin/services/${service.id}/approve`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
                                  credentials: 'include',
                                  body: JSON.stringify({ approved: false })
                                });
                                
                                const result = await response.json();
                                
                                if (response.ok) {
                                  toast({ 
                                    title: 'Service rejected',
                                    description: result.message 
                                  });
                                  await refetch();
                                } else {
                                  toast({ 
                                    title: 'Error', 
                                    description: result.message || 'Failed to reject service'
                                  });
                                }
                              } catch (error) {
                                console.error('Service rejection error:', error);
                                toast({ 
                                  title: 'Error',
                                  description: 'Failed to reject service'
                                });
                              }
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            {messages.admin_panel?.reject || 'Reject'}
                          </Button>
                        </div>
                      </div>
                    ))}
                    {pending?.providers?.length === 0 && pending?.services?.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-khadamati-gray">No pending approvals</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>

            {/* User Management */}
            <div className="mt-6">
              <ScrollReveal>
                <Card className="bg-white shadow-lg border-0">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-2xl font-bold text-khadamati-dark">
                        {messages.admin_panel?.user_management || 'User Management'}
                      </CardTitle>
                      <div className="flex space-x-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-khadamati-gray" />
                          <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 w-64"
                          />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{messages.admin_panel?.table?.user || 'User'}</TableHead>
                            <TableHead>{messages.admin_panel?.table?.type || 'Type'}</TableHead>
                            <TableHead>{messages.admin_panel?.table?.joined || 'Joined'}</TableHead>
                            <TableHead>{messages.admin_panel?.table?.status || 'Status'}</TableHead>
                            <TableHead>{messages.admin_panel?.table?.actions || 'Actions'}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users?.map((user: any) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage src={user.profileImageUrl} alt={user.firstName || ''} />
                                    <AvatarFallback>
                                      {user.firstName ? user.firstName[0] : ''}
                                      {user.lastName ? user.lastName[0] : ''}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium text-khadamati-dark">
                                      {user.firstName} {user.lastName}
                                    </div>
                                    <div className="text-sm text-khadamati-gray">
                                      {user.email}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={getTypeColor(user.role || 'client')}>
                                  {user.role || 'client'}
                                </Badge>
                              </TableCell>
                              <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(user.isActive ? 'active' : 'inactive')}>
                                  {user.isActive ? 'active' : 'inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button variant="ghost" size="icon">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>
          </>
        )}

        {/* Pending Approvals Tab */}
        {activeTab === 'pending' && (
          <div className="mt-6">
            <ScrollReveal>
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-khadamati-dark">
                    Pending Provider Applications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {pending?.providers?.length > 0 ? (
                    <div className="space-y-4">
                      {pending.providers.map((provider: any) => (
                        <div key={provider.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback>
                                {provider.businessName?.substring(0,2) || 'PV'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-khadamati-dark">
                                {provider.businessName}
                              </h3>
                              <p className="text-khadamati-gray text-sm">
                                {provider.city}
                              </p>
                              <p className="text-khadamati-gray text-xs">
                                {new Date(provider.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => approveProvider(provider.id, true)}
                              className="bg-khadamati-success hover:bg-green-700 text-white"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              {messages.admin_panel?.approve || 'Approve'}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => approveProvider(provider.id, false)}
                            >
                              <X className="h-4 w-4 mr-1" />
                              {messages.admin_panel?.reject || 'Reject'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-khadamati-gray">No pending provider applications</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </ScrollReveal>
          </div>
        )}
      </div>
    </div>
  );
}