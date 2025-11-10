
'use client';
import { WeatherForecastCard } from '@/components/weather-forecast-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Lightbulb, MessageCircle, ShoppingCart, Users, Settings } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export default function Home() {
  const { t } = useLanguage();
  // Placeholder for user data. In a real app, this would come from an auth context.
  const userName = "Ramesh"; 

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-4xl md:text-5xl font-headline font-bold mb-2">{t('welcome_message', { name: userName })}</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">{t('smart_farming_partner')}</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <WeatherForecastCard />
        </div>
        
        <aside className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className='font-headline text-2xl flex items-center gap-2'>
                        <Lightbulb className='text-yellow-400' />
                        {t('daily_tip')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className='text-muted-foreground'>
                        {t('daily_tip_content')}
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className='font-headline text-2xl'>
                        {t('quick_links')}
                    </CardTitle>
                </CardHeader>
                 <CardContent className='grid grid-cols-2 gap-4'>
                     <Link href="/assistant" className="flex flex-col items-center justify-center p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                        <MessageCircle className="w-8 h-8 text-primary mb-2"/>
                        <span className="text-sm font-semibold text-center">{t('ai_assistant')}</span>
                     </Link>
                     <Link href="/market" className="flex flex-col items-center justify-center p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                        <ShoppingCart className="w-8 h-8 text-primary mb-2"/>
                        <span className="text-sm font-semibold text-center">{t('market_prices')}</span>
                     </Link>
                     <Link href="/community" className="flex flex-col items-center justify-center p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                        <Users className="w-8 h-8 text-primary mb-2"/>
                        <span className="text-sm font-semibold text-center">{t('community')}</span>
                     </Link>
                     <Link href="/settings" className="flex flex-col items-center justify-center p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors">
                        <Settings className="w-8 h-8 text-primary mb-2"/>
                        <span className="text-sm font-semibold text-center">{t('settings')}</span>
                     </Link>
                 </CardContent>
            </Card>
        </aside>

      </div>
    </div>
  );
}
