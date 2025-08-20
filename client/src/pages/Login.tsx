
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, ArrowRight, Shield, Users, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Messages } from '@/lib/i18n';
import { signInWithGoogle, signInWithEmail } from '@/lib/firebase';
import { useState } from 'react';

interface LoginProps {
  messages: Messages;
}

export default function Login({ messages }: LoginProps) {
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
                {messages.login?.title || 'Welcome Back'}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {messages.login?.subtitle || 'Sign in to access your Taskego account'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-medium"
                  onClick={async () => { await signInWithGoogle(); }}
                >
                  {messages.login?.button || 'Continue with Google'}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <div className="grid grid-cols-1 gap-2">
                  <div className="grid grid-cols-1 gap-2">
                    <input className="border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <input className="border rounded px-3 py-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <Button
                    variant="outline"
                    className="w-full py-3 text-lg font-medium"
                    onClick={async () => { await signInWithEmail(email, password); }}
                  >
                    <Mail className="mr-2 w-5 h-5" /> Sign in with Email
                  </Button>
                </div>
              </div>
              
              <div className="text-center text-sm text-gray-500">
                {messages.login?.secure || 'Secure authentication powered by Replit'}
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="text-center">
                  <Shield className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                  <p className="text-xs text-gray-600">
                    {messages.login?.secure_auth || 'Secure Auth'}
                  </p>
                </div>
                <div className="text-center">
                  <Users className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                  <p className="text-xs text-gray-600">
                    {messages.login?.trusted || 'Trusted Platform'}
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