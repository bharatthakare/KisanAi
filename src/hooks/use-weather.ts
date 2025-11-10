'use client';

import { useState, useEffect, useCallback } from 'react';
import type { WeatherData } from '@/lib/types';
import { getWeatherForCoords } from '@/lib/actions';
import { FALLBACK_COORDINATES } from '@/lib/constants';
import { useToast } from './use-toast';

export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    const result = await getWeatherForCoords(lat, lon);
    if ('error' in result) {
      setError(result.error);
      toast({
        title: "Weather Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      setWeather(result);
    }
    setLoading(false);
  }, [toast]);

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
            title: "Location Access Denied",
            description: "Falling back to default location for weather.",
        })
        fetchWeather(FALLBACK_COORDINATES.lat, FALLBACK_COORDINATES.lon);
      }
    );
  }, [fetchWeather, toast]);

  return { weather, loading, error };
}
