import React, { useEffect } from 'react';
import Chart from 'chart.js/auto';

const PieChart = ({ alias, data }) => {
  useEffect(() => {
    const ctx = document.getElementById(`pie-${alias}`).getContext('2d');
    const etatDurations = {};
    
    data?.segments.forEach((segment) => {
      const seconds = (segment.fin - segment.debut) / 1000;
      etatDurations[segment.etat] = (etatDurations[segment.etat] || 0) + seconds;
    });

    const labels = Object.keys(etatDurations);
    const values = labels.map((key) => etatDurations[key]);

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: ['black', ' brown', 'yellow', 'green', 'skyblue'],
          },
        ],
      },
    });
  }, [alias, data]);

  return <canvas id={`pie-${alias}`} width="40" height="40"></canvas>;
};

export default PieChart;
