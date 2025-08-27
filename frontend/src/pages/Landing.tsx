import React from 'react';
import { Button } from '@/components/ui/button';
import { Messages } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Sparkles, Users, Shield, Zap } from 'lucide-react';

interface LandingProps {
  messages: Messages;
}

export default function Landing({ messages }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-blue-600 rounded-full">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {messages.welcome || 'Welcome to Taskego'}
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {messages.heroSubtitle || 'Your trusted local service marketplace connecting clients with skilled providers'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
              onClick={() => window.location.href = '/api/login'}
            >
              {messages.getStarted || 'Get Started'}
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-4 text-lg"
              onClick={() => window.location.href = '/api/login'}
            >
              {messages.becomeProvider || 'Become a Provider'}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
          >
            <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {messages.trustedProviders || 'Trusted Providers'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {messages.trustedProvidersDesc || 'Connect with verified local service providers'}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
          >
            <Shield className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {messages.secureBooking || 'Secure Booking'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {messages.secureBookingDesc || 'Safe and secure booking system with payment protection'}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md"
          >
            <Zap className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {messages.quickService || 'Quick Service'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {messages.quickServiceDesc || 'Fast and reliable service delivery when you need it'}
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}