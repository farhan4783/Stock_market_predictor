import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import { Star, X, TrendingUp, TrendingDown, RefreshCw, Zap } from 'lucide-react';
import axios from 'axios';

const WatchlistPage = () => {
    const { watchlist, removeFromWatchlist } = useWatchlist();
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchPrices = async () => {
        if (watchlist.length === 0) return;
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/watchlist-prices', { tickers: watchlist });
            setPrices(res.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPrices();
    }, [watchlist]);

    const getPrice = (sym) => prices.find(p => p.symbol === sym) || null;

    return (
        <div className="min-h-screen text-white pt-20 pb-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center justify-between mb-8"
                >
                    <div className="flex items-center gap-3">
                        <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-orange-400">
                            My Watchlist
                        </h1>
                        <span className="text-sm text-gray-500 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                            {watchlist.length} stocks
                        </span>
                    </div>
                    <motion.button
                        onClick={fetchPrices}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-all"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </motion.button>
                </motion.div>

                {watchlist.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-24 text-gray-500"
                    >
                        <Star className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">Your watchlist is empty.</p>
                        <p className="text-sm mt-2">Search a stock and click ★ to add it here.</p>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {watchlist.map((sym, i) => {
                                const p = getPrice(sym);
                                const isPos = p && p.change_percent >= 0;
                                return (
                                    <motion.div
                                        key={sym}
                                        initial={{ opacity: 0, x: -30 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 30, height: 0, marginBottom: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        className="group flex items-center justify-between bg-white/5 border border-white/5 hover:border-cyan-400/30 rounded-xl px-5 py-4 cursor-pointer transition-all backdrop-blur-md hover:shadow-[0_0_15px_rgba(0,243,255,0.05)]"
                                        onClick={() => navigate(`/?ticker=${sym}`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                                                <span className="text-xs font-black text-white">{sym.slice(0, 2)}</span>
                                            </div>
                                            <div>
                                                <div className="font-bold font-mono text-white text-lg">{sym}</div>
                                                {p && (
                                                    <div className={`text-xs flex items-center gap-1 ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                        {isPos ? '+' : ''}{p.change_percent.toFixed(2)}% today
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {p ? (
                                                <div className="text-right">
                                                    <div className="text-xl font-bold font-mono text-white">${p.price.toLocaleString()}</div>
                                                </div>
                                            ) : (
                                                <div className="w-20 h-6 bg-white/5 rounded animate-pulse" />
                                            )}
                                            <div className="flex items-center gap-2">
                                                <motion.button
                                                    onClick={(e) => { e.stopPropagation(); navigate('/'); }}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="p-2 rounded-lg bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-400 transition-all opacity-0 group-hover:opacity-100"
                                                    title="Predict"
                                                >
                                                    <Zap className="w-4 h-4" />
                                                </motion.button>
                                                <motion.button
                                                    onClick={(e) => { e.stopPropagation(); removeFromWatchlist(sym); }}
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all opacity-0 group-hover:opacity-100"
                                                    title="Remove"
                                                >
                                                    <X className="w-4 h-4" />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WatchlistPage;
