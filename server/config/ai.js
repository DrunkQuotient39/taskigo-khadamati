const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI;

// Initialize Gemini AI with API key
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

const getGeminiModel = () => {
  if (!genAI) {
    throw new Error('Gemini API not initialized. Please set GEMINI_API_KEY environment variable.');
  }
  return genAI.getGenerativeModel({ model: 'gemini-pro' });
};

// Fallback NLP functions when Gemini is not available
const fallbackNLP = {
  // Simple keyword matching for service recommendations
  findServices: (query, services) => {
    const keywords = query.toLowerCase().split(' ');
    return services.filter(service => {
      const searchText = `${service.title} ${service.description} ${service.category}`.toLowerCase();
      return keywords.some(keyword => searchText.includes(keyword));
    });
  },

  // Basic sentiment analysis using simple word lists
  analyzeSentiment: (text) => {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'perfect', 'love', 'best'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'horrible', 'disappointing'];
    
    const words = text.toLowerCase().split(' ');
    let positive = 0, negative = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positive++;
      if (negativeWords.includes(word)) negative++;
    });
    
    if (positive > negative) return 'positive';
    if (negative > positive) return 'negative';
    return 'neutral';
  },

  // Generate basic chatbot responses
  generateResponse: (message, language = 'en') => {
    const responses = {
      en: {
        greeting: "Hello! I'm Taskego AI Assistant. How can I help you today?",
        booking: "I can help you book services. What type of service are you looking for?",
        pricing: "Prices vary by service and provider. You can check specific pricing on each service page.",
        default: "I'm here to help! You can ask me about services, bookings, or any questions about Taskego."
      },
      ar: {
        greeting: "مرحباً! أنا مساعد تاسكيجو الذكي. كيف يمكنني مساعدتك اليوم؟",
        booking: "يمكنني مساعدتك في حجز الخدمات. ما نوع الخدمة التي تبحث عنها؟",
        pricing: "الأسعار تختلف حسب الخدمة ومقدم الخدمة. يمكنك مراجعة الأسعار في صفحة كل خدمة.",
        default: "أنا هنا للمساعدة! يمكنك سؤالي عن الخدمات أو الحجوزات أو أي أسئلة حول تاسكيجو."
      }
    };

    const lang = responses[language] || responses.en;
    const msg = message.toLowerCase();

    if (msg.includes('hello') || msg.includes('hi') || msg.includes('مرحبا')) {
      return lang.greeting;
    }
    if (msg.includes('book') || msg.includes('حجز')) {
      return lang.booking;
    }
    if (msg.includes('price') || msg.includes('سعر')) {
      return lang.pricing;
    }
    
    return lang.default;
  }
};

module.exports = {
  getGeminiModel,
  fallbackNLP,
  isGeminiAvailable: () => !!genAI
};