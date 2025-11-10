'use client';

import { useWeather } from '@/hooks/use-weather';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { WifiOff, Wind, Droplets, Thermometer, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/language-context';

const WeatherIcon = ({ iconCode }: { iconCode: string }) => {
    if (!iconCode) return <Thermometer className="w-16 h-16 text-yellow-400" />;
    return (
        <Image
            src={`https://openweathermap.org/img/wn/${iconCode}@2x.png`}
            alt="weather icon"
            width={80}
            height={80}
            className="drop-shadow-lg"
        />
    );
};


export function WeatherCard() {
  const { weather, loading, error } = useWeather();
  const { t } = useLanguage();

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

  if (!weather) {
    return null;
  }

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">{t('current_weather')}</CardTitle>
        <CardDescription className="flex items-center gap-1"><MapPin className="w-4 h-4" />{weather.location}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="text-6xl font-bold font-headline text-primary-foreground/90">
            {weather.temperature}°C
          </div>
          <div className='flex flex-col items-center'>
            <WeatherIcon iconCode={weather.icon} />
            <span className="font-semibold capitalize text-muted-foreground">{weather.condition}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 p-2 bg-background rounded-lg">
            <Droplets className="w-5 h-5 text-blue-500" />
            <div>
              <div className="text-muted-foreground">{t('humidity')}</div>
              <div className="font-semibold">{weather.humidity}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-background rounded-lg">
            <Wind className="w-5 h-5 text-gray-500" />
            <div>
              <div className="text-muted-foreground">{t('wind')}</div>
              <div className="font-semibold">{weather.windSpeed} km/h</div>
            </div>
          </div>
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
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-16 w-32" />
          <Skeleton className="h-20 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}
