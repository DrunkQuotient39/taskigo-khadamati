import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Paperclip, Bot, User, Settings, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Messages } from '@/lib/i18n';
import { auth } from '@/lib/firebase';

interface ChatProps {
  messages: Messages;
}

interface ActionProposal {
  intent: 'book' | 'cancel';
  proposal?: any;
  requires?: string[];
  bookingId?: number;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  actionProposal?: ActionProposal;
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

  const sendToAssistant = async (userMessage: string) => {
    setIsTyping(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: userMessage, language: document.documentElement.lang || 'en' }),
      });
      const data = await res.json();
      const botText: string = data?.response || 'Sorry, I could not process that right now.';
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: botText,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, newMessage]);

      // Attempt actionable flow (book/cancel) with confirmation
      const lower = userMessage.toLowerCase();
      const isBook = /\b(book|booking)\b/.test(lower);
      const isCancel = /\b(cancel|unbook)\b/.test(lower);
      if (isBook || isCancel) {
        try {
          const idToken = await auth.currentUser?.getIdToken();
          if (!idToken) {
            setChatMessages(prev => [...prev, { id: (Date.now()+2).toString(), type: 'bot', content: 'Please sign in to proceed with booking actions.', timestamp: new Date() }]);
            return;
          }
          const actionRes = await fetch('/api/ai/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
            body: JSON.stringify({ intent: isBook ? 'book' : 'cancel', query: userMessage, confirm: false }),
          });
          if (actionRes.ok) {
            const action = await actionRes.json();
            const proposal: ActionProposal = {
              intent: isBook ? 'book' : 'cancel',
              proposal: action.proposal,
              requires: action.requires,
              bookingId: action.proposal?.bookingId,
            };
            const followUp: ChatMessage = {
              id: (Date.now() + 3).toString(),
              type: 'bot',
              content: isBook
                ? `Proposed booking. ${action.requires?.length ? `Missing: ${action.requires.join(', ')}` : 'Ready to confirm.'}`
                : `Proposed cancellation${action.proposal?.bookingId ? ` for booking ${action.proposal.bookingId}` : ''}. Ready to confirm?`,
              timestamp: new Date(),
              actionProposal: proposal,
            };
            setChatMessages(prev => [...prev, followUp]);
          }
        } catch {}
      }
    } catch (e) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Our assistant is temporarily unavailable. Please try again later.',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, newMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const confirmProposal = async (msg: ChatMessage) => {
    if (!msg.actionProposal) return;
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
      setChatMessages(prev => [...prev, { id: Date.now().toString(), type: 'bot', content: 'Please sign in to continue.', timestamp: new Date() }]);
      return;
    }
    const intent = msg.actionProposal.intent;
    const payload: any = { intent, query: msg.content, confirm: true };
    if (intent === 'cancel' && msg.actionProposal.bookingId) payload.bookingId = msg.actionProposal.bookingId;
    try {
      const res = await fetch('/api/ai/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        const text = intent === 'book' ? `Booking created (ID: ${data.bookingId}).` : `Booking ${data.bookingId} cancelled.`;
        setChatMessages(prev => [...prev, { id: Date.now().toString(), type: 'bot', content: text, timestamp: new Date() }]);
      } else {
        setChatMessages(prev => [...prev, { id: Date.now().toString(), type: 'bot', content: data.error || 'Could not complete action.', timestamp: new Date() }]);
      }
    } catch (e) {
      setChatMessages(prev => [...prev, { id: Date.now().toString(), type: 'bot', content: 'Action failed. Try again.', timestamp: new Date() }]);
    }
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
    sendToAssistant(inputMessage);
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
                                  {message.actionProposal && (
                                    <div className="mt-2 flex gap-2">
                                      <Button size="sm" className="h-7" onClick={() => confirmProposal(message)}>Confirm</Button>
                                      <Button size="sm" variant="outline" className="h-7" onClick={() => setChatMessages(prev => [...prev, { id: Date.now().toString(), type: 'bot', content: 'Cancelled.', timestamp: new Date() }])}>Cancel</Button>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Suggestions removed to keep assistant strictly website-scoped */}
                                
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