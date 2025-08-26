import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, AlertTriangle, CheckCircle, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';

interface FloatingChatProps {
  messages: any;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  requiresConfirmation?: boolean;
  confirmationToken?: string;
  confirmationAction?: string;
  confirmationParams?: Record<string, any>;
  isProcessing?: boolean;
}

export default function FloatingChat({ messages }: FloatingChatProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState<string>(`session-${Date.now()}`);
  const [pendingConfirmation, setPendingConfirmation] = useState<ChatMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Add welcome message when chat is opened for the first time
  useEffect(() => {
    if (isOpen && chatMessages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: messages.chat?.welcome || 'Hello! I am the Taskigo assistant. How can I help you today?',
        isUser: false,
        timestamp: new Date()
      };
      setChatMessages([welcomeMessage]);
    }
  }, [isOpen, chatMessages.length, messages.chat?.welcome]);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [chatMessages]);

  // Check if a message contains confirmation keywords
  const isConfirmationMessage = (text: string): boolean => {
    const lower = text.toLowerCase();
    return /^(yes|yeah|yep|sure|ok|confirmed|نعم|اجل|تأكيد|موافق)$/i.test(lower);
  };
  
  // Check if a message contains rejection keywords
  const isRejectionMessage = (text: string): boolean => {
    const lower = text.toLowerCase();
    return /^(no|nope|cancel|stop|don\'t|dont|لا|كلا|الغاء|توقف)$/i.test(lower);
  };
  
  // Process confirmation/rejection of pending action
  const handleConfirmationResponse = async (message: string, confirmationMessage: ChatMessage) => {
    if (isConfirmationMessage(message)) {
      // User confirmed the action
      try {
        setIsLoading(true);
        
        // Mark the confirmation message as processing
        setChatMessages(prev => 
          prev.map(msg => 
            msg.id === confirmationMessage.id 
              ? {...msg, isProcessing: true} 
              : msg
          )
        );
        
        // Call the AI action endpoint with confirmation token
        const res = await fetch('/api/ai-actions/action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            action: confirmationMessage.confirmationAction,
            parameters: confirmationMessage.confirmationParams,
            sessionId,
            confirmationToken: confirmationMessage.confirmationToken
          })
        });
        
        const data = await res.json();
        
        // Add result message
        const botResponse: ChatMessage = {
          id: Date.now().toString(),
          text: data.result?.message || 'Action completed successfully.',
          isUser: false,
          timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, botResponse]);
      } catch (error) {
        // Add error message
        const errorMsg: ChatMessage = {
          id: Date.now().toString(),
          text: 'Sorry, there was a problem completing that action. Please try again later.',
          isUser: false,
          timestamp: new Date()
        };
        
        setChatMessages(prev => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
        setPendingConfirmation(null);
      }
    } else if (isRejectionMessage(message)) {
      // User rejected the action
      const botResponse: ChatMessage = {
        id: Date.now().toString(),
        text: 'I\'ve cancelled that action. Is there anything else you\'d like me to help with?',
        isUser: false,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, botResponse]);
      setPendingConfirmation(null);
    }
  };
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    // Check if there's a pending confirmation that this message might be responding to
    if (pendingConfirmation) {
      await handleConfirmationResponse(userMessage.text, pendingConfirmation);
      setIsLoading(false);
      return;
    }

    try {
      // Get the current language
      const currentLang = document.documentElement.lang || 'en';
      
      // Prepare a basic message object for the API
      const requestData = {
        message: userMessage.text,
        language: currentLang,
        sessionId: sessionId,
      };
      
      // If user is authenticated, include their conversation history
      let endpoint = '/api/ai/chat';
      let requestMethod = 'POST';
      
      // For authenticated users, we'll use the enhanced AI actions endpoint
      if (user) {
        endpoint = '/api/ai-actions/action';
        requestMethod = 'POST';
        
        // Check if the message might contain action intent
        const intentMatch = userMessage.text.match(/(book|schedule|cancel|find|search|look|information|detail|price|cost)/i);
        
        if (intentMatch) {
          // This might be an action request, let's use the action endpoint
          requestData.action = 'detectIntent';
        }
      }
      
      const res = await fetch(endpoint, {
        method: requestMethod,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });
      
      const data = await res.json();
      
      // Check if the response requires confirmation
      if (data.requiresConfirmation && data.confirmationMessage && data.confirmationToken) {
        const bot: ChatMessage = {
          id: Date.now().toString(),
          text: data.confirmationMessage,
          isUser: false,
          timestamp: new Date(),
          requiresConfirmation: true,
          confirmationToken: data.confirmationToken,
          confirmationAction: data.action,
          confirmationParams: data.parameters
        };
        
        setChatMessages(prev => [...prev, bot]);
        setPendingConfirmation(bot);
      } else {
        // Regular chat response
        const bot: ChatMessage = {
          id: Date.now().toString(),
          text: data?.response || data?.result?.message || messages.chat?.response || 'How can I help you with the website?',
          isUser: false,
          timestamp: new Date(),
        };
        
        setChatMessages(prev => [...prev, bot]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const fallback: ChatMessage = {
        id: Date.now().toString(),
        text: 'Assistant is unavailable. Please try again later.',
        isUser: false,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, fallback]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="floating w-16 h-16 bg-gradient-to-br from-khadamati-blue to-khadamati-yellow rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="absolute bottom-20 right-0 w-80 h-96 shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-khadamati-blue to-khadamati-yellow p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="text-white">
                  <CardTitle className="text-sm font-semibold">
                    {messages.chat?.title || 'Taskego Assistant'}
                  </CardTitle>
                  <p className="text-xs opacity-90">
                    {messages.chat?.status || 'Online'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 h-64 flex flex-col">
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4 bg-khadamati-light">
              <div className="space-y-4">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start space-x-2 ${
                      message.isUser ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.isUser 
                        ? 'bg-khadamati-yellow' 
                        : message.requiresConfirmation
                          ? 'bg-amber-500'
                          : 'bg-khadamati-blue'
                    }`}>
                      {message.isUser ? (
                        <User className="h-4 w-4 text-white" />
                      ) : message.requiresConfirmation ? (
                        <AlertTriangle className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className={`max-w-xs rounded-lg p-3 ${
                      message.isUser
                        ? 'bg-khadamati-blue text-white ml-auto'
                        : message.requiresConfirmation
                          ? 'bg-amber-50 border border-amber-200 text-amber-800'
                          : 'bg-white text-khadamati-dark'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      
                      {/* Action confirmation UI */}
                      {message.requiresConfirmation && (
                        <div className="mt-2 border-t border-amber-200 pt-2 text-xs">
                          <p className="font-medium text-amber-700">Type "yes" to confirm or "no" to cancel</p>
                        </div>
                      )}
                      
                      {/* Processing indicator */}
                      {message.isProcessing && (
                        <div className="mt-2 flex items-center text-xs text-amber-600">
                          <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-amber-600 mr-1"></div>
                          Processing...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Loading indicator for new messages */}
                {isLoading && (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-khadamati-blue">
                      <div className="animate-pulse h-3 w-3 bg-white rounded-full"></div>
                    </div>
                    <div className="max-w-xs bg-white rounded-lg p-3 text-khadamati-gray flex items-center space-x-2">
                      <div className="animate-bounce h-2 w-2 bg-khadamati-gray rounded-full"></div>
                      <div className="animate-bounce h-2 w-2 bg-khadamati-gray rounded-full" style={{ animationDelay: '0.2s' }}></div>
                      <div className="animate-bounce h-2 w-2 bg-khadamati-gray rounded-full" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={messages.chat?.placeholder || 'Type your message...'}
                  className="flex-1 text-sm"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="bg-khadamati-blue hover:bg-blue-700"
                  disabled={isLoading || !inputMessage.trim()}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {pendingConfirmation && (
                <div className="mt-2 bg-amber-50 border border-amber-200 rounded-md p-2 text-xs text-amber-800 flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Action requires confirmation</p>
                    <p>Please type "yes" to confirm or "no" to cancel the action.</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
