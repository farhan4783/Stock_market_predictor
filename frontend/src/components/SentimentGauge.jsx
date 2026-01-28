import { motion } from 'framer-motion';

const SentimentGauge = ({ score, label, color, news }) => {
    // Normalize score (-100 to 100) to percentage (0 to 100) for the semi-circle
    const percentage = (score + 100) / 2;
    const rotation = (percentage / 100) * 180 - 90; // -90 to 90 degrees

    return (
        <div className="bg-dark-card/30 rounded-xl p-6 border border-white/5 relative overflow-hidden backdrop-blur-md">
            <h3 className="text-neon-blue font-bold mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse" />
                Market Sentiment
            </h3>

            <div className="flex flex-col items-center justify-center relative mb-8">
                {/* Gauge Background */}
                <div className="w-48 h-24 overflow-hidden relative">
                    <div className="w-48 h-48 rounded-full border-[12px] border-white/5 box-border absolute top-0 left-0" />
                    <div
                        className="w-48 h-48 rounded-full border-[12px] border-transparent border-t-neon-blue/20 box-border absolute top-0 left-0"
                        style={{ transform: 'rotate(-45deg)' }}
                    />
                </div>

                {/* Needle */}
                <motion.div
                    initial={{ rotate: -90 }}
                    animate={{ rotate: rotation }}
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    className="w-1 h-24 bg-gradient-to-t from-white to-transparent absolute bottom-0 origin-bottom"
                    style={{
                        borderRadius: '2px',
                        zIndex: 10
                    }}
                />

                {/* Center Dot */}
                <div className="w-4 h-4 bg-white rounded-full absolute bottom-[-8px] z-20 shadow-[0_0_10px_white]" />

                {/* Validations/Labels */}
                <div className="absolute top-28 text-center">
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-2xl font-bold`}
                        style={{ color: color === 'green' || color === 'lightgreen' ? '#00f3ff' : color === 'red' ? '#ff4d4d' : '#ffffff' }}
                    >
                        {label}
                    </motion.div>
                    <div className="text-gray-400 text-sm">Score: {score}</div>
                </div>
            </div>

            {/* News Ticker */}
            <div className="mt-12 space-y-3">
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
