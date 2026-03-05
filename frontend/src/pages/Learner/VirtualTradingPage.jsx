import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, Search, Plus, Minus, TrendingUp, TrendingDown,
    DollarSign, BarChart2, Trash2, RefreshCw, Trophy
} from 'lucide-react';

const STARTING_CASH = 10000;
const STORAGE_KEY = 'neurostock-portfolio';

const loadPortfolio = () => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) return JSON.parse(saved);
    } catch { }
    return { cash: STARTING_CASH, holdings: {}, trades: [] };
};

const VirtualTradingPage = () => {
    const navigate = useNavigate();
    const [portfolio, setPortfolio] = useState(loadPortfolio);
    const [searchTicker, setSearchTicker] = useState('');
    const [stockInfo, setStockInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tradeQty, setTradeQty] = useState(1);
    const [tradeMsg, setTradeMsg] = useState(null);
    const [prices, setPrices] = useState({});
    const [refreshing, setRefreshing] = useState(false);

    // Persist to localStorage on every portfolio change
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    }, [portfolio]);

    // Refresh live prices for all holdings
    const refreshPrices = async () => {
        const syms = Object.keys(portfolio.holdings);
        if (!syms.length) return;
        setRefreshing(true);
        try {
            const res = await axios.post('http://localhost:5000/watchlist-prices', { tickers: syms });
            const priceMap = {};
            res.data.forEach(item => { priceMap[item.symbol] = item; });
            setPrices(priceMap);
        } catch { }
        setRefreshing(false);
    };

    useEffect(() => { refreshPrices(); }, [portfolio.holdings]);

    const handleSearch = async () => {
        if (!searchTicker.trim()) return;
        setLoading(true);
        setStockInfo(null);
        setTradeMsg(null);
        try {
            const res = await axios.post('http://localhost:5000/watchlist-prices', { tickers: [searchTicker.toUpperCase()] });
            const data = res.data[0];
            if (data) {
                setStockInfo(data);
                setPrices(prev => ({ ...prev, [data.symbol]: data }));
            }
        } catch {
            setTradeMsg({ type: 'error', text: 'Could not fetch price.' });
        }
        setLoading(false);
    };

    const handleBuy = () => {
        if (!stockInfo || tradeQty < 1) return;
        const cost = stockInfo.price * tradeQty;
        if (cost > portfolio.cash) {
            setTradeMsg({ type: 'error', text: `Insufficient funds. Need $${cost.toFixed(2)}, have $${portfolio.cash.toFixed(2)}` });
            return;
        }
        setPortfolio(prev => {
            const sym = stockInfo.symbol;
            const prevHolding = prev.holdings[sym] || { qty: 0, avgCost: 0 };
            const newQty = prevHolding.qty + tradeQty;
            const newAvg = ((prevHolding.avgCost * prevHolding.qty) + (stockInfo.price * tradeQty)) / newQty;
            return {
                cash: prev.cash - cost,
                holdings: { ...prev.holdings, [sym]: { qty: newQty, avgCost: newAvg } },
                trades: [{ type: 'BUY', symbol: sym, qty: tradeQty, price: stockInfo.price, date: new Date().toLocaleDateString() }, ...prev.trades.slice(0, 49)]
            };
        });
        setTradeMsg({ type: 'success', text: `✅ Bought ${tradeQty} share(s) of ${stockInfo.symbol} at $${stockInfo.price}` });
    };

    const handleSell = () => {
        if (!stockInfo || tradeQty < 1) return;
        const sym = stockInfo.symbol;
        const holding = portfolio.holdings[sym];
        if (!holding || holding.qty < tradeQty) {
            setTradeMsg({ type: 'error', text: `Not enough shares. You have ${holding?.qty || 0}.` });
            return;
        }
        const proceeds = stockInfo.price * tradeQty;
        setPortfolio(prev => {
            const newQty = prev.holdings[sym].qty - tradeQty;
            const newHoldings = { ...prev.holdings };
            if (newQty === 0) delete newHoldings[sym]; else newHoldings[sym] = { ...prev.holdings[sym], qty: newQty };
            return {
                cash: prev.cash + proceeds,
                holdings: newHoldings,
                trades: [{ type: 'SELL', symbol: sym, qty: tradeQty, price: stockInfo.price, date: new Date().toLocaleDateString() }, ...prev.trades.slice(0, 49)]
            };
        });
        setTradeMsg({ type: 'success', text: `✅ Sold ${tradeQty} share(s) of ${stockInfo.symbol} at $${stockInfo.price}` });
    };

    const handleReset = () => {
        if (window.confirm('Reset portfolio to $10,000 starting cash?')) {
            const fresh = { cash: STARTING_CASH, holdings: {}, trades: [] };
            setPortfolio(fresh);
            setPrices({});
            setStockInfo(null);
            setTradeMsg(null);
        }
    };

    // Calculate portfolio total value
    const holdingsValue = Object.entries(portfolio.holdings).reduce((acc, [sym, h]) => {
        const livePrice = prices[sym]?.price || h.avgCost;
        return acc + livePrice * h.qty;
    }, 0);
    const totalValue = portfolio.cash + holdingsValue;
    const totalPnl = totalValue - STARTING_CASH;
    const isPnlPos = totalPnl >= 0;

    return (
        <div className="min-h-screen text-white pt-20 pb-16 px-4 bg-gradient-to-br from-dark-bg via-dark-bg to-dark-secondary">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/learner" className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Learner
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">
                                📈 Virtual Trading
                            </h1>
                            <p className="text-gray-400 mt-1">Practice trading with $10,000 virtual cash — no real money at risk</p>
                        </div>
                        <motion.button
                            onClick={handleReset}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg text-sm transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                            Reset
                        </motion.button>
                    </div>
                </div>

                {/* Portfolio Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Value', value: `$${totalValue.toFixed(2)}`, icon: DollarSign, color: 'text-cyan-400', bg: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20' },
                        { label: 'Available Cash', value: `$${portfolio.cash.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400', bg: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20' },
                        { label: 'Holdings Value', value: `$${holdingsValue.toFixed(2)}`, icon: BarChart2, color: 'text-purple-400', bg: 'from-purple-500/10 to-purple-500/5 border-purple-500/20' },
                        {
                            label: 'Total P&L', value: `${isPnlPos ? '+' : ''}$${totalPnl.toFixed(2)}`,
                            icon: isPnlPos ? TrendingUp : TrendingDown,
                            color: isPnlPos ? 'text-green-400' : 'text-red-400',
                            bg: isPnlPos ? 'from-green-500/10 to-green-500/5 border-green-500/20' : 'from-red-500/10 to-red-500/5 border-red-500/20'
                        },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                        <motion.div
                            key={label}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className={`bg-gradient-to-br ${bg} border rounded-xl p-4`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Icon className={`w-4 h-4 ${color}`} />
                                <span className="text-gray-400 text-xs uppercase tracking-wider">{label}</span>
                            </div>
                            <div className={`text-xl font-bold font-mono ${color}`}>{value}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Trade Panel */}
                    <div className="space-y-6">
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Search className="w-5 h-5 text-cyan-400" />
                                Search & Trade
                            </h2>

                            {/* Search */}
                            <div className="flex gap-3 mb-4">
                                <input
                                    type="text"
                                    value={searchTicker}
                                    onChange={e => setSearchTicker(e.target.value.toUpperCase())}
                                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                    placeholder="AAPL, TSLA, NVDA..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono uppercase outline-none focus:border-cyan-400 transition-colors"
                                />
                                <motion.button
                                    onClick={handleSearch}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={loading}
                                    className="px-4 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-400 rounded-lg transition-all"
                                >
                                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                </motion.button>
                            </div>

                            {/* Stock Info */}
                            <AnimatePresence>
                                {stockInfo && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="mb-4"
                                    >
                                        <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                                            <div>
                                                <div className="text-lg font-bold font-mono text-white">{stockInfo.symbol}</div>
                                                <div className={`text-sm flex items-center gap-1 ${stockInfo.change_percent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {stockInfo.change_percent >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                    {stockInfo.change_percent >= 0 ? '+' : ''}{stockInfo.change_percent.toFixed(2)}% today
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold font-mono text-white">${stockInfo.price.toFixed(2)}</div>
                                                <div className="text-xs text-gray-500">per share</div>
                                            </div>
                                        </div>

                                        {/* Quantity + Buy/Sell */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-gray-400 text-sm">Qty:</span>
                                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                                                <button onClick={() => setTradeQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-white/10 transition-colors text-gray-300">
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={tradeQty}
                                                    onChange={e => setTradeQty(Math.max(1, parseInt(e.target.value) || 1))}
                                                    className="w-16 bg-transparent text-white text-center font-mono outline-none py-2"
                                                    min={1}
                                                />
                                                <button onClick={() => setTradeQty(q => q + 1)} className="px-3 py-2 hover:bg-white/10 transition-colors text-gray-300">
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <span className="text-gray-500 text-xs">= ${(stockInfo.price * tradeQty).toFixed(2)}</span>
                                        </div>

                                        <div className="flex gap-3">
                                            <motion.button
                                                onClick={handleBuy}
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-green-500/30 transition-all"
                                            >
                                                BUY {tradeQty} share{tradeQty > 1 ? 's' : ''}
                                            </motion.button>
                                            <motion.button
                                                onClick={handleSell}
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold rounded-xl shadow-lg hover:shadow-red-500/30 transition-all"
                                            >
                                                SELL {tradeQty} share{tradeQty > 1 ? 's' : ''}
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Trade Message */}
                            <AnimatePresence>
                                {tradeMsg && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`p-3 rounded-lg text-sm font-medium ${tradeMsg.type === 'success'
                                            ? 'bg-green-500/10 border border-green-500/30 text-green-400'
                                            : 'bg-red-500/10 border border-red-500/30 text-red-400'
                                            }`}
                                    >
                                        {tradeMsg.text}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Recent Trades */}
                        {portfolio.trades.length > 0 && (
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                                <h3 className="text-lg font-bold text-white mb-4">Recent Trades</h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                    {portfolio.trades.slice(0, 10).map((trade, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${trade.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {trade.type}
                                                </span>
                                                <span className="font-mono text-white">{trade.symbol}</span>
                                                <span className="text-gray-400">×{trade.qty}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-mono text-white">${trade.price.toFixed(2)}</div>
                                                <div className="text-gray-600 text-[10px]">{trade.date}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Holdings */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-purple-400" />
                                My Holdings
                            </h2>
                            <motion.button
                                onClick={refreshPrices}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={refreshing}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                            >
                                <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </motion.button>
                        </div>

                        {Object.keys(portfolio.holdings).length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No holdings yet.</p>
                                <p className="text-sm mt-1">Search a stock and buy some shares!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {Object.entries(portfolio.holdings).map(([sym, h]) => {
                                    const live = prices[sym];
                                    const livePrice = live?.price || h.avgCost;
                                    const marketValue = livePrice * h.qty;
                                    const costBasis = h.avgCost * h.qty;
                                    const pnl = marketValue - costBasis;
                                    const pnlPct = ((pnl / costBasis) * 100);
                                    const isPos = pnl >= 0;

                                    return (
                                        <motion.div
                                            key={sym}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="bg-white/5 border border-white/5 rounded-xl p-4"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400/20 to-purple-500/20 flex items-center justify-center">
                                                        <span className="text-xs font-black text-white">{sym.slice(0, 2)}</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold font-mono text-white">{sym}</div>
                                                        <div className="text-xs text-gray-500">{h.qty} shares</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold font-mono text-white">${marketValue.toFixed(2)}</div>
                                                    <div className={`text-xs font-bold flex items-center justify-end gap-0.5 ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                        {isPos ? '+' : ''}${pnl.toFixed(2)} ({pnlPct.toFixed(1)}%)
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                <span>Avg cost: ${h.avgCost.toFixed(2)}</span>
                                                <span>Live: ${livePrice.toFixed(2)}</span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VirtualTradingPage;
