import { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface LanguageSwitcherProps {
  currentLanguage: string;
  onLanguageChange: (lang: 'en' | 'ar') => void;
  messages: any;
}

export default function LanguageSwitcher({ currentLanguage, onLanguageChange, messages }: LanguageSwitcherProps) {
  const languages = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
  ];

  const currentLang = languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2 px-3 py-2 border-khadamati-blue text-khadamati-blue hover:bg-blue-50">
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">{currentLang.nativeLabel}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => onLanguageChange(lang.code as 'en' | 'ar')}
            className={`cursor-pointer ${
              currentLanguage === lang.code ? 'bg-khadamati-light' : ''
            }`}
          >
            <span className="text-sm">{lang.nativeLabel}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
