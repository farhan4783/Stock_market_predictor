import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Plus, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { usePortfolio } from '../context/PortfolioContext';
import PortfolioCard from '../components/PortfolioCard';

const PortfolioPage = () => {
    const { holdings, addHolding, removeHolding } = usePortfolio();
    const [prices, setPrices] = useState([]);
    const [loading, setLoading] = useState(false);

    const [ticker, setTicker] = useState('');
    const [shares, setShares] = useState('');
    const [avgBuy, setAvgBuy] = useState('');
    const [error, setError] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        const fetchPrices = async () => {
            if (holdings.length === 0) return;
            setLoading(true);
            try {
                const res = await axios.post('http://localhost:5000/portfolio-prices', { tickers: holdings.map(h => h.ticker) });
                setPrices(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchPrices();
    }, [holdings]);

    const handleAdd = (e) => {
        e.preventDefault();
        setError('');
        if (!ticker || !shares || !avgBuy) {
            setError('Please fill all fields');
            return;
        }
        addHolding(ticker.toUpperCase(), parseFloat(shares), parseFloat(avgBuy));
        setTicker('');
        setShares('');
        setAvgBuy('');
        setIsAdding(false);
    };

    const getPrice = (sym) => prices.find(p => p.symbol === sym) || null;

    return (
        <div className="min-h-screen text-white pt-20 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-indigo-400 flex items-center gap-3">
                        <Briefcase className="w-8 h-8 text-indigo-400" /> My Portfolio
                    </h1>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        {isAdding ? 'Cancel' : 'Add Holding'}
                    </button>
                </motion.div>

                <AnimatePresence>
                    {isAdding && (
                        <motion.form
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            onSubmit={handleAdd}
                            className="bg-dark-card/40 border border-indigo-500/30 rounded-xl p-5 mb-8 backdrop-blur-md overflow-hidden"
                        >
                            <div className="flex flex-wrap gap-4 items-end">
                                <div className="flex-1 min-w-[120px]">
                                    <label className="text-xs text-gray-500 uppercase tracking-widest mb-1 block">Ticker</label>
                                    <input type="text" value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-400 transition-colors" placeholder="AAPL" />
                                </div>
                                <div className="flex-1 min-w-[120px]">
                                    <label className="text-xs text-gray-500 uppercase tracking-widest mb-1 block">Shares</label>
                                    <input type="number" step="any" value={shares} onChange={e => setShares(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-400 transition-colors" placeholder="10.5" />
                                </div>
                                <div className="flex-1 min-w-[120px]">
                                    <label className="text-xs text-gray-500 uppercase tracking-widest mb-1 block">Avg Buy Price ($)</label>
                                    <input type="number" step="any" value={avgBuy} onChange={e => setAvgBuy(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-400 transition-colors" placeholder="150.00" />
                                </div>
                                <button type="submit" className="bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-white px-6 py-2 rounded-lg font-bold transition-all h-[42px]">
                                    Save
                                </button>
                            </div>
                            {error && <div className="text-red-400 text-sm mt-3 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{error}</div>}
                        </motion.form>
                    )}
                </AnimatePresence>

                <PortfolioCard currentValues={prices} loading={loading} />

                <div className="mt-8">
                    <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest border-b border-white/10 pb-2">Holdings</h3>
                    {holdings.length === 0 ? (
                        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/5 text-gray-500">
                            No holdings yet. Add one above to start tracking.
                        </div>
                    ) : (
                        <div className="bg-dark-card/30 border border-white/5 rounded-xl overflow-hidden backdrop-blur-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white/5 text-xs text-gray-400 uppercase tracking-widest">
                                            <th className="p-4 font-bold">Asset</th>
                                            <th className="p-4 font-bold text-right">Balance</th>
                                            <th className="p-4 font-bold text-right">Avg Buy</th>
                                            <th className="p-4 font-bold text-right">Current Price</th>
                                            <th className="p-4 font-bold text-right">P&L</th>
                                            <th className="p-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {holdings.map((h, i) => {
                                            const p = getPrice(h.ticker);
                                            const currentPrice = p ? p.price : h.avgBuy;
                                            const value = h.shares * currentPrice;
                                            const pnl = value - (h.shares * h.avgBuy);
                                            const pnlPct = (pnl / (h.shares * h.avgBuy)) * 100;
                                            const isPos = pnl >= 0;

                                            return (
                                                <motion.tr
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    key={h.ticker}
                                                    className="border-t border-white/5 hover:bg-white/5 transition-colors group"
                                                >
                                                    <td className="p-4">
                                                        <div className="font-bold text-lg text-white font-mono flex items-center gap-2">
                                                            {h.ticker}
                                                        </div>
                                                        <div className="text-xs text-indigo-300 font-mono mt-0.5">{h.shares} shares</div>
                                                    </td>
                                                    <td className="p-4 text-right font-mono text-white text-lg">${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="p-4 text-right text-gray-400 font-mono">${h.avgBuy.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td className="p-4 text-right text-gray-300 font-mono">
                                                        {loading ? <span className="animate-pulse bg-white/10 px-4 rounded text-transparent">...</span> : `$${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className={`font-bold font-mono ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                                                            {isPos ? '+' : ''}${pnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </div>
                                                        <div className={`text-xs font-mono mt-0.5 ${isPos ? 'text-emerald-400/80' : 'text-red-400/80'}`}>
                                                            {isPos ? '+' : ''}{pnlPct.toFixed(2)}%
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <button
                                                            onClick={() => removeHolding(h.ticker)}
                                                            className="text-red-500/50 hover:text-red-400 hover:bg-red-400/10 p-2 rounded transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default PortfolioPage;
