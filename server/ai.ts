import OpenAI from 'openai';
import { Anthropic } from '@anthropic-ai/sdk';
import natural from 'natural';
import { Service, ServiceCategory, User } from '../shared/schema';

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
    }
  ): Promise<string> {
    try {
      if (!openai) {
        return this.generateFallbackResponse(message, context.language);
      }

      const systemPrompt = `You are Taskego AI Assistant, a helpful customer service chatbot for a bilingual service marketplace platform. 

      Your capabilities:
      - Help users find services
      - Assist with booking processes
      - Answer questions about pricing and availability
      - Provide support in both English and Arabic
      - Handle complaints and feedback professionally
      
      Current language: ${context.language}
      
      Always respond in a friendly, professional manner and provide accurate information about our platform.`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...(context.conversationHistory || []),
        { role: "user", content: message }
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: messages as any,
        temperature: 0.8,
        max_tokens: 500,
      });

      return response.choices[0].message.content || "I apologize, but I'm having trouble processing your request right now. Please try again.";
    } catch (error) {
      console.error('Chatbot error:', error);
      return this.generateFallbackResponse(message, context.language);
    }
  }

  // Fallback responses when AI is not available
  private generateFallbackResponse(message: string, language: string = 'en'): string {
    const lowerMessage = message.toLowerCase();
    
    if (language === 'ar') {
      if (lowerMessage.includes('booking') || lowerMessage.includes('حجز')) {
        return 'مرحباً! يمكنك حجز الخدمات من خلال تصفح فئات الخدمات واختيار مقدم الخدمة المناسب. هل تحتاج مساعدة في العثور على خدمة معينة؟';
      }
      if (lowerMessage.includes('price') || lowerMessage.includes('سعر')) {
        return 'الأسعار تختلف حسب نوع الخدمة ومقدم الخدمة. يمكنك مراجعة الأسعار في صفحة كل خدمة. هل تبحث عن خدمة محددة؟';
      }
      return 'مرحباً! أنا مساعد تاسكيجو الذكي. كيف يمكنني مساعدتك اليوم؟ يمكنني مساعدتك في العثور على الخدمات وإجراء الحجوزات.';
    }
    
    if (lowerMessage.includes('booking')) {
      return 'Hello! You can book services by browsing our service categories and selecting the right provider. Do you need help finding a specific service?';
    }
    if (lowerMessage.includes('price')) {
      return 'Prices vary by service type and provider. You can check pricing on each service page. Are you looking for a specific service?';
    }
    return 'Hello! I\'m Taskego AI Assistant. How can I help you today? I can assist you with finding services and making bookings.';
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
      const systemPrompts = {
        booking: "You are helping users with booking-related questions. Be specific about the booking process.",
        pricing: "You are answering pricing questions. Always be transparent about costs and any additional fees.",
        availability: "You are helping users check service availability. Provide clear scheduling information.",
        support: "You are providing customer support. Be empathetic and solution-focused.",
        general: "You are a general assistant for the Taskego platform. Be helpful and informative."
      };

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompts[queryType] },
          { role: "user", content: query }
        ],
        temperature: 0.7,
        max_tokens: 300,
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