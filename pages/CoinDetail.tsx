
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Chart, registerables } from 'https://esm.sh/chart.js';
import { getCoinDetails, getMarketChart } from '../api';
import { CoinMarketData, MarketChartData } from '../types';

Chart.register(...registerables);

const CoinDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [coin, setCoin] = useState<CoinMarketData | null>(null);
  const [chartData, setChartData] = useState<MarketChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(7);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  const fetchData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [coinInfo, chartInfo] = await Promise.all([
        getCoinDetails(id),
        getMarketChart(id, days)
      ]);
      setCoin(coinInfo[0] || null);
      setChartData(chartInfo);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id, days]);

  useEffect(() => {
    if (!chartData || !chartRef.current || loading) return;

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const labels = chartData.prices.map(p => {
      const date = new Date(p[0]);
      return days <= 1 ? date.toLocaleTimeString() : date.toLocaleDateString();
    });
    const prices = chartData.prices.map(p => p[1]);

    const isPositive = prices[prices.length - 1] >= prices[0];
    const color = isPositive ? '#4ade80' : '#f87171';

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: prices,
          borderColor: color,
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.1,
          fill: true,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return '';
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, isPositive ? 'rgba(74, 222, 128, 0.2)' : 'rgba(248, 113, 113, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            return gradient;
          }
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { display: false },
          y: { 
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#94a3b8', font: { size: 10 } }
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [chartData, loading]);

  if (loading && !coin) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-pulse">
        <div className="h-10 w-48 bg-slate-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 h-96 bg-slate-800 rounded-2xl"></div>
          <div className="h-96 bg-slate-800 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error || (!coin && !loading)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <i className="fas fa-search text-5xl text-slate-700 mb-4"></i>
        <h2 className="text-2xl font-bold mb-2">Coin not found</h2>
        <p className="text-slate-400 mb-6">{error || "The cryptocurrency you're looking for doesn't exist or data is unavailable."}</p>
        <button onClick={() => navigate('/')} className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg transition-colors">Back Home</button>
      </div>
    );
  }

  const priceChange = coin?.price_change_percentage_24h ?? 0;
  const currentPrice = coin?.current_price ?? 0;
  const marketCap = coin?.market_cap ?? 0;
  const totalVolume = coin?.total_volume ?? 0;

  const stats = [
    { label: 'Market Cap', value: `$${marketCap.toLocaleString()}` },
    { label: '24h Volume', value: `$${totalVolume.toLocaleString()}` },
    { label: '24h High', value: `$${(coin?.high_24h ?? 0).toLocaleString()}`, color: 'text-green-400' },
    { label: '24h Low', value: `$${(coin?.low_24h ?? 0).toLocaleString()}`, color: 'text-red-400' },
    { label: 'All Time High', value: `$${currentPrice.toLocaleString()}` },
    { label: 'Circulating Supply', value: currentPrice > 0 ? `${(marketCap / currentPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })} ${coin?.symbol.toUpperCase()}` : 'N/A' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate('/')} className="text-slate-500 hover:text-white transition-colors">
            <i className="fas fa-arrow-left text-xl"></i>
          </button>
          <img src={coin!.image} alt={coin!.name} className="w-10 h-10 rounded-full" />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold text-white">{coin!.name}</h1>
              <span className="text-slate-500 font-medium uppercase text-sm bg-slate-800 px-2 py-0.5 rounded">
                {coin!.symbol}
              </span>
            </div>
            <div className="text-slate-400 text-sm">Rank #{coin!.market_cap_rank}</div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-3xl font-bold text-white">
            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
          </div>
          <div className={`font-bold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}% (24h)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-slate-800/30 border border-slate-800 rounded-2xl p-6 flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider">Price Chart</h3>
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
              {[
                { label: '1D', val: 1 },
                { label: '7D', val: 7 },
                { label: '1M', val: 30 },
                { label: '1Y', val: 365 }
              ].map(t => (
                <button
                  key={t.val}
                  onClick={() => setDays(t.val)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${days === t.val ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[400px] relative">
            {loading && <div className="absolute inset-0 skeleton opacity-20"></div>}
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        {/* Market Stats */}
        <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-6 space-y-6 h-fit">
          <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider">Market Statistics</h3>
          <div className="divide-y divide-slate-800">
            {stats.map((stat, i) => (
              <div key={i} className="py-4 flex justify-between items-center">
                <span className="text-slate-400 text-sm">{stat.label}</span>
                <span className={`font-bold text-slate-200 ${stat.color || ''}`}>{stat.value}</span>
              </div>
            ))}
          </div>
          <div className="pt-4">
            <a 
              href={`https://www.coingecko.com/en/coins/${coin!.id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full inline-block text-center bg-blue-600/10 border border-blue-600/30 text-blue-400 font-bold py-3 rounded-xl hover:bg-blue-600/20 transition-all text-sm"
            >
              View on CoinGecko <i className="fas fa-external-link-alt ml-2 text-xs"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinDetail;
