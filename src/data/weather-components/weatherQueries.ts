// Query functions for weather app

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '';

export function getCoordsFromCity(city: string): Promise<{ lat: number; lon: number }> {
  return fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
  )
    .then((res) => res.json())
    .then((data) => {
      if (!data[0]) throw new Error('City not found');
      return { lat: data[0].lat, lon: data[0].lon };
    });
}

export function getCoordsFromGeolocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      },
      (err) => reject(new Error('Unable to get your location'))
    );
  });
}

export function fetchWeather(lat: number, lon: number) {
  return fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=alerts&units=imperial&appid=${API_KEY}`
  ).then((res) => {
    if (!res.ok) throw new Error('Weather fetch failed');
    return res.json();
  });
}
