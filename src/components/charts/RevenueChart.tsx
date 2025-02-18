import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, subMonths, eachMonthOfInterval } from 'date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueData {
  date: string;
  revenue: number;
  newRevenue: number;
  lostRevenue: number;
  projectedRevenue: number;
}

interface Props {
  data: RevenueData[];
  isLoading?: boolean;
}

export default function RevenueChart({ data, isLoading }: Props) {
  const months = eachMonthOfInterval({
    start: subMonths(new Date(), 11),
    end: new Date()
  }).map(date => format(date, 'MMM yyyy'));

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'Total Revenue',
        data: data.map(d => d.revenue),
        borderColor: '#f45d48',
        backgroundColor: 'rgba(244, 93, 72, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'New Revenue',
        data: data.map(d => d.newRevenue),
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4
      },
      {
        label: 'Lost Revenue',
        data: data.map(d => -d.lostRevenue),
        borderColor: '#ef4444',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4
      },
      {
        label: 'Projected Revenue',
        data: data.map(d => d.projectedRevenue),
        borderColor: '#6366f1',
        backgroundColor: 'transparent',
        borderDash: [2, 2],
        tension: 0.4
      }
    ]
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
              label += new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
              }).format(context.parsed.y);
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
            return new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(value);
          }
        }
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
        <div className="text-zinc-400">Loading revenue data...</div>
      </div>
    );
  }

  return (
    <div className="h-[400px] p-4 bg-zinc-900 border border-zinc-800 rounded-xl">
      <Line data={chartData} options={options} />
    </div>
  );
}