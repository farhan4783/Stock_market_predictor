import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { GitCompare, AlertCircle, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

const CompareTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-neutral-900 border border-white/10 p-3 rounded-lg text-xs shadow-xl">
                <p className="text-gray-400 mb-1">{label}</p>
                {payload.map((p, i) => (
                    <div key={i} style={{ color: p.color }} className="font-bold font-mono">
                        {p.name}: ${p.value?.toFixed(2)}
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const ComparePage = () => {
    const [ticker1, setTicker1] = useState('AAPL');
    const [ticker2, setTicker2] = useState('MSFT');
    const [days, setDays] = useState(7);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('price'); // 'price' or 'percent'

    const handleCompare = async () => {
        setLoading(true);
        setError(null);
        setData(null);
        try {
            const res = await axios.post('http://localhost:5000/compare', {
                ticker1: ticker1.toUpperCase(),
                ticker2: ticker2.toUpperCase(),
                days
            });
            setData(res.data);
        } catch (e) {
            setError(e.response?.data?.error || 'Comparison failed. Ensure both models exist.');
        } finally {
            setLoading(false);
        }
    };

    // Build unified chart data from both prediction arrays
    const buildChartData = () => {
        if (!data) return [];
        const t1 = data.ticker1;
        const t2 = data.ticker2;
        const allDates = [...new Set([
            ...t1.historical.map(d => d.date),
            ...t2.historical.map(d => d.date),
            ...t1.predictions.map(d => d.date),
            ...t2.predictions.map(d => d.date),
        ])].sort();

        let formattedData = allDates.map(date => {
            const h1 = t1.historical.find(d => d.date === date);
            const h2 = t2.historical.find(d => d.date === date);
            const p1 = t1.predictions.find(d => d.date === date);
            const p2 = t2.predictions.find(d => d.date === date);
            return {
                date,
                [t1.ticker]: h1?.close ?? p1?.price ?? null,
                [t2.ticker]: h2?.close ?? p2?.price ?? null,
                isPred: !h1 && !h2,
            };
        });

        if (viewMode === 'percent' && formattedData.length > 0) {
            const first1 = formattedData.find(d => d[t1.ticker] !== null)?.[t1.ticker];
            const first2 = formattedData.find(d => d[t2.ticker] !== null)?.[t2.ticker];

            formattedData = formattedData.map(d => ({
                ...d,
                [t1.ticker]: d[t1.ticker] !== null ? ((d[t1.ticker] - first1) / first1) * 100 : null,
                [t2.ticker]: d[t2.ticker] !== null ? ((d[t2.ticker] - first2) / first2) * 100 : null,
            }));
        }

        return formattedData;
    };

    const chartData = buildChartData();

    return (
        <div className="min-h-screen text-white pt-20 pb-12 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center gap-3 mb-8"
                >
                    <GitCompare className="w-6 h-6 text-purple-400" />
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                        Stock Comparison
                    </h1>
                </motion.div>

                {/* Input Row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-4 mb-8 items-end"
                >
                    {[
                        { label: 'Stock A', value: ticker1, set: setTicker1, color: '#00f3ff' },
                        { label: 'Stock B', value: ticker2, set: setTicker2, color: '#bc13fe' },
                    ].map(({ label, value, set, color }) => (
                        <div key={label} className="flex-1 min-w-[150px]">
                            <label className="text-xs text-gray-500 uppercase tracking-widest mb-1 block">{label}</label>
                            <input
                                type="text"
                                value={value}
                                onChange={e => set(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white font-mono text-lg uppercase tracking-widest outline-none focus:border-cyan-400 transition-colors"
                                style={{ caretColor: color }}
                            />
                        </div>
                    ))}

                    <div>
                        <label className="text-xs text-gray-500 uppercase tracking-widest mb-1 block">Horizon</label>
                        <select
                            value={days}
                            onChange={e => setDays(Number(e.target.value))}
                            className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white outline-none focus:border-cyan-400 transition-colors"
                        >
                            {[3, 7, 14, 30].map(d => (
                                <option key={d} value={d}>{d} Days</option>
                            ))}
                        </select>
                    </div>

                    <motion.button
                        onClick={handleCompare}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        disabled={loading}
                        className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg font-bold text-white shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 transition-all"
                    >
                        {loading ? 'Analyzing...' : 'Compare'}
                    </motion.button>
                </motion.div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl p-4 mb-6"
                        >
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Results */}
                <AnimatePresence>
                    {data && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                            {/* Stat Comparison Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                {[data.ticker1, data.ticker2].map((t, idx) => {
                                    const lastPred = t.predictions[t.predictions.length - 1];
                                    const isPos = lastPred.change_percent >= 0;
                                    const colors = ['from-cyan-500/20 to-cyan-500/5 border-cyan-500/30', 'from-purple-500/20 to-purple-500/5 border-purple-500/30'];
                                    const textColors = ['text-cyan-400', 'text-purple-400'];

                                    const otherT = idx === 0 ? data.ticker2 : data.ticker1;
                                    const isWinner = lastPred.change_percent > otherT.predictions[otherT.predictions.length - 1].change_percent;

                                    return (
                                        <motion.div
                                            key={t.ticker}
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className={`bg-gradient-to-br ${colors[idx]} border rounded-xl p-5 relative overflow-hidden`}
                                        >
                                            {isWinner && (
                                                <div className="absolute -right-6 top-4 bg-yellow-400 text-black text-[10px] font-black uppercase tracking-widest py-1 px-8 rotate-45 shadow-lg shadow-yellow-400/20">
                                                    Winner
                                                </div>
                                            )}
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={`text-2xl font-black font-mono ${textColors[idx]}`}>{t.ticker}</span>
                                                <span className={`flex items-center gap-1 text-sm font-bold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {isPos ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                                    {isPos ? '+' : ''}{lastPred.change_percent.toFixed(2)}%
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div>
                                                    <div className="text-gray-500 text-xs uppercase tracking-wider">Current</div>
                                                    <div className="text-white font-bold font-mono text-lg">${t.current_price.toFixed(2)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-500 text-xs uppercase tracking-wider">{days}D Forecast</div>
                                                    <div className="text-white font-bold font-mono text-lg">${lastPred.price.toFixed(2)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-500 text-xs uppercase tracking-wider flex items-center gap-1"><Activity className="w-3 h-3" /> MAE</div>
                                                    <div className="text-white font-mono">{t.metadata.test_mae?.toFixed(4)}</div>
                                                </div>
                                                <div>
                                                    <div className="text-gray-500 text-xs uppercase tracking-wider">Seq Len</div>
                                                    <div className="text-white font-mono">{t.metadata.sequence_length}d</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Overlay Chart */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <span className="w-1 h-5 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-full" />
                                        Performance Trajectories
                                    </h3>
                                    <div className="flex bg-white/5 p-1 rounded-lg">
                                        <button
                                            onClick={() => setViewMode('price')}
                                            className={`px-3 py-1 rounded text-xs font-bold transition-all ${viewMode === 'price' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            Price ($)
                                        </button>
                                        <button
                                            onClick={() => setViewMode('percent')}
                                            className={`px-3 py-1 rounded text-xs font-bold transition-all ${viewMode === 'percent' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-white'}`}
                                        >
                                            Relative (%)
                                        </button>
                                    </div>
                                </div>
                                <ResponsiveContainer width="100%" height={350}>
                                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#bc13fe" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#bc13fe" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                        <XAxis dataKey="date" stroke="#444" tick={{ fontSize: 10 }}
                                            tickFormatter={s => { const d = new Date(s); return `${d.getMonth() + 1}/${d.getDate()}`; }}
                                            minTickGap={20}
                                        />
                                        <YAxis stroke="#444" tick={{ fontSize: 10 }} tickFormatter={v => viewMode === 'percent' ? `${v.toFixed(0)}%` : `$${v.toFixed(0)}`} width={55} />
                                        <Tooltip content={<CompareTooltip />} />
                                        <Legend />
                                        <Area type="monotone" dataKey={data.ticker1.ticker} stroke="#00f3ff" strokeWidth={2} fill="url(#g1)" connectNulls />
                                        <Area type="monotone" dataKey={data.ticker2.ticker} stroke="#bc13fe" strokeWidth={2} fill="url(#g2)" connectNulls />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ComparePage;
