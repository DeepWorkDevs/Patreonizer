import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Users, DollarSign, Loader2, RefreshCw } from 'lucide-react';
import { useStore } from '../../store';
import { supabase } from '../../lib/supabase';
import { Line } from 'react-chartjs-2';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import DateRangePicker from '../../components/DateRangePicker';
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

interface PageStats {
  id: string;
  name: string;
  imageUrl: string | null;
  currentRevenue: number;
  previousRevenue: number;
  currentPatrons: number;
  previousPatrons: number;
  revenueHistory: number[];
  patronHistory: number[];
  lastUpdated: string;
}

interface CombinedStats {
  totalRevenue: number;
  totalPatrons: number;
  revenueChange: number;
  patronChange: number;
}

export default function Dashboard() {
  const [pageStats, setPageStats] = useState<PageStats[]>([]);
  const [combinedStats, setCombinedStats] = useState<CombinedStats>({
    totalRevenue: 0,
    totalPatrons: 0,
    revenueChange: 0,
    patronChange: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: startOfMonth(subMonths(new Date(), 1)),
    to: endOfMonth(new Date())
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [dateRange]);

  const fetchStats = async () => {
    if (!dateRange.from || !dateRange.to) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data: pages, error: pagesError } = await supabase
        .from('patreon_pages')
        .select(`
          id,
          name,
          patreon_campaigns (
            patron_count,
            pledge_sum,
            image_url,
            image_small_url
          )
        `);

      if (pagesError) throw pagesError;

      // Get historical data based on selected date range
      const { data: historicalData, error: historicalError } = await supabase
        .from('patreon_campaigns')
        .select('page_id, patron_count, pledge_sum')
        .gte('updated_at', dateRange.from.toISOString())
        .lte('updated_at', dateRange.to.toISOString())
        .order('updated_at', { ascending: false });

      if (historicalError) throw historicalError;

      // Generate mock historical data for charts (will be replaced with real data)
      const generateHistory = (current: number) => {
        return Array.from({ length: 12 }, (_, i) => {
          const base = current * 0.7; // Start at 70% of current value
          const growth = (i + 1) / 12; // Linear growth
          return Math.round(base + (current - base) * growth);
        });
      };

      const stats: PageStats[] = pages.map(page => {
        const campaign = page.patreon_campaigns[0];
        const historical = historicalData?.find(h => h.page_id === page.id);
        
        const currentRevenue = (campaign?.pledge_sum || 0) / 100;
        const previousRevenue = (historical?.pledge_sum || campaign?.pledge_sum || 0) / 100;
        const currentPatrons = campaign?.patron_count || 0;
        const previousPatrons = historical?.patron_count || campaign?.patron_count || 0;

        return {
          id: page.id,
          name: page.name,
          imageUrl: campaign?.image_small_url || campaign?.image_url || null,
          currentRevenue,
          previousRevenue,
          currentPatrons,
          previousPatrons,
          revenueHistory: generateHistory(currentRevenue),
          patronHistory: generateHistory(currentPatrons),
          lastUpdated: new Date().toISOString()
        };
      });

      setPageStats(stats);

      // Calculate combined stats
      const combined = stats.reduce((acc, stat) => ({
        totalRevenue: acc.totalRevenue + stat.currentRevenue,
        totalPatrons: acc.totalPatrons + stat.currentPatrons,
        revenueChange: acc.revenueChange + (stat.currentRevenue - stat.previousRevenue),
        patronChange: acc.patronChange + (stat.currentPatrons - stat.previousPatrons)
      }), {
        totalRevenue: 0,
        totalPatrons: 0,
        revenueChange: 0,
        patronChange: 0
      });

      setCombinedStats(combined);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setIsLoading(false);
    }
  };

  const formatChange = (current: number, previous: number) => {
    const change = current - previous;
    const percentage = previous === 0 ? 0 : (change / previous) * 100;
    return {
      value: Math.abs(change),
      percentage: Math.abs(percentage).toFixed(1),
      isPositive: change >= 0
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            let label = '';
            if (context.parsed.y !== null) {
              label = context.datasetLabel === 'Revenue' 
                ? new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  }).format(context.parsed.y)
                : context.parsed.y.toLocaleString() + ' patrons';
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        display: false
      },
      y: {
        display: false
      }
    },
    elements: {
      point: {
        radius: 0
      },
      line: {
        tension: 0.4
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="flex flex-col items-center gap-4 text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] gap-6">
        <div className="text-red-400 text-center max-w-md">
          <p className="text-lg font-semibold mb-2">Error Loading Dashboard</p>
          <p className="text-zinc-400">{error}</p>
        </div>
        <button
          onClick={fetchStats}
          className="px-6 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-5 h-5" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1920px] mx-auto space-y-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Monitoring {pageStats.length} Patreon {pageStats.length === 1 ? 'page' : 'pages'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DateRangePicker
            from={dateRange.from}
            to={dateRange.to}
            onSelect={setDateRange}
            isOpen={isDatePickerOpen}
            onOpenChange={setIsDatePickerOpen}
          />
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-zinc-800/50 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors text-sm font-medium flex items-center gap-2 group"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            Refresh
          </button>
        </div>
      </div>

      {/* Overall Performance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/50 rounded-2xl p-6 sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f45d48]/10 to-transparent" />
        
        <div className="relative">
          <h2 className="text-xl font-bold text-white mb-6">Overall Performance</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Total Revenue Card */}
            <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-zinc-400">Total Monthly Revenue</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    ${combinedStats.totalRevenue.toLocaleString()}
                    <span className="text-zinc-400 text-lg font-normal">/mo</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#f45d48] to-[#f17c67] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#f45d48]/20">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              {combinedStats.revenueChange !== 0 && (
                <div className={`flex items-center gap-2 ${
                  combinedStats.revenueChange >= 0 
                    ? 'text-emerald-400 bg-emerald-400/10'
                    : 'text-red-400 bg-red-400/10'
                } px-3 py-1 rounded-lg text-sm font-medium w-fit`}>
                  {combinedStats.revenueChange >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  ${Math.abs(combinedStats.revenueChange).toLocaleString()} in last 24h
                </div>
              )}
            </div>

            {/* Total Patrons Card */}
            <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-zinc-400">Total Patrons</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {combinedStats.totalPatrons.toLocaleString()}
                    <span className="text-zinc-400 text-lg font-normal"> patrons</span>
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#f45d48] to-[#f17c67] rounded-xl flex items-center justify-center text-white shadow-lg shadow-[#f45d48]/20">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              {combinedStats.patronChange !== 0 && (
                <div className={`flex items-center gap-2 ${
                  combinedStats.patronChange >= 0 
                    ? 'text-emerald-400 bg-emerald-400/10'
                    : 'text-red-400 bg-red-400/10'
                } px-3 py-1 rounded-lg text-sm font-medium w-fit`}>
                  {combinedStats.patronChange >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(combinedStats.patronChange)} in last 24h
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Individual Page Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pageStats.map(page => {
          const revenueChange = formatChange(page.currentRevenue, page.previousRevenue);
          const patronChange = formatChange(page.currentPatrons, page.previousPatrons);
          const months = Array.from({ length: 12 }, (_, i) => `Month ${i + 1}`);

          const revenueChartData = {
            labels: months,
            datasets: [{
              label: 'Revenue',
              data: page.revenueHistory,
              borderColor: '#f45d48',
              backgroundColor: 'rgba(244, 93, 72, 0.1)',
              fill: true
            }]
          };

          const patronChartData = {
            labels: months,
            datasets: [{
              label: 'Patrons',
              data: page.patronHistory,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              fill: true
            }]
          };

          return (
            <div key={page.id} className="group bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800/50 rounded-xl p-6 transition-all duration-300 hover:border-zinc-700/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-zinc-800 rounded-xl overflow-hidden">
                  {page.imageUrl ? (
                    <img
                      src={page.imageUrl}
                      alt={page.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f45d48] to-[#f17c67]">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#f45d48] transition-colors">
                    {page.name}
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Updated {new Date(page.lastUpdated).toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Revenue Stats */}
                <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl p-4">
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-zinc-400">Monthly Revenue</p>
                      <p className="text-lg font-bold text-white">
                        ${page.currentRevenue.toLocaleString()}
                      </p>
                    </div>
                    {revenueChange.value > 0 && (
                      <div className={`mt-1 flex items-center gap-1 text-sm font-medium ${
                        revenueChange.isPositive ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {revenueChange.isPositive ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        ${revenueChange.value.toLocaleString()} ({revenueChange.percentage}%)
                      </div>
                    )}
                  </div>
                  <div className="h-24">
                    <Line data={revenueChartData} options={chartOptions} />
                  </div>
                </div>

                {/* Patron Stats */}
                <div className="bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl p-4">
                  <div className="mb-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-zinc-400">Patrons</p>
                      <p className="text-lg font-bold text-white">
                        {page.currentPatrons.toLocaleString()}
                      </p>
                    </div>
                    {patronChange.value > 0 && (
                      <div className={`mt-1 flex items-center gap-1 text-sm font-medium ${
                        patronChange.isPositive ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        {patronChange.isPositive ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {patronChange.value} ({patronChange.percentage}%)
                      </div>
                    )}
                  </div>
                  <div className="h-24">
                    <Line data={patronChartData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}