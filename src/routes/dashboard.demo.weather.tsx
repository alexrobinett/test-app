import React, { useState } from 'react';
import { useCoordsQuery, useWeatherQuery } from '../data/weather-components/weatherHooks';
import { getCoordsFromGeolocation } from '../data/weather-components/weatherQueries';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,  
  Tooltip,
  Legend,
} from 'chart.js';
import { createFileRoute } from '@tanstack/react-router';
import MinuteRainGraph from '../components/weather-components/MinuteRainGraph';
import RainGraph from '../components/weather-components/RainGraph';
import { WeeklyForecastSkeleton, MinuteRainGraphSkeleton, RainGraphSkeleton } from '../components/weather-components/WeatherSkeleton';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function WeatherDemo() {
  const [city, setCity] = useState('Atlanta');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [search, setSearch] = useState('Atlanta');

  // Step 1: Get coordinates (either from city or geolocation)
  const { data: locationData, isLoading: locLoading, isError: locError, refetch: refetchLoc } = useCoordsQuery(city, coords);

  // Step 2: Fetch weather data
  const { data: weather, isLoading: weatherLoading, isError: weatherError, refetch: refetchWeather } = useWeatherQuery(locationData);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCity(search);
    setCoords(null);
    refetchLoc();
  };

  const handleUseLocation = async () => {
    try {
      const pos = await getCoordsFromGeolocation();
      setCoords(pos);
      setCity('');
      refetchLoc();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Weather Demo</h1>
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="text"
          className="border rounded p-2 flex-1"
          placeholder="Enter city name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Search</button>
        <button type="button" className="px-4 py-2 bg-green-600 text-white rounded" onClick={handleUseLocation}>
          Use My Location
        </button>
      </form>
      {locError && <div className="text-red-600">Location not found.</div>}
      {weatherLoading || locLoading ? (
        <>
          <WeeklyForecastSkeleton />
          <MinuteRainGraphSkeleton />
          <RainGraphSkeleton />
        </>
      ) : weatherError ? (
        <div className="text-red-600">Could not fetch weather.</div>
      ) : weather ? (
        <>
          {/* Weekly Forecast */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
            {weather.daily.slice(0, 7).map((day: any, idx: number) => (
              <div key={day.dt} className="bg-white rounded shadow p-3 text-center">
                <div className="font-semibold">{new Date(day.dt * 1000).toLocaleDateString(undefined, { weekday: 'short' })}</div>
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt={day.weather[0].description}
                  className="mx-auto"
                />
                <div className="text-lg">{Math.round(day.temp.max)}° / {Math.round(day.temp.min)}°F</div>
                <div className="text-sm text-gray-500">{day.weather[0].main}</div>
                <div className="text-xs text-blue-600">Rain: {day.rain ? day.rain + 'in' : '0in'}</div>
              </div>
            ))}
          </div>
          {/* Rainfall for the Next 60 Minutes */}
          {weather.minutely && <MinuteRainGraph minutely={weather.minutely} />}
          {/* Rain Graph for Today */}
          <RainGraph hourly={weather.hourly} />
        </>
      ) : null}
      <div className="mt-8 text-xs text-gray-400">
        Powered by <a href="https://openweathermap.org/" className="underline" target="_blank" rel="noopener noreferrer">OpenWeather</a>. Requires free API key in <code>.env</code> as <code>VITE_OPENWEATHER_API_KEY</code>.
      </div>
    </div>
  );
}

export const Route = createFileRoute('/dashboard/demo/weather')({
  component: WeatherDemo,
});
