import { useState, useEffect } from 'react';
import { Switch, Route } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { loadMessages, defaultLanguage, getDirection, type Language } from './lib/i18n';
import type { Messages } from './lib/i18n';
import { useAuth } from '@/hooks/useAuth';

// Components
import Header from '@/components/navigation/Header';
import Footer from '@/components/navigation/Footer';
import FloatingChat from '@/components/common/FloatingChat';

// Pages
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import Home from '@/pages/Home';
import Services from '@/pages/Services';
import Booking from '@/pages/Booking';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import ProviderDashboard from '@/pages/ProviderDashboard';
import AdminPanel from '@/pages/AdminPanel';
import NotFound from '@/pages/not-found';

function Router({ messages, currentLanguage, onLanguageChange }: { 
  messages: Messages; 
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        currentLanguage={currentLanguage} 
        onLanguageChange={onLanguageChange}
        messages={messages}
      />
      
      <main className="flex-1">
        <Switch>
          <Route path="/" component={() => <Home messages={messages} />} />
          <Route path="/login" component={() => <Login messages={messages} />} />
          <Route path="/signup" component={() => <SignUp messages={messages} />} />
          <Route path="/services" component={() => <Services messages={messages} />} />
          <Route path="/booking" component={() => <Booking messages={messages} />} />
          <Route path="/about" component={() => <About messages={messages} />} />
          <Route path="/contact" component={() => <Contact messages={messages} />} />
          <Route path="/provider-dashboard" component={() => <ProviderDashboard messages={messages} />} />
          <Route path="/admin-panel" component={() => <AdminPanel messages={messages} />} />
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <Footer messages={messages} />
      <FloatingChat messages={messages} />
    </div>
  );
}

function App() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(defaultLanguage);
  const [messages, setMessages] = useState<Messages>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLanguageMessages = async () => {
      setIsLoading(true);
      try {
        const loadedMessages = await loadMessages(currentLanguage);
        setMessages(loadedMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLanguageMessages();
  }, [currentLanguage]);

  useEffect(() => {
    // Update document attributes for RTL/LTR and language
    const direction = getDirection(currentLanguage);
    document.documentElement.setAttribute('dir', direction);
    document.documentElement.setAttribute('lang', currentLanguage);
    
    // Add/remove RTL class on body for additional styling
    if (direction === 'rtl') {
      document.body.classList.add('rtl');
    } else {
      document.body.classList.remove('rtl');
    }
  }, [currentLanguage]);

  const handleLanguageChange = (lang: Language) => {
    setCurrentLanguage(lang);
    // Store preference in localStorage
    localStorage.setItem('preferred-language', lang);
  };

  // Load saved language preference on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-khadamati-light">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-khadamati-blue to-khadamati-yellow rounded-xl flex items-center justify-center mx-auto mb-4 floating">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div className="text-2xl font-bold text-gradient">Taskego</div>
          <div className="text-khadamati-gray mt-2">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router 
          messages={messages} 
          currentLanguage={currentLanguage}
          onLanguageChange={handleLanguageChange}
        />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
