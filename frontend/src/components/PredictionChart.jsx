import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-dark-bg border border-neon-blue p-4 rounded-lg shadow-[0_0_15px_rgba(0,243,255,0.2)]">
                <p className="text-gray-400 text-xs mb-1">{label}</p>
                <p className="text-neon-blue font-bold font-mono text-lg">
                    ${Number(payload[0].value).toFixed(2)}
                </p>
            </div>
        );
    }
    return null;
};

const PredictionChart = ({ data, predictions }) => {
    // Combine historical and prediction data
    const chartData = [
        ...data.map(d => ({ ...d, type: 'Historical' })),
        ...predictions.map(d => ({ ...d, type: 'Prediction' }))
    ];

    const minPrice = Math.min(...chartData.map(d => d.price));
    const maxPrice = Math.max(...chartData.map(d => d.price));
    const domain = [minPrice * 0.95, maxPrice * 1.05];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full h-[400px] bg-dark-card/50 backdrop-blur-sm rounded-2xl border border-white/5 p-4 md:p-8"
        >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-neon-blue rounded-full"></span>
                Price Forecast
            </h2>

            <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
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
                        tick={{ fontSize: 12 }}
                        tickFormatter={(str) => str.substring(5)}
                    />
                    <YAxis
                        domain={domain}
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(val) => `$${val.toFixed(0)}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#00f3ff"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                        data={data.map(d => ({ ...d, type: 'Historical' }))}
                    />
                    <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#bc13fe"
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        fillOpacity={1}
                        fill="url(#colorPred)"
                        data={predictions.map(d => ({ ...d, type: 'Prediction' }))}
                        connectNulls
                    />
                    {/* Render separate lines/areas is tricky in Recharts for single array. 
               Better approach: Map full dataset but have nulls?
               Actually, simpler: Just show one line but change color? 
               Recharts Area doesn't support changing color mid-line easily.
               I will render two Areas. One for Historical, One for Prediction.
               Historical data should have 'prediction' null/undefined.
               Prediction data should have 'historical' null/undefined.
           */}
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
};

// Refined component to handle split data correctly
const RefinedPredictionChart = ({ data, predictions }) => {
    // Last point of history needs to be first point of prediction to connect lines
    const lastHist = data[data.length - 1];

    const historicalSeries = data.map(d => ({ date: d.date, histPrice: d.price }));
    const predictionSeries = [
        { date: lastHist.date, predPrice: lastHist.price }, // Connection point
        ...predictions.map(d => ({ date: d.date, predPrice: d.price }))
    ];

    // Merge for XAxis
    // We need a unified list of dates
    const allDates = [...data.map(d => d.date), ...predictions.map(d => d.date)];
    // Create a map
    const combinedData = allDates.map(date => {
        const h = historicalSeries.find(d => d.date === date);
        const p = predictionSeries.find(d => d.date === date);
        return {
            date,
            histPrice: h?.histPrice,
            predPrice: p?.predPrice
        };
    });

    const allPrices = [...data, ...predictions].map(d => d.price);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const domain = [minPrice * 0.95, maxPrice * 1.05];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full h-[400px] bg-dark-card/50 backdrop-blur-sm rounded-2xl border border-white/5 p-4 md:p-8"
        >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-neon-blue rounded-full shadow-[0_0_10px_#00f3ff]"></span>
                Price Forecast
            </h2>

            <ResponsiveContainer width="100%" height="85%">
                <AreaChart data={combinedData}>
                    <defs>
                        <linearGradient id="colorHist" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#bc13fe" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#bc13fe" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(str) => str.substring(5)} // MM-DD
                    />
                    <YAxis
                        domain={domain}
                        stroke="#666"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(val) => `$${val.toFixed(0)}`}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#050505', borderColor: '#333' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="histPrice"
                        name="Historical"
                        stroke="#00f3ff"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorHist)"
                    />
                    <Area
                        type="monotone"
                        dataKey="predPrice"
                        name="Forecast"
                        stroke="#bc13fe"
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        fillOpacity={1}
                        fill="url(#colorPred)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
}

export default RefinedPredictionChart;
