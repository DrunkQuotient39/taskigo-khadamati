import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowRight, Shield, Users, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Messages } from '@/lib/i18n';
import { signUpWithEmail, signInWithGoogle } from '@/lib/firebase';

interface SignUpProps {
  messages: Messages;
}

export default function SignUp({ messages }: SignUpProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
              <div className="space-y-3">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                  onClick={async () => { await signInWithGoogle(); }}
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
                  className="w-full py-3 text-lg font-medium"
                  onClick={async () => { await signUpWithEmail(email, password); }}
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