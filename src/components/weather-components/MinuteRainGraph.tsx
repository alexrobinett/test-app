import React from 'react';
import { Line } from 'react-chartjs-2';

const MinuteRainGraph = ({ minutely }: { minutely: any[] }) => {
  const labels = minutely.slice(0, 60).map((m) => {
    const date = new Date(m.dt * 1000);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  });
  const data = {
    labels,
    datasets: [
      {
        label: 'Rain (in)',
        data: minutely.slice(0, 60).map(m => m.precipitation || 0),
        fill: true,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4,
      },
    ],
  };
  return (
    <div className="my-4">
      <h3 className="font-semibold mb-2">Rain Next 60 Minutes</h3>
      <Line data={data} options={{
        scales: {
          x: { title: { display: true, text: 'Time' } },
          y: { title: { display: true, text: 'Rain (in)' }, beginAtZero: true }
        }
      }} />
    </div>
  );
};

export default MinuteRainGraph;
