import { useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Layers, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import Background from '../components/Background';
import NavBar from '../components/NavBar';
import ThemeToggle from '../components/ThemeToggle';
import BootSequence from '../components/BootSequence';

const STRATEGIES = {
    'LONG_CALL': { name: 'Long Call', description: 'Bullish strategy with unlimited upside and capped risk.', color: '#00f3ff' },
    'IRON_CONDOR': { name: 'Iron Condor', description: 'Neutral strategy profiting from low volatility.', color: '#bc13fe' },
    'STRADDLE': { name: 'Long Straddle', description: 'Volatile strategy profiting from large moves in either direction.', color: '#0aff00' }
};

const OptionsVisualizerPage = () => {
    const [strategy, setStrategy] = useState('LONG_CALL');
    const [price, setPrice] = useState(150);
    const [volatility, setVolatility] = useState(30);

    // Generate mock P&L data
    const generateData = () => {
        const data = [];
        for (let p = price * 0.7; p <= price * 1.3; p += price * 0.02) {
            let pnl = 0;
            if (strategy === 'LONG_CALL') {
                const strike = price * 1.05;
                const premium = 5 * (volatility / 30);
                pnl = Math.max(0, p - strike) - premium;
            } else if (strategy === 'IRON_CONDOR') {
                const innerLower = price * 0.9;
                const innerUpper = price * 1.1;
                const premiumCollected = 3;
                if (p < innerLower) pnl = Math.max(-5, p - innerLower + premiumCollected);
                else if (p > innerUpper) pnl = Math.max(-5, innerUpper - p + premiumCollected);
                else pnl = premiumCollected;
            } else if (strategy === 'STRADDLE') {
                const premiumBox = 10 * (volatility / 30);
                pnl = Math.abs(p - price) - premiumBox;
            }
            data.push({ price: parseFloat(p.toFixed(2)), pnl: parseFloat(pnl.toFixed(2)) });
        }
        return data;
    };

    const data = generateData();

    return (
        <div className="min-h-screen text-white font-sans selection:bg-neon-blue selection:text-black">
            <Background />
            <ThemeToggle />
            
            <div className="pt-24 pb-12 px-4 container mx-auto relative z-10">
                <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mb-10 text-center"
                >
                    <h1 className="text-4xl md:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-neon-blue to-neon-purple shadow-[0_0_20px_rgba(188,19,254,0.3)] mb-4 uppercase tracking-widest inline-flex items-center gap-4">
                        <Layers className="w-10 h-10 text-neon-blue" />
                        Derivatives Hub
                    </h1>
                    <p className="text-gray-400 font-mono tracking-widest uppercase">Advanced Options Strategy Visualizer</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Controls */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-[0_0_30px_rgba(0,243,255,0.1)]">
                            <h3 className="text-xl font-bold mb-6 text-neon-blue uppercase tracking-wider flex items-center gap-2">
                                <Activity className="w-5 h-5" /> Parameters
                            </h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">Strategy</label>
                                    <select 
                                        value={strategy}
                                        onChange={(e) => setStrategy(e.target.value)}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-neon-purple transition-colors font-mono text-sm"
                                    >
                                        {Object.entries(STRATEGIES).map(([k, v]) => (
                                            <option key={k} value={k}>{v.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="flex justify-between text-gray-400 text-xs uppercase tracking-wider mb-2">
                                        <span>Underlying Price</span>
                                        <span className="text-white font-mono">${price}</span>
                                    </label>
                                    <input 
                                        type="range" 
                                        min="10" 
                                        max="500" 
                                        value={price}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                        className="w-full accent-neon-blue cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="flex justify-between text-gray-400 text-xs uppercase tracking-wider mb-2">
                                        <span>Implied Vol (IV)</span>
                                        <span className="text-white font-mono">{volatility}%</span>
                                    </label>
                                    <input 
                                        type="range" 
                                        min="10" 
                                        max="150" 
                                        value={volatility}
                                        onChange={(e) => setVolatility(Number(e.target.value))}
                                        className="w-full accent-neon-purple cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/10">
                                <div className="p-4 rounded-xl bg-neon-purple/10 border border-neon-purple/30">
                                    <h4 className="font-bold text-neon-purple mb-2 flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4" /> Threat Assessment
                                    </h4>
                                    <p className="text-xs text-gray-300 leading-relaxed font-mono">
                                        {STRATEGIES[strategy].description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="lg:col-span-3">
                        <div className="bg-[#05050A] rounded-2xl p-6 border border-white/10 h-[600px] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold font-mono tracking-widest">{STRATEGIES[strategy].name} <span className="text-gray-500">P&L Curve</span></h2>
                                <div className="flex gap-4 text-xs font-mono">
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Profit</div>
                                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Loss</div>
                                </div>
                            </div>
                            
                            <div className="flex-1 w-full relative">
                                {/* Grid decorative elements */}
                                <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
                                
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                                        <defs>
                                            <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={STRATEGIES[strategy].color} stopOpacity={0.5}/>
                                                <stop offset="95%" stopColor={STRATEGIES[strategy].color} stopOpacity={0.0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                        <XAxis 
                                            dataKey="price" 
                                            stroke="#666" 
                                            tick={{fill: '#888', fontFamily: 'monospace'}}
                                            tickFormatter={(val) => `$${val}`}
                                        />
                                        <YAxis 
                                            stroke="#666" 
                                            tick={{fill: '#888', fontFamily: 'monospace'}}
                                            tickFormatter={(val) => `$${val}`}
                                        />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontFamily: 'monospace' }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(value) => [`$${value}`, "P&L Target"]}
                                            labelFormatter={(label) => `Underlying: $${label}`}
                                        />
                                        <ReferenceLine y={0} stroke="#fff" strokeOpacity={0.5} strokeDasharray="5 5" />
                                        <ReferenceLine x={price} stroke={STRATEGIES[strategy].color} strokeOpacity={0.8} label={{position: 'top', value: 'CURRENT PRICE', fill: STRATEGIES[strategy].color, fontSize: 10, fontFamily: 'monospace'}} />
                                        <Area 
                                            type="monotone" 
                                            dataKey="pnl" 
                                            stroke={STRATEGIES[strategy].color} 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorPnL)" 
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OptionsVisualizerPage;
