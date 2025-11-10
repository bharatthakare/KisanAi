'use client';

import { useLanguage } from '@/contexts/language-context';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
  ] as const;

  return (
    <div className="flex flex-wrap gap-2">
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={language === lang.code ? 'default' : 'outline'}
          onClick={() => setLanguage(lang.code)}
          className={cn(language === lang.code && 'bg-primary text-primary-foreground')}
        >
          {lang.name}
        </Button>
      ))}
    </div>
  );
}
