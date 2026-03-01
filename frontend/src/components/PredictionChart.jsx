import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine
} from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const isPrediction = data.predValue !== null && data.predValue !== undefined && data.histValue === null;

        return (
            <div className="bg-neutral-900 border border-cyan-400/50 p-4 rounded-lg shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                <p className="text-gray-400 text-xs mb-1">{label}</p>
                {data.open ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <span className="text-gray-400 text-xs">Open:</span>
                        <span className="text-white font-mono text-xs text-right">${data.open?.toFixed(2)}</span>
                        <span className="text-gray-400 text-xs">High:</span>
                        <span className="text-white font-mono text-xs text-right">${data.high?.toFixed(2)}</span>
                        <span className="text-gray-400 text-xs">Low:</span>
                        <span className="text-white font-mono text-xs text-right">${data.low?.toFixed(2)}</span>
                        <span className="text-gray-400 text-xs">Close:</span>
                        <span className="text-cyan-400 font-bold font-mono text-xs text-right">${data.close?.toFixed(2)}</span>
                    </div>
                ) : (
                    <p className="text-purple-400 font-bold font-mono text-lg">
                        Forecast: ${data.predValue?.toFixed(2)}
                    </p>
                )}
            </div>
        );
    }
    return null;
};

const VolumeTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-neutral-900 border border-white/10 p-2 rounded text-xs">
                <p className="text-gray-400">{label}</p>
                <p className="text-cyan-300 font-mono">{(payload[0].value / 1e6).toFixed(1)}M shares</p>
            </div>
        );
    }
    return null;
};

const PredictionChart = ({ data, predictions }) => {
    const historicalData = data.map(d => ({
        ...d,
        date: d.date,
        value: d.close || d.price,
        type: 'Historical'
    }));

    const lastHist = historicalData[historicalData.length - 1];

    const predictionData = predictions.map(d => ({
        ...d,
        date: d.date,
        value: d.price,
        type: 'Prediction'
    }));

    const allDates = [...data.map(d => d.date), ...predictions.map(d => d.date)];

    const chartData = allDates.map(date => {
        const hItem = historicalData.find(d => d.date === date);
        const pItem = predictionData.find(d => d.date === date);

        return {
            date,
            histValue: hItem ? hItem.value : null,
            predValue: pItem ? pItem.value : (lastHist && date === lastHist.date ? lastHist.value : null),
            open: hItem?.open,
            high: hItem?.high,
            low: hItem?.low,
            close: hItem?.close || hItem?.value || pItem?.value,
            volume: hItem?.volume ?? null,
        };
    });

    const prices = [...historicalData.map(d => d.value), ...predictionData.map(d => d.value)];
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const domain = [minPrice * 0.98, maxPrice * 1.02];

    const tickFmt = (str) => {
        const d = new Date(str);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5 p-4 md:p-6"
        >
            {/* Title */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="w-1 h-6 bg-cyan-400 rounded-full shadow-[0_0_10px_#00f3ff]" />
                    <span className="text-white">Price Forecast</span>
                </h2>
                {/* Legend */}
                <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-cyan-400 inline-block" /> Historical
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-0.5 bg-purple-400 border-dashed inline-block" style={{ borderTop: '2px dashed #bc13fe', background: 'transparent' }} /> Forecast
                    </span>
                </div>
            </div>

            {/* Price Chart */}
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#bc13fe" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#bc13fe" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                    <XAxis dataKey="date" stroke="#444" tick={{ fontSize: 10 }} tickFormatter={tickFmt} minTickGap={30} />
                    <YAxis domain={domain} stroke="#444" tick={{ fontSize: 10 }} tickFormatter={(val) => `$${val.toFixed(0)}`} width={55} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="histValue" name="Historical" stroke="#00f3ff" strokeWidth={2} fillOpacity={1} fill="url(#colorHist)" activeDot={{ r: 5, strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="predValue" name="Forecast" stroke="#bc13fe" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPred)" activeDot={{ r: 5, strokeWidth: 0 }} connectNulls={true} />
                    {lastHist && (
                        <ReferenceLine x={lastHist.date} stroke="#ffffff20" strokeDasharray="3 3"
                            label={{ position: 'insideTop', value: 'Today', fill: '#555', fontSize: 9 }}
                        />
                    )}
                </AreaChart>
            </ResponsiveContainer>

            {/* Volume Sub-chart */}
            <div className="mt-3">
                <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1 ml-1">Volume</p>
                <ResponsiveContainer width="100%" height={70}>
                    <BarChart data={chartData.filter(d => d.volume !== null)} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                        <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
                        <YAxis tick={false} axisLine={false} tickLine={false} width={55} />
                        <Tooltip content={<VolumeTooltip />} />
                        <Bar dataKey="volume" fill="#00f3ff" fillOpacity={0.25} radius={[2, 2, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default PredictionChart;
