
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration, Content } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

const CryptoChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hello! I am your **CRYPXIL Intelligence Bot**. I provide live, verified market data. Ask me about any coin price!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const getLivePrice = async (coinId: string) => {
    try {
      const id = coinId.toLowerCase().trim();
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`);
      if (!response.ok) throw new Error("API Limit");
      const data = await response.json();
      if (!data[id]) return { error: `Asset '${id}' not found.` };
      
      return {
        coin: id.charAt(0).toUpperCase() + id.slice(1),
        price_usd: `$${data[id].usd.toLocaleString()}`,
        change_24h: `${data[id].usd_24h_change.toFixed(2)}%`,
        timestamp: new Date().toLocaleTimeString(),
        source: "CoinGecko API (Live)"
      };
    } catch (e) {
      return { error: "Live price data unavailable. Please try again." };
    }
  };

  const getMarketMetrics = async (coinId: string) => {
    try {
      const id = coinId.toLowerCase().trim();
      const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${id}`);
      if (!response.ok) throw new Error("API Limit");
      const data = await response.json();
      if (!data || data.length === 0) return { error: `Metrics for '${id}' unavailable.` };

      const coin = data[0];
      return {
        coin: coin.name,
        symbol: coin.symbol.toUpperCase(),
        price_usd: `$${coin.current_price.toLocaleString()}`,
        market_cap: `$${coin.market_cap.toLocaleString()}`,
        change_24h: `${coin.price_change_percentage_24h.toFixed(2)}%`,
        volume_24h: `$${coin.total_volume.toLocaleString()}`,
        source: "CoinGecko API (Verified)"
      };
    } catch (e) {
      return { error: "Live market data unavailable. Please try again." };
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const priceTool: FunctionDeclaration = {
        name: "fetchPrice",
        description: "Get the current USD price and 24h change for a crypto asset.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            coinId: { type: Type.STRING, description: "The CoinGecko ID (e.g., 'bitcoin')." }
          },
          required: ["coinId"]
        }
      };

      const metricsTool: FunctionDeclaration = {
        name: "fetchMetrics",
        description: "Get detailed market metrics like market cap and volume.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            coinId: { type: Type.STRING, description: "The CoinGecko ID (e.g., 'ethereum')." }
          },
          required: ["coinId"]
        }
      };

      // Construct initial history for the model
      const contents: Content[] = [
        ...messages.map(m => ({ role: m.role, parts: [{ text: m.text }] })),
        { role: 'user', parts: [{ text: userMessage }] }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents,
        config: {
          tools: [{ functionDeclarations: [priceTool, metricsTool] }],
          systemInstruction: `You are the CRYPXIL AI Assistant. 
          RULES:
          1. NEVER guess prices. ALWAYS use tools for price or market cap queries.
          2. When providing data, be extremely clear. Use bold text for key figures.
          3. ALWAYS follow the specific JSON format for the technical part of your response:
          {
            "coin": "<name>",
            "price_usd": "<price>",
            "change_24h": "<change>",
            "source": "CoinGecko API"
          }
          4. If tools fail or return an error, report it directly.
          5. Keep responses concise and user-friendly.`,
          temperature: 0.1,
        },
      });

      const candidate = response.candidates[0];
      const modelContent = candidate.content;
      const functionCalls = response.functionCalls;

      if (functionCalls && functionCalls.length > 0) {
        const fc = functionCalls[0];
        let toolData: any;

        if (fc.name === "fetchPrice") toolData = await getLivePrice(fc.args.coinId as string);
        else if (fc.name === "fetchMetrics") toolData = await getMarketMetrics(fc.args.coinId as string);

        // CRITICAL: Include the entire original modelContent (including thoughts) back in the history
        const finalResponse = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [
            ...contents,
            modelContent, // The turn with the "thought" and the function call
            { 
              role: 'user', 
              parts: [{ 
                functionResponse: {
                  name: fc.name,
                  id: fc.id,
                  response: { result: toolData }
                } 
              }] 
            }
          ],
        });

        setMessages(prev => [...prev, { role: 'model', text: finalResponse.text || "Data processed." }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: response.text || "I am here to help." }]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Service temporarily unavailable. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end pointer-events-none">
      <div 
        className={`mb-4 w-[350px] sm:w-[420px] h-[600px] bg-[#0c111d] border border-slate-800 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-auto origin-bottom-right ${
          isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-20 pointer-events-none'
        }`}
      >
        {/* Glass Header */}
        <div className="bg-slate-900/80 p-6 border-b border-slate-800/50 flex items-center justify-between backdrop-blur-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.3)]">
              <i className="fas fa-robot text-[#0c111d] text-lg"></i>
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-tight">CRYPXIL INTEL</h3>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.15em]">L1 Node Connected</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-800 text-slate-500 hover:text-white transition-all"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Messaging Area */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_20%_30%,rgba(34,197,94,0.02),transparent)]">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
              <div className={`max-w-[90%] p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none font-medium' 
                : 'bg-slate-800/60 text-slate-200 border border-slate-700/30 rounded-bl-none'
              }`}>
                {m.text.includes('{') ? (
                  <div className="space-y-4">
                    <div className="prose prose-invert prose-sm">
                      {m.text.split('{')[0].trim()}
                    </div>
                    <div className="bg-black/40 rounded-xl p-4 border border-green-500/20 font-mono text-green-400 text-[11px] overflow-x-auto">
                      <code>{'{' + m.text.split('{')[1]}</code>
                    </div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{m.text}</div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800/40 p-4 rounded-2xl flex space-x-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Dock */}
        <div className="p-6 border-t border-slate-800/50 bg-slate-900/40 backdrop-blur-xl">
          <div className="relative group">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Check live Bitcoin price..."
              className="w-full bg-[#0c111d] border border-slate-800 rounded-2xl py-4 pl-5 pr-14 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all shadow-inner"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-green-500 text-[#0c111d] rounded-xl flex items-center justify-center hover:bg-green-400 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100 shadow-lg shadow-green-500/20"
            >
              <i className={`fas ${isLoading ? 'fa-circle-notch fa-spin' : 'fa-bolt'}`}></i>
            </button>
          </div>
          <div className="mt-4 flex justify-center">
            <span className="text-[8px] text-slate-600 font-black uppercase tracking-[0.3em] bg-slate-800/30 px-3 py-1 rounded-full border border-slate-800">
              Verified Marketplace Feed
            </span>
          </div>
        </div>
      </div>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition-all duration-500 pointer-events-auto group relative ${
          isOpen ? 'bg-slate-800 rotate-90 scale-90' : 'bg-green-500 hover:scale-110 active:scale-95 shadow-green-500/30'
        }`}
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-robot'} text-2xl ${isOpen ? 'text-white' : 'text-[#0c111d]'} transition-transform duration-500`}></i>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-[3px] border-[#0c111d]"></span>
          </span>
        )}
      </button>
    </div>
  );
};

export default CryptoChatbot;
