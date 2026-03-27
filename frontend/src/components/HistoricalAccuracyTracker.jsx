import {
    ResponsiveContainer, AreaChart, Area,
    XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { motion } from 'framer-motion';
import { History, Activity } from 'lucide-react';

const AccuracyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-neutral-900 border border-white/10 p-4 rounded-lg shadow-xl">
                <p className="text-gray-400 text-xs mb-2">{label}</p>
                {payload.map((p, i) => (
                    <div key={i} style={{ color: p.color }} className="font-bold font-mono text-sm mb-1 flex justify-between gap-4">
                        <span>{p.name}:</span>
                        <span>${p.value?.toFixed(2)}</span>
                    </div>
                ))}
                {payload.length === 2 && (
                    <div className="mt-2 pt-2 border-t border-white/10 text-xs flex justify-between gap-4">
                        <span className="text-gray-400">Error:</span>
                        <span className="text-white font-mono font-bold">
                            ${Math.abs(payload[0].value - payload[1].value).toFixed(2)}
                        </span>
                    </div>
                )}
            </div>
        );
    }
    return null;
};

const HistoricalAccuracyTracker = ({ backtestData = [] }) => {
    if (!backtestData || backtestData.length === 0) return null;

    // Calculate mean absolute error over the backtest period
    const totalError = backtestData.reduce((acc, curr) => acc + Math.abs(curr.predicted - curr.actual), 0);
    const avgError = totalError / backtestData.length;
    const avgActual = backtestData.reduce((acc, curr) => acc + curr.actual, 0) / backtestData.length;
    const accuracyPercent = Math.max(0, 100 - ((avgError / avgActual) * 100));

    const allPrices = [...backtestData.map(d => d.predicted), ...backtestData.map(d => d.actual)];
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const domain = [minPrice * 0.98, maxPrice * 1.02];

    const tickFmt = (str) => {
        const d = new Date(str);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/5 p-4 md:p-6 mb-7"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                        <History className="w-5 h-5 text-emerald-400" />
                        <span className="text-white">Historical Accuracy Tracker</span>
                    </h2>
                    <p className="text-xs text-gray-400">Backtesting AI performance over the last {backtestData.length} days</p>
                </div>
                
                <div className="flex items-center gap-4 bg-black/20 px-4 py-2 rounded-xl border border-white/5">
                    <div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
                            <Activity className="w-3 h-3" /> Average Error
                        </div>
                        <div className="text-white font-mono font-bold text-sm">
                            ±${avgError.toFixed(2)}
                        </div>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">
                            Estimated Accuracy
                        </div>
                        <div className="text-emerald-400 font-mono font-bold text-sm">
                            {accuracyPercent.toFixed(1)}%
                        </div>
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={backtestData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="date" stroke="#444" tick={{ fontSize: 10 }} tickFormatter={tickFmt} minTickGap={20} />
                    <YAxis domain={domain} stroke="#444" tick={{ fontSize: 10 }} tickFormatter={(val) => `$${val.toFixed(0)}`} width={55} />
                    <Tooltip content={<AccuracyTooltip />} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                    <Area type="monotone" dataKey="actual" name="Actual Price" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" activeDot={{ r: 4 }} />
                    <Area type="monotone" dataKey="predicted" name="AI Predicted" stroke="#34d399" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorPredicted)" activeDot={{ r: 4 }} />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
};

export default HistoricalAccuracyTracker;
