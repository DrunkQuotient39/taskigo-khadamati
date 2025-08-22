import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowRight, Shield, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Messages } from '@/lib/i18n';
import { signUpWithEmail, signInWithGoogle } from '@/lib/firebase';

interface SignUpProps {
  messages: Messages;
}

export default function SignUp({ messages }: SignUpProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-yellow-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                {messages.signup?.title || 'Join Taskego'}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {messages.signup?.subtitle || 'Create your account to get started'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Disclaimer Section */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-800 mb-2">Important Legal Disclaimer</h4>
                    <div className="text-sm text-amber-700 space-y-2">
                      <p>By using Taskego, you acknowledge and agree that:</p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Taskego acts as a platform connecting service providers and clients</li>
                        <li>We are not responsible for the quality, safety, or outcome of services provided by third-party providers</li>
                        <li>We do not guarantee the accuracy of provider information, reviews, or service descriptions</li>
                        <li>All transactions and agreements are between you and the service provider directly</li>
                        <li>We are not liable for any damages, losses, or disputes arising from service provision</li>
                        <li>Service providers are independent contractors, not our employees or agents</li>
                        <li>We reserve the right to modify, suspend, or terminate services at any time</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="disclaimer-signup"
                    checked={disclaimerAccepted}
                    onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    required
                  />
                  <label htmlFor="disclaimer-signup" className="text-sm text-amber-800">
                    I have read, understood, and agree to the above disclaimer and terms of service. I acknowledge that Taskego is not responsible for any services provided by third-party providers.
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={async () => { await signInWithGoogle(); }}
                  disabled={!disclaimerAccepted}
                >
                  {messages.signup?.button || 'Sign Up with Google'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <div className="grid grid-cols-1 gap-2">
                  <input className="border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <input className="border rounded px-3 py-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button
                  variant="outline"
                  className="w-full py-3 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={async () => { await signUpWithEmail(email, password); }}
                  disabled={!disclaimerAccepted}
                >
                  Create Account with Email
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
              
              <div className="text-center text-sm text-gray-500">
                {messages.signup?.secure || 'Secure registration powered by Replit'}
              </div>
              
              <div className="space-y-3 pt-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">
                    {messages.signup?.benefit1 || 'Connect with trusted service providers'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">
                    {messages.signup?.benefit2 || 'Secure payment processing'}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">
                    {messages.signup?.benefit3 || 'Real-time booking management'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-xs text-gray-600">
                    {messages.signup?.secure_auth || 'Secure Auth'}
                  </p>
                </div>
                <div className="text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                  <p className="text-xs text-gray-600">
                    {messages.signup?.community || 'Join Community'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}