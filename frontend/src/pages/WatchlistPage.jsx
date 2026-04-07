import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../context/WatchlistContext';
import { usePortfolio } from '../context/PortfolioContext';
import { Star, X, TrendingUp, TrendingDown, RefreshCw, Zap, Briefcase, ChevronRight, ChevronLeft } from 'lucide-react';
import axios from 'axios';
import MiniSparkline from '../components/MiniSparkline';
import Background from '../components/Background';
import ThemeToggle from '../components/ThemeToggle';

const WatchlistPage = () => {
    const { watchlist, removeFromWatchlist } = useWatchlist();
    const { addHolding } = usePortfolio();
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
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

    const handlePredict = (sym, e) => {
        e.stopPropagation();
        navigate(`/?ticker=${sym}`);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % watchlist.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + watchlist.length) % watchlist.length);
    };

    // Calculate position for cover flow
    const getCardStyle = (index) => {
        const diff = (index - currentIndex + watchlist.length) % watchlist.length;
        let offset = diff;
        if (diff > watchlist.length / 2) offset = diff - watchlist.length;

        const isCenter = offset === 0;
        const xOffset = offset * 200;
        const zOffset = Math.abs(offset) * -100;
        const rotateY = offset * -25;
        const opacity = Math.max(0, 1 - Math.abs(offset) * 0.3);

        return { xOffset, zOffset, rotateY, opacity, isCenter, offset };
    };

    return (
        <div className="min-h-screen text-white pt-24 pb-12 px-4 overflow-hidden relative selection:bg-cyan-500/30">
            <Background />
            <ThemeToggle />

            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center justify-between mb-16"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Star className="w-8 h-8 text-cyan-400 fill-cyan-400/20" />
                            <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-20"></div>
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-500 drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
                            HOLOGRAPHIC WATCHLIST
                        </h1>
                        <span className="ml-4 text-xs font-mono text-cyan-500 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1 rounded-full">
                            {watchlist.length} DETECTED
                        </span>
                    </div>
                    <motion.button
                        onClick={fetchPrices}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-black/50 hover:bg-white/10 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 transition-all font-mono"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        SYNC
                    </motion.button>
                </motion.div>

                {watchlist.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-32 text-gray-500 font-mono"
                    >
                        <Star className="w-20 h-20 mx-auto mb-6 opacity-10" />
                        <p className="text-xl tracking-widest uppercase">No assets tracked.</p>
                        <p className="text-sm mt-2 opacity-50">INITIALIZE TRACKING FROM MAIN TERMINAL.</p>
                    </motion.div>
                ) : (
                    <div className="relative h-[500px] flex items-center justify-center perspective-[1500px] mt-10">
                        <AnimatePresence>
                            {watchlist.map((sym, index) => {
                                const { xOffset, zOffset, rotateY, opacity, isCenter, offset } = getCardStyle(index);
                                const p = getPrice(sym);
                                const isPos = p && p.change_percent >= 0;

                                // Hide cards severely out of view
                                if (Math.abs(offset) > 2) return null;

                                return (
                                    <motion.div
                                        key={sym}
                                        initial={{ opacity: 0 }}
                                        animate={{ 
                                            x: xOffset, 
                                            z: zOffset, 
                                            rotateY: rotateY, 
                                            opacity: opacity,
                                            scale: isCenter ? 1 : 0.85
                                        }}
                                        transition={{ duration: 0.6, type: 'spring', bounce: 0.2 }}
                                        onClick={() => {
                                            if (isCenter) navigate(`/?ticker=${sym}`);
                                            else setCurrentIndex(index);
                                        }}
                                        style={{ 
                                            transformStyle: 'preserve-3d', 
                                            zIndex: 100 - Math.abs(offset) * 10
                                        }}
                                        className={`absolute w-[360px] h-[450px] rounded-2xl flex flex-col justify-between p-6 cursor-pointer border backdrop-blur-xl transition-all duration-300
                                            ${isCenter 
                                                ? 'bg-gradient-to-br from-gray-900/90 to-black border-cyan-500/50 shadow-[0_0_50px_rgba(0,243,255,0.2)]' 
                                                : 'bg-black/60 border-white/5 hover:border-white/20'}`}
                                    >
                                        {/* Card Header */}
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="text-4xl font-black font-mono tracking-widest text-white drop-shadow-md">
                                                    {sym}
                                                </div>
                                                <div className="text-xs text-gray-500 font-mono mt-1 uppercase">Asset Identifier</div>
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shadow-inner">
                                                <span className="font-bold text-white/50">{sym.slice(0,1)}</span>
                                            </div>
                                        </div>

                                        {/* Dynamic Price Area */}
                                        <div className="my-8 flex-1">
                                            {p ? (
                                                <div className="flex flex-col items-center justify-center h-full">
                                                    <div className="text-5xl font-mono font-bold text-white mb-4">
                                                        ${p.price.toFixed(2)}
                                                    </div>
                                                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-lg font-bold font-mono border ${isPos ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-red-400 bg-red-500/10 border-red-500/30'}`}>
                                                        {isPos ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                                        {isPos ? '+' : ''}{p.change_percent.toFixed(2)}%
                                                    </div>
                                                    
                                                    <div className="w-full mt-8 opacity-60 pointer-events-none">
                                                        <MiniSparkline ticker={sym} />
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                                                    <div className="w-48 h-12 bg-white/5 rounded-lg animate-pulse" />
                                                    <div className="w-32 h-8 bg-white/5 rounded-full animate-pulse" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions (Only visible on center) */}
                                        <div className={`grid grid-cols-3 gap-3 transition-opacity duration-300 ${isCenter ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate('/portfolio'); addHolding(sym, 1, p?.price || 0); }}
                                                className="flex flex-col items-center justify-center gap-1 bg-indigo-500/10 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-400 py-3 rounded-xl transition-all"
                                            >
                                                <Briefcase className="w-5 h-5" />
                                                <span className="text-[9px] font-bold uppercase tracking-wider">Buy</span>
                                            </button>
                                            <button
                                                onClick={(e) => handlePredict(sym, e)}
                                                className="flex flex-col items-center justify-center gap-1 bg-cyan-500/10 hover:bg-cyan-500/30 border border-cyan-500/30 text-cyan-400 py-3 rounded-xl shadow-[0_0_15px_rgba(0,243,255,0.2)] transition-all transform hover:scale-105"
                                            >
                                                <Zap className="w-6 h-6" />
                                                <span className="text-[9px] font-bold uppercase tracking-wider">Predict</span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); removeFromWatchlist(sym); }}
                                                className="flex flex-col items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/30 border border-red-500/30 text-red-400 py-3 rounded-xl transition-all"
                                            >
                                                <X className="w-5 h-5" />
                                                <span className="text-[9px] font-bold uppercase tracking-wider">Drop</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {/* Navigation Arrows */}
                        {watchlist.length > 1 && (
                            <>
                                <button 
                                    onClick={prevSlide}
                                    className="absolute left-0 z-50 p-4 rounded-full bg-black/50 border border-white/10 text-white hover:bg-cyan-500/20 hover:text-cyan-400 transition-all backdrop-blur-md"
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>
                                <button 
                                    onClick={nextSlide}
                                    className="absolute right-0 z-50 p-4 rounded-full bg-black/50 border border-white/10 text-white hover:bg-cyan-500/20 hover:text-cyan-400 transition-all backdrop-blur-md"
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
            
            {/* Ambient Background Glow for Hologram effect */}
            <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-cyan-900/20 to-transparent pointer-events-none z-0"></div>
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-3/4 h-2 rounded-[100%] border border-cyan-500/30 bg-cyan-500/5 shadow-[0_0_50px_rgba(0,243,255,0.3)] filter blur-md z-0 transform perspective-[1000px] rotateX-[60deg]"></div>
        </div>
    );
};

export default WatchlistPage;
