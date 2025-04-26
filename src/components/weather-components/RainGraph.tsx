import React from 'react';
import { Line } from 'react-chartjs-2';

const RainGraph = ({ hourly }: { hourly: any[] }) => {
  const hours = hourly.slice(0, 24).map((h) => new Date(h.dt * 1000).getHours());
  const rain = hourly.slice(0, 24).map((h) => h.rain?.['1h'] || 0);
  const data = {
    labels: hours,
    datasets: [
      {
        label: 'Rain (in)',
        data: rain,
        fill: true,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        tension: 0.4,
      },
    ],
  };
  return (
    <div className="my-4">
      <h3 className="font-semibold mb-2">Rain Next 24h</h3>
      <Line data={data} options={{ scales: { x: { title: { display: true, text: 'Hour' } }, y: { title: { display: true, text: 'Rain (in)' }, beginAtZero: true } } }} />
    </div>
  );
};

export default RainGraph;
