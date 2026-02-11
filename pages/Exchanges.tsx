
import React, { useState, useEffect } from 'react';
import { getExchanges } from '../api';

const Exchanges: React.FC = () => {
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getExchanges();
        setExchanges(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-8 animate-fadeIn">
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Top Cryptocurrency Exchanges</h1>
        <p className="text-slate-400 text-sm">Ranked by trust score and 24h trading volume.</p>
      </div>

      <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/20 text-slate-400 text-[11px] font-extrabold uppercase tracking-wider">
                <th className="px-6 py-4 w-12 text-center">#</th>
                <th className="px-6 py-4">Exchange</th>
                <th className="px-6 py-4 text-center">Trust Score</th>
                <th className="px-6 py-4 text-right">24h Vol (BTC)</th>
                <th className="px-6 py-4 text-center">Established</th>
                <th className="px-6 py-4 text-right">Website</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? Array(10).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse"><td colSpan={6} className="px-6 py-6"><div className="h-6 bg-slate-800/30 rounded" /></td></tr>
              )) : exchanges.map((ex, idx) => (
                <tr key={ex.id} className="hover:bg-slate-800/20 transition-all">
                  <td className="px-6 py-5 text-center text-slate-500 font-bold text-xs">{idx + 1}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-3">
                      <img src={ex.image} alt={ex.name} className="w-6 h-6 rounded-full" />
                      <span className="font-bold text-white">{ex.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold">
                      {ex.trust_score}/10
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right text-slate-300 font-medium tabular-nums">
                    {Math.round(ex.trade_volume_24h_btc).toLocaleString()} BTC
                  </td>
                  <td className="px-6 py-5 text-center text-slate-500 text-xs">
                    {ex.year_established || 'N/A'}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <a href={ex.url} target="_blank" rel="noopener" className="text-blue-400 hover:text-blue-300 transition-colors">
                      <i className="fas fa-external-link-alt"></i>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Exchanges;
