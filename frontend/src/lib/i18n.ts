export interface Messages {
  [key: string]: string | Messages;
}

export type Language = 'en' | 'ar';

export const defaultLanguage: Language = 'en';

export const languages: Record<Language, string> = {
  en: 'English',
  ar: 'العربية',
};

export const isRTL = (lang: Language): boolean => {
  return lang === 'ar';
};

export const getDirection = (lang: Language): 'ltr' | 'rtl' => {
  return isRTL(lang) ? 'rtl' : 'ltr';
};

export const loadMessages = async (lang: Language): Promise<Messages> => {
  try {
    const messages = await import(`../messages/${lang}.json`);
    return messages.default;
  } catch (error) {
    console.error(`Failed to load messages for language: ${lang}`, error);
    // Fallback to English
    if (lang !== 'en') {
      return loadMessages('en');
    }
    return {};
  }
};

export const t = (key: string, messages: Messages, fallback?: string): string => {
  const keys = key.split('.');
  let current: any = messages;
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return fallback || key;
    }
  }
  
  return typeof current === 'string' ? current : fallback || key;
};
