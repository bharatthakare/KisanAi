
'use server';

import type { WeatherData, WeatherForecast } from '@/lib/types';

async function fetchFromOpenWeather(endpoint: string, params: URLSearchParams) {
  const apiKey = process.env.OPENWEATHER_KEY;
  if (!apiKey) {
    console.error('OPENWEATHER_KEY environment variable not set.');
    return { error: 'Server configuration error.' };
  }
  params.append('appid', apiKey);
  params.append('units', 'metric');

  const url = `https://api.openweathermap.org/data/2.5/${endpoint}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenWeather API error:', errorData);
      return { error: `Failed to fetch weather data: ${response.statusText}` };
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return { error: 'Could not fetch weather data.' };
  }
}


export async function getWeatherForCoords(lat: number, lon: number): Promise<WeatherData | { error: string }> {
  const params = new URLSearchParams({ lat: lat.toString(), lon: lon.toString() });
  const data = await fetchFromOpenWeather('weather', params);

  if ('error' in data) {
    return data;
  }

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
}

export async function getForecastForCoords(lat: number, lon: number): Promise<WeatherForecast[] | { error: string }> {
  const params = new URLSearchParams({ lat: lat.toString(), lon: lon.toString() });
  const data = await fetchFromOpenWeather('forecast', params);
  
  if ('error' in data) {
    return data;
  }
  
  const dailyForecasts: { [key: string]: any } = {};

  data.list.forEach((item: any) => {
    const date = new Date(item.dt * 1000).toISOString().split('T')[0];
    if (!dailyForecasts[date]) {
      dailyForecasts[date] = [];
    }
    dailyForecasts[date].push(item);
  });

  const fiveDayForecast: WeatherForecast[] = [];
  const today = new Date().toISOString().split('T')[0];

  Object.keys(dailyForecasts).sort().forEach(date => {
    // Skip today's forecast as we already show current weather
    if (date === today) {
        return;
    }

    if (fiveDayForecast.length < 5) {
      // Find the forecast closest to noon (12:00) for a representative daily forecast
      let best_item = dailyForecasts[date].reduce((prev: any, curr: any) => {
        const prev_hour = new Date(prev.dt * 1000).getUTCHours();
        const curr_hour = new Date(curr.dt * 1000).getUTCHours();
        return (Math.abs(curr_hour - 12) < Math.abs(prev_hour - 12) ? curr : prev);
      });

      fiveDayForecast.push({
        date: best_item.dt * 1000,
        temp: Math.round(best_item.main.temp),
        condition: best_item.weather[0].main,
        icon: best_item.weather[0].icon,
      });
    }
  });

  return fiveDayForecast;
}
