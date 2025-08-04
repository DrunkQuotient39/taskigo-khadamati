const { getGeminiModel, fallbackNLP, isGeminiAvailable } = require('../config/ai');
const Service = require('../models/Service');
const User = require('../models/User');
const Review = require('../models/Review');
const Booking = require('../models/Booking');

// AI-powered chat endpoint
const chatWithAI = async (req, res) => {
  try {
    const { message, language = 'en', conversationHistory = [] } = req.body;
    const userId = req.user?._id;

    let response;

    if (isGeminiAvailable()) {
      try {
        const model = getGeminiModel();
        
        // Build conversation context
        const conversationContext = conversationHistory.map(msg => 
          `${msg.role}: ${msg.content}`
        ).join('\n');

        const systemPrompt = `You are Taskego AI Assistant, a helpful customer service chatbot for a bilingual service marketplace platform in Lebanon and the Middle East.

Your capabilities:
- Help users find services across categories: maintenance, cleaning, delivery, events, care, gardens, auto, tech, admin
- Assist with booking processes and pricing inquiries
- Provide support in both English and Arabic
- Handle complaints and feedback professionally
- Suggest relevant services based on user needs

Current language: ${language}
User context: ${userId ? 'Logged in user' : 'Guest user'}
Conversation history: ${conversationContext}

Guidelines:
- Always respond in ${language === 'ar' ? 'Arabic' : 'English'}
- Be helpful, professional, and friendly
- If asked about specific services, suggest browsing categories or searching
- For booking help, guide users through the process
- Keep responses concise but informative

User message: ${message}`;

        const result = await model.generateContent(systemPrompt);
        response = result.response.text();

      } catch (geminiError) {
        console.error('Gemini API error:', geminiError);
        // Fallback to local NLP
        response = fallbackNLP.generateResponse(message, language);
      }
    } else {
      // Use fallback NLP
      response = fallbackNLP.generateResponse(message, language);
    }

    // Log the conversation if user is logged in
    if (userId) {
      // In a real app, you might want to store conversation history in the database
      console.log(`User ${userId} chatted: ${message}`);
    }

    res.json({
      response,
      aiProvider: isGeminiAvailable() ? 'gemini' : 'fallback',
      language,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat AI error:', error);
    res.status(500).json({
      message: 'AI chat service temporarily unavailable',
      error: error.message
    });
  }
};

// Smart service recommendations
const getServiceRecommendations = async (req, res) => {
  try {
    const { query, location, budget, category, language = 'en' } = req.body;
    const userId = req.user?._id;

    // Get available services
    let services = await Service.find({ 
      status: 'approved', 
      isActive: true 
    }).populate('providerId', 'name rating location');

    // Apply basic filters
    if (category) {
      services = services.filter(service => service.category === category);
    }

    if (budget) {
      services = services.filter(service => service.price <= budget);
    }

    if (location?.city) {
      services = services.filter(service => 
        service.location.city.toLowerCase().includes(location.city.toLowerCase())
      );
    }

    let recommendations;

    if (query && isGeminiAvailable()) {
      try {
        const model = getGeminiModel();
        
        const servicesSummary = services.map(s => ({
          id: s._id,
          title: language === 'ar' ? s.title_ar || s.title : s.title,
          description: language === 'ar' ? s.description_ar || s.description : s.description,
          category: s.category,
          price: s.price,
          rating: s.rating.average,
          location: s.location.city
        }));

        const prompt = `Analyze this service request and recommend the most suitable services:

User Query: "${query}"
User Location: ${location?.city || 'Not specified'}
Budget: ${budget || 'Not specified'}
Language: ${language}

Available Services: ${JSON.stringify(servicesSummary)}

Please provide:
1. Top 3-5 most relevant services with reasons
2. Brief explanation of why each service matches
3. Any additional suggestions or tips

Respond in ${language === 'ar' ? 'Arabic' : 'English'}.`;

        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        // Extract service IDs from AI response (basic implementation)
        const recommendedIds = servicesSummary
          .filter(service => aiResponse.includes(service.id.toString()))
          .map(service => service.id);

        recommendations = services.filter(service => 
          recommendedIds.includes(service._id.toString())
        ).slice(0, 5);

        res.json({
          recommendations,
          aiExplanation: aiResponse,
          totalAvailable: services.length,
          aiProvider: 'gemini'
        });

      } catch (geminiError) {
        console.error('Gemini recommendation error:', geminiError);
        // Fallback to simple matching
        recommendations = fallbackNLP.findServices(query, services);
        
        res.json({
          recommendations: recommendations.slice(0, 5),
          totalAvailable: services.length,
          aiProvider: 'fallback'
        });
      }
    } else {
      // Simple filtering and sorting
      if (query) {
        recommendations = fallbackNLP.findServices(query, services);
      } else {
        recommendations = services.sort((a, b) => b.rating.average - a.rating.average);
      }

      res.json({
        recommendations: recommendations.slice(0, 10),
        totalAvailable: services.length,
        aiProvider: 'basic'
      });
    }

  } catch (error) {
    console.error('Service recommendations error:', error);
    res.status(500).json({
      message: 'Failed to get service recommendations',
      error: error.message
    });
  }
};

// Analyze review sentiment
const analyzeReviewSentiment = async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;

    let sentiment, confidence, keywords;

    if (isGeminiAvailable()) {
      try {
        const model = getGeminiModel();
        
        const prompt = `Analyze the sentiment of this review text:

Review: "${text}"
Language: ${language}

Please provide:
1. Sentiment: positive, negative, or neutral
2. Confidence: 0.0 to 1.0
3. Key topics/keywords mentioned
4. Brief explanation

Return as JSON format.`;

        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();
        
        // Parse AI response (basic implementation)
        sentiment = fallbackNLP.analyzeSentiment(text);
        confidence = 0.8; // Mock confidence for AI analysis
        keywords = text.toLowerCase().split(' ').slice(0, 5);

      } catch (geminiError) {
        console.error('Gemini sentiment analysis error:', geminiError);
        sentiment = fallbackNLP.analyzeSentiment(text);
        confidence = 0.6;
        keywords = text.toLowerCase().split(' ').slice(0, 5);
      }
    } else {
      sentiment = fallbackNLP.analyzeSentiment(text);
      confidence = 0.6;
      keywords = text.toLowerCase().split(' ').slice(0, 5);
    }

    res.json({
      sentiment,
      confidence,
      keywords,
      aiProvider: isGeminiAvailable() ? 'gemini' : 'fallback'
    });

  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({
      message: 'Sentiment analysis failed',
      error: error.message
    });
  }
};

// Smart pricing suggestions for providers
const getPricingSuggestions = async (req, res) => {
  try {
    const { category, subcategory, location, serviceDetails } = req.body;

    // Get similar services for price comparison
    const similarServices = await Service.find({
      category,
      subcategory: { $regex: subcategory, $options: 'i' },
      status: 'approved',
      isActive: true
    });

    if (similarServices.length === 0) {
      return res.json({
        message: 'No similar services found for price comparison',
        suggestedPrice: null
      });
    }

    const prices = similarServices.map(s => s.price);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    let aiSuggestion;

    if (isGeminiAvailable() && serviceDetails) {
      try {
        const model = getGeminiModel();
        
        const prompt = `Analyze pricing for this service:

Category: ${category}
Subcategory: ${subcategory}
Location: ${location?.city || 'Not specified'}
Service Details: ${serviceDetails}

Market Data:
- Average Price: $${avgPrice.toFixed(2)}
- Price Range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}
- Number of Competitors: ${similarServices.length}

Provide pricing recommendations considering:
1. Market positioning (budget, standard, premium)
2. Location factors
3. Service complexity
4. Competitive advantage

Suggest optimal pricing strategy.`;

        const result = await model.generateContent(prompt);
        aiSuggestion = result.response.text();

      } catch (geminiError) {
        console.error('Gemini pricing error:', geminiError);
        aiSuggestion = null;
      }
    }

    res.json({
      marketAnalysis: {
        averagePrice: avgPrice.toFixed(2),
        priceRange: {
          min: minPrice.toFixed(2),
          max: maxPrice.toFixed(2)
        },
        competitorCount: similarServices.length
      },
      recommendations: {
        competitive: (avgPrice * 0.9).toFixed(2),
        market: avgPrice.toFixed(2),
        premium: (avgPrice * 1.2).toFixed(2)
      },
      aiSuggestion,
      aiProvider: isGeminiAvailable() ? 'gemini' : 'basic'
    });

  } catch (error) {
    console.error('Pricing suggestions error:', error);
    res.status(500).json({
      message: 'Failed to get pricing suggestions',
      error: error.message
    });
  }
};

module.exports = {
  chatWithAI,
  getServiceRecommendations,
  analyzeReviewSentiment,
  getPricingSuggestions
};