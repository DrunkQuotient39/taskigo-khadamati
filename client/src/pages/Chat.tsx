import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Paperclip, Bot, User, Settings, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Messages } from '@/lib/i18n';

interface ChatProps {
  messages: Messages;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  suggestions?: string[];
}

export default function Chat({ messages }: ChatProps) {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m your AI assistant for Taskego. I can help you find services, compare prices, get recommendations, and answer any questions. What can I help you with today?',
      timestamp: new Date(),
      suggestions: [
        'Find cleaning services under $50',
        'Best plumbers in my area',
        'Compare AC repair services',
        'Show me available today'
      ]
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

      // Simple AI simulation based on keywords
      const message = userMessage.toLowerCase();
      
      if (message.includes('clean') || message.includes('maid')) {
        botResponse = 'I found several cleaning services in your area! Here are the top-rated options: Professional House Cleaning ($45/hour), Quick Clean Service ($35/hour), and Deep Clean Experts ($55/hour). Would you like me to show you more details or help you book?';
        suggestions = ['Show cleaning details', 'Book Professional House Cleaning', 'Compare all cleaning services'];
      } else if (message.includes('plumb') || message.includes('pipe') || message.includes('leak')) {
        botResponse = 'For plumbing services, I recommend: FastFix Plumbers (24/7 emergency, $80/hour), Ahmed\'s Plumbing ($65/hour), or City Plumbing Solutions ($70/hour). They all have excellent ratings and can handle urgent repairs.';
        suggestions = ['Emergency plumber now', 'Schedule plumbing visit', 'Compare plumber prices'];
      } else if (message.includes('price') || message.includes('cost') || message.includes('cheap')) {
        botResponse = 'I can help you find budget-friendly options! What type of service are you looking for? I can filter by your price range and show you the best value providers in your area.';
        suggestions = ['Under $30 services', 'Under $50 services', 'Best value options'];
      } else if (message.includes('urgent') || message.includes('emergency') || message.includes('now')) {
        botResponse = 'I understand you need urgent help! Here are providers available right now: Emergency Repair Services (available 24/7), Quick Response Team (2-hour response), and Instant Fix Solutions (1-hour response). Should I help you contact them immediately?';
        suggestions = ['Call emergency service', 'Book urgent appointment', 'Find 24/7 providers'];
      } else {
        botResponse = 'I can help you with that! To give you the best recommendations, could you tell me more about what type of service you need? I can help with cleaning, repairs, maintenance, delivery, and many other services.';
        suggestions = ['Browse all services', 'Find providers near me', 'Show popular services'];
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
    }, 1500);
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

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-800 p-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="h-[calc(100vh-2rem)] flex flex-col"
        >
          <Card className="flex-1 flex flex-col shadow-xl">
            <CardHeader className="flex-shrink-0 bg-gradient-to-r from-khadamati-blue to-khadamati-yellow text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 border-2 border-white">
                    <AvatarFallback className="bg-white text-khadamati-blue">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">Taskego AI Assistant</CardTitle>
                    <p className="text-sm text-white/80">Your smart service companion</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex-1 flex flex-col overflow-hidden"
                >
                  <CardContent className="flex-1 flex flex-col p-0">
                    <ScrollArea className="flex-1 p-4">
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
                                <Avatar className="w-8 h-8 flex-shrink-0">
                                  <AvatarFallback className="bg-khadamati-blue text-white">
                                    <Bot className="w-4 h-4" />
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              
                              <div className={`max-w-[70%] ${message.type === 'user' ? 'order-1' : ''}`}>
                                <div
                                  className={`rounded-lg px-4 py-2 ${
                                    message.type === 'user'
                                      ? 'bg-khadamati-blue text-white ml-auto'
                                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                                  }`}
                                >
                                  <p className="text-sm">{message.content}</p>
                                </div>
                                
                                {message.suggestions && (
                                  <div className="mt-2 space-y-1">
                                    {message.suggestions.map((suggestion, index) => (
                                      <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="block text-xs text-khadamati-blue hover:text-khadamati-blue/80 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-2 py-1 rounded transition-colors"
                                      >
                                        {suggestion}
                                      </button>
                                    ))}
                                  </div>
                                )}
                                
                                <p className="text-xs text-gray-500 mt-1">
                                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              
                              {message.type === 'user' && (
                                <Avatar className="w-8 h-8 flex-shrink-0 order-2">
                                  <AvatarFallback className="bg-gray-300 text-gray-700">
                                    <User className="w-4 h-4" />
                                  </AvatarFallback>
                                </Avatar>
                              )}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        
                        {isTyping && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-3"
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-khadamati-blue text-white">
                                <Bot className="w-4 h-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
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
                    <div className="border-t p-4 bg-white dark:bg-gray-900">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Input
                            ref={inputRef}
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Ask me anything about services..."
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            className="pr-20"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                            <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                              <Paperclip className="w-3 h-3" />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                              <Mic className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!inputMessage.trim() || isTyping}
                          className="bg-khadamati-blue hover:bg-khadamati-blue/90"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {['Find cleaning services', 'Emergency repair', 'Compare prices', 'Available today'].map((quickAction) => (
                          <button
                            key={quickAction}
                            onClick={() => handleSuggestionClick(quickAction)}
                            className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded-full transition-colors"
                          >
                            {quickAction}
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}