import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, TrendingDown, TrendingUp, AlertTriangle, Activity, Expand, Minimize2 } from 'lucide-react';

const MacroHUD = () => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [metrics, setMetrics] = useState({
        vix: 18.4,
        vixChange: 1.2,
        rateCutProb: 65,
        yield10y: 4.12,
        yieldChange: -0.05
    });

    useEffect(() => {
        // Simulate live HUD flickering/updates
        const interval = setInterval(() => {
            setMetrics(prev => ({
                ...prev,
                vix: prev.vix + (Math.random() - 0.5) * 0.2,
                yield10y: prev.yield10y + (Math.random() - 0.5) * 0.01
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const threatLevel = metrics.vix > 25 ? "HIGH" : metrics.vix > 20 ? "ELEVATED" : "NORMAL";
    const threatColor = metrics.vix > 25 ? "text-red-500" : metrics.vix > 20 ? "text-yellow-500" : "text-emerald-500";

    return (
        <motion.div
            drag
            dragConstraints={{ left: 0, right: window.innerWidth - 300, top: 0, bottom: window.innerHeight - 300 }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className={`fixed top-1/4 left-6 z-40 backdrop-blur-md bg-black/60 border ${isExpanded ? 'border-cyan-500/30 shadow-[0_0_20px_rgba(0,243,255,0.15)]' : 'border-white/10'} rounded-xl overflow-hidden transition-all duration-300 w-64`}
        >
            <div 
                className="bg-black/50 p-2 flex justify-between items-center cursor-grab active:cursor-grabbing border-b border-white/10"
            >
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
                    <span className="text-xs font-bold text-gray-300 tracking-wider">MACRO HUD</span>
                </div>
                <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-500 hover:text-white transition-colors">
                    {isExpanded ? <Minimize2 className="w-3 h-3" /> : <Expand className="w-3 h-3" />}
                </button>
            </div>

            {isExpanded && (
                <div className="p-4 space-y-4 font-mono">
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                        <div className="text-[10px] text-gray-500">THREAT LEVEL</div>
                        <div className={`text-xs font-bold flex items-center gap-1 ${threatColor}`}>
                            <AlertTriangle className="w-3 h-3" />
                            {threatLevel}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center group">
                            <div className="text-xs text-gray-400">VIX Index</div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className={metrics.vix > 20 ? 'text-red-400' : 'text-emerald-400'}>{metrics.vix.toFixed(2)}</span>
                                {metrics.vixChange > 0 ? <TrendingUp className="w-3 h-3 text-red-500" /> : <TrendingDown className="w-3 h-3 text-emerald-500" />}
                            </div>
                        </div>

                        <div className="flex justify-between items-center group">
                            <div className="text-xs text-gray-400">Rate Cut Prob (Sep)</div>
                            <div className="text-sm text-cyan-400 font-bold">{metrics.rateCutProb}%</div>
                        </div>

                        <div className="flex justify-between items-center group">
                            <div className="text-xs text-gray-400">US 10Y Yield</div>
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-purple-400">{metrics.yield10y.toFixed(3)}%</span>
                                {metrics.yieldChange > 0 ? <TrendingUp className="w-3 h-3 text-emerald-500" /> : <TrendingDown className="w-3 h-3 text-red-500" />}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                            <div className="h-full bg-emerald-500/80 w-1/3"></div>
                            <div className="h-full bg-yellow-500/80 w-1/3"></div>
                            <div className="h-full bg-red-500/80 w-1/3"></div>
                        </div>
                        <div className="w-full relative h-[2px]">
                            <motion.div 
                                animate={{ x: `${Math.min(100, Math.max(0, (metrics.vix / 40) * 100))}%` }}
                                className="absolute top-0 w-1 h-3 bg-white -translate-y-1.5 shadow-[0_0_5px_white]"
                            />
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default MacroHUD;
