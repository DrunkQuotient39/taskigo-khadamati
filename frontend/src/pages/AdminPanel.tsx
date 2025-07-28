import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Briefcase, TrendingUp, DollarSign, Search, Eye, Ban, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ScrollReveal from '@/components/common/ScrollReveal';
import AnimatedCounter from '@/components/common/AnimatedCounter';

interface AdminPanelProps {
  messages: any;
}

export default function AdminPanel({ messages }: AdminPanelProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - in real app, this would come from API
  const mockStats = {
    totalUsers: 2547,
    activeProviders: 1247,
    monthlyBookings: 15842,
    monthlyRevenue: 124578,
  };

  const mockPendingApprovals = [
    {
      id: 1,
      name: 'David Wilson',
      type: 'provider',
      service: 'Electrical Services',
      date: '2024-01-20',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Lisa Anderson',
      type: 'service',
      service: 'Pet Grooming',
      date: '2024-01-18',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Robert Johnson',
      type: 'provider',
      service: 'Landscaping',
      date: '2024-01-15',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face'
    },
  ];

  const mockUsers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@email.com',
      type: 'client',
      joinDate: '2023-11-15',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      type: 'provider',
      joinDate: '2023-10-22',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Michael Brown',
      email: 'michael.b@email.com',
      type: 'client',
      joinDate: '2023-12-01',
      status: 'inactive',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face'
    },
  ];

  const { data: stats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: () => Promise.resolve(mockStats),
  });

  const { data: pendingApprovals } = useQuery({
    queryKey: ['/api/admin/pending-approvals'],
    queryFn: () => Promise.resolve(mockPendingApprovals),
  });

  const { data: users } = useQuery({
    queryKey: ['/api/admin/users', searchTerm],
    queryFn: () => Promise.resolve(mockUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )),
  });

  const handleApprove = (id: number) => {
    console.log('Approving item:', id);
    // In real app, this would make an API call
  };

  const handleReject = (id: number) => {
    console.log('Rejecting item:', id);
    // In real app, this would make an API call
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'provider':
        return 'bg-yellow-100 text-yellow-800';
      case 'client':
        return 'bg-blue-100 text-blue-800';
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
            <p className="text-xl text-khadamati-gray">
              {messages.admin_panel?.description || 'Platform management and analytics.'}
            </p>
          </ScrollReveal>
        </div>

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
                      {messages.admin_panel?.stats?.monthly_bookings || 'Monthly Bookings'}
                    </p>
                    <p className="text-3xl font-bold text-khadamati-dark">
                      <AnimatedCounter end={stats?.monthlyBookings || 0} />
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-khadamati-yellow rounded-lg flex items-center justify-center">
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
                      {messages.admin_panel?.stats?.revenue || 'Monthly Revenue'}
                    </p>
                    <p className="text-3xl font-bold text-khadamati-dark">
                      $<AnimatedCounter end={stats?.monthlyRevenue || 0} />
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-khadamati-info rounded-lg flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </ScrollReveal>
        </div>

        {/* Pending Approvals */}
        <ScrollReveal delay={400}>
          <Card className="bg-white shadow-lg border-0 mb-12">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl font-bold text-khadamati-dark">
                  {messages.admin_panel?.pending_approvals || 'Pending Approvals'}
                </CardTitle>
                <Badge className="bg-khadamati-error text-white">
                  {pendingApprovals?.length || 0} pending
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingApprovals?.map((approval) => (
                  <div key={approval.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={approval.avatar} alt={approval.name} />
                        <AvatarFallback>
                          {approval.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-khadamati-dark">
                          {approval.name}
                        </h3>
                        <p className="text-khadamati-gray text-sm">
                          {approval.type === 'provider' ? 'New Provider' : 'New Service'} - {approval.service}
                        </p>
                        <p className="text-khadamati-gray text-xs">
                          {approval.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(approval.id)}
                        className="bg-khadamati-success hover:bg-green-700 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        {messages.admin_panel?.approve || 'Approve'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(approval.id)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        {messages.admin_panel?.reject || 'Reject'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </ScrollReveal>

        {/* User Management */}
        <ScrollReveal delay={500}>
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
                    {users?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>
                                {user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-khadamati-dark">
                                {user.name}
                              </div>
                              <div className="text-sm text-khadamati-gray">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(user.type)}>
                            {user.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Ban className="h-4 w-4" />
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
    </div>
  );
}
