import React, { useRef, useState, useEffect } from 'react';
import Chart from 'chart.js/auto';

const ChartContainer = () => {
  const chartContainer = useRef(null);
  const chartInstance = useRef(null);
  const [selectedScale, setSelectedScale] = useState('time');

  // Example data for demonstration
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [{
      label: 'My Dataset',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  useEffect(() => {
    if (chartContainer && chartContainer.current) {
      chartInstance.current = new Chart(chartContainer.current, {
        type: 'line',
        data: data,
        options: {
          scales: {
            x: {
              type: selectedScale,
              title: {
                display: true,
                text: 'Time'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Value'
              }
            }
          }
        }
      });
    }

    // Clean up chart instance on component unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  const handleScaleChange = (e) => {
    setSelectedScale(e.target.value);

    // Update chart scales without recreating the chart
    if (chartInstance.current) {
      chartInstance.current.config.options.scales.x.type = e.target.value;
      chartInstance.current.update();
    }
  };

  return (
    <div>
      <canvas ref={chartContainer}></canvas>
      <select value={selectedScale} onChange={handleScaleChange}>
        <option value="time">Time Scale</option>
        <option value="linear">Linear Scale</option>
        <option value="logarithmic">Logarithmic Scale</option>
      </select>
    </div>
  );
};

export default ChartContainer;
