
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTopCoins, getCategories } from '../api';
import { CoinMarketData, SortKey, SortOrder } from '../types';

const Sparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  if (!data || data.length === 0) return <div className="h-10 w-24 bg-slate-800 rounded opacity-20" />;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  const width = 100;
  const height = 30;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / (range || 1)) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

const GlobalStatCard: React.FC<{ title: string; value: string; change?: number; sparklineData?: number[]; loading?: boolean }> = ({ title, value, change, sparklineData, loading }) => {
  if (loading) return <div className="bg-slate-800/20 border border-slate-800/50 rounded-2xl p-6 h-40 animate-pulse" />;
  
  const isPositive = (change ?? 0) >= 0;
  return (
    <div className="bg-slate-800/20 border border-slate-800/50 rounded-2xl p-6 flex items-start justify-between">
      <div className="space-y-2">
        <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 text-sm font-medium">{title}</span>
          {change !== undefined && (
            <span className={`text-xs font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              <i className={`fas fa-caret-${isPositive ? 'up' : 'down'} mr-1`}></i>
              {Math.abs(change).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
      {sparklineData && (
        <div className="mt-2">
          <Sparkline data={sparklineData} color={isPositive ? '#4ade80' : '#f87171'} />
        </div>
      )}
    </div>
  );
};

const MiniList: React.FC<{ title: string; icon: string; coins: CoinMarketData[]; loading: boolean }> = ({ title, icon, coins, loading }) => {
  const navigate = useNavigate();
  return (
    <div className="bg-slate-800/20 border border-slate-800/50 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{icon}</span>
          <h3 className="font-bold text-slate-100">{title}</h3>
        </div>
      </div>
      <div className="space-y-3">
        {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="h-8 bg-slate-800/50 rounded-lg animate-pulse" />) :
          coins.map((coin, idx) => {
            const price = coin.current_price ?? 0;
            const change = coin.price_change_percentage_24h ?? 0;
            return (
              <div 
                key={coin.id} 
                className="flex items-center justify-between cursor-pointer group"
                onClick={() => navigate(`/coin/${coin.id}`)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-500 font-bold w-4">{idx + 1}</span>
                  <img src={coin.image} alt={coin.name} className="w-5 h-5 rounded-full" />
                  <span className="text-sm font-medium text-slate-200 group-hover:text-green-400 transition-colors">{coin.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-slate-300 font-medium tabular-nums">
                    ${price < 1 ? price.toFixed(4) : price.toLocaleString()}
                  </span>
                  <span className={`text-xs font-bold tabular-nums ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
};

type TabType = 'All' | 'Highlights' | 'Categories' | 'Ecosystems';

const Home: React.FC = () => {
  const [coins, setCoins] = useState<CoinMarketData[]>([]);
  const [categories, setCategories] = useState<{ category_id: string; name: string }[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('All');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder }>({ key: 'market_cap_rank', order: 'asc' });
  const [visibleColumns, setVisibleColumns] = useState({
    price: true, h1: true, h24: true, d7: true, volume: true, mcap: true, spark: true
  });
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  
  const navigate = useNavigate();

  const fetchData = async (category?: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTopCoins(50, category);
      setCoins(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    getCategories().then(setCategories).catch(console.error);
  }, []);

  const handleTabChange = (tab: TabType) => {
    if (activeTab === tab) return;
    setActiveTab(tab);
    setSelectedCategory(null);
    setSearchTerm('');
    if (tab === 'All' || tab === 'Highlights') fetchData();
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId || null);
    fetchData(categoryId || undefined);
  };

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      order: prev.key === key && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedCoins = useMemo(() => {
    let result = [...coins];
    if (activeTab === 'Highlights') {
      result = result.filter(c => Math.abs(c.price_change_percentage_24h ?? 0) > 2.5 || c.market_cap_rank <= 10);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(lower) || c.symbol.toLowerCase().includes(lower));
    }
    result.sort((a, b) => {
      const valA = (a[sortConfig.key] ?? 0) as number;
      const valB = (b[sortConfig.key] ?? 0) as number;
      return sortConfig.order === 'asc' ? valA - valB : valB - valA;
    });
    return result;
  }, [coins, searchTerm, sortConfig, activeTab]);

  const trendingCoins = useMemo(() => [...coins].sort((a, b) => (b.price_change_percentage_24h ?? 0) - (a.price_change_percentage_24h ?? 0)).slice(0, 3), [coins]);
  const categorySubList = useMemo(() => {
    if (activeTab === 'Categories') return categories.slice(0, 40);
    if (activeTab === 'Ecosystems') return categories.filter(c => c.name.toLowerCase().includes('ecosystem')).slice(0, 40);
    return [];
  }, [categories, activeTab]);

  return (
    <div className="space-y-10 animate-fadeIn max-w-7xl mx-auto px-4 relative">
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Cryptocurrency Prices by Market Cap</h1>
        <p className="text-slate-400 text-sm">
          Market analysis powered by real-time data from CoinGecko.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
            <div>
              <h3 className="text-red-500 font-bold">Data Fetching Failed</h3>
              <p className="text-slate-400 text-sm">{error}</p>
            </div>
          </div>
          <button 
            onClick={() => fetchData(selectedCategory || undefined)}
            className="bg-red-500 text-white font-bold px-6 py-2 rounded-xl hover:bg-red-400 transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {/* Hero Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 grid grid-cols-1 gap-4">
          <GlobalStatCard title="Market Cap" value="$2.36T" change={-2.8} loading={loading && coins.length === 0} />
          <GlobalStatCard title="24h Volume" value="$105.8B" change={12.4} loading={loading && coins.length === 0} />
        </div>
        <div className="lg:col-span-1">
          <MiniList title="Trending" icon="🔥" coins={trendingCoins} loading={loading && coins.length === 0} />
        </div>
        <div className="lg:col-span-1">
          <MiniList title="Top Gainers" icon="🚀" coins={trendingCoins.reverse()} loading={loading && coins.length === 0} />
        </div>
      </div>

      {/* Customize Modal */}
      {showCustomizeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-fadeIn">
            <h3 className="text-xl font-bold mb-6 text-white">Customize Table</h3>
            <div className="space-y-4">
              {Object.entries(visibleColumns).map(([key, value]) => (
                <label key={key} className="flex items-center justify-between cursor-pointer group">
                  <span className="text-slate-300 font-medium capitalize">{key === 'spark' ? 'Last 7 Days' : key === 'h1' ? '1h Change' : key === 'h24' ? '24h Change' : key === 'd7' ? '7d Change' : key}</span>
                  <input 
                    type="checkbox" 
                    checked={value}
                    onChange={() => setVisibleColumns(p => ({...p, [key]: !value}))}
                    className="w-5 h-5 accent-green-500 rounded border-slate-700 bg-slate-800"
                  />
                </label>
              ))}
            </div>
            <button 
              onClick={() => setShowCustomizeModal(false)}
              className="mt-8 w-full bg-green-500 text-[#0c111d] font-bold py-3 rounded-xl hover:bg-green-400 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-6 py-2 border-b border-slate-800/50">
          <div className="flex items-center space-x-2 bg-slate-800/30 p-1 rounded-xl border border-slate-800/50">
            {(['All', 'Highlights', 'Categories', 'Ecosystems'] as TabType[]).map((f) => (
              <button key={f} onClick={() => handleTabChange(f)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === f ? 'bg-green-500 text-[#0c111d]' : 'text-slate-400 hover:text-slate-200'}`}>{f}</button>
            ))}
          </div>
          <div className="flex flex-grow lg:flex-grow-0 items-center space-x-4">
            <div className="relative flex-grow lg:flex-grow-0">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-900/50 border border-slate-700/50 rounded-xl pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all w-full lg:w-64" />
            </div>
            <button onClick={() => setShowCustomizeModal(true)} className="bg-slate-800/50 hover:bg-slate-800 text-slate-200 border border-slate-700/50 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"><i className="fas fa-sliders-h mr-2"></i> Customize</button>
          </div>
        </div>
        {(activeTab === 'Categories' || activeTab === 'Ecosystems') && (
          <div className="flex items-center space-x-3 overflow-x-auto pb-4 custom-scrollbar">
            <button onClick={() => handleCategorySelect('')} className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold border transition-all ${!selectedCategory ? 'bg-green-500 border-green-500 text-[#0c111d]' : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:text-slate-200'}`}>All {activeTab}</button>
            {categorySubList.map(cat => (
              <button key={cat.category_id} onClick={() => handleCategorySelect(cat.category_id)} className={`flex-shrink-0 px-5 py-2 rounded-full text-xs font-bold border transition-all ${selectedCategory === cat.category_id ? 'bg-green-500 border-green-500 text-[#0c111d]' : 'bg-slate-800/30 border-slate-700 text-slate-400 hover:text-slate-200'}`}>{cat.name}</button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[#0c111d] border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl relative">
        {loading && <div className="absolute inset-0 bg-[#0c111d]/50 backdrop-blur-sm z-10 flex items-center justify-center"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/20 text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="px-6 py-4 w-12 text-center">#</th>
                <th className="px-6 py-4 min-w-[150px] cursor-pointer" onClick={() => handleSort('market_cap_rank')}>Coin</th>
                {visibleColumns.price && <th className="px-6 py-4 text-right cursor-pointer" onClick={() => handleSort('current_price')}>Price</th>}
                {visibleColumns.h1 && <th className="px-4 py-4 text-right">1h</th>}
                {visibleColumns.h24 && <th className="px-4 py-4 text-right">24h</th>}
                {visibleColumns.d7 && <th className="px-4 py-4 text-right">7d</th>}
                {visibleColumns.volume && <th className="px-6 py-4 text-right">24h Volume</th>}
                {visibleColumns.mcap && <th className="px-6 py-4 text-right cursor-pointer" onClick={() => handleSort('market_cap')}>Market Cap</th>}
                {visibleColumns.spark && <th className="px-6 py-4 text-center">Last 7 Days</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading && coins.length === 0 ? Array(10).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse"><td colSpan={9} className="px-6 py-6"><div className="h-6 bg-slate-800/30 rounded" /></td></tr>
              )) : filteredAndSortedCoins.map((coin) => {
                const price = coin.current_price ?? 0;
                const p1h = coin.price_change_percentage_1h_in_currency ?? 0;
                const p24h = coin.price_change_percentage_24h ?? 0;
                const p7d = coin.price_change_percentage_7d_in_currency ?? 0;
                const sparkData = coin.sparkline_in_7d?.price || [];
                const sparkColor = (sparkData[sparkData.length-1] > sparkData[0]) ? '#4ade80' : '#f87171';

                return (
                  <tr key={coin.id} className="hover:bg-slate-800/30 transition-all cursor-pointer group" onClick={() => navigate(`/coin/${coin.id}`)}>
                    <td className="px-6 py-5 text-center text-slate-500 font-bold text-xs">{coin.market_cap_rank}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <img src={coin.image} alt={coin.name} className="w-6 h-6 rounded-full" />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-100 group-hover:text-green-500 transition-colors">{coin.name}</span>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">{coin.symbol}</span>
                        </div>
                        <a 
                          href={`https://www.binance.com/en/trade/${coin.symbol.toUpperCase()}_USDT`} 
                          target="_blank" 
                          rel="noopener"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] font-bold px-3 py-1 rounded-lg border border-green-500/20 text-green-500 bg-green-500/5 hover:bg-green-500/20 opacity-0 group-hover:opacity-100 transition-all"
                        >BUY</a>
                      </div>
                    </td>
                    {visibleColumns.price && (
                      <td className="px-6 py-5 text-right font-bold text-white tabular-nums">
                        ${price < 1 ? price.toFixed(4) : price.toLocaleString()}
                      </td>
                    )}
                    {visibleColumns.h1 && (
                      <td className={`px-4 py-5 text-right text-xs font-bold tabular-nums ${p1h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {p1h.toFixed(1)}%
                      </td>
                    )}
                    {visibleColumns.h24 && (
                      <td className={`px-4 py-5 text-right text-xs font-bold tabular-nums ${p24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {p24h.toFixed(1)}%
                      </td>
                    )}
                    {visibleColumns.d7 && (
                      <td className={`px-4 py-5 text-right text-xs font-bold tabular-nums ${p7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {p7d.toFixed(1)}%
                      </td>
                    )}
                    {visibleColumns.volume && (
                      <td className="px-6 py-5 text-right text-slate-400 text-xs tabular-nums">
                        ${(coin.total_volume ?? 0).toLocaleString()}
                      </td>
                    )}
                    {visibleColumns.mcap && (
                      <td className="px-6 py-5 text-right text-white font-bold text-xs tabular-nums">
                        ${(coin.market_cap ?? 0).toLocaleString()}
                      </td>
                    )}
                    {visibleColumns.spark && (
                      <td className="px-6 py-5">
                        <div className="flex justify-center">
                          <Sparkline data={sparkData} color={sparkColor} />
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Home;
