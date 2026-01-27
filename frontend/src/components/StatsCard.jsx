import { motion } from 'framer-motion';

const StatsCard = ({ label, value, subValue, change, icon: Icon, delay = 0 }) => {
    const isPositive = change > 0;
    const isNeutral = change === 0;

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay, duration: 0.5 }}
            className="bg-dark-card backdrop-blur-md border border-white/5 rounded-xl p-6 relative overflow-hidden group hover:border-neon-blue/50 transition-colors duration-300"
        >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {Icon && <Icon className="w-12 h-12 text-white" />}
            </div>

            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">{label}</h3>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-bold font-mono text-white">{value}</span>
                {subValue && <span className="text-sm text-gray-500 mb-1">{subValue}</span>}
            </div>

            {change !== undefined && (
                <div className={`mt-2 flex items-center text-sm font-bold ${isPositive ? 'text-neon-green' : isNeutral ? 'text-gray-400' : 'text-red-500'}`}>
                    {isPositive ? '▲' : isNeutral ? '-' : '▼'} {Math.abs(change).toFixed(2)}%
                </div>
            )}
        </motion.div>
    );
};

export default StatsCard;
