import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const TopMovers = () => {
    const [data, setData] = useState({ gainers: [], losers: [] });
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('gainers');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMovers = async () => {
            try {
                const res = await axios.get('http://localhost:5000/top-movers');
                setData(res.data);
            } catch (e) {
                console.error("Top movers error", e);
            } finally {
                setLoading(false);
            }
        };
        fetchMovers();
    }, []);

    const items = tab === 'gainers' ? data.gainers : data.losers;
    const isGainerTab = tab === 'gainers';

    return (
        <div className="w-full bg-dark-card/40 border border-white/5 rounded-2xl p-5 mb-8 backdrop-blur-md relative overflow-hidden">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setTab('gainers')}
                        className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors ${tab === 'gainers' ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <TrendingUp className="w-4 h-4" /> Top Gainers
                    </button>
                    <button
                        onClick={() => setTab('losers')}
                        className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors ${tab === 'losers' ? 'text-red-400' : 'text-gray-500 hover:text-gray-300'}`}
                    >
                        <TrendingDown className="w-4 h-4" /> Top Losers
                    </button>
                </div>
                <button onClick={() => navigate('/screener')} className="text-xs text-cyan-400 hover:text-white flex items-center gap-1 transition-colors">
                    Screener <ArrowRight className="w-3 h-3" />
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex gap-4 overflow-hidden">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="min-w-[140px] h-20 bg-white/5 rounded-xl animate-pulse shrink-0" />
                    ))}
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
                    <AnimatePresence mode="wait">
                        {items.map((item, idx) => (
                            <motion.div
                                key={item.symbol + tab}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => navigate(`/?ticker=${item.symbol}`)}
                                className="min-w-[140px] flex-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-3 cursor-pointer snap-start transition-colors group relative"
                            >
                                <div className={`absolute top-0 right-0 w-8 h-8 rounded-bl-xl rounded-tr-xl flex items-center justify-center opacity-20 group-hover:opacity-100 transition-opacity ${isGainerTab ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                    {isGainerTab ? <TrendingUp className="w-4 h-4 text-white" /> : <TrendingDown className="w-4 h-4 text-white" />}
                                </div>
                                <div className="text-lg font-black text-white font-mono">{item.symbol}</div>
                                <div className="text-sm font-mono text-gray-400 mt-1">${item.price.toFixed(2)}</div>
                                <div className={`text-xs font-bold mt-2 ${isGainerTab ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {isGainerTab ? '+' : ''}{item.change_percent}%
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {items.length === 0 && <div className="text-gray-500 text-sm">No data available</div>}
                </div>
            )}

            <style>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

export default TopMovers;
