'use server';

import type { WeatherData } from '@/lib/types';

export async function getWeatherForCoords(lat: number, lon: number): Promise<WeatherData | { error: string }> {
  const apiKey = process.env.OPENWEATHER_KEY;
  if (!apiKey) {
    console.error('OPENWEATHER_KEY environment variable not set.');
    return { error: 'Server configuration error.' };
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url, {
        next: { revalidate: 3600 } // Revalidate every hour
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenWeather API error:', errorData);
      return { error: `Failed to fetch weather data: ${response.statusText}` };
    }

    const data = await response.json();

    return {
      temperature: Math.round(data.main.temp),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // m/s to km/h
      condition: data.weather[0].main,
      location: `${data.name}, ${data.sys.country}`,
      icon: data.weather[0].icon,
      lat: data.coord.lat,
      lon: data.coord.lon,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return { error: 'Could not fetch weather data.' };
  }
}
