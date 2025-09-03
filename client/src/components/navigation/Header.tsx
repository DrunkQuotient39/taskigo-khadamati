import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Globe, User, Bell, Building2, MessageCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/lib/firebase';
import { Messages, t } from '@/lib/i18n';

interface HeaderProps {
  currentLanguage: string;
  onLanguageChange: (lang: 'en' | 'ar') => void;
  messages: Messages;
}

export default function Header({ currentLanguage, onLanguageChange, messages }: HeaderProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Get user via Firebase-backed auth hook
  const { user } = useAuth();
  
  // Check for direct admin access
  const [hasDirectAdminAccess, setHasDirectAdminAccess] = useState(false);
  
  useEffect(() => {
    const directAccess = localStorage.getItem('adminDirectAccess') === 'true';
    setHasDirectAdminAccess(directAccess);
  }, []);
  
  // Fetch notifications
  const { data: notificationsData } = useQuery({
    queryKey: ['/api/notifications', user?.id],
    queryFn: async () => {
      if (!user) return { notifications: [], unreadCount: 0 };
      
      try {
        const idToken = await auth.currentUser?.getIdToken(true);
        if (!idToken) throw new Error('No ID token available');
        
        const response = await fetch('/api/notifications', {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          },
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch notifications');
        return await response.json();
      } catch (error) {
        console.error('Error fetching notifications:', error);
        return { notifications: [], unreadCount: 0 };
      }
    },
    enabled: !!user,
    refetchInterval: 60000, // Refetch every minute
  });

  const navItems = [
    { href: '/', label: t('nav.home', messages, 'Home') },
    { href: '/services', label: t('nav.services', messages, 'Services') },
    { href: '/about', label: t('nav.about', messages, 'About') },
    { href: '/contact', label: t('nav.contact', messages, 'Contact') },
  ];

  const isActive = (href: string) => {
    if (href === '/') return location === '/';
    return location.startsWith(href);
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-khadamati-blue to-khadamati-yellow rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gradient">Taskigo</span>
              <span className="text-xs text-khadamati-gray hidden sm:inline">Khadamati</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`font-medium transition-colors hover:text-khadamati-blue ${
                  isActive(item.href) ? 'text-khadamati-blue' : 'text-khadamati-gray'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
              messages={messages}
            />

            {/* Notifications */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                    {((notificationsData?.unreadCount || 0) > 0 || user?.role === 'admin') && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-khadamati-error text-white">
                        {user?.role === 'admin' ? '1' : (notificationsData?.unreadCount > 99 ? '99+' : notificationsData?.unreadCount)}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-72" align="end">
                  <div className="flex flex-col p-2">
                    <div className="font-medium text-sm mb-2 px-2">{t('notifications.title', messages, 'Notifications')}</div>
                    
                    {/* Real notifications if available */}
                    {notificationsData?.notifications && notificationsData.notifications.length > 0 ? (
                      notificationsData.notifications.slice(0, 5).map((notification: any) => {
                        // Handle different notification types
                        let href = '/notifications';
                        if (notification.type === 'booking') {
                          href = `/my-bookings/${notification.metadata?.bookingId || ''}`;
                        } else if (notification.type === 'chat') {
                          href = `/chat?provider=${notification.metadata?.providerId || ''}&booking=${notification.metadata?.bookingId || ''}`;
                        } else if (notification.type === 'provider_application') {
                          href = `/provider-dashboard`;
                        }
                        
                        return (
                          <Link key={notification.id} href={href} onClick={() => setIsOpen(false)}>
                            <div className={`rounded-md hover:bg-gray-100 p-2 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50' : ''}`}>
                              <div className="font-medium text-sm">{notification.title}</div>
                              <div className="text-xs text-gray-500">{notification.message}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      // Fallback to sample notifications when no real ones are available
                      <>
                        {/* Special provider request notification for admin */}
                        {user?.role === 'admin' && (
                          <Link href="/admin?tab=pending" onClick={() => setIsOpen(false)}>
                            <div className="rounded-md hover:bg-gray-100 bg-blue-50 p-2 cursor-pointer transition-colors">
                              <div className="font-medium text-sm">New Provider Application</div>
                              <div className="text-xs text-gray-500">AC Service Pro has applied to become a provider</div>
                              <div className="text-xs text-gray-400 mt-1">Just now</div>
                            </div>
                          </Link>
                        )}
                        
                        <Link href="/my-bookings/123" onClick={() => setIsOpen(false)}>
                          <div className="rounded-md hover:bg-gray-100 p-2 cursor-pointer transition-colors">
                            <div className="font-medium text-sm">{t('notifications.booking_confirmed', messages, 'Booking Confirmed')}</div>
                            <div className="text-xs text-gray-500">{t('notifications.booking_confirmed_desc', messages, 'Your booking for AC Repair has been confirmed')}</div>
                            <div className="text-xs text-gray-400 mt-1">2 hours ago</div>
                          </div>
                        </Link>
                        
                        <Link href="/chat?provider=45&booking=124" onClick={() => setIsOpen(false)}>
                          <div className="rounded-md hover:bg-gray-100 p-2 cursor-pointer transition-colors">
                            <div className="font-medium text-sm">{t('notifications.new_message', messages, 'New Message')}</div>
                            <div className="text-xs text-gray-500">{t('notifications.new_message_desc', messages, 'You received a new message from AC Repair provider')}</div>
                            <div className="text-xs text-gray-400 mt-1">Yesterday</div>
                          </div>
                        </Link>
                        
                        <Link href="/my-bookings/125" onClick={() => setIsOpen(false)}>
                          <div className="rounded-md hover:bg-gray-100 p-2 cursor-pointer transition-colors">
                            <div className="font-medium text-sm">{t('notifications.service_reminder', messages, 'Service Reminder')}</div>
                            <div className="text-xs text-gray-500">{t('notifications.service_reminder_desc', messages, 'Your cleaning service is scheduled for tomorrow')}</div>
                            <div className="text-xs text-gray-400 mt-1">2 days ago</div>
                          </div>
                        </Link>
                      </>
                    )}
                    
                    <div className="mt-2 pt-2 border-t text-center">
                      <Link href="/notifications">
                        <Button variant="link" size="sm" className="text-xs text-blue-600">
                          {t('notifications.view_all', messages, 'View All Notifications')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* User Menu */}
            {user || hasDirectAdminAccess ? (
              <div className="flex items-center space-x-2">
                {/* Become a Provider button for regular users */}
                {user && user.role !== 'provider' && user.role !== 'admin' && !hasDirectAdminAccess && (
                  <Link href="/provider-signup">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-khadamati-blue text-khadamati-blue hover:bg-khadamati-blue hover:text-white hidden md:flex"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      {t('nav.become_provider', messages, 'Become a Provider')}
                    </Button>
                  </Link>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      <span className="hidden sm:inline text-sm text-khadamati-gray max-w-[160px] truncate">
                        {(user?.role === 'admin' || hasDirectAdminAccess) ? 'Admin' : (user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email || 'Account')}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* Only show profile for regular users */}
                    {user && !hasDirectAdminAccess && (
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Profile</Link>
                      </DropdownMenuItem>
                    )}
                    
                    {/* Show Provider Dashboard for providers */}
                    {user && user.role === 'provider' && !hasDirectAdminAccess && (
                      <DropdownMenuItem asChild>
                        <Link href="/provider-dashboard">Provider Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    
                    {/* Show Admin Panel for admins or direct admin access */}
                    {(user?.role === 'admin' || hasDirectAdminAccess) && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">Admin Panel</Link>
                      </DropdownMenuItem>
                    )}
                    
                    {/* Become a Provider menu item for mobile */}
                    {user && user.role !== 'provider' && user.role !== 'admin' && !hasDirectAdminAccess && (
                      <DropdownMenuItem asChild>
                        <Link href="/provider-signup">
                          {t('nav.become_provider', messages, 'Become a Provider')}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    
                    {/* Only show bookings for regular users */}
                    {user && !hasDirectAdminAccess && (
                      <DropdownMenuItem asChild>
                        <Link href="/my-bookings">My Bookings</Link>
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuItem>
                      <button onClick={async () => {
                        try {
                          // Handle direct admin access logout
                          if (hasDirectAdminAccess) {
                            localStorage.removeItem('adminDirectAccess');
                            window.location.href = '/';
                            return;
                          }
                          
                          // Sign out from Firebase for regular users
                          await auth.signOut();
                          // Redirect to home page
                          window.location.href = '/';
                        } catch (error) {
                          console.error('Logout error:', error);
                        }
                      }}>
                        {t('nav.logout', messages, 'Logout')}
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link href="/provider-signup">
                  <Button 
                    variant="ghost" 
                    className="text-khadamati-blue hover:bg-blue-50 font-semibold"
                  >
                    Become a Provider
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  className="border-khadamati-blue text-khadamati-blue hover:bg-khadamati-blue hover:text-white"
                  onClick={() => window.location.href = '/login'}
                >
                  {t('nav.login', messages, 'Login')}
                </Button>
                <Button 
                  className="bg-khadamati-blue hover:bg-blue-700"
                  onClick={() => window.location.href = '/signup'}
                >
                  {t('nav.signup', messages, 'Sign Up')}
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`text-lg font-medium transition-colors hover:text-khadamati-blue ${
                        isActive(item.href) ? 'text-khadamati-blue' : 'text-khadamati-gray'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  {!user && (
                    <div className="pt-4 border-t space-y-3">
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full border-khadamati-blue text-khadamati-blue hover:bg-khadamati-blue hover:text-white">
                          {t('nav.login', messages, 'Login')}
                        </Button>
                      </Link>
                      <Link href="/signup" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-khadamati-blue hover:bg-blue-700">
                          {t('nav.signup', messages, 'Sign Up')}
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
