import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface CohortData {
  cohort: string;
  retentionRates: number[];
  averageValue: number;
}

interface Props {
  data: CohortData[];
  isLoading?: boolean;
}

export default function CohortChart({ data, isLoading }: Props) {
  const months = Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`);

  const chartData = {
    labels: months,
    datasets: data.map((cohort, index) => ({
      label: format(new Date(cohort.cohort), 'MMM yyyy'),
      data: cohort.retentionRates,
      borderColor: `hsl(${index * 30}, 70%, 50%)`,
      backgroundColor: 'transparent',
      tension: 0.4
    }))
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#d4d4d8'
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(1) + '%';
            }
            return label;
          }
        }
      },
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#d4d4d8',
          callback: function(value: any) {
            return value + '%';
          }
        },
        min: 0,
        max: 100
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#d4d4d8',
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-[400px] flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="text-zinc-400">Loading cohort data...</div>
      </div>
    );
  }

  return (
    <div className="h-[400px] p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
      <Line data={chartData} options={options} />
    </div>
  );
}