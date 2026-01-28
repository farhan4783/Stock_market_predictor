import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        // Find the payload item that has the data
        const data = payload[0].payload;
        // payload[0] might be history or prediction, need to check which one is active or just read from data
        // Actually, if we hover over prediction part, payload[0] will be prediction.

        const isPrediction = data.predValue !== null && data.predValue !== undefined && data.histValue === null;

        // If we are at the connection point (both exist), we can show both or just Close.
        // Let's rely on the properties we passed.

        return (
            <div className="bg-neutral-900 border border-cyan-400 p-4 rounded-lg shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                <p className="text-gray-400 text-xs mb-1">{label}</p>
                {data.open ? (
                    <>
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
                    </>
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

const PredictionChart = ({ data, predictions }) => {
    // 1. Format Historical Data
    const historicalData = data.map(d => ({
        ...d,
        date: d.date,
        value: d.close || d.price,
        type: 'Historical'
    }));

    const lastHist = historicalData[historicalData.length - 1];

    // 2. Format Prediction Data
    const predictionData = predictions.map(d => ({
        ...d,
        date: d.date,
        value: d.price,
        type: 'Prediction'
    }));

    // Connection point strategy:
    // We want the prediction line to start exactly where history ended.

    // Create a unified list of dates
    const allDates = [...data.map(d => d.date), ...predictions.map(d => d.date)];

    const chartData = allDates.map(date => {
        const hItem = historicalData.find(d => d.date === date);
        const pItem = predictionData.find(d => d.date === date);

        return {
            date,
            histValue: hItem ? hItem.value : null,
            // If it's the last history date, we set it as the start of prediction too
            predValue: pItem ? pItem.value : (lastHist && date === lastHist.date ? lastHist.value : null),
            open: hItem?.open,
            high: hItem?.high,
            low: hItem?.low,
            close: hItem?.close || hItem?.value || pItem?.value
        };
    });

    // Calculate domain for Y axis
    const prices = [...historicalData.map(d => d.value), ...predictionData.map(d => d.value)];
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const domain = [minPrice * 0.98, maxPrice * 1.02];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full h-[450px] bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/5 p-4 md:p-8"
        >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-1 h-6 bg-cyan-400 rounded-full shadow-[0_0_10px_#00f3ff]"></span>
                <span className="text-white">Price Forecast</span>
                <span className="text-xs text-gray-500 ml-2 font-normal uppercase tracking-wider">
                    (History vs Prediction)
                </span>
            </h2>

            <ResponsiveContainer width="100%" height="85%">
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#666"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(str) => {
                            const d = new Date(str);
                            return `${d.getMonth() + 1}/${d.getDate()}`;
                        }}
                        minTickGap={30}
                    />
                    <YAxis
                        domain={domain}
                        stroke="#666"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(val) => `$${val.toFixed(0)}`}
                        width={60}
                    />
                    <Tooltip content={<CustomTooltip />} />

                    <Area
                        type="monotone"
                        dataKey="histValue"
                        name="Historical"
                        stroke="#00f3ff"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorHist)"
                        activeDot={{ r: 6, strokeWidth: 0, stroke: '#fff' }}
                    />

                    <Area
                        type="monotone"
                        dataKey="predValue"
                        name="Forecast"
                        stroke="#bc13fe"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fillOpacity={1}
                        fill="url(#colorPred)"
                        activeDot={{ r: 6, strokeWidth: 0, stroke: '#fff' }}
                        connectNulls={true}
                    />

                    {lastHist && (
                        <ReferenceLine
                            x={lastHist.date}
                            stroke="#ffffff30"
                            strokeDasharray="3 3"
                            label={{ position: 'insidetop', value: 'Today', fill: '#666', fontSize: 10 }}
                        />
                    )}
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
};

export default PredictionChart;
