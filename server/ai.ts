import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
// Removed: import natural from 'natural';
import { Service, ServiceCategory, User } from '../shared/schema';
import { WEBSITE_KNOWLEDGE_EN, WEBSITE_KNOWLEDGE_AR } from './knowledge/websiteContent';
// @ts-ignore - Import node-fetch without type checking
import fetch from 'node-fetch';
import { OLLAMA_BASE_URL, OLLAMA_MODEL } from './config';

// Initialize OpenAI
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Initialize Anthropic (Claude)
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}) : null;

// Initialize Google Gemini (primary)
const genAI = process.env.GOOGLE_GENERATIVE_AI_API_KEY
  ? new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
  : null;

// NLP Tokenizer for text analysis (safe fallback without natural)
// Simple tokenization and stemming if 'natural' is unavailable at runtime
type SimpleTokenizer = { tokenize: (input: string) => string[] };
type SimpleStemmer = { stem: (word: string) => string };

const tokenizer: SimpleTokenizer = {
      tokenize: (text: string) =>
      (text || '').toLowerCase().split(/[^a-z0-9]+/g).filter(Boolean),
};

const stemmer: SimpleStemmer = {
  stem: (word: string) => (word || '').toLowerCase(),
};

// Ollama local LLM config (free provider) comes from central config with sane defaults

/**
 * Call Ollama API with optimized parameters for consistent, deterministic responses
 * 
 * @param messages Array of chat messages
 * @param requestStructuredOutput Whether to request JSON output
 * @returns Response string or structured object if JSON requested
 */
async function chatViaOllama(
  messages: Array<{ role: string; content: string }>,
  requestStructuredOutput: boolean = false
): Promise<string | any> {
  try {
    // Set strict timeout to ensure responsive UX
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Reduced to 3-second timeout for better UX
    
    // Prepare system instruction for structured output if needed
    if (requestStructuredOutput) {
      // Find the system message
      const systemMessageIndex = messages.findIndex(m => m.role === 'system');
      if (systemMessageIndex >= 0) {
        // Add JSON format instruction to system prompt
        messages[systemMessageIndex].content = 
          messages[systemMessageIndex].content + 
          '\n\nYou MUST respond only with JSON. No explanations, markdown or code blocks.';
      }
    }
    
    // Configure model for optimal performance on a website assistant task:
    // - Low temperature for deterministic responses
    // - Limited context size for speed
    // - Limited generation length to avoid verbose responses 
    // - Fixed seed for reproducibility
    const modelOptions = {
      temperature: 0.1,   // Very low temp for deterministic responses
      top_p: 0.9,         // Keep this high with low temp for factual responses
      num_ctx: 512,       // Limited context window for speed
      num_predict: 200,   // Limit response length
      seed: 42            // Fixed seed for reproducible outputs
    };
    
    const res = await (fetch as any)(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        options: modelOptions
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const data = await res.json();
    const content = data?.message?.content || '';
    
    // Process structured output if requested
    if (requestStructuredOutput && content) {
      try {
        // Extract JSON from the response if wrapped in code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || 
                          content.match(/({[\s\S]*})/);
                          
        if (jsonMatch && jsonMatch[1]) {
          return JSON.parse(jsonMatch[1]);
        }
        
        // Try parsing the whole response as JSON
        return JSON.parse(content);
      } catch (jsonError) {
        console.warn('Failed to parse JSON from Ollama response:', jsonError);
        return content; // Fall back to returning the raw content
      }
    }
    
    return content;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.warn('Ollama request timed out after 3 seconds');
    } else {
      console.warn('Ollama unavailable:', err);
    }
    return '';
  }
}

export class AIService {
  // Generate service recommendations based on user preferences and history
  async generateServiceRecommendations(
    userId: string,
    userPreferences: any,
    availableServices: Service[],
    serviceCategories: ServiceCategory[]
  ): Promise<Service[]> {
    try {
      if (!openai) {
        console.warn('OpenAI not configured, using basic recommendations');
        return this.generateBasicRecommendations(availableServices, userPreferences);
      }

      const prompt = `
        As an AI assistant for a service marketplace, analyze the following user data and recommend the most suitable services:
        
        User Preferences: ${JSON.stringify(userPreferences)}
        Available Services: ${JSON.stringify(availableServices.slice(0, 10))} // Limit for prompt size
        Service Categories: ${JSON.stringify(serviceCategories)}
        
        Please recommend 5-8 services that best match the user's needs, considering:
        - Location proximity
        - Budget constraints
        - Service ratings and reviews
        - User's previous booking history
        - Time availability
        
        Return a JSON array of service IDs ranked by relevance.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const recommendations = JSON.parse(response.choices[0].message.content || '[]');
      return availableServices.filter(service => recommendations.includes(service.id));
    } catch (error) {
      console.error('AI recommendation error:', error);
      // Fallback to basic filtering
      return this.generateBasicRecommendations(availableServices, userPreferences);
    }
  }

  // Fallback basic recommendations when AI is not available
  private generateBasicRecommendations(services: Service[], preferences: any): Service[] {
    let filtered = [...services];
    
    // Filter by budget if provided
    if (preferences.budget) {
      filtered = filtered.filter(service => parseFloat(service.price) <= preferences.budget);
    }
    
    // Sort by rating and review count
    filtered.sort((a, b) => {
      const aScore = parseFloat(a.rating || '0') * (a.reviewCount || 1);
      const bScore = parseFloat(b.rating || '0') * (b.reviewCount || 1);
      return bScore - aScore;
    });
    
    return filtered.slice(0, 6);
  }

  // AI-powered chatbot for customer support
  async chatbotResponse(
    message: string,
    context: {
      userId?: string;
      language: string;
      conversationHistory?: Array<{ role: string; content: string }>;
      userContext?: Record<string, any>;
      sessionId?: string;
    }
  ): Promise<string> {
    try {
      // Arabic UX: if user mentions service + price without a number, ask for budget in Arabic
      const isArabic = context.language === 'ar' || /[\u0600-\u06FF]/.test(message);
      if (isArabic) {
        const hasServiceAr = /(خدمة|تنظيف|سباكة|كهرباء|دهان|صيانة|توصيل)/i.test(message);
        const hasPriceAr = /(سعر|تكلفة|أقل من|اقل من|\$|دولار)/i.test(message);
        const hasDigits = /[0-9\u0660-\u0669]/.test(message);
        if (hasServiceAr && hasPriceAr && !hasDigits) {
          return 'ما هو الحد الأقصى للميزانية (مثلاً ٤٠$)؟';
        }
      }

      // Import guardrails
      const { validateUserInput, getOffTopicResponse, containsPromptInjection } = await import('./guardrails');

      // Always protect against prompt injection
      const inj = containsPromptInjection(message);
      if (!inj.safe) {
        return inj.reason || getOffTopicResponse(message, context.language);
      }

      // For Arabic, be permissive on-topic to improve UX
      if (context.language !== 'ar') {
        const validation = validateUserInput(message);
        if (!validation.valid) {
          console.log(`[Guardrails] Blocked off-topic message: "${message.substring(0, 50)}..."`);
          return validation.response || getOffTopicResponse(message, context.language);
        }
      }

      // Before calling AI, try to detect action intents to enable interactive capabilities
      const actionIntent = await this.detectActionIntent(message, context);
      if (actionIntent) {
        const { action, parameters } = actionIntent;
        
        try {
          const actionRequest = {
            action,
            parameters,
            userId: context.userId,
            sessionId: context.sessionId || 'session-' + Date.now(),
          };
          
          // Call AI action handler
          const { processAIAction } = await import('./ai-actions');
          const actionResponse = await processAIAction(actionRequest);
          
          if (actionResponse.success) {
            // If action requires confirmation, return confirmation message
            if (actionResponse.requiresConfirmation && actionResponse.confirmationMessage) {
              return actionResponse.confirmationMessage + "\n\nReply 'yes' to confirm or 'no' to cancel.";
            }
            
            // If action has a result, format it into a nice response
            if (actionResponse.result) {
              if (action === 'getServices') {
                const services = actionResponse.result.services;
                let responseText = context.language === 'ar' 
                  ? 'وجدت الخدمات التالية التي قد تهمك:\n\n'
                  : 'I found the following services that might interest you:\n\n';
                
                // Limit to maximum 5 services for concise output
                const limitedServices = services.slice(0, 5); 
                limitedServices.forEach((svc: any, idx: number) => {
                  const title = context.language === 'ar' ? svc.titleAr || svc.title : svc.title;
                  responseText += `${idx+1}. ${title} - $${svc.price}\n`;
                });
                
                responseText += context.language === 'ar'
                  ? '\nهل ترغب في حجز أي من هذه الخدمات؟ يمكنني مساعدتك في الحجز.'
                  : '\nWould you like to book any of these services? I can help you with the booking.';
                
                return responseText;
              }
              
              if (action === 'getServiceDetails') {
                const service = actionResponse.result.service;
                let responseText = context.language === 'ar'
                  ? `معلومات عن الخدمة: ${service.titleAr || service.title}\n\n`
                  : `Service details for: ${service.title}\n\n`;
                
                responseText += context.language === 'ar'
                  ? `السعر: $${service.price}\nمقدم الخدمة: ${service.providerName}\n`
                  : `Price: $${service.price}\nProvider: ${service.providerName}\n`;
                
                // Limit description length for concise output
                if (service.description) {
                  const shortenedDesc = service.description.length > 100 
                    ? service.description.substring(0, 100) + '...' 
                    : service.description;
                    
                  const shortenedDescAr = service.descriptionAr && service.descriptionAr.length > 100
                    ? service.descriptionAr.substring(0, 100) + '...'
                    : service.descriptionAr;
                    
                  responseText += context.language === 'ar'
                    ? `\nوصف: ${shortenedDescAr || shortenedDesc}`
                    : `\nDescription: ${shortenedDesc}`;
                }
                
                responseText += context.language === 'ar'
                  ? '\n\nهل ترغب في حجز هذه الخدمة؟'
                  : '\n\nWould you like to book this service?';
                
                return responseText;
              }
              
              if (action === 'createBooking' && actionResponse.result.bookingId) {
                return context.language === 'ar'
                  ? `تم إنشاء الحجز بنجاح! رقم الحجز الخاص بك هو #${actionResponse.result.bookingId}.`
                  : `Booking created successfully! Your booking ID is #${actionResponse.result.bookingId}.`;
              }
              
              if (action === 'cancelBooking' && actionResponse.result.bookingId) {
                return context.language === 'ar'
                  ? `تم إلغاء الحجز #${actionResponse.result.bookingId} بنجاح.`
                  : `Booking #${actionResponse.result.bookingId} has been cancelled successfully.`;
              }
            }
          } else if (actionResponse.error) {
            // Return error message from action
            return context.language === 'ar'
              ? `عذراً، لم أتمكن من إكمال الإجراء: ${actionResponse.error}`
              : `Sorry, I couldn't complete the action: ${actionResponse.error}`;
          }
        } catch (actionError) {
          console.error('Action processing error:', actionError);
          // Fall through to regular AI response
        }
      }

      // Extract topics and intents from user message for better context management
      const { extractIntents } = await import('./guardrails');
      const intents = extractIntents(message);
      
      // Only include relevant knowledge sections to reduce context size
      let knowledgeToInclude = '';
      const knowledge = context.language === 'ar' ? WEBSITE_KNOWLEDGE_AR : WEBSITE_KNOWLEDGE_EN;
      
      // Split knowledge into sections (approximate implementation)
      const knowledgeSections = knowledge.split('\n\n').filter(Boolean);
      
      // Select relevant sections based on intents
      if (intents.isBookingIntent) {
        // Add booking-related knowledge sections
        const bookingKeywords = ['book', 'scheduling', 'appointment', 'reservation'];
        knowledgeToInclude += knowledgeSections
          .filter(section => bookingKeywords.some(kw => section.toLowerCase().includes(kw)))
          .join('\n\n');
      }
      
      if (intents.isPaymentIntent) {
        // Add payment-related knowledge sections
        const paymentKeywords = ['payment', 'price', 'cost', 'refund'];
        knowledgeToInclude += knowledgeSections
          .filter(section => paymentKeywords.some(kw => section.toLowerCase().includes(kw)))
          .join('\n\n');
      }
      
      // If specific services were mentioned, include only those service details
      if (intents.identifiedServices.length > 0) {
        const serviceKeywords = intents.identifiedServices;
        knowledgeToInclude += knowledgeSections
          .filter(section => serviceKeywords.some(kw => section.toLowerCase().includes(kw)))
          .join('\n\n');
      }
      
      // If we didn't find any specific sections, use a concise general knowledge subset
      if (!knowledgeToInclude) {
        // Take just the first few sections as general knowledge
        knowledgeToInclude = knowledgeSections.slice(0, 3).join('\n\n');
      }

      // Create an optimized system prompt with reduced knowledge
      const systemPrompt = `You are Taskigo (Khadamati) Website Assistant - a strictly controlled AI that ONLY discusses the Taskigo service marketplace website.
Rules (CRITICALLY IMPORTANT):
- You can ONLY discuss the Taskigo website, its services, features, and usage.
- NEVER discuss politics, news, celebrities, other companies, or any topics outside of Taskigo's services.
- Always respond in ${context.language === 'ar' ? 'Arabic' : 'English'}.
- Keep responses VERY concise - use 1-3 sentences when possible.
- If asked about specific services (cleaning, AC repair, etc.), provide specific pricing and information.
- Focus on helping users book services, find information, or contact support.
- NEVER make up information not in your knowledge base.

Knowledge (use ONLY this information for your responses):
"""
${knowledgeToInclude}
"""`;

      // Add previous 2-3 messages for minimal context
      let relevantHistory: Array<{ role: string; content: string }> = [];
      if (context.conversationHistory && context.conversationHistory.length > 0) {
        // Get just the most recent 2-3 messages for context
        relevantHistory = context.conversationHistory.slice(-3);
      }

      const messages = [
        { role: 'system', content: systemPrompt },
        ...relevantHistory,
        { role: 'user', content: message },
      ];

      // Try Gemini first, then OpenAI, then Ollama
      if (genAI) {
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const geminiSystem = (messages.find(m => (m as any).role === 'system') as any)?.content || '';
          const langHint = context.language === 'ar' ? 'Always respond in Arabic (العربية) using clear, concise sentences.' : 'Always respond in English with concise sentences.';
          const prompt = `${geminiSystem}\n\n${langHint}\n\nUser: ${message}`;
          const resp: any = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }]}],
            generationConfig: { temperature: 0.2, maxOutputTokens: 220 },
          } as any);
          const text = resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text || resp?.response?.text || '';
          if (text) return text;
        } catch (e: any) {
          console.warn('Gemini failed, falling back to OpenAI/Ollama:', e?.message);
        }
      }

      if (openai) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: messages as any,
          temperature: 0.3, // Lower temperature for more deterministic responses
          max_tokens: 200,  // Limit token count for faster, concise responses
        });
        return (
          response.choices[0].message.content ||
          this.generateFallbackResponse(message, context.language)
        );
      }

      // Call Ollama with our optimized system prompt and settings
      const ollamaText = await chatViaOllama(messages as any);
      if (ollamaText) return ollamaText;
      
      // If all else fails, use our rule-based fallback response system
      return this.generateFallbackResponse(message, context.language);
    } catch (error) {
      console.error('Chatbot error:', error);
      return this.generateFallbackResponse(message, context.language);
    }
  }
  
  /**
   * Detect if the user's message contains an action intent that can be automated
   */
  private async detectActionIntent(message: string, context: any): Promise<{ action: string; parameters: any } | null> {
    const lower = message.toLowerCase();
    const language = context.language || 'en';
    
    // Check for confirmation of a previous action
    const isConfirmation = /^(yes|yeah|yep|sure|ok|confirmed|نعم|اجل|تأكيد|موافق)$/i.test(lower);
    if (isConfirmation && context.pendingAction) {
      return {
        action: context.pendingAction.action,
        parameters: {
          ...context.pendingAction.parameters,
          confirmed: true
        }
      };
    }
    
    // Check for booking intent
    const bookingPatterns = language === 'ar' 
      ? /حجز|احجز|أريد حجز|أود أن أحجز|يمكنني الحجز/i
      : /book|schedule|reserve|make.+appointment|can i book/i;
      
    if (bookingPatterns.test(lower)) {
      // Extract service information
      const service = this.extractServiceInfo(message, language);
      
      // Extract date and time information
      const date = this.extractDateInfo(message, language);
      const time = this.extractTimeInfo(message, language);
      
      // Extract location information
      const location = this.extractLocationInfo(message, language);
      
      if (service) {
        return {
          action: 'createBooking',
          parameters: {
            serviceType: service,
            scheduledDate: date || new Date().toISOString().split('T')[0], // Default to today
            scheduledTime: time || '12:00', // Default to noon
            location: location,
            clientAddress: location || 'To be provided'
          }
        };
      }
    }
    
    // Check for service information request
    const serviceInfoPatterns = language === 'ar'
      ? /معلومات عن|تفاصيل|اخبرني عن|ما هي|كم سعر|سعر/i
      : /info about|details|tell me about|what is|how much|price of|cost of/i;
      
    if (serviceInfoPatterns.test(lower)) {
      const service = this.extractServiceInfo(message, language);
      if (service) {
        return {
          action: 'getServiceDetails',
          parameters: {
            serviceTitle: service
          }
        };
      }
    }
    
    // Check for listing/browsing services
    const listServicePatterns = language === 'ar'
      ? /اظهر|أظهر|اعرض|أعرض|قائمة|ابحث عن|أبحث عن|اريد|أريد/i
      : /show|list|display|find|search for|looking for|available|i want|i need/i;
      
    if (listServicePatterns.test(lower)) {
      const service = this.extractServiceInfo(message, language);
      const location = this.extractLocationInfo(message, language);
      
      // Price range extraction
      let priceRange = null;
      const priceMatch = lower.match(/(under|less than|cheaper than|max|maximum|up to) \$?(\d+)/i);
      if (priceMatch && priceMatch[2]) {
        const maxPrice = parseInt(priceMatch[2]);
        priceRange = `0-${maxPrice}`;
      }
      
      return {
        action: 'getServices',
        parameters: {
          category: service,
          location: location,
          priceRange: priceRange,
          limit: 5
        }
      };
    }
    
    // Check for booking cancellation
    const cancelBookingPatterns = language === 'ar'
      ? /الغ|ألغ|الغي|ألغي|إلغاء|الغاء/i
      : /cancel|remove|delete|undo/i;
      
    const bookingIdMatch = lower.match(/(booking|reservation|appointment|order|#)\s*(\d+)/i);
    
    if (cancelBookingPatterns.test(lower) && bookingIdMatch) {
      const bookingId = bookingIdMatch[2];
      return {
        action: 'cancelBooking',
        parameters: {
          bookingId,
          reason: 'Cancelled via AI assistant'
        }
      };
    }
    
    // No recognized action intent
    return null;
  }
  
  /**
   * Extract service information from message
   */
  private extractServiceInfo(message: string, language: string): string | null {
    const lower = message.toLowerCase();
    
    // Common service types in both languages
    const serviceTypes = [
      { en: ['cleaning', 'maid', 'cleaner'], ar: ['تنظيف', 'نظافة', 'تنظيف المنزل'] },
      { en: ['plumbing', 'plumber', 'leak', 'pipe'], ar: ['سباكة', 'سباك', 'تسرب', 'أنابيب'] },
      { en: ['electrical', 'electrician', 'wiring'], ar: ['كهرباء', 'كهربائي', 'أسلاك'] },
      { en: ['ac', 'air conditioning', 'hvac', 'air conditioner'], ar: ['تكييف', 'مكيف', 'تبريد'] },
      { en: ['delivery', 'courier', 'shipping'], ar: ['توصيل', 'شحن'] },
      { en: ['maintenance', 'repair', 'fix'], ar: ['صيانة', 'إصلاح', 'تصليح'] },
      { en: ['painting', 'painter'], ar: ['دهان', 'طلاء', 'صباغ'] },
      { en: ['gardening', 'landscaping', 'lawn'], ar: ['حديقة', 'بستنة', 'زراعة'] }
    ];
    
    // Check for service mentions
    for (const service of serviceTypes) {
      const terms = language === 'ar' ? service.ar : service.en;
      if (terms.some(term => lower.includes(term))) {
        return language === 'ar' ? service.ar[0] : service.en[0];
      }
    }
    
    return null;
  }
  
  /**
   * Extract date information from message
   */
  private extractDateInfo(message: string, language: string): string | null {
    const lower = message.toLowerCase();
    
    // Check for explicit date format YYYY-MM-DD
    const dateMatch = lower.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) return dateMatch[1];
    
    // Check for day references
    const today = new Date();
    
    if (language === 'ar') {
      if (/اليوم/.test(lower)) return today.toISOString().split('T')[0];
      if (/غدا|غداً/.test(lower)) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      }
      if (/بعد غد|بعد غداً/.test(lower)) {
        const dayAfter = new Date(today);
        dayAfter.setDate(dayAfter.getDate() + 2);
        return dayAfter.toISOString().split('T')[0];
      }
    } else {
      if (/today/.test(lower)) return today.toISOString().split('T')[0];
      if (/tomorrow/.test(lower)) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
      }
      if (/day after tomorrow|day after tmrw/.test(lower)) {
        const dayAfter = new Date(today);
        dayAfter.setDate(dayAfter.getDate() + 2);
        return dayAfter.toISOString().split('T')[0];
      }
    }
    
    // Check for day of week references
    const weekdays = [
      { en: 'sunday', ar: 'الأحد' },
      { en: 'monday', ar: 'الإثنين' },
      { en: 'tuesday', ar: 'الثلاثاء' },
      { en: 'wednesday', ar: 'الأربعاء' },
      { en: 'thursday', ar: 'الخميس' },
      { en: 'friday', ar: 'الجمعة' },
      { en: 'saturday', ar: 'السبت' }
    ];
    
    for (let i = 0; i < weekdays.length; i++) {
      const day = language === 'ar' ? weekdays[i].ar : weekdays[i].en;
      if (lower.includes(day)) {
        const targetDay = i;
        const currentDay = today.getDay();
        let daysToAdd = targetDay - currentDay;
        if (daysToAdd <= 0) daysToAdd += 7; // Next week if day has passed
        
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() + daysToAdd);
        return targetDate.toISOString().split('T')[0];
      }
    }
    
    // No date found
    return null;
  }
  
  /**
   * Extract time information from message
   */
  private extractTimeInfo(message: string, language: string): string | null {
    const lower = message.toLowerCase();
    
    // Check for explicit time format HH:MM
    const timeMatch = lower.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hours = timeMatch[1].padStart(2, '0');
      return `${hours}:${timeMatch[2]}`;
    }
    
    // Check for hour references
    const hourMatch = lower.match(/(\d{1,2})\s*(am|pm|صباحا|صباحاً|مساءا|مساءً)/i);
    if (hourMatch) {
      let hour = parseInt(hourMatch[1]);
      const period = hourMatch[2].toLowerCase();
      
      // Convert to 24-hour format
      if (/(pm|مساءا|مساءً)/i.test(period) && hour < 12) {
        hour += 12;
      } else if (/(am|صباحا|صباحاً)/i.test(period) && hour === 12) {
        hour = 0;
      }
      
      return `${hour.toString().padStart(2, '0')}:00`;
    }
    
    // Check for time of day references
    if (language === 'ar') {
      if (/صباح/.test(lower)) return '09:00';
      if (/ظهر/.test(lower)) return '12:00';
      if (/بعد الظهر|عصر/.test(lower)) return '15:00';
      if (/مساء/.test(lower)) return '19:00';
      if (/ليل/.test(lower)) return '21:00';
    } else {
      if (/morning/.test(lower)) return '09:00';
      if (/noon/.test(lower)) return '12:00';
      if (/afternoon/.test(lower)) return '15:00';
      if (/evening/.test(lower)) return '19:00';
      if (/night/.test(lower)) return '21:00';
    }
    
    // No time found
    return null;
  }
  
  /**
   * Extract location information from message
   */
  private extractLocationInfo(message: string, language: string): string | null {
    const lower = message.toLowerCase();
    
    // Common locations in Lebanon
    const locations = [
      { en: 'beirut', ar: 'بيروت' },
      { en: 'tripoli', ar: 'طرابلس' },
      { en: 'sidon', ar: 'صيدا' },
      { en: 'tyre', ar: 'صور' },
      { en: 'byblos', ar: 'جبيل' },
      { en: 'baalbek', ar: 'بعلبك' },
      { en: 'jounieh', ar: 'جونية' },
      { en: 'nabatieh', ar: 'النبطية' }
    ];
    
    for (const loc of locations) {
      if (language === 'ar') {
        if (lower.includes(loc.ar)) return loc.en; // Return English name for consistency
      } else {
        if (lower.includes(loc.en)) return loc.en;
      }
    }
    
    // No location found
    return null;
  }

  // Fallback responses when AI is not available
  private generateFallbackResponse(message: string, language: string = 'en'): string {
    const lower = message.toLowerCase();

    // Simple extractors
    const detectService = () => {
      if (/clean|maid|تنظيف|نظافة/.test(lower)) return 'cleaning';
      if (/plumb|leak|سباكة|تسرب/.test(lower)) return 'plumbing';
      if (/electri|كهرباء|كهربائي/.test(lower)) return 'electrical';
      if (/deliver|courier|توصيل/.test(lower)) return 'delivery';
      if (/ac|air|condition|تكييف|مكيف/.test(lower)) return 'ac_repair';
      if (/mainten|صيانة/.test(lower)) return 'maintenance';
      if (/paint|دهان|طلاء/.test(lower)) return 'painting';
      if (/garden|lawn|حديقة|بستنة/.test(lower)) return 'gardening';
      if (/tutor|lesson|دروس|تدريس/.test(lower)) return 'tutoring';
      return '';
    };
    
    const detectLocation = () => {
      if (/beirut|بيروت/.test(lower)) return 'Beirut';
      if (/tripoli|طرابلس/.test(lower)) return 'Tripoli';
      if (/sidon|saida|صيدا/.test(lower)) return 'Sidon';
      if (/tyre|صور/.test(lower)) return 'Tyre';
      if (/jbeil|byblos|جبيل/.test(lower)) return 'Jbeil';
      if (/batroun|بترون/.test(lower)) return 'Batroun';
      if (/nabatieh|نبطية/.test(lower)) return 'Nabatieh';
      return '';
    };
    
    const detectDate = () => {
      const explicit = lower.match(/(\d{4}-\d{2}-\d{2})/);
      if (explicit) return explicit[1];
      if (/today|اليوم/.test(lower)) return new Date().toISOString().split('T')[0];
      if (/tomorrow|غدا|غداً/.test(lower)) {
        const d = new Date(); d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
      }
      
      // Try to detect relative days
      const daysMatch = lower.match(/(\d+)\s*(day|days|يوم|ايام|أيام)/);
      if (daysMatch) {
        const days = parseInt(daysMatch[1], 10);
        if (!isNaN(days) && days < 30) { // Reasonable limit
          const d = new Date(); 
          d.setDate(d.getDate() + days);
          return d.toISOString().split('T')[0];
        }
      }
      
      return '';
    };
    
    const detectTime = () => {
      const t = lower.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
      if (t) return `${t[1].padStart(2,'0')}:${t[2]}`;
      if (/morning|صباح/.test(lower)) return '09:00';
      if (/noon|ظهر/.test(lower)) return '12:00';
      if (/afternoon|عصر/.test(lower)) return '14:00';
      if (/evening|مساء/.test(lower)) return '17:00';
      
      // Try to detect hour number
      const hourMatch = lower.match(/\b(\d{1,2})\s*(am|pm|صباحا|صباحاً|مساءا|مساءً)\b/i);
      if (hourMatch) {
        let hour = parseInt(hourMatch[1], 10);
        if (!isNaN(hour) && hour >= 1 && hour <= 12) {
          if (/(pm|مساءا|مساءً)/i.test(hourMatch[2]) && hour < 12) hour += 12;
          return `${hour.toString().padStart(2, '0')}:00`;
        }
      }
      
      return '';
    };

    const serviceType = detectService();
    const location = detectLocation();
    const date = detectDate();
    const time = detectTime();
    const bookingParams = new URLSearchParams();
    if (serviceType) bookingParams.set('serviceType', serviceType);
    if (date) bookingParams.set('date', date);
    if (time) bookingParams.set('time', time);
    if (location) bookingParams.set('location', location);

    // Arabic responses
    if (language === 'ar') {
      if (/(book|booking|احجز|حجز)/.test(lower)) {
        const link = `/booking${bookingParams.toString() ? `?${bookingParams.toString()}` : ''}`;
        return `يمكنني مساعدتك بالحجز! انقر على هذا الرابط لتعبئة النموذج وإكمال الحجز: ${link}`;
      }
      
      if (/(pay|payment|apple pay|stripe|دفع|ابل باي)/.test(lower)) {
        return 'نقبل الدفع عبر البطاقات المصرفية (Stripe) وقريباً Apple Pay. يمكنك أيضاً إكمال الحجز وتسديد الدفع بعد تأكيد مزود الخدمة للحجز.';
      }
      
      if (/(recommend|اقتراح|اقتراحات|أفضل خدمة)/.test(lower)) {
        const serviceMsg = serviceType 
          ? `لخدمة ${serviceType === 'cleaning' ? 'التنظيف' : serviceType === 'electrical' ? 'الكهرباء' : 'المطلوبة'}، `
          : '';
        const locationMsg = location ? `في ${location}، ` : '';
        return `${serviceMsg}${locationMsg}لدينا عدة خيارات متميزة. أخبرني بميزانيتك ومتطلباتك الخاصة وسأقدم لك أفضل التوصيات.`;
      }
      
      if (/(cheapest|رخيص|أرخص)/.test(lower) && /clean|تنظيف/.test(lower)) {
        return 'خدمة التنظيف الأساسي للمنزل هي الأرخص، تبدأ من ٣٠ دولار لمدة ساعتين. يمكنك حجزها الآن مباشرة: /booking?serviceType=cleaning';
      }
      
      if (/delivery|fast|توصيل|سريع/.test(lower)) {
        return 'نعم، لدينا خدمة توصيل سريعة في نفس اليوم! تبدأ من ١٢ دولار للتوصيل داخل المدينة. يمكنك حجز الخدمة الآن: /booking?serviceType=delivery';
      }
      
      if (/(ac repair|تكييف|مكيف|بيروت)/.test(lower)) {
        return 'نعم، لدينا خدمة إصلاح وصيانة مكيفات في بيروت! الخدمة تبدأ من ٥٠ دولار وتشمل التشخيص والإصلاح. احجز الآن: /booking?serviceType=ac_repair';
      }
      
      if (/(how to|كيف|طريقة|استخدام|حساب|تسجيل)/.test(lower)) {
        return 'استخدام تاسكيجو سهل: تصفح الخدمات، اختر الخدمة المناسبة، انقر على "احجز الآن"، أدخل تفاصيل الحجز، وأكمل الدفع. يمكنك إنشاء حساب أو تسجيل الدخول لتتبع حجوزاتك والاستفادة من العروض الخاصة.';
      }
      
      if (/(price|cost|charge|how much|سعر|تكلفة|كم يكلف)/.test(lower)) {
        if (serviceType === 'cleaning') {
          return 'تبدأ أسعار خدمات التنظيف من ٣٠ دولار للتنظيف الأساسي، و٥٠ دولار للتنظيف العميق. السعر النهائي يعتمد على حجم المكان ومتطلباتك الخاصة.';
        } else if (serviceType === 'ac_repair') {
          return 'تبدأ أسعار خدمات صيانة وإصلاح المكيفات من ٥٠ دولار للإصلاح السريع، و٨٠ دولار للصيانة الكاملة التي تشمل التنظيف العميق وفحص النظام بالكامل.';
        } else if (serviceType) {
          return `أسعار الخدمات تختلف حسب متطلباتك. يرجى زيارة صفحة الخدمة للحصول على الأسعار التفصيلية أو إخبارنا بميزانيتك لنقدم لك الخيارات المناسبة.`;
        }
        return 'تختلف أسعار الخدمات حسب النوع والمزود. يمكنك الاطلاع على الأسعار التفصيلية في صفحة كل خدمة. أخبرنا بنوع الخدمة التي تبحث عنها وسنوفر لك المعلومات الدقيقة.';
      }
      
      return 'مرحباً! أنا مساعد تاسكيجو. يمكنني مساعدتك في العثور على الخدمات المناسبة، معلومات عن الأسعار، أو حجز موعد. كيف يمكنني مساعدتك اليوم؟';
    }

    // English responses
    if (/(book|booking)/.test(lower)) {
      const link = `/booking${bookingParams.toString() ? `?${bookingParams.toString()}` : ''}`;
      return `I can help you book a service! Click this link to complete your booking with all details pre-filled: ${link}`;
    }
    
    if (/(price|cost|charge|how much)/.test(lower)) {
      if (serviceType === 'cleaning') {
        return 'Cleaning services start at $30 for basic cleaning and $50 for deep cleaning. The final price depends on the size of your space and specific requirements.';
      } else if (serviceType === 'ac_repair') {
        return 'AC repair services start at $50 for quick diagnosis and minor fixes. A complete AC service including deep cleaning and full system check costs $80.';
      } else if (serviceType) {
        return `${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)} service pricing varies based on your specific needs. Visit the service page for detailed pricing or let me know your budget for suitable options.`;
      }
      return 'Prices vary by service and provider. Check specific service pages for detailed pricing or tell me what service you need and I can provide more information.';
    }
    
    if (/(recommend|suggest)/.test(lower)) {
      const serviceMsg = serviceType ? `For ${serviceType} services, ` : '';
      const locationMsg = location ? `in ${location}, ` : '';
      return `${serviceMsg}${locationMsg}we have several excellent options. Tell me about your budget and specific requirements, and I'll provide tailored recommendations.`;
    }
    
    if (/(cheapest).*?(cleaning)/.test(lower)) {
      return 'Our Basic Home Cleaning is the most affordable option at $30 for a 2-hour standard cleaning service. Book it now at: /booking?serviceType=cleaning';
    }
    
    if (/delivery|fast/.test(lower)) {
      return 'Yes, we have same-day delivery services! Starting at $12 for in-city deliveries, perfect for documents and small packages. Book now: /booking?serviceType=delivery';
    }
    
    if (/(ac repair).*?(beirut)/.test(lower)) {
      return 'Yes, we offer AC repair services in Beirut! Our AC Repair Quick Fix service starts at $50 and includes diagnosis and minor repairs. Book now: /booking?serviceType=ac_repair';
    }
    
    if (/(electrical|electrician)/.test(lower)) {
      return 'We have professional electrical services for all your needs. Our electricians can handle outlet repairs, light fixture installation, and more starting at $45/hour. Book now: /booking?serviceType=electrical';
    }
    
    if (/(plumbing|plumber|leak)/.test(lower)) {
      return 'Our plumbing services cover everything from fixing leaks to installations. Expert plumbers available starting at $40/hour. Book now: /booking?serviceType=plumbing';
    }
    
    if (/(pay|payment|apple pay|stripe|card)/.test(lower)) {
      return 'We accept payments via credit/debit cards through Stripe, with Apple Pay coming soon. You can also book first and pay after your service provider confirms the booking.';
    }
    
    if (/(how to|use|sign up|register|account)/.test(lower)) {
      return 'Using Taskigo is easy! Browse services, select one that fits your needs, click "Book Now", enter booking details, and complete payment. Create an account or sign in to track your bookings and access special offers.';
    }
    
    return "Hi! I'm the Taskigo assistant. I can help you find services, get pricing information, or book appointments. How can I assist you today?";
  }

  // Smart service matching based on natural language descriptions
  async matchServicesByDescription(
    description: string,
    availableServices: Service[],
    categories: ServiceCategory[]
  ): Promise<{
    matches: Service[];
    confidence: number;
    suggestions: string[];
  }> {
    try {
      if (!openai) {
        // Apply guardrails - only select a few relevant services to include in context
        const { extractIntents } = await import('./guardrails');
        const intents = extractIntents(description);
        
        // Filter services to reduce context size
        let relevantServices = availableServices;
        if (intents.identifiedServices.length > 0) {
          // Filter services by detected types
          relevantServices = availableServices.filter(s => {
            const serviceText = `${s.title} ${s.description}`.toLowerCase();
            return intents.identifiedServices.some(type => 
              serviceText.includes(type.toLowerCase())
            );
          });
          
          // If no matches, keep a subset of services
          if (relevantServices.length === 0) {
            relevantServices = availableServices.slice(0, 5);
          }
        } else {
          // Limit to 5 services to reduce context size
          relevantServices = availableServices.slice(0, 5);
        }
        
        // Try Ollama for semantic matching with structured output
        const prompt = `Match this user request to the most relevant services.
Request: "${description}"
Services: ${JSON.stringify(relevantServices.map(s => ({ 
  id: s.id, 
  title: s.title, 
  description: s.description && s.description.substring(0, 100),
  category: s.categoryId, 
  price: s.price 
})))}
Categories: ${JSON.stringify(categories.map(c => ({ id: c.id, name: c.name })))}

Your task is to identify which services best match the user request.
You must respond in JSON format with:
{
  "matchedServiceIds": [array of service IDs that match],
  "confidence": number between 0-1 indicating match confidence,
  "suggestions": [1-2 suggestions for the user]
}`;

        // Use the structured output mode to get proper JSON
        const result = await chatViaOllama([
          { role: 'system', content: 'You are a service matching assistant. You must ONLY return valid JSON.' },
          { role: 'user', content: prompt }
        ], true); // true = request structured output
        
        // Check if we got a valid result object
        if (result && typeof result === 'object' && result.matchedServiceIds) {
          return {
            matches: availableServices.filter(s => result.matchedServiceIds?.includes(s.id)),
            confidence: result.confidence || 0.5,
            suggestions: result.suggestions || []
          };
        }
        
        return this.generateBasicMatches(description, availableServices);
      }

      const prompt = `
        Analyze this service request and match it with the most relevant services:
        
        User Request: "${description}"
        Available Services: ${JSON.stringify(availableServices.map(s => ({
          id: s.id,
          title: s.title,
          description: s.description,
          category: s.categoryId
        })))}
        Categories: ${JSON.stringify(categories)}
        
        Return a JSON object with:
        {
          "matchedServiceIds": [array of service IDs],
          "confidence": number (0-1),
          "suggestions": [array of helpful suggestions for the user]
        }
      `;

      const response = await openai!.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 800,
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        matches: availableServices.filter(service => 
          result.matchedServiceIds?.includes(service.id)
        ),
        confidence: result.confidence || 0.5,
        suggestions: result.suggestions || []
      };
    } catch (error) {
      console.error('Service matching error:', error);
      return {
        matches: [],
        confidence: 0,
        suggestions: ['Please try describing your service needs more specifically.']
      };
    }
  }

  // Basic fallback matching when AI is not available
  private generateBasicMatches(description: string, services: Service[]): {
    matches: Service[];
    confidence: number;
    suggestions: string[];
  } {
    const lowerDescription = description.toLowerCase();
    const tokens = lowerDescription.split(/\s+/);
    
    const matches = services.filter(service => {
      const searchText = `${service.title} ${service.description}`.toLowerCase();
      return tokens.some(token => searchText.includes(token));
    });
    
    return {
      matches: matches.slice(0, 5),
      confidence: matches.length > 0 ? 0.6 : 0.1,
      suggestions: matches.length === 0 ? 
        ['Try using more specific keywords', 'Browse our service categories', 'Contact support for help'] : 
        [`Found ${matches.length} matching services`]
    };
  }

  // Generate dynamic pricing suggestions based on market analysis
  async generatePricingSuggestions(
    serviceType: string,
    location: string,
    duration: number,
    competitorPrices: number[]
  ): Promise<{
    suggestedPrice: number;
    priceRange: { min: number; max: number };
    marketAnalysis: string;
  }> {
    try {
      const prompt = `
        As a pricing expert for service marketplaces, analyze the market and suggest optimal pricing:
        
        Service Type: ${serviceType}
        Location: ${location}
        Duration: ${duration} minutes
        Competitor Prices: ${competitorPrices.join(', ')}
        
        Provide pricing analysis considering:
        - Market competition
        - Service complexity
        - Location-based pricing variations
        - Duration-based calculations
        
        Return JSON format:
        {
          "suggestedPrice": number,
          "priceRange": {"min": number, "max": number},
          "marketAnalysis": "detailed analysis string"
        }
      `;

      if (!openai) {
        throw new Error('OpenAI not configured');
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 600,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Pricing analysis error:', error);
      const avgPrice = competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length || 50;
      return {
        suggestedPrice: Math.round(avgPrice),
        priceRange: { min: Math.round(avgPrice * 0.8), max: Math.round(avgPrice * 1.2) },
        marketAnalysis: 'Basic pricing analysis based on competitor average.'
      };
    }
  }

  // Added: parse booking intent from natural language (basic heuristic)
  async parseBookingIntent(query: string, context: any = {}): Promise<any> {
    const lower = query.toLowerCase();
    const intent = {
      serviceType: (/clean|maid/.test(lower) && 'cleaning') || (/plumb|leak/.test(lower) && 'plumbing') || (/electric/.test(lower) && 'electrical') || null,
      date: null as string | null,
      time: null as string | null,
      location: context.location || null,
      details: query,
    };
    return intent;
  }

  // Added: compare services (simple score)
  async compareServices(services: Partial<Service>[]): Promise<{ comparison: any[]; recommendation: any | null }> {
    const scored = services
      .filter(Boolean)
      .map((s: any) => ({
        id: s.id,
        title: s.title,
        price: parseFloat(s.price || '0'),
        rating: parseFloat(s.rating || '0'),
        score: (parseFloat(s.rating || '0') || 0) * 10 - (parseFloat(s.price || '0') || 0) * 0.2,
      }))
      .sort((a, b) => b.score - a.score);
    return { comparison: scored, recommendation: scored[0] || null };
  }

  // Sentiment analysis for reviews and feedback
  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    keywords: string[];
  }> {
    try {
      // Try to load 'natural' dynamically; if it fails, fall back below
      const natMod: any = await import('natural').then(m => (m as any).default ?? m);
      const analyzer = new natMod.SentimentAnalyzer('English', natMod.PorterStemmer, 'negation');
      const tokens = tokenizer.tokenize(text.toLowerCase());
      const stemmedTokens = tokens?.map((token) => natMod.PorterStemmer.stem(token)) || [];
      const score = analyzer.getSentiment(stemmedTokens);

      let sentiment: 'positive' | 'negative' | 'neutral';
      if (score > 0.1) sentiment = 'positive';
      else if (score < -0.1) sentiment = 'negative';
      else sentiment = 'neutral';

      return { sentiment, score, keywords: tokens?.slice(0, 5) || [] };
    } catch (error) {
      // Fallback to simple analysis when 'natural' or its deps are unavailable
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect'];
      const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst'];
      const lowerText = (text || '').toLowerCase();
      const hasPositive = positiveWords.some((w) => lowerText.includes(w));
      const hasNegative = negativeWords.some((w) => lowerText.includes(w));
      const score = (hasPositive ? 1 : 0) - (hasNegative ? 1 : 0);
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
      if (score > 0) sentiment = 'positive';
      if (score < 0) sentiment = 'negative';
      return { sentiment, score, keywords: tokenizer.tokenize(lowerText).slice(0, 5) };
    }
  }

  // Generate automated responses for common queries
  async generateAutoResponse(
    query: string,
    queryType: 'booking' | 'pricing' | 'availability' | 'support' | 'general',
    context: any = {}
  ): Promise<string> {
    try {
      const kbEnforcedPrompt = `You are Taskigo Website Assistant. Only answer website-related questions and use the knowledge below. If out-of-scope, politely refuse and redirect to website topics.

Knowledge:
${WEBSITE_KNOWLEDGE_EN}`;

      // Prefer Gemini as primary
      if (genAI) {
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const prompt = `${kbEnforcedPrompt}\n\nUser: ${query}`;
          const resp: any = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }]}],
            generationConfig: { temperature: 0.2, maxOutputTokens: 260 },
          } as any);
          const text = resp?.response?.candidates?.[0]?.content?.parts?.[0]?.text || resp?.response?.text || '';
          if (text) return text;
        } catch {}
      }

      if (openai) {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: kbEnforcedPrompt },
            { role: "user", content: query }
          ],
          temperature: 0.3,
          max_tokens: 250,
        });

        return response.choices[0].message.content || "I'd be happy to help you with that. Could you provide more details?";
      }

      // Final fallback when no providers are available
      return "Thank you for your question. Our team will get back to you soon.";
    } catch (error) {
      console.error('Auto-response error:', error);
      return "Thank you for your question. Our team will get back to you soon.";
    }
  }

  // Quality assessment for service provider profiles
  async assessProviderProfile(provider: User, services: Service[]): Promise<{
    score: number;
    recommendations: string[];
    strengths: string[];
    improvementAreas: string[];
  }> {
    try {
      const prompt = `
        Analyze this service provider profile and provide quality assessment:
        
        Provider: ${JSON.stringify({
          firstName: provider.firstName,
          lastName: provider.lastName,
          role: provider.role,
          isVerified: provider.isVerified
        })}
        
        Services: ${JSON.stringify(services.map(s => ({
          title: s.title,
          description: s.description,
          rating: s.rating,
          reviewCount: s.reviewCount
        })))}
        
        Provide assessment with:
        - Overall quality score (0-100)
        - Key strengths
        - Areas for improvement
        - Specific recommendations
        
        Return JSON format.
      `;

      if (!openai) {
        throw new Error('OpenAI not configured');
      }

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 800,
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } catch (error) {
      console.error('Profile assessment error:', error);
      return {
        score: 75,
        recommendations: ['Complete your profile information', 'Add more service descriptions'],
        strengths: ['Verified account'],
        improvementAreas: ['Profile completeness']
      };
    }
  }
}

export const aiService = new AIService();