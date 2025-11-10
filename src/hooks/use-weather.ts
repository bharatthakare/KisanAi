'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WeatherData } from '@/lib/types';
import { getWeatherForCoords } from '@/lib/actions';
import { FALLBACK_COORDINATES } from '@/lib/constants';
import { useToast } from './use-toast';
import { useLanguage } from '@/contexts/language-context';

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    const result = await getWeatherForCoords(lat, lon);
    if ('error' in result) {
      setError(result.error);
      toast({
        title: t('weather_error'),
        description: result.error,
        variant: "destructive",
      });
    } else {
      setWeather(result);
    }
    setLoading(false);
  }, [toast, t]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      fetchWeather(FALLBACK_COORDINATES.lat, FALLBACK_COORDINATES.lon);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      () => {
        toast({
            title: t('location_access_denied'),
            description: t('fallback_location_weather'),
        })
        fetchWeather(FALLBACK_COORDINATES.lat, FALLBACK_COORDINATES.lon);
      }
    );
  }, [fetchWeather, toast, t]);

  return { weather, loading, error };
}
