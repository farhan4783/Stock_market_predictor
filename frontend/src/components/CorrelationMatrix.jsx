import { motion } from 'framer-motion';
import { Network, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';

const NODES = [
    { id: 'AAPL', x: 20, y: 30, sector: 'tech' },
    { id: 'MSFT', x: 25, y: 70, sector: 'tech' },
    { id: 'NVDA', x: 50, y: 20, sector: 'semi' },
    { id: 'TSLA', x: 60, y: 80, sector: 'auto' },
    { id: 'BTC', x: 80, y: 50, sector: 'crypto' },
    { id: 'SPY', x: 45, y: 55, sector: 'index' },
    { id: 'GOLD', x: 85, y: 15, sector: 'commodity' }
];

const EDGES = [
    { source: 'AAPL', target: 'MSFT', str: 0.8 },
    { source: 'AAPL', target: 'SPY', str: 0.9 },
    { source: 'MSFT', target: 'SPY', str: 0.85 },
    { source: 'NVDA', target: 'SPY', str: 0.7 },
    { source: 'NVDA', target: 'TSLA', str: 0.4 },
    { source: 'TSLA', target: 'SPY', str: 0.6 },
    { source: 'BTC', target: 'TSLA', str: 0.5 },
    { source: 'GOLD', target: 'SPY', str: -0.3 },
    { source: 'BTC', target: 'GOLD', str: 0.1 },
];

const CorrelationMatrix = () => {
    const [activeNode, setActiveNode] = useState(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const getNodeColor = (sector) => {
        switch (sector) {
            case 'tech': return '#00f3ff';
            case 'semi': return '#bc13fe';
            case 'auto': return '#ff0055';
            case 'crypto': return '#fbbf24';
            case 'commodity': return '#fbbf24';
            case 'index': return '#0aff00';
            default: return '#ffffff';
        }
    };

    return (
        <div className="w-full bg-dark-card/30 rounded-xl p-6 border border-white/5 relative overflow-hidden h-[400px]">
            <div className="absolute top-0 left-0 p-4 opacity-10 pointer-events-none">
                <Network className="w-48 h-48" />
            </div>

            <div className="relative z-20 mb-4 flex justify-between items-center border-b border-white/10 pb-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Quantum Correlation Matrix
                </h3>
                {activeNode && (
                    <div className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-1 rounded">
                        Analyzing Nexus: <span className="text-white font-bold">{activeNode}</span>
                    </div>
                )}
            </div>

            <div className="relative w-full h-[300px] z-10" onMouseLeave={() => setActiveNode(null)}>
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {mounted && EDGES.map((edge, i) => {
                        const source = NODES.find(n => n.id === edge.source);
                        const target = NODES.find(n => n.id === edge.target);
                        const isHovered = activeNode === edge.source || activeNode === edge.target;
                        const opacity = activeNode ? (isHovered ? 0.8 : 0.1) : 0.3;
                        const color = edge.str > 0 ? '#0aff00' : '#ff0055';

                        return (
                            <motion.line
                                key={i}
                                x1={`${source.x}%`}
                                y1={`${source.y}%`}
                                x2={`${target.x}%`}
                                y2={`${target.y}%`}
                                stroke={color}
                                strokeWidth={Math.abs(edge.str) * 4}
                                strokeOpacity={opacity}
                                strokeDasharray={edge.str < 0 ? "5,5" : "none"}
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 2, delay: i * 0.1, ease: "easeInOut" }}
                            />
                        );
                    })}
                </svg>

                {mounted && NODES.map((node) => (
                    <motion.div
                        key={node.id}
                        onMouseEnter={() => setActiveNode(node.id)}
                        drag
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        dragElastic={0.2}
                        className="absolute cursor-pointer flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 + Math.random() * 0.5 }}
                        whileHover={{ scale: 1.2, zIndex: 30 }}
                    >
                        <div 
                            className="w-4 h-4 rounded-full shadow-[0_0_15px_currentColor] animate-pulse"
                            style={{ backgroundColor: getNodeColor(node.sector), color: getNodeColor(node.sector) }}
                        />
                        <div className="mt-1 text-[10px] font-bold font-mono px-1.5 py-0.5 bg-black/80 rounded border border-white/10 text-white whitespace-nowrap pointer-events-none">
                            {node.id}
                        </div>
                    </motion.div>
                ))}
            </div>
            
            <div className="absolute bottom-4 left-6 right-6 flex justify-between text-[10px] font-mono text-gray-500 uppercase">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#00f3ff]" /> Tech</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#0aff00]" /> Index</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#fbbf24]" /> Crypto</span>
                </div>
                <div>Node Mapping: Online</div>
            </div>
        </div>
    );
};

export default CorrelationMatrix;
