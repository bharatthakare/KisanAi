'use client';
import { useWeather } from '@/hooks/use-weather';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { WifiOff, MapPin, Thermometer } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';
import { format, Locale } from 'date-fns';
import { enUS, hi, ta, te, kn, bn, gu } from 'date-fns/locale';

const locales: Record<string, Locale> = {
  en: enUS,
  hi,
  ta,
  te,
  kn,
  bn,
  gu,
  mr: enUS, // Defaulting mr to enUS
  pa: enUS, // Defaulting pa to enUS
};

const WeatherIcon = ({ iconCode, large = false }: { iconCode: string, large?: boolean }) => {
    if (!iconCode) return <Thermometer className={large ? "w-16 h-16 text-yellow-400" : "w-10 h-10 text-yellow-400"} />;
    return (
        <Image
            src={`https://openweathermap.org/img/wn/${iconCode}@2x.png`}
            alt="weather icon"
            width={large ? 80 : 50}
            height={large ? 80 : 50}
            className="drop-shadow-lg"
        />
    );
};

export function WeatherForecastCard() {
  const { weather, forecast, loading, error } = useWeather();
  const { t, language } = useLanguage();
  
  const locale = locales[language] || enUS;

  if (loading) {
    return <WeatherSkeleton />;
  }

  if (error) {
    return (
      <Card className="shadow-lg bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-800">{t('weather_error')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center text-red-700 gap-4">
            <WifiOff className="w-12 h-12" />
            <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!weather || !forecast) {
    return null;
  }

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{t('weather_forecast')}</CardTitle>
        <CardDescription className="flex items-center gap-1"><MapPin className="w-4 h-4" />{weather.location}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Today's Weather */}
        <div className="flex justify-between items-center mb-6 p-4 bg-primary/10 rounded-lg">
          <div>
            <p className='text-sm text-muted-foreground'>{t('today')}</p>
            <div className="text-5xl font-bold font-headline text-primary">
              {weather.temperature}°C
            </div>
            <p className="font-semibold capitalize text-muted-foreground">{weather.condition}</p>
          </div>
          <WeatherIcon iconCode={weather.icon} large />
        </div>
        
        {/* 5-Day Forecast */}
        <div className="space-y-3">
          {forecast.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
              <div className="font-semibold w-1/3">
                {format(new Date(day.date), 'EEEE', { locale })}
              </div>
              <div className="flex items-center gap-2 w-1/3">
                <WeatherIcon iconCode={day.icon} />
                <span className="text-muted-foreground text-sm capitalize">{day.condition}</span>
              </div>
              <div className="font-bold text-right w-1/3">{day.temp}°C</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function WeatherSkeleton() {
  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-6 p-4 rounded-lg">
           <div>
             <Skeleton className="h-4 w-16 mb-2" />
             <Skeleton className="h-12 w-24" />
             <Skeleton className="h-4 w-20 mt-1" />
           </div>
           <Skeleton className="h-20 w-20 rounded-full" />
        </div>
        <div className="space-y-3">
            {Array.from({length: 5}).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-2">
                    <Skeleton className="h-5 w-1/4" />
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-5 w-1/4" />
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
