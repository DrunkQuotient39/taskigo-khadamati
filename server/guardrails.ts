/**
 * AI Guardrails
 * 
 * This module provides guardrails to ensure AI responses stay on-topic
 * and prevent misuse of the AI assistant.
 */

// Allowed topics - what the AI assistant is allowed to discuss
const ALLOWED_TOPIC_PATTERNS = [
  // Services
  /service|cleaning|plumbing|electrician|repair|maintenance|booking|schedule|appointment|hvac|ac|air conditioning|painter|delivery/i,
  // Website features
  /website|app|application|platform|login|signup|account|profile|dashboard|password|reset|forgot/i,
  // Booking and payments
  /book|schedule|appointment|reservation|cancel|refund|payment|pay|price|cost|fee|charge|billing/i,
  // Providers
  /provider|professional|technician|cleaner|plumber|electrician/i,
  // Support and help
  /help|support|contact|assistance|issue|problem|question|how to|guide/i,
  // Arabic equivalents
  /خدمة|تنظيف|سباكة|كهرباء|إصلاح|صيانة|حجز|جدولة|موعد|تكييف|هواء|دهان|توصيل/i,
  /موقع|تطبيق|منصة|تسجيل دخول|تسجيل|حساب|ملف|لوحة القيادة|كلمة المرور|إعادة تعيين|نسيت/i,
  /حجز|جدولة|موعد|حجوزات|إلغاء|استرداد|دفع|سعر|تكلفة|رسوم|فواتير/i,
  /مزود|محترف|فني|منظف|سباك|كهربائي/i,
  /مساعدة|دعم|اتصال|مساعدة|مشكلة|سؤال|كيف|دليل/i
];

// Restricted topics - what the AI assistant should NOT discuss
const RESTRICTED_TOPIC_PATTERNS = [
  // Politics and government
  /politic|government|election|president|minister|congress|senate|democrat|republican|parliament|law|legislation/i,
  // Non-website products and companies
  /amazon|google|facebook|apple|microsoft|netflix|spotify|competitor|other website|other service|other company/i,
  // General knowledge questions
  /who is|where is|when was|what is the capital|how many people|what is the population|tell me about|history of|facts about/i,
  // Entertainment
  /movie|film|tv show|television|actor|actress|celebrity|star|music|song|artist|band|game|play|sport|team/i,
  // Personal advice
  /relationship advice|marriage|dating|breakup|divorce|love life|career advice|medical advice|health advice|mental health|therapy/i,
  // Off-topic requests
  /tell me a joke|tell me a story|write a poem|write a song|write an essay|write code|program|write a letter/i,
  // Arabic equivalents
  /سياسة|حكومة|انتخابات|رئيس|وزير|برلمان|مجلس النواب|قانون|تشريع/i,
  /امازون|جوجل|فيسبوك|ابل|مايكروسوفت|نتفلكس|سبوتيفاي|منافس|موقع آخر|خدمة أخرى|شركة أخرى/i,
  /من هو|أين|متى كان|ما هي عاصمة|كم عدد الناس|ما هو عدد السكان|أخبرني عن|تاريخ|حقائق حول/i,
  /فيلم|سينما|عرض تلفزيوني|تلفزيون|ممثل|ممثلة|مشهور|نجم|موسيقى|أغنية|فنان|فرقة|لعبة|رياضة|فريق/i,
  /نصيحة علاقة|زواج|مواعدة|انفصال|طلاق|حياة عاطفية|نصيحة مهنية|نصيحة طبية|نصيحة صحية|صحة نفسية|علاج/i,
  /قل لي نكتة|قل لي قصة|اكتب قصيدة|اكتب أغنية|اكتب مقالة|اكتب كود|برنامج|اكتب رسالة/i
];

/**
 * Check if a user message is on-topic for the website assistant
 * 
 * @param message The user's message
 * @returns Object with isOnTopic flag and rejection reason if off-topic
 */
export function isOnTopic(message: string): { isOnTopic: boolean; reason?: string } {
  // Always allow very short questions as they might be follow-ups or confirmations
  if (message.length < 15) {
    return { isOnTopic: true };
  }
  
  const lowerMessage = message.toLowerCase();
  
  // Check for explicit mentions of the website name or core functionality
  const explicitMentions = /taskigo|khadamati|service marketplace|booking service|خدماتي|سوق الخدمات/i;
  if (explicitMentions.test(lowerMessage)) {
    return { isOnTopic: true };
  }
  
  // Check if message contains restricted topics
  for (const pattern of RESTRICTED_TOPIC_PATTERNS) {
    if (pattern.test(lowerMessage)) {
      return { 
        isOnTopic: false, 
        reason: "I can only answer questions about Taskigo services, bookings, and website features."
      };
    }
  }
  
  // Check if message contains allowed topics
  let isAllowed = false;
  for (const pattern of ALLOWED_TOPIC_PATTERNS) {
    if (pattern.test(lowerMessage)) {
      isAllowed = true;
      break;
    }
  }
  
  if (!isAllowed) {
    return { 
      isOnTopic: false, 
      reason: "I'm designed to assist with Taskigo services and website questions. How can I help you with our services?" 
    };
  }
  
  return { isOnTopic: true };
}

/**
 * Check if a user message is attempting to prompt-inject or jailbreak the AI
 */
export function containsPromptInjection(message: string): { safe: boolean; reason?: string } {
  const lowerMessage = message.toLowerCase();
  
  // Common prompt injection patterns
  const injectionPatterns = [
    /ignore (previous|above|all) instructions/i,
    /disregard (previous|above|all) instructions/i,
    /forget (previous|above|all) instructions/i,
    /you are not (an assistant|a website assistant|taskigo assistant)/i,
    /pretend to be/i,
    /act as if/i,
    /simulate/i,
    /ignore your programming/i,
    /bypass/i,
    /let's play a game where you/i,
    /your new instructions are/i,
    /from now on you are/i,
    /system prompt:/i
  ];
  
  for (const pattern of injectionPatterns) {
    if (pattern.test(lowerMessage)) {
      return { 
        safe: false, 
        reason: "I'm the Taskigo assistant and can only help with questions about our services and website."
      };
    }
  }
  
  return { safe: true };
}

/**
 * Perform full validation of a user message
 */
export function validateUserInput(message: string): { valid: boolean; response?: string } {
  // Check for empty or too short messages
  if (!message || message.trim().length === 0) {
    return { valid: false, response: "How can I help you with Taskigo services today?" };
  }
  
  if (message.trim().length < 3) {
    return { valid: false, response: "Could you please provide more details so I can assist you better?" };
  }
  
  // Check for prompt injection attempts
  const injectionCheck = containsPromptInjection(message);
  if (!injectionCheck.safe) {
    return { valid: false, response: injectionCheck.reason };
  }
  
  // Check if message is on topic
  const topicCheck = isOnTopic(message);
  if (!topicCheck.isOnTopic) {
    return { valid: false, response: topicCheck.reason };
  }
  
  // All checks passed
  return { valid: true };
}

/**
 * Generate a standard off-topic response based on language
 */
export function getOffTopicResponse(message: string, language: string = 'en'): string {
  // Detect if message is in Arabic
  const probablyArabic = /[\u0600-\u06FF]/.test(message);
  const useLang = probablyArabic ? 'ar' : language;
  
  if (useLang === 'ar') {
    return "أنا مساعد Taskigo ويمكنني فقط الإجابة على الأسئلة المتعلقة بخدماتنا وموقعنا. كيف يمكنني مساعدتك في العثور على الخدمة المناسبة؟";
  }
  
  return "I'm the Taskigo assistant and can only answer questions about our services and website. How can I help you find the right service today?";
}

/**
 * Extract key intents from user message for faster processing
 */
export function extractIntents(message: string): {
  isBookingIntent: boolean;
  isInquiryIntent: boolean;
  isSupportIntent: boolean;
  isPaymentIntent: boolean;
  identifiedServices: string[];
} {
  const lower = message.toLowerCase();
  
  // Detect main intents
  const isBookingIntent = /book|schedule|reserve|appointment|حجز|موعد/i.test(lower);
  const isInquiryIntent = /how much|price|cost|information|details|available|عن|سعر|تكلفة|معلومات|تفاصيل|متوفر/i.test(lower);
  const isSupportIntent = /help|support|problem|issue|contact|مساعدة|دعم|مشكلة|اتصال/i.test(lower);
  const isPaymentIntent = /pay|payment|refund|billing|دفع|استرداد|فاتورة/i.test(lower);
  
  // Extract service types mentioned
  const serviceTypes = [
    { name: "cleaning", patterns: [/clean|maid|housekeeping|تنظيف|خادمة/i] },
    { name: "plumbing", patterns: [/plumb|pipe|leak|water|سباك|أنبوب|تسرب|ماء/i] },
    { name: "electrical", patterns: [/electric|wiring|power|outlet|كهرباء|أسلاك|طاقة/i] },
    { name: "ac_repair", patterns: [/ac|air condition|cooling|hvac|تكييف|تبريد/i] },
    { name: "painting", patterns: [/paint|wall|color|طلاء|دهان|جدار|لون/i] },
    { name: "moving", patterns: [/mov|relocat|transport|نقل|تحريك/i] },
    { name: "gardening", patterns: [/garden|landscap|plant|lawn|حديقة|نبات|عشب/i] }
  ];
  
  const identifiedServices = serviceTypes
    .filter(service => service.patterns.some(pattern => pattern.test(lower)))
    .map(service => service.name);
  
  return {
    isBookingIntent,
    isInquiryIntent,
    isSupportIntent,
    isPaymentIntent,
    identifiedServices
  };
}
