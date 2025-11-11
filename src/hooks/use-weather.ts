'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WeatherData, WeatherForecast } from '@/lib/types';
import { getWeatherForCoords, getForecastForCoords } from '@/lib/actions';
import { FALLBACK_COORDINATES } from '@/lib/constants';
import { useToast } from './use-toast';
import { useLanguage } from '@/contexts/language-context';

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  const fetchWeatherData = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const [weatherResult, forecastResult] = await Promise.all([
          getWeatherForCoords(lat, lon),
          getForecastForCoords(lat, lon)
      ]);

      if ('error' in weatherResult) {
        throw new Error(weatherResult.error);
      } else {
        setWeather(weatherResult);
      }
      
      if ('error' in forecastResult) {
        throw new Error(forecastResult.error);
      } else {
          setForecast(forecastResult);
      }
    } catch(err: any) {
        const errorMessage = err.message || "An unknown error occurred while fetching weather.";
        setError(errorMessage);
        toast({
          title: t('weather_error'),
          description: errorMessage,
          variant: "destructive",
        });
    } finally {
        setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      fetchWeatherData(FALLBACK_COORDINATES.lat, FALLBACK_COORDINATES.lon);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeatherData(position.coords.latitude, position.coords.longitude);
      },
      (geoError) => {
        let title = t('weather_error');
        let description = t('fallback_location_weather');
        if (geoError.code === geoError.PERMISSION_DENIED) {
            title = t('location_access_denied');
        }
        toast({ title, description });
        fetchWeatherData(FALLBACK_COORDINATES.lat, FALLBACK_COORDINATES.lon);
      }
    );
  }, [fetchWeatherData, toast, t]);

  return { weather, forecast, loading, error };
}
