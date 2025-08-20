import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import natural from 'natural';
import { Service, ServiceCategory, User } from '../shared/schema';
import { WEBSITE_KNOWLEDGE_EN, WEBSITE_KNOWLEDGE_AR } from './knowledge/websiteContent';
import fetch from 'node-fetch';

// Initialize OpenAI
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Initialize Anthropic (Claude)
const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
}) : null;

// NLP Tokenizer for text analysis
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Ollama local LLM config (free provider)
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.2:3b-instruct';

async function chatViaOllama(messages: Array<{ role: string; content: string }>): Promise<string> {
  try {
    const res = await (fetch as any)(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: OLLAMA_MODEL, messages, stream: false })
    });
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const data = await res.json();
    return data?.message?.content || '';
  } catch (err) {
    console.warn('Ollama unavailable:', err);
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
    }
  ): Promise<string> {
    try {
      // Strict website-only assistant: use an instruction plus embedded knowledge base.

      const knowledge = context.language === 'ar' ? WEBSITE_KNOWLEDGE_AR : WEBSITE_KNOWLEDGE_EN;
      const systemPrompt = `You are Taskego (Khadamati) Website Assistant.
Rules:
- Only answer questions about the Taskego website, its features, policies, pages, roles, bookings, payments, and usage.
- If the question is unrelated to the website, politely refuse and steer back to website topics.
- Keep responses concise, accurate, and helpful.
- Answer in the user's language (en/ar) when possible.
- If information is not in the provided knowledge, say you don’t have that info and suggest relevant sections.

Knowledge (authoritative and exhaustive for your responses):
"""
${knowledge}
"""`;

      const messages = [
        { role: 'system', content: systemPrompt },
        ...(context.conversationHistory || []),
        { role: 'user', content: message },
      ];

      // Prefer OpenAI if configured; else try local Ollama; else fallback
      if (openai) {
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: messages as any,
          temperature: 0.4,
          max_tokens: 400,
        });
        return (
          response.choices[0].message.content ||
          this.generateFallbackResponse(message, context.language)
        );
      }

      const ollamaText = await chatViaOllama(messages as any);
      if (ollamaText) return ollamaText;
      return this.generateFallbackResponse(message, context.language);
    } catch (error) {
      console.error('Chatbot error:', error);
      return this.generateFallbackResponse(message, context.language);
    }
  }

  // Fallback responses when AI is not available
  private generateFallbackResponse(message: string, language: string = 'en'): string {
    const lower = message.toLowerCase();

    // Simple extractors
    const detectService = () => {
      if (/clean|maid/.test(lower)) return 'cleaning';
      if (/plumb|leak/.test(lower)) return 'plumbing';
      if (/electri/.test(lower)) return 'electrical';
      if (/deliver|courier/.test(lower)) return 'delivery';
      if (/mainten/.test(lower)) return 'maintenance';
      if (/paint/.test(lower)) return 'painting';
      if (/garden|lawn/.test(lower)) return 'gardening';
      if (/tutor|lesson/.test(lower)) return 'tutoring';
      return '';
    };
    const detectDate = () => {
      const explicit = lower.match(/(\d{4}-\d{2}-\d{2})/);
      if (explicit) return explicit[1];
      if (/today/.test(lower)) return new Date().toISOString().split('T')[0];
      if (/tomorrow/.test(lower)) {
        const d = new Date(); d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
      }
      return '';
    };
    const detectTime = () => {
      const t = lower.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
      if (t) return `${t[1].padStart(2,'0')}:${t[2]}`;
      if (/morning/.test(lower)) return '09:00';
      if (/afternoon/.test(lower)) return '14:00';
      if (/evening/.test(lower)) return '17:00';
      return '';
    };

    const serviceType = detectService();
    const date = detectDate();
    const time = detectTime();
    const bookingParams = new URLSearchParams();
    if (serviceType) bookingParams.set('serviceType', serviceType);
    if (date) bookingParams.set('date', date);
    if (time) bookingParams.set('time', time);

    // Arabic responses
    if (language === 'ar') {
      if (/(book|booking|احجز|حجز)/.test(lower)) {
        const link = `/booking${bookingParams.toString() ? `?${bookingParams.toString()}` : ''}`;
        return `يمكنني مساعدتك بالحجز. افتح الرابط التالي لإكمال التفاصيل: ${link}`;
      }
      if (/(pay|payment|apple pay|stripe|دفع|ابل باي)/.test(lower)) {
        return 'طرق الدفع: البطاقات عبر سترايب (Apple Pay لاحقًا). يمكنك الدفع بعد تأكيد مزود الخدمة إذا كانت خاصية الدفع غير مفعلة.';
      }
      if (/(recommend|اقتراح|اقتراحات|أفضل خدمة)/.test(lower)) {
        return 'أخبرني بنوع الخدمة وميزانيتك وموقعك لأقترح لك أفضل الخيارات. مثال: تنظيف في وسط المدينة بميزانية 50.';
      }
      if (/(how to buy|كيف|طريقة|استخدام|حساب|تسجيل)/.test(lower)) {
        return 'يمكنك تصفح الخدمات، اختيار الخدمة، ثم الحجز من صفحة الحجز. أنشئ حسابًا أو سجّل الدخول لمتابعة حجوزاتك.';
      }
      return 'مرحباً! أنا مساعد تاسكيجو. اسألني عن الخدمات، الأسعار، أو احجز موعدًا وسأرشدك.';
    }

    // English responses
    if (/(book|booking)/.test(lower)) {
      const link = `/booking${bookingParams.toString() ? `?${bookingParams.toString()}` : ''}`;
      return `I can help you book. Open this link to prefill the form and complete details: ${link}`;
    }
    if (/(price|cost|how much)/.test(lower)) {
      return 'Prices vary by service and provider. Check the service page or tell me your budget and I’ll suggest options.';
    }
    if (/(pay|payment|apple pay|stripe|card)/.test(lower)) {
      return 'Payments are via cards (Stripe). Apple Pay can be enabled later. You can also book first and pay after provider confirmation.';
    }
    if (/(recommend|suggest)/.test(lower)) {
      return 'Tell me the service type, your location, and budget, and I’ll recommend the best options.';
    }
    if (/(how to buy|how to use|account|sign in|sign up|help)/.test(lower)) {
      return 'Browse services, open a service page, and click Book. Create an account or sign in to track your bookings.';
    }
    return "Hello! I'm the Taskego assistant. Ask me about services, prices, or booking and I’ll guide you.";
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
        // Try Ollama for semantic matching; else basic
        const prompt = `Match this request to services by ID.
Request: "${description}"
Services: ${JSON.stringify(availableServices.map(s => ({ id: s.id, title: s.title, description: s.description, category: s.categoryId })))}
Categories: ${JSON.stringify(categories)}
Return JSON: {"matchedServiceIds": number[], "confidence": number (0-1), "suggestions": string[]}`;
        const content = await chatViaOllama([
          { role: 'system', content: 'You return strictly JSON and nothing else.' },
          { role: 'user', content: prompt }
        ]);
        if (content) {
          try {
            const result = JSON.parse(content);
            return {
              matches: availableServices.filter(s => result.matchedServiceIds?.includes(s.id)),
              confidence: result.confidence || 0.5,
              suggestions: result.suggestions || []
            };
          } catch {}
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
      // Use Natural's built-in sentiment analyzer
      const analyzer = new natural.SentimentAnalyzer('English', 
        natural.PorterStemmer, 'negation');
      
      const tokens = tokenizer.tokenize(text.toLowerCase());
      const stemmedTokens = tokens?.map(token => stemmer.stem(token)) || [];
      
      const score = analyzer.getSentiment(stemmedTokens);
      
      let sentiment: 'positive' | 'negative' | 'neutral';
      if (score > 0.1) sentiment = 'positive';
      else if (score < -0.1) sentiment = 'negative';
      else sentiment = 'neutral';

      return {
        sentiment,
        score,
        keywords: tokens?.slice(0, 5) || []
      };
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      // Fallback to simple analysis
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect'];
      const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst'];
      
      const lowerText = text.toLowerCase();
      const hasPositive = positiveWords.some(word => lowerText.includes(word));
      const hasNegative = negativeWords.some(word => lowerText.includes(word));
      
      let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
      let score = 0;
      
      if (hasPositive && !hasNegative) {
        sentiment = 'positive';
        score = 0.5;
      } else if (hasNegative && !hasPositive) {
        sentiment = 'negative';
        score = -0.5;
      }
      
      return {
        sentiment,
        score,
        keywords: tokenizer.tokenize(text.toLowerCase())?.slice(0, 5) || []
      };
    }
  }

  // Generate automated responses for common queries
  async generateAutoResponse(
    query: string,
    queryType: 'booking' | 'pricing' | 'availability' | 'support' | 'general',
    context: any = {}
  ): Promise<string> {
    try {
      const kbEnforcedPrompt = `You are Taskego Website Assistant. Only answer website-related questions and use the knowledge below. If out-of-scope, politely refuse and redirect to website topics.

Knowledge:
${WEBSITE_KNOWLEDGE_EN}`;

      if (!openai) {
        throw new Error('OpenAI not configured');
      }

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