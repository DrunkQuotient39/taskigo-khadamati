import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Clock, CheckCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface PendingApprovalProps {
  messages: any;
}

export default function PendingApproval({ messages }: PendingApprovalProps) {
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation('/login?redirect=/pending-approval');
    }
  }, [user, isLoading, setLocation]);

  // If the user is already approved as a provider, redirect to provider dashboard
  useEffect(() => {
    if (user?.role === 'provider') {
      setLocation('/provider-dashboard');
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {messages.pending_approval?.title || 'Application Under Review'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 text-center">
            <p className="text-gray-600">
              {messages.pending_approval?.message || 
                'Your provider application has been submitted and is currently under review by our team. This process typically takes 24-48 hours.'}
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-800 mb-2">What happens next?</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-blue-700">
                    <li>Our admin team will review your application</li>
                    <li>You'll receive a notification when a decision is made</li>
                    <li>If approved, you'll gain access to the provider dashboard</li>
                    <li>You can then start adding your services and accepting bookings</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 pt-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-yellow-700 font-medium">Application Status: Pending Review</span>
              </div>
              
              <div className="flex justify-center space-x-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setLocation('/')}
                  className="flex items-center"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Home
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setLocation('/contact')}
                  className="flex items-center"
                >
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
