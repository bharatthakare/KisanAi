
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
  
  // Filter for forecasts around noon (12:00) to get one per day.
  const dailyForecasts = data.list.filter((item: any) => {
    const itemDate = new Date(item.dt * 1000);
    // Include the current day's forecast regardless of time, and then noon for subsequent days.
    const isToday = itemDate.getDate() === new Date().getDate();
    return isToday || itemDate.getHours() === 12;
  });

  // Remove duplicate days, keeping the first entry (which will be today or noon).
  const uniqueDailyForecasts: any[] = [];
  const seenDays = new Set<number>();
  for (const item of dailyForecasts) {
    const day = new Date(item.dt * 1000).getDate();
    if (!seenDays.has(day)) {
      uniqueDailyForecasts.push(item);
      seenDays.add(day);
    }
  }

  // Ensure we skip today's entry from the list of 5 days if it's already represented
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return uniqueDailyForecasts
    .filter(item => {
        // Filter out past entries, ensuring we only show future forecasts
        const itemDate = new Date(item.dt * 1000);
        return itemDate >= today || itemDate.getDate() === today.getDate();
    })
    .slice(0, 5) // Take the next 5 days
    .map((item: any) => ({
      date: item.dt * 1000,
      temp: Math.round(item.main.temp),
      condition: item.weather[0].main,
      icon: item.weather[0].icon,
  }));
}
