import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MOCK_WHALE_ALERTS = [
    { id: 1, ticker: 'NVDA', type: 'CALL SWEEP', amount: '$45.2M', sentiment: 'bullish' },
    { id: 2, ticker: 'TSLA', type: 'BLOCK TRADE', amount: '$120M', sentiment: 'bearish' },
    { id: 3, ticker: 'AAPL', type: 'DARK POOL', amount: '$85.5M', sentiment: 'neutral' },
    { id: 4, ticker: 'MSFT', type: 'PUT SWEEP', amount: '$30.1M', sentiment: 'bearish' },
    { id: 5, ticker: 'AMD', type: 'CALL BLOCK', amount: '$15.8M', sentiment: 'bullish' },
    { id: 6, ticker: 'PLTR', type: 'CALL SWEEP', amount: '$10.2M', sentiment: 'bullish' },
    { id: 7, ticker: 'META', type: 'BLOCK TRADE', amount: '$60.5M', sentiment: 'bearish' },
    { id: 8, ticker: 'GOOGL', type: 'DARK POOL', amount: '$45.0M', sentiment: 'neutral' },
];

const WhaleTracker = () => {
    const [alerts, setAlerts] = useState([]);
    
    useEffect(() => {
        // Initial setup - add one alert
        const initialAlert = { ...MOCK_WHALE_ALERTS[Math.floor(Math.random() * MOCK_WHALE_ALERTS.length)], instanceId: Date.now() };
        setAlerts([initialAlert]);

        const interval = setInterval(() => {
            setAlerts(prev => {
                const newAlert = { ...MOCK_WHALE_ALERTS[Math.floor(Math.random() * MOCK_WHALE_ALERTS.length)], instanceId: Date.now() };
                const updated = [newAlert, ...prev];
                // Keep only top 4
                if (updated.length > 4) return updated.slice(0, 4);
                return updated;
            });
        }, 8000); // New alert every 8 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-24 left-6 z-40 w-72 pointer-events-none hidden md:block">
            <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-3 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                    <Radar className="w-4 h-4 text-purple-400 animate-pulse" />
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Whale Radar</span>
                    <span className="ml-auto w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                </div>
                
                <div className="flex flex-col gap-2 relative h-[200px] overflow-hidden">
                    <AnimatePresence>
                        {alerts.map((alert) => (
                            <motion.div
                                key={alert.instanceId}
                                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                                className={`p-2 rounded-lg border bg-black/60 pointer-events-auto backdrop-blur-sm
                                    ${alert.sentiment === 'bullish' ? 'border-green-500/30' : 
                                      alert.sentiment === 'bearish' ? 'border-red-500/30' : 'border-gray-500/30'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-mono font-bold text-white text-sm">{alert.ticker}</span>
                                    {alert.sentiment === 'bullish' && <ArrowUpRight className="w-3 h-3 text-green-400" />}
                                    {alert.sentiment === 'bearish' && <ArrowDownRight className="w-3 h-3 text-red-400" />}
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className={`px-1.5 py-0.5 rounded
                                        ${alert.sentiment === 'bullish' ? 'bg-green-500/20 text-green-300' : 
                                          alert.sentiment === 'bearish' ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-300'}`}>
                                        {alert.type}
                                    </span>
                                    <span className="font-bold text-white">{alert.amount}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {/* Fade out bottom overlay */}
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
};

export default WhaleTracker;
