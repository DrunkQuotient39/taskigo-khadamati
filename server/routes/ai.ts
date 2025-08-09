import { Router } from 'express';
import { storage } from '../storage';
import { aiService } from '../ai';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { validate, aiLimiter } from '../middleware/security';
import { body } from 'express-validator';

const router = Router();

// Apply AI rate limiting to all routes
router.use(aiLimiter);

// AI Chat endpoint - bilingual assistant
router.post('/chat', optionalAuth, validate([
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters'),
  body('language').optional().isIn(['en', 'ar']).withMessage('Language must be en or ar'),
  body('conversationHistory').optional().isArray()
]), async (req: AuthRequest, res) => {
  try {
    const { message, language = 'en', conversationHistory = [] } = req.body;
    const userId = req.user?.id || 'anonymous';

    // Get user context for personalization
    let userContext = {};
    if (req.user?.id) {
      const user = await storage.getUser(req.user.id);
      userContext = {
        role: user?.role,
        language: user?.language || language,
        isVerified: user?.isVerified
      };
    }

    const response = await aiService.chatbotResponse(message, {
      userId,
      language,
      conversationHistory,
      userContext
    });

    // Log AI interaction
    await storage.createAiLog({
      userId: req.user?.id,
      query: message,
      response: response.text,
      intent: response.intent || 'chat',
      language,
      processingTime: response.processingTime,
      model: response.model || 'gpt-4'
    });

    res.json({
      response: response.text,
      intent: response.intent,
      language,
      suggestions: response.suggestions || [],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ 
      error: "AI chat service temporarily unavailable",
      fallback: "I'm sorry, I'm having trouble processing your request right now. Please try again later."
    });
  }
});

// Smart service recommendations
router.post('/recommend', optionalAuth, validate([
  body('query').optional().trim().isLength({ max: 500 }),
  body('location').optional().trim().isLength({ max: 100 }),
  body('budget').optional().isDecimal(),
  body('category').optional().trim(),
  body('preferences').optional().isObject()
]), async (req: AuthRequest, res) => {
  try {
    const { query, location, budget, category, preferences = {} } = req.body;
    const userId = req.user?.id || 'anonymous';

    // Get available services
    const services = await storage.getServices({ category });
    const categories = await storage.getServiceCategories();

    const userPreferences = {
      location: location || null,
      budget: budget ? parseFloat(budget) : null,
      preferredCategory: category || null,
      language: req.user?.language || 'en',
      ...preferences
    };

    const recommendations = await aiService.generateServiceRecommendations(
      userId,
      userPreferences,
      services,
      categories
    );

    // Log recommendation request
    await storage.createAiLog({
      userId: req.user?.id,
      query: JSON.stringify({ query, location, budget, category }),
      response: `Generated ${recommendations.length} recommendations`,
      intent: 'recommend',
      serviceMatchedId: recommendations[0]?.id || null,
      language: userPreferences.language,
      model: 'gpt-4'
    });

    // If query provided, use AI to match services
    let aiMatches = [];
    if (query) {
      const matchResult = await aiService.matchServicesByDescription(query, services, categories);
      aiMatches = matchResult.matches;
      
      res.json({
        recommendations,
        aiMatches,
        confidence: matchResult.confidence,
        suggestions: matchResult.suggestions,
        totalAvailable: services.length,
        filters: { location, budget, category }
      });
    } else {
      res.json({
        recommendations,
        totalAvailable: services.length,
        filters: { location, budget, category }
      });
    }
  } catch (error) {
    console.error('AI recommendations error:', error);
    res.status(500).json({ error: "AI recommendation service unavailable" });
  }
});

// Sentiment analysis for reviews and feedback
router.post('/sentiment', authenticate, validate([
  body('text').trim().isLength({ min: 5, max: 2000 }).withMessage('Text must be 5-2000 characters'),
  body('referenceType').optional().isIn(['review', 'message', 'feedback']),
  body('referenceId').optional().isInt({ min: 1 })
]), async (req: AuthRequest, res) => {
  try {
    const { text, referenceType, referenceId } = req.body;
    
    const sentimentResult = await aiService.analyzeSentiment(text);
    
    // Save sentiment analysis if reference provided
    if (referenceType && referenceId) {
      await storage.createSentimentAnalysis({
        referenceType,
        referenceId,
        sentiment: sentimentResult.sentiment,
        score: sentimentResult.score.toString(),
        keywords: sentimentResult.keywords
      });
    }

    // Log sentiment analysis
    await storage.createAiLog({
      userId: req.user?.id,
      query: text,
      response: JSON.stringify(sentimentResult),
      intent: 'sentiment',
      language: 'en',
      model: 'natural'
    });
    
    res.json({
      sentiment: sentimentResult.sentiment,
      score: sentimentResult.score,
      keywords: sentimentResult.keywords,
      confidence: Math.abs(sentimentResult.score)
    });
  } catch (error) {
    console.error('Sentiment analysis error:', error);
    res.status(500).json({ error: "Sentiment analysis service unavailable" });
  }
});

// AI pricing suggestions for providers
router.post('/price-suggest', authenticate, validate([
  body('serviceType').trim().notEmpty().withMessage('Service type is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('duration').isInt({ min: 15, max: 480 }).withMessage('Duration must be 15-480 minutes'),
  body('description').optional().trim().isLength({ max: 500 })
]), async (req: AuthRequest, res) => {
  try {
    const { serviceType, location, duration, description } = req.body;
    
    // Only providers can access pricing suggestions
    if (req.user?.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can access pricing suggestions' });
    }

    // Get competitor prices from database
    const similarServices = await storage.getServices({ category: serviceType });
    const competitorPrices = similarServices
      .map(s => parseFloat(s.price))
      .filter(p => !isNaN(p) && p > 0);

    if (competitorPrices.length === 0) {
      return res.status(400).json({ 
        message: 'No competitor data available for this service type',
        fallback: {
          suggestedPrice: 50,
          priceRange: { min: 30, max: 80 },
          marketAnalysis: 'Based on general market data'
        }
      });
    }

    const pricingAnalysis = await aiService.generatePricingSuggestions(
      serviceType,
      location,
      duration,
      competitorPrices
    );

    // Log pricing analysis
    await storage.createAiLog({
      userId: req.user.id,
      query: JSON.stringify({ serviceType, location, duration }),
      response: JSON.stringify(pricingAnalysis),
      intent: 'pricing',
      language: 'en',
      model: 'gpt-4'
    });
    
    res.json({
      ...pricingAnalysis,
      competitorCount: competitorPrices.length,
      marketAverage: (competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length).toFixed(2)
    });
  } catch (error) {
    console.error('AI pricing error:', error);
    res.status(500).json({ error: "AI pricing service unavailable" });
  }
});

// AI-powered booking assistant
router.post('/action', authenticate, validate([
  body('intent').isIn(['book', 'search', 'compare', 'schedule']).withMessage('Valid intent required'),
  body('query').trim().isLength({ min: 5, max: 500 }).withMessage('Query must be 5-500 characters'),
  body('context').optional().isObject()
]), async (req: AuthRequest, res) => {
  try {
    const { intent, query, context = {} } = req.body;
    const userId = req.user!.id;

    let result: any = {};

    switch (intent) {
      case 'book':
        // Parse booking intent from natural language
        const bookingContext = await aiService.parseBookingIntent(query, context);
        result = {
          intent: 'book',
          parsed: bookingContext,
          nextSteps: ['Select service', 'Choose date/time', 'Confirm booking']
        };
        break;

      case 'search':
        // Use AI to enhance search
        const services = await storage.getServices();
        const categories = await storage.getServiceCategories();
        const searchResults = await aiService.matchServicesByDescription(query, services, categories);
        result = {
          intent: 'search',
          matches: searchResults.matches,
          confidence: searchResults.confidence,
          suggestions: searchResults.suggestions
        };
        break;

      case 'compare':
        // Compare services using AI
        if (context.serviceIds && Array.isArray(context.serviceIds)) {
          const servicesToCompare = await Promise.all(
            context.serviceIds.map((id: number) => storage.getService(id))
          );
          const comparison = await aiService.compareServices(servicesToCompare.filter(Boolean));
          result = {
            intent: 'compare',
            comparison,
            recommendation: comparison.recommendation
          };
        } else {
          result = { error: 'Service IDs required for comparison' };
        }
        break;

      case 'schedule':
        // Help with scheduling
        result = {
          intent: 'schedule',
          availableSlots: ['9:00 AM', '2:00 PM', '4:00 PM'],
          suggestions: ['Book early for better availability', 'Consider weekday slots']
        };
        break;

      default:
        result = { error: 'Unknown intent' };
    }

    // Log AI action
    await storage.createAiLog({
      userId,
      query,
      response: JSON.stringify(result),
      intent,
      language: 'en',
      model: 'gpt-4'
    });

    res.json(result);
  } catch (error) {
    console.error('AI action error:', error);
    res.status(500).json({ error: "AI action service unavailable" });
  }
});

// Get AI interaction history
router.get('/history', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { intent, limit = 20, offset = 0 } = req.query;

    const logs = await storage.getAiLogs({
      userId,
      intent: intent as string
    });

    // Apply pagination
    const startIndex = parseInt(offset as string);
    const limitNum = parseInt(limit as string);
    const paginatedLogs = logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(startIndex, startIndex + limitNum);

    res.json({
      history: paginatedLogs,
      totalCount: logs.length,
      hasMore: startIndex + limitNum < logs.length
    });
  } catch (error) {
    console.error('Get AI history error:', error);
    res.status(500).json({ message: 'Failed to get AI history' });
  }
});

// AI analytics for admin
router.get('/analytics', authenticate, async (req: AuthRequest, res) => {
  try {
    // Only admins can access AI analytics
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { period = '30d' } = req.query;
    
    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const logs = await storage.getAiLogs();
    const periodLogs = logs.filter(log => new Date(log.timestamp) >= startDate);

    // Calculate analytics
    const totalQueries = periodLogs.length;
    const uniqueUsers = new Set(periodLogs.map(log => log.userId)).size;
    
    const intentBreakdown = periodLogs.reduce((acc, log) => {
      acc[log.intent || 'unknown'] = (acc[log.intent || 'unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const languageBreakdown = periodLogs.reduce((acc, log) => {
      acc[log.language || 'en'] = (acc[log.language || 'en'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgProcessingTime = periodLogs
      .filter(log => log.processingTime)
      .reduce((sum, log) => sum + (log.processingTime || 0), 0) / 
      periodLogs.filter(log => log.processingTime).length || 0;

    res.json({
      period,
      summary: {
        totalQueries,
        uniqueUsers,
        avgProcessingTime: Math.round(avgProcessingTime),
        topIntent: Object.entries(intentBreakdown).sort(([,a], [,b]) => b - a)[0]?.[0] || 'unknown'
      },
      breakdowns: {
        intents: intentBreakdown,
        languages: languageBreakdown
      },
      trends: this.calculateDailyTrends(periodLogs, startDate)
    });
  } catch (error) {
    console.error('AI analytics error:', error);
    res.status(500).json({ message: 'Failed to get AI analytics' });
  }
});

// Helper method for calculating daily trends
function calculateDailyTrends(logs: any[], startDate: Date) {
  const dailyStats: Record<string, { queries: number; users: Set<string> }> = {};
  const days = Math.ceil((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    dailyStats[dateStr] = { queries: 0, users: new Set() };
  }

  logs.forEach(log => {
    const date = new Date(log.timestamp).toISOString().split('T')[0];
    if (dailyStats[date]) {
      dailyStats[date].queries++;
      if (log.userId) dailyStats[date].users.add(log.userId);
    }
  });

  return Object.entries(dailyStats).map(([date, stats]) => ({
    date,
    queries: stats.queries,
    uniqueUsers: stats.users.size
  }));
}

export default router;