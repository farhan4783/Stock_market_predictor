import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Twitter, Globe, Hash } from 'lucide-react';

const Hexagon = ({ size, color, label, icon: Icon, delay }) => {
    // Generate hex points
    const a = size / 2;
    const b = (Math.sqrt(3) * a);
    const points = `
        ${size},${b} 
        ${a + size},0 
        ${a * 3},0 
        ${size * 2},${b} 
        ${a * 3},${b * 2} 
        ${a + size},${b * 2}
    `;

    return (
        <motion.div 
            className="relative inline-block cursor-crosshair group"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, type: "spring", stiffness: 100 }}
            whileHover={{ scale: 1.1, zIndex: 10 }}
        >
            <svg width={size * 2} height={b * 2} className="drop-shadow-lg filter">
                <polygon 
                    points={points} 
                    fill={`${color}20`} 
                    stroke={color} 
                    strokeWidth="2"
                    className="transition-all duration-300 group-hover:fill-opacity-50" 
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <Icon className="w-5 h-5 mb-1" style={{ color }} />
                <span className="text-[10px] font-bold tracking-wider text-white bg-black/50 px-1 rounded">{label}</span>
            </div>
            
            {/* Tooltip on hover */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-black/90 border border-white/10 px-3 py-2 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                Volume: {(Math.random() * 1000 + 500).toFixed(0)} mentions/hr
            </div>
        </motion.div>
    );
};

const SentimentHexGrid = ({ score }) => {
    // Determine colors based on overall score, but add noise for individual hexes
    // Score > 55 = Bullish (Greens), Score < 45 = Bearish (Reds), else Neutral (Yellow/Blues)
    const getVariantColor = (baseMult) => {
        const modScore = score + baseMult;
        if (modScore > 60) return '#0aff00'; // Neon Green
        if (modScore > 45) return '#00f3ff'; // Neon Blue
        return '#ff0055'; // Neon Red/Pink
    };

    return (
        <div className="bg-dark-card/30 rounded-xl p-6 border border-white/5 flex flex-col items-center justify-center h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 w-full flex justify-between items-center opacity-50 z-0">
                <Hash className="w-24 h-24 text-gray-800" />
            </div>

            <h3 className="text-neon-purple font-bold mb-4 uppercase tracking-wider text-xs self-start w-full border-b border-white/10 pb-2 z-10">
                Social Vector Matrix
            </h3>

            <div className="flex flex-col items-center relative z-10 py-6 scale-90 sm:scale-100">
                {/* Top Row */}
                <div className="flex gap-1 mb-[-12px]">
                    <Hexagon size={40} color={getVariantColor(10)} label="X/Twitter" icon={Twitter} delay={0.1} />
                    <Hexagon size={40} color={getVariantColor(-15)} label="R/WSB" icon={MessageSquare} delay={0.2} />
                </div>
                {/* Middle Row */}
                <div className="flex gap-1 mb-[-12px] ml-[69px]">
                    <Hexagon size={40} color={getVariantColor(5)} label="News" icon={Globe} delay={0.3} />
                    <Hexagon size={40} color={getVariantColor(20)} label="Dark Pool" icon={Hash} delay={0.4} />
                    <Hexagon size={40} color={getVariantColor(-5)} label="Insiders" icon={MessageSquare} delay={0.5} />
                </div>
                {/* Bottom Row */}
                <div className="flex gap-1 ml-[138px]">
                    <Hexagon size={40} color={getVariantColor(0)} label="Analysts" icon={Twitter} delay={0.6} />
                    <Hexagon size={40} color={getVariantColor(10)} label="Retail" icon={Globe} delay={0.7} />
                </div>
            </div>

            <div className="mt-4 text-center z-10 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                <span className="text-gray-400 text-xs font-mono">Consensus Velocity: </span>
                <span className={`text-sm font-bold shadow-sm ${score > 55 ? 'text-emerald-400' : score < 45 ? 'text-red-400' : 'text-cyan-400'}`}>
                    {score > 55 ? 'EXPANDING' : score < 45 ? 'CONTRACTING' : 'STABILIZED'}
                </span>
            </div>
        </div>
    );
};

export default SentimentHexGrid;
