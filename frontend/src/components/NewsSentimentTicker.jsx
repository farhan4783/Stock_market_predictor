import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingUp, TrendingDown, Activity } from 'lucide-react';

const mockNews = [
  { id: 1, ticker: 'AAPL', headline: "Apple's new AI framework beats expectations in benchmark leaks.", impact: 92, type: 'bullish' },
  { id: 2, ticker: 'NVDA', headline: "Nvidia announces next-gen tensor core architecture.", impact: 88, type: 'bullish' },
  { id: 3, ticker: 'TSLA', headline: "Global supply chain issues threaten Q3 delivery targets.", impact: 35, type: 'bearish' },
  { id: 4, ticker: 'MSFT', headline: "Microsoft cloud revenue shows unprecedented aggressive growth.", impact: 95, type: 'bullish' },
  { id: 5, ticker: 'META', headline: "Regulatory scrutiny increases over ad revenue practices in EU.", impact: 42, type: 'bearish' },
  { id: 6, ticker: 'AMZN', headline: "Amazon prime day sales set new all-time high record.", impact: 85, type: 'bullish' },
  { id: 7, ticker: 'GOOGL', headline: "Google Search market share slightly dips against new AI competitors.", impact: 48, type: 'bearish' },
];

export default function NewsSentimentTicker() {
  const [fearGreedIndex, setFearGreedIndex] = useState(65);

  // Randomize the index slightly to simulate live movement
  useEffect(() => {
    const interval = setInterval(() => {
      setFearGreedIndex(prev => {
        const change = (Math.random() - 0.5) * 5;
        const newScore = Math.max(0, Math.min(100, prev + change));
        return newScore;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const getFearGreedColor = (score) => {
    if (score >= 75) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/50';
    if (score >= 50) return 'text-green-400 bg-green-400/10 border-green-400/50';
    if (score >= 25) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/50';
    return 'text-red-500 bg-red-500/10 border-red-500/50';
  };

  const getFearGreedLabel = (score) => {
    if (score >= 75) return 'EXTREME GREED';
    if (score >= 50) return 'GREED';
    if (score >= 25) return 'FEAR';
    return 'EXTREME FEAR';
  };

  return (
    <div className="fixed bottom-0 left-0 w-full h-12 bg-black/80 backdrop-blur-md border-t border-white/10 z-50 flex overflow-hidden font-mono text-xs shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
      {/* Index Widget */}
      <div className={`shrink-0 flex items-center justify-center px-4 border-r border-white/10 transition-colors duration-500 flex-col py-1 ${getFearGreedColor(fearGreedIndex)}`}>
        <div className="font-bold flex items-center gap-1.5">
          <Activity className="w-3 h-3" />
          <span>AI SENTIMENT INDEX</span>
        </div>
        <div className="text-[10px] uppercase font-black tracking-widest mt-0.5">
          {getFearGreedLabel(fearGreedIndex)} • {fearGreedIndex.toFixed(1)}
        </div>
      </div>

      {/* Ticker Marquee */}
      <div className="flex-1 relative overflow-hidden flex items-center bg-dark-card/50">
        <motion.div
          animate={{ x: [0, -2000] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap items-center px-4 gap-8"
        >
          {/* Double array for seamless loop */}
          {[...mockNews, ...mockNews].map((news, idx) => (
            <div key={`${news.id}-${idx}`} className="flex items-center gap-3 border-r border-white/10 pr-8">
              <span className={`font-black uppercase flex items-center gap-1 ${
                news.type === 'bullish' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {news.type === 'bullish' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                ${news.ticker}
              </span>
              <span className="text-gray-300">{news.headline}</span>
              <span className="bg-white/5 border border-white/10 px-2 flex items-center gap-1 rounded text-[10px]">
                <AlertTriangle className="w-3 h-3 opacity-50 text-neon-blue" />
                IMPACT: {news.impact}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
