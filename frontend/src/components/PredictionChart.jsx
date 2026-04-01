import { useState } from 'react';
import {
    ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, ComposedChart
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, X } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const isPrediction = data.predValue !== null && data.predValue !== undefined && data.histValue === null;

        return (
            <div className="bg-neutral-900/95 backdrop-blur-md border border-cyan-400/50 p-4 rounded-xl shadow-[0_0_20px_rgba(0,243,255,0.15)] z-50">
                <p className="text-gray-400 text-xs mb-2 font-mono">{label}</p>
                {data.open ? (
                    <div className="space-y-1">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-2 border-b border-white/10 pb-2">
                            <span className="text-gray-400 text-xs">Open:</span>
                            <span className="text-white font-mono text-xs text-right">${data.open?.toFixed(2)}</span>
                            <span className="text-gray-400 text-xs">High:</span>
                            <span className="text-white font-mono text-xs text-right">${data.high?.toFixed(2)}</span>
                            <span className="text-gray-400 text-xs">Low:</span>
                            <span className="text-white font-mono text-xs text-right">${data.low?.toFixed(2)}</span>
                            <span className="text-gray-400 text-xs">Close:</span>
                            <span className="text-cyan-400 font-bold font-mono text-xs text-right">${data.close?.toFixed(2)}</span>
                        </div>
                        {data.upper_bb && (
                            <div className="flex flex-col gap-0.5 pt-1">
                                <span className="text-[10px] text-orange-400/80">Upper BB: ${data.upper_bb?.toFixed(2)}</span>
                                <span className="text-[10px] text-orange-400/50">SMA20: ${data.sma20?.toFixed(2)}</span>
                                <span className="text-[10px] text-orange-400/30">Lower BB: ${data.lower_bb?.toFixed(2)}</span>
                            </div>
                        )}
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
            <div className="bg-neutral-900 border border-white/10 p-2 rounded text-xs z-50">
                <p className="text-gray-400">{label}</p>
                <p className="text-cyan-300 font-mono">{(payload[0].value / 1e6).toFixed(1)}M shares</p>
            </div>
        );
    }
    return null;
};

const IndicatorTooltip = ({ active, payload, label, title }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-neutral-900 border border-white/10 p-2 rounded text-xs z-50">
                <p className="text-gray-400 text-[10px]">{label}</p>
                <div className="flex gap-2 items-center">
                    <span className="text-white">{title}:</span>
                    <span className="text-cyan-400 font-mono font-bold">{payload[0].value?.toFixed(2)}</span>
                </div>
            </div>
        );
    }
    return null;
};

const PredictionChart = ({ data, predictions }) => {
    const [advancedMode, setAdvancedMode] = useState(false);

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
            rsi: hItem?.rsi ?? null,
            macd: hItem?.macd ?? null,
            sma20: hItem?.sma20 ?? null,
            upper_bb: hItem?.upper_bb ?? null,
            lower_bb: hItem?.lower_bb ?? null,
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
            className="w-full bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5 p-4 md:p-6 shadow-xl relative overflow-hidden"
        >
            {/* Title & Controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <span className="w-1 h-6 bg-cyan-400 rounded-full shadow-[0_0_10px_#00f3ff]" />
                    <span className="text-white">Price Forecast</span>
                </h2>
                
                <div className="flex items-center gap-4">
                    {/* Legend */}
                    <div className="hidden md:flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-0.5 bg-cyan-400 inline-block" /> Historical
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-0.5 bg-purple-400 border-dashed inline-block" style={{ borderTop: '2px dashed #bc13fe', background: 'transparent' }} /> Forecast
                        </span>
                    </div>

                    {/* Toggle Advanced */}
                    <button
                        onClick={() => setAdvancedMode(!advancedMode)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            advancedMode 
                            ? 'bg-neon-blue/20 text-neon-blue border-neon-blue shadow-[0_0_10px_rgba(0,243,255,0.3)]' 
                            : 'bg-white/5 text-gray-400 w border-white/10 hover:bg-white/10'
                        }`}
                    >
                        {advancedMode ? <X className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
                        {advancedMode ? 'Standard View' : 'Advanced Mode'}
                    </button>
                </div>
            </div>

            {/* Main Price Chart */}
            <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} syncId="priceChartGrp">
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
                    
                    {advancedMode && (
                        <Area type="monotone" dataKey="upper_bb" stroke="none" fill="#f97316" fillOpacity={0.05} />
                    )}
                    {advancedMode && (
                        <Area type="monotone" dataKey="lower_bb" stroke="none" fill="#f97316" fillOpacity={0.05} />
                    )}
                    
                    <Area type="monotone" dataKey="histValue" name="Historical" stroke="#00f3ff" strokeWidth={2} fillOpacity={1} fill="url(#colorHist)" activeDot={{ r: 5, strokeWidth: 0 }} />
                    <Area type="monotone" dataKey="predValue" name="Forecast" stroke="#bc13fe" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorPred)" activeDot={{ r: 5, strokeWidth: 0 }} connectNulls={true} />
                    
                    {advancedMode && (
                        <Line type="monotone" dataKey="upper_bb" stroke="#f97316" strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.5} dot={false} isAnimationActive={false} />
                    )}
                    {advancedMode && (
                        <Line type="monotone" dataKey="sma20" stroke="#f97316" strokeWidth={1} strokeOpacity={0.8} dot={false} isAnimationActive={false} />
                    )}
                    {advancedMode && (
                        <Line type="monotone" dataKey="lower_bb" stroke="#f97316" strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.5} dot={false} isAnimationActive={false} />
                    )}

                    {lastHist && (
                        <ReferenceLine x={lastHist.date} stroke="#ffffff20" strokeDasharray="3 3"
                            label={{ position: 'insideTop', value: 'Today', fill: '#555', fontSize: 9 }}
                        />
                    )}
                </ComposedChart>
            </ResponsiveContainer>

            {/* Advanced Subcharts */}
            <AnimatePresence>
                {advancedMode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden space-y-3 mt-4"
                    >
                        {/* RSI */}
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest pl-1">RSI (14) - Oscillator</p>
                            <ResponsiveContainer width="100%" height={80}>
                                <ComposedChart data={chartData} syncId="priceChartGrp" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                    <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
                                    <YAxis domain={[0, 100]} stroke="#444" tick={{ fontSize: 10 }} width={55} ticks={[30, 70]} />
                                    <Tooltip content={<IndicatorTooltip title="RSI" />} />
                                    <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.5} />
                                    <ReferenceLine y={30} stroke="#10b981" strokeDasharray="3 3" strokeOpacity={0.5} />
                                    <Line type="monotone" dataKey="rsi" stroke="#00f3ff" strokeWidth={1.5} dot={false} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                        
                        {/* MACD */}
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest pl-1">MACD Histogram</p>
                            <ResponsiveContainer width="100%" height={80}>
                                <BarChart data={chartData} syncId="priceChartGrp" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                    <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
                                    <YAxis stroke="#444" tick={{ fontSize: 10 }} width={55} />
                                    <Tooltip content={<IndicatorTooltip title="MACD" />} />
                                    <Bar dataKey="macd" shape={(props) => {
                                        const { fill, x, y, width, height, payload } = props;
                                        const isPositive = payload.macd > 0;
                                        return <rect x={x} y={y} width={width} height={height} fill={isPositive ? '#10b981' : '#ef4444'} opacity={0.7} rx={1} />;
                                    }} />
                                    <ReferenceLine y={0} stroke="#ffffff20" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Standard Volume Sub-chart */}
            {!advancedMode && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest mb-1 ml-1">Volume</p>
                    <ResponsiveContainer width="100%" height={70}>
                        <BarChart data={chartData.filter(d => d.volume !== null)} syncId="priceChartGrp" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                            <XAxis dataKey="date" tick={false} axisLine={false} tickLine={false} />
                            <YAxis tick={false} axisLine={false} tickLine={false} width={55} />
                            <Tooltip content={<VolumeTooltip />} />
                            <Bar dataKey="volume" fill="#00f3ff" fillOpacity={0.25} radius={[2, 2, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            )}
        </motion.div>
    );
};

export default PredictionChart;
