import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X, Globe, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { useQuery } from '@tanstack/react-query';
import type { User as UserType } from '@shared/schema';

interface HeaderProps {
  currentLanguage: string;
  onLanguageChange: (lang: 'en' | 'ar') => void;
  messages: any;
}

export default function Header({ currentLanguage, onLanguageChange, messages }: HeaderProps) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Get user data from auth hook
  const { data: user } = useQuery<UserType | null>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const navItems = [
    { href: '/', label: messages.nav?.home || 'Home' },
    { href: '/services', label: messages.nav?.services || 'Services' },
    { href: '/about', label: messages.nav?.about || 'About' },
    { href: '/contact', label: messages.nav?.contact || 'Contact' },
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
              <span className="text-xl font-bold text-gradient">Taskego</span>
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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-khadamati-error text-white">
                  3
                </Badge>
              </Button>
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link href="/bookings">My Bookings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <button onClick={() => window.location.href = '/api/logout'}>Logout</button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
                  onClick={() => window.location.href = '/api/login'}
                >
                  {messages.nav?.login || 'Login'}
                </Button>
                <Button 
                  className="bg-khadamati-blue hover:bg-blue-700"
                  onClick={() => window.location.href = '/api/login'}
                >
                  {messages.nav?.signup || 'Sign Up'}
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
                          {messages.nav?.login || 'Login'}
                        </Button>
                      </Link>
                      <Link href="/signup" onClick={() => setIsOpen(false)}>
                        <Button className="w-full bg-khadamati-blue hover:bg-blue-700">
                          {messages.nav?.signup || 'Sign Up'}
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
