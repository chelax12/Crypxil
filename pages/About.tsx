
import React from 'react';

const About: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto space-y-12 py-10 animate-fadeIn">
      <section className="text-center space-y-4">
        <div className="inline-block p-4 bg-blue-600/10 rounded-3xl mb-4">
          <i className="fas fa-info-circle text-4xl text-blue-500"></i>
        </div>
        <h1 className="text-4xl font-extrabold text-white">About CRYPXIL</h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          CRYPXIL is a modern, lightweight cryptocurrency tracking dashboard designed for speed and clarity, modeled after industry-leading market data providers.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <i className="fas fa-database text-blue-400 mr-3"></i> Data Source
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            All market data, including prices, volume, and historical charts, is sourced directly from the <strong>CoinGecko Public API</strong>. 
            No private keys or API keys are stored on our servers.
          </p>
        </div>

        <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <i className="fas fa-bolt text-yellow-400 mr-3"></i> Performance
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            We use <strong>sessionStorage caching</strong> with a 60-second TTL to reduce redundant API calls and stay within free-tier rate limits, ensuring a snappy experience.
          </p>
        </div>

        <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <i className="fas fa-chart-area text-purple-400 mr-3"></i> Visualization
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Charts are powered by <strong>Chart.js</strong>, providing high-performance canvas-based rendering for accurate price trend analysis.
          </p>
        </div>

        <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
          <h3 className="text-xl font-bold mb-4 flex items-center">
            <i className="fas fa-code text-green-400 mr-3"></i> Tech Stack
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Built using <strong>React 18+</strong>, <strong>TypeScript</strong> for type safety, and <strong>Tailwind CSS</strong> for a responsive, accessible dark UI.
          </p>
        </div>
      </div>

      <div className="bg-blue-900/10 border border-blue-900/30 rounded-2xl p-8 text-center">
        <h4 className="font-bold text-blue-400 mb-2">Note on Rate Limits</h4>
        <p className="text-slate-400 text-sm">
          The CoinGecko free API has strict rate limits (currently ~10-50 calls/min). 
          If charts fail to load or data doesn't refresh, please wait 60 seconds and try again.
        </p>
      </div>
    </div>
  );
};

export default About;
