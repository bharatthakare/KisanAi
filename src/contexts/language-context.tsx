'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'kn' | 'bn' | 'pa' | 'gu';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  // A simple t function for demonstration
  t: (key: string) => string;
}

const translations = {
  en: {
    welcome: 'Welcome',
    settings: 'Settings',
    language: 'Language',
  },
  hi: {
    welcome: 'स्वागत है',
    settings: 'सेटिंग्स',
    language: 'भाषा',
  },
  mr: {
    welcome: 'स्वागत आहे',
    settings: 'सेटिंग्ज',
    language: 'भाषा',
  },
  ta: {
    welcome: 'வரவேற்பு',
    settings: 'அமைப்புகள்',
    language: 'மொழி',
  },
  te: {
    welcome: 'స్వాగతం',
    settings: 'సెట్టింగ్‌లు',
    language: 'భాష',
  },
  kn: {
    welcome: 'ಸ್ವಾಗತ',
    settings: 'ಸಂಯೋಜನೆಗಳು',
    language: 'ಭಾಷೆ',
  },
  bn: {
    welcome: 'স্বাগত',
    settings: 'সেটিংস',
    language: 'ভাষা',
  },
  pa: {
    welcome: 'ਜੀ ਆਇਆਂ ਨੂੰ',
    settings: 'ਸੈਟਿੰਗਾਂ',
    language: 'ਭਾਸ਼ਾ',
  },
  gu: {
    welcome: 'પધારો',
    settings: 'સેટિંગ્સ',
    language: 'ભાષા',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
