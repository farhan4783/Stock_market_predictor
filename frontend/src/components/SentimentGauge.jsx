import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const SentimentGauge = ({ score, label, color, news, rsi, trend }) => {
    // Normalize score (-100 to 100) to percentage for the semi-circle
    const percentage = (score + 100) / 2;
    const rotation = (percentage / 100) * 180 - 90; // -90 to 90 degrees

    const arcColor = score >= 50 ? '#00f3ff'
        : score >= 20 ? '#4ade80'
            : score >= -20 ? '#facc15'
                : score >= -50 ? '#fb923c'
                    : '#ef4444';

    const trendIcon = trend === 'bullish'
        ? <TrendingUp className="w-3.5 h-3.5" />
        : trend === 'bearish'
            ? <TrendingDown className="w-3.5 h-3.5" />
            : <Minus className="w-3.5 h-3.5" />;

    const trendColor = trend === 'bullish' ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5'
        : trend === 'bearish' ? 'text-red-400 border-red-400/30 bg-red-400/5'
            : 'text-gray-400 border-gray-400/30 bg-gray-400/5';

    return (
        <div className="bg-dark-card/30 rounded-xl p-6 border border-white/5 relative overflow-hidden backdrop-blur-md h-full">
            <h3 className="text-neon-blue font-bold mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
                Market Sentiment
            </h3>

            {/* Gauge */}
            <div className="flex flex-col items-center justify-center relative mb-4">
                <div className="w-48 h-24 overflow-hidden relative">
                    {/* Gray base arc */}
                    <div className="w-48 h-48 rounded-full border-[10px] border-white/5 box-border absolute top-0 left-0" />
                    {/* Colored fill arc */}
                    <div
                        className="w-48 h-48 rounded-full border-[10px] border-transparent box-border absolute top-0 left-0 transition-all duration-700"
                        style={{
                            borderTopColor: arcColor,
                            borderRightColor: score > 0 ? arcColor : 'transparent',
                            transform: 'rotate(-45deg)',
                            filter: `drop-shadow(0 0 8px ${arcColor}60)`,
                        }}
                    />
                </div>

                {/* Needle */}
                <motion.div
                    initial={{ rotate: -90 }}
                    animate={{ rotate: rotation }}
                    transition={{ type: 'spring', stiffness: 60, damping: 15 }}
                    className="w-0.5 h-20 absolute bottom-0 origin-bottom"
                    style={{
                        background: `linear-gradient(to top, ${arcColor}, transparent)`,
                        borderRadius: '2px',
                        zIndex: 10,
                        boxShadow: `0 0 8px ${arcColor}`,
                    }}
                />
                {/* Center dot */}
                <div className="w-4 h-4 rounded-full absolute bottom-[-8px] z-20 shadow-[0_0_10px_white]"
                    style={{ background: arcColor }} />
            </div>

            {/* Label & Score */}
            <div className="text-center mb-4">
                <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl font-bold"
                    style={{ color: arcColor }}
                >
                    {label}
                </motion.div>
                <div className="text-gray-500 text-xs mt-0.5">Score: {score}</div>
            </div>

            {/* Badges: RSI + Trend */}
            <div className="flex justify-center gap-2 mb-4">
                {rsi !== null && rsi !== undefined && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border
                        ${rsi > 70 ? 'text-red-400 border-red-400/30 bg-red-400/5'
                            : rsi < 30 ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5'
                                : 'text-yellow-400 border-yellow-400/30 bg-yellow-400/5'}`}
                    >
                        RSI {rsi}
                    </span>
                )}
                {trend && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${trendColor}`}>
                        {trendIcon}
                        {trend.charAt(0).toUpperCase() + trend.slice(1)}
                    </span>
                )}
            </div>

            {/* News */}
            <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">Latest Headlines</h4>
                {news && news.map((item, i) => (
                    <motion.a
                        key={i}
                        href={item.url}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="block text-sm text-gray-300 hover:text-white transition-colors truncate relative pl-4 group"
                    >
                        <span className="absolute left-0 top-2 w-1.5 h-1.5 bg-neon-purple rounded-full group-hover:bg-neon-blue transition-colors" />
                        {item.title}
                        <div className="text-[10px] text-gray-500 mt-0.5">{item.source} • {item.time}</div>
                    </motion.a>
                ))}
            </div>
        </div>
    );
};

export default SentimentGauge;
