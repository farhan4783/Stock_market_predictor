import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Square, Settings, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function TradingBotPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [portfolio, setPortfolio] = useState(100000);
  const [trades, setTrades] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(150.00);

  // Simulate streaming data
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentPrice(prev => {
          const change = (Math.random() - 0.5) * 2;
          const newPrice = Math.max(1, prev + change);

          // Simulated strategy: Mean reversion
          if (Math.random() > 0.8) {
            const isBuy = change > 0;
            const size = Math.floor(Math.random() * 50) + 10;
            const tradeValue = size * newPrice;
            
            if (isBuy && portfolio >= tradeValue) {
              setPortfolio(p => p - tradeValue);
              setTrades(t => [{ id: Date.now(), type: 'BUY', price: newPrice, size, time: new Date().toLocaleTimeString() }, ...t].slice(0, 50));
            } else if (!isBuy) {
              // Simulating selling short or selling positions we "held"
              setPortfolio(p => p + tradeValue);
              setTrades(t => [{ id: Date.now(), type: 'SELL', price: newPrice, size, time: new Date().toLocaleTimeString() }, ...t].slice(0, 50));
            }
          }
          return newPrice;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, portfolio]);

  const pnl = portfolio - 100000;

  return (
    <div className="container mx-auto px-4 py-8 mt-16 min-h-screen text-white font-mono">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue uppercase mb-2 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
            Autonomous Trading Bot
          </h1>
          <p className="text-gray-400 font-sans tracking-wide">Live Paper Trading Execution Terminal</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-dark-card/50 border border-white/10 px-6 py-3 rounded-xl shadow-lg">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total P&L</p>
            <p className={`text-2xl font-bold flex items-center ${pnl >= 0 ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]'}`}>
              {pnl >= 0 ? '+' : '-'}${Math.abs(pnl).toFixed(2)}
            </p>
          </div>
          
          <div className="bg-dark-card/50 border border-white/10 px-6 py-3 rounded-xl shadow-lg">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Available Capital</p>
            <p className="text-2xl font-bold text-white flex items-center">
              ${portfolio.toFixed(2)}
            </p>
          </div>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold transition-all shadow-lg ${
              isRunning ? 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30' : 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 hover:bg-emerald-500/30'
            }`}
          >
            {isRunning ? <><Square className="w-5 h-5 fill-current" /> STOP BOT</> : <><Play className="w-5 h-5 fill-current" /> START BOT</>}
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Chart Placeholder */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-black/40 border border-white/10 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden h-[450px] shadow-[0_0_30px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center">
             <div className="absolute top-4 left-6 flex items-center gap-3">
               <span className="relative flex h-3 w-3">
                 {isRunning && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                 <span className={`relative inline-flex rounded-full h-3 w-3 ${isRunning ? 'bg-emerald-500' : 'bg-gray-500'}`}></span>
               </span>
               <span className="text-gray-400 text-sm">LIVE FEED {isRunning ? 'ACTIVE' : 'OFFLINE'}</span>
             </div>
             
             <h2 className="text-8xl font-black text-white/10 absolute z-0 pointer-events-none">Q-LEARNING ALGO</h2>
             
             <div className="z-10 flex flex-col items-center">
                 <p className="text-gray-400 mb-2 uppercase tracking-widest text-sm">Current Asset Price</p>
                 <div className={`text-6xl font-black ${isRunning ? 'text-neon-blue drop-shadow-[0_0_15px_rgba(0,243,255,0.4)]' : 'text-gray-600'}`}>
                     ${currentPrice.toFixed(2)}
                 </div>
                 {isRunning && (
                   <div className="mt-8 text-center max-w-sm">
                     <p className="text-emerald-400 text-sm mb-1 animate-pulse">Running Deep-Q Learning Matrix...</p>
                     <p className="text-xs text-gray-500">Scanning 12,000 tickers for Alpha. Executing HFT (High Frequency Trading) parameters.</p>
                   </div>
                 )}
             </div>
          </div>
        </div>

        {/* Trade Ledger */}
        <div className="bg-black/40 border border-white/10 rounded-2xl flex flex-col shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden h-[450px]">
          <div className="p-4 border-b border-white/10 bg-dark-card/50 flex justify-between items-center">
             <h3 className="text-neon-purple font-bold flex items-center gap-2">
                 <Settings className="w-4 h-4" /> LEDGER LOGS
             </h3>
             <span className="text-xs text-gray-500">{trades.length} TRADES</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {trades.length === 0 ? (
                <div className="text-center text-gray-500 text-sm mt-10">Awaiting market execution...</div>
            ) : (
                trades.map((trade) => (
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={trade.id}
                    className={`flex items-center justify-between p-3 rounded-lg border bg-white/5 ${
                        trade.type === 'BUY' ? 'border-emerald-500/30' : 'border-red-500/30'
                    }`}
                >
                    <div className="flex flex-col">
                        <span className={`font-bold text-sm ${trade.type === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {trade.type} {trade.size} SHRS
                        </span>
                        <span className="text-xs text-gray-500">{trade.time}</span>
                    </div>
                    <div className="font-bold text-white text-right flex items-center gap-1">
                        {trade.type === 'BUY' ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-red-400" />}
                        ${trade.price.toFixed(2)}
                    </div>
                </motion.div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
