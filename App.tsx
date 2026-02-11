
import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import CoinDetail from './pages/CoinDetail';
import About from './pages/About';
import Exchanges from './pages/Exchanges';
import CryptoChatbot from './components/CryptoChatbot';
import BackgroundEffect from './components/BackgroundEffect';

const Navbar: React.FC = () => {
  const location = useLocation();
  
  return (
    <header className="sticky top-0 z-50 bg-[#0c111d]/70 backdrop-blur-xl border-b border-slate-800/50 px-4 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-10">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="bg-green-500 p-2 rounded-xl group-hover:scale-105 transition-transform duration-300">
              <i className="fas fa-coins text-[#0c111d] text-lg"></i>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white uppercase">
              CRYP<span className="text-green-500">XIL</span>
            </span>
          </Link>
          
          <nav className="hidden lg:flex items-center space-x-8">
            <Link to="/" className={`text-sm font-bold transition-colors ${location.pathname === '/' ? 'text-green-500' : 'text-slate-300 hover:text-white'}`}>
              Cryptocurrencies
            </Link>
            <Link to="/exchanges" className={`text-sm font-bold transition-colors ${location.pathname === '/exchanges' ? 'text-green-500' : 'text-slate-300 hover:text-white'}`}>
              Exchanges
            </Link>
            <a href="https://www.coingecko.com/en/nft" target="_blank" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
              NFT
            </a>
            <a href="https://www.coingecko.com/learn" target="_blank" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
              Learn
            </a>
            <a href="https://www.coingecko.com/en/api" target="_blank" className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
              API
            </a>
          </nav>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="hidden sm:flex items-center space-x-4 text-xs font-bold text-slate-400">
            <a href="https://www.coingecko.com/account/candy" target="_blank" className="hover:text-slate-200 cursor-pointer flex items-center"><i className="fas fa-candy-cane text-pink-500 mr-2"></i> Candy</a>
            <a href="https://www.coingecko.com/en/portfolio" target="_blank" className="hover:text-slate-200 cursor-pointer flex items-center"><i className="fas fa-wallet text-blue-400 mr-2"></i> Portfolio</a>
          </div>
          <div className="h-4 w-px bg-slate-800 mx-2 hidden sm:block"></div>
          <Link 
            to="/about" 
            className={`text-sm font-bold transition-colors ${location.pathname === '/about' ? 'text-green-400' : 'text-slate-300 hover:text-white'}`}
          >
            About
          </Link>
        </div>
      </div>
    </header>
  );
};

const Footer: React.FC = () => (
  <footer className="border-t border-slate-800/50 mt-20 bg-[#0c111d]/80 backdrop-blur-md py-16">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="space-y-4">
        <span className="text-xl font-extrabold text-white uppercase">CRYP<span className="text-slate-500">XIL</span></span>
        <p className="text-slate-500 text-sm leading-relaxed">The world's largest independent crypto data aggregator with real-time analytics.</p>
        <div className="flex space-x-4">
          {['twitter', 'telegram', 'discord', 'instagram'].map(s => <i key={s} className={`fab fa-${s} text-slate-600 hover:text-slate-400 cursor-pointer transition-colors`}></i>)}
        </div>
      </div>
      <div className="space-y-4">
        <h5 className="text-white font-bold text-sm uppercase tracking-widest">Resources</h5>
        <ul className="space-y-2 text-slate-500 text-sm">
          <li className="hover:text-slate-300 cursor-pointer">Crypto News</li>
          <li className="hover:text-slate-300 cursor-pointer">Market Analysis</li>
          <li className="hover:text-slate-300 cursor-pointer">Learning Center</li>
        </ul>
      </div>
      <div className="space-y-4">
        <h5 className="text-white font-bold text-sm uppercase tracking-widest">Support</h5>
        <ul className="space-y-2 text-slate-500 text-sm">
          <li className="hover:text-slate-300 cursor-pointer">Contact Us</li>
          <li className="hover:text-slate-300 cursor-pointer">Help Center</li>
          <li className="hover:text-slate-300 cursor-pointer">Feedback</li>
        </ul>
      </div>
      <div className="space-y-4">
        <h5 className="text-white font-bold text-sm uppercase tracking-widest">Legal</h5>
        <ul className="space-y-2 text-slate-500 text-sm">
          <li className="hover:text-slate-300 cursor-pointer">Privacy Policy</li>
          <li className="hover:text-slate-300 cursor-pointer">Terms of Service</li>
          <li className="hover:text-slate-300 cursor-pointer">Cookie Policy</li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-slate-800/50 text-center text-slate-600 text-xs">
      <p>© {new Date().getFullYear()} CRYPXIL. All data from CoinGecko Public API.</p>
    </div>
  </footer>
);

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col relative">
        <BackgroundEffect />
        <Navbar />
        <main className="flex-grow pt-10 pb-20 relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/exchanges" element={<Exchanges />} />
            <Route path="/coin/:id" element={<CoinDetail />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <CryptoChatbot />
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
