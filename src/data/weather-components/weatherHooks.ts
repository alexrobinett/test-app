import { useQuery } from '@tanstack/react-query';
import { getCoordsFromCity, fetchWeather } from './weatherQueries';

export function useCoordsQuery(city: string, coords: { lat: number; lon: number } | null) {
  return useQuery({
    queryKey: ['coords', city],
    queryFn: async () => {
      if (coords) return coords;
      if (city) return getCoordsFromCity(city);
      return getCoordsFromCity('New York');
    },
    enabled: !!city || !!coords,
  });
}

export function useWeatherQuery(locationData: { lat: number; lon: number } | undefined) {
  return useQuery({
    queryKey: ['weather', locationData?.lat, locationData?.lon],
    queryFn: () => {
      if (!locationData) return Promise.reject('No location data');
      return fetchWeather(locationData.lat, locationData.lon);
    },
    enabled: !!locationData,
    refetchInterval: 60000,
    staleTime: 60000,
  });
}
