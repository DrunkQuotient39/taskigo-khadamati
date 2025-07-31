import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2, Maximize2, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Messages } from '@/lib/i18n';

interface EnhancedFloatingChatProps {
  messages: Messages;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export default function EnhancedFloatingChat({ messages }: EnhancedFloatingChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your AI assistant. I can help you find services, compare prices, and answer questions. What do you need help with today?',
      timestamp: new Date(),
      suggestions: ['Find cleaning services', 'Compare prices', 'Book emergency repair', 'Show available today']
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const simulateBotResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let botResponse = '';
      let suggestions: string[] = [];

      const message = userMessage.toLowerCase();
      
      if (message.includes('clean') || message.includes('maid')) {
        botResponse = '🧹 I found several excellent cleaning services for you! Professional House Cleaning ($45/hour, 4.8★), Quick Clean Service ($35/hour, 4.6★), and Deep Clean Experts ($55/hour, 4.9★). All are available today with verified professionals.';
        suggestions = ['Book Professional House Cleaning', 'Compare all cleaning options', 'Show reviews', 'Check availability'];
      } else if (message.includes('plumb') || message.includes('repair')) {
        botResponse = '🔧 For plumbing and repairs, I recommend: FastFix Plumbers (24/7 emergency, $80/hour), Ahmed\'s Reliable Plumbing ($65/hour), and City Plumbing Solutions ($70/hour). All have 5-star ratings and immediate availability.';
        suggestions = ['Emergency plumber now', 'Schedule plumbing visit', 'Compare repair prices', 'View plumber profiles'];
      } else if (message.includes('price') || message.includes('cost') || message.includes('cheap')) {
        botResponse = '💰 Here are budget-friendly options: Services under $30 (15 available), Services under $50 (47 available), and Premium services with best value. I can filter by your specific budget range!';
        suggestions = ['Show under $30', 'Show under $50', 'Best value services', 'Compare by price'];
      } else {
        botResponse = '✨ I\'m here to help you find the perfect service! I can assist with booking, price comparisons, provider recommendations, scheduling, and much more. What specific service are you looking for?';
        suggestions = ['Browse all services', 'Find providers near me', 'Emergency services', 'Popular services'];
      }

      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: botResponse,
        timestamp: new Date(),
        suggestions
      };

      setChatMessages(prev => [...prev, newMessage]);
      setIsTyping(false);
      
      if (!isOpen) {
        setHasNewMessage(true);
      }
    }, 1200 + Math.random() * 800);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    simulateBotResponse(inputMessage);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessage(false);
    }
  };

  // Button variants
  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    pulse: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  // Chat container variants
  const chatVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20,
      transition: {
        duration: 0.2
      }
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  // Message variants
  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={chatVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="mb-4 w-80 md:w-96"
          >
            <Card className="shadow-2xl border-0 overflow-hidden bg-white dark:bg-gray-900">
              {/* Header */}
              <CardHeader className="bg-gradient-to-r from-khadamati-blue to-khadamati-yellow text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-8 h-8 border-2 border-white">
                        <AvatarFallback className="bg-white text-khadamati-blue">
                          <Bot className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Taskego AI Assistant</h3>
                      <p className="text-xs text-white/80">Always here to help</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 p-1 h-6 w-6"
                      onClick={() => setIsMinimized(!isMinimized)}
                    >
                      {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 p-1 h-6 w-6"
                      onClick={toggleChat}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Chat Body */}
              <AnimatePresence>
                {!isMinimized && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="p-0">
                      {/* Messages */}
                      <ScrollArea className="h-80 p-4">
                        <div className="space-y-4">
                          <AnimatePresence>
                            {chatMessages.map((message) => (
                              <motion.div
                                key={message.id}
                                variants={messageVariants}
                                initial="hidden"
                                animate="visible"
                                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                {message.type === 'bot' && (
                                  <Avatar className="w-6 h-6 flex-shrink-0">
                                    <AvatarFallback className="bg-khadamati-blue text-white text-xs">
                                      <Bot className="w-3 h-3" />
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                
                                <div className={`max-w-[75%] ${message.type === 'user' ? 'order-1' : ''}`}>
                                  <div
                                    className={`rounded-2xl px-4 py-2 ${
                                      message.type === 'user'
                                        ? 'bg-khadamati-blue text-white ml-auto'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                    }`}
                                  >
                                    <p className="text-sm leading-relaxed">{message.content}</p>
                                  </div>
                                  
                                  {message.suggestions && (
                                    <div className="mt-2 space-y-1">
                                      {message.suggestions.map((suggestion, index) => (
                                        <motion.button
                                          key={index}
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98 }}
                                          onClick={() => handleSuggestionClick(suggestion)}
                                          className="block w-full text-left text-xs text-khadamati-blue hover:text-khadamati-blue/80 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-2 rounded-lg transition-all duration-200 border border-khadamati-blue/20 hover:border-khadamati-blue/40"
                                        >
                                          {suggestion}
                                        </motion.button>
                                      ))}
                                    </div>
                                  )}
                                  
                                  <p className="text-xs text-gray-500 mt-1">
                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          
                          {isTyping && (
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex gap-3"
                            >
                              <Avatar className="w-6 h-6">
                                <AvatarFallback className="bg-khadamati-blue text-white text-xs">
                                  <Bot className="w-3 h-3" />
                                </AvatarFallback>
                              </Avatar>
                              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>

                      {/* Input Area */}
                      <div className="border-t p-4 bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex gap-2">
                          <Input
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Ask me anything..."
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="flex-1 border-gray-200 dark:border-gray-700"
                          />
                          <Button 
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isTyping}
                            className="bg-khadamati-blue hover:bg-khadamati-blue/90 px-3"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button */}
      <motion.div
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        animate={hasNewMessage ? "pulse" : "initial"}
        className="relative"
      >
        <Button
          onClick={toggleChat}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-khadamati-blue to-khadamati-yellow text-white shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <MessageCircle className="w-6 h-6" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="w-3 h-3" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>

        {/* New Message Indicator */}
        <AnimatePresence>
          {hasNewMessage && !isOpen && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
            >
              !
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}