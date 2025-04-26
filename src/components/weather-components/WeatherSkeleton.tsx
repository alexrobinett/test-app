import React from 'react';

// Tailwind shimmer animation
const shimmer = 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200';

export function WeeklyForecastSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="bg-white rounded shadow p-3 text-center flex flex-col items-center gap-2">
          <div className={`h-4 w-20 rounded ${shimmer}`} />
          <div className={`h-12 w-12 rounded-full ${shimmer}`} />
          <div className={`h-5 w-24 rounded ${shimmer}`} />
          <div className={`h-4 w-16 rounded ${shimmer}`} />
          <div className={`h-3 w-20 rounded ${shimmer}`} />
        </div>
      ))}
    </div>
  );
}

export function MinuteRainGraphSkeleton() {
  return (
    <div className="my-4">
      <div className="h-6 w-40 mb-2 rounded bg-gray-100 animate-pulse" />
      <div className="h-32 w-full rounded bg-gray-200 animate-pulse" />
    </div>
  );
}

export function RainGraphSkeleton() {
  return (
    <div className="my-4">
      <div className="h-6 w-40 mb-2 rounded bg-gray-100 animate-pulse" />
      <div className="h-32 w-full rounded bg-gray-200 animate-pulse" />
    </div>
  );
}

// Optionally, a loader for the main weather card
export function WeatherMainSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-40 rounded bg-gray-200 animate-pulse" />
      <div className="h-6 w-24 rounded bg-gray-100 animate-pulse" />
    </div>
  );
}
