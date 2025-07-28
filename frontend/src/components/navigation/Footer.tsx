import { Link } from 'wouter';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

interface FooterProps {
  messages: any;
}

export default function Footer({ messages }: FooterProps) {
  return (
    <footer className="bg-khadamati-dark text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-khadamati-blue to-khadamati-yellow rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gradient">Taskego</span>
            </div>
            <p className="text-gray-400 text-sm">
              {messages.footer?.description || 'Your trusted platform for professional local services. Connect with skilled providers and get the job done right.'}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-khadamati-blue transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-khadamati-blue transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-khadamati-blue transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-khadamati-blue transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {messages.footer?.quick_links || 'Quick Links'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  {messages.footer?.home || 'Home'}
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-400 hover:text-white transition-colors">
                  {messages.footer?.services || 'Services'}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  {messages.footer?.about || 'About'}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  {messages.footer?.contact || 'Contact'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {messages.footer?.services_title || 'Services'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services?category=cleaning" className="text-gray-400 hover:text-white transition-colors">
                  {messages.services?.cleaning?.title || 'Cleaning'}
                </Link>
              </li>
              <li>
                <Link href="/services?category=plumbing" className="text-gray-400 hover:text-white transition-colors">
                  {messages.services?.plumbing?.title || 'Plumbing'}
                </Link>
              </li>
              <li>
                <Link href="/services?category=electrical" className="text-gray-400 hover:text-white transition-colors">
                  {messages.services?.electrical?.title || 'Electrical'}
                </Link>
              </li>
              <li>
                <Link href="/services?category=delivery" className="text-gray-400 hover:text-white transition-colors">
                  {messages.services?.delivery?.title || 'Delivery'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {messages.footer?.support || 'Support'}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-400 hover:text-white transition-colors">
                  {messages.footer?.help_center || 'Help Center'}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  {messages.footer?.privacy || 'Privacy Policy'}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
                  {messages.footer?.terms || 'Terms of Service'}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  {messages.footer?.faq || 'FAQ'}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              {messages.footer?.copyright || '© 2023 Taskego. All rights reserved.'}
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                {messages.footer?.privacy || 'Privacy'}
              </Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                {messages.footer?.terms || 'Terms'}
              </Link>
              <Link href="/cookies" className="text-gray-400 hover:text-white transition-colors text-sm">
                {messages.footer?.cookies || 'Cookies'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
