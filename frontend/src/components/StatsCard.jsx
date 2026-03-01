import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatsCard = ({ label, value, subValue, change, icon: Icon, delay = 0 }) => {
    const isPositive = change > 0;
    const isNeutral = change === 0 || change === undefined;

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay, duration: 0.5 }}
            className={`relative bg-dark-card backdrop-blur-md border rounded-xl p-6 overflow-hidden group transition-all duration-300
                ${isPositive
                    ? 'border-emerald-500/20 hover:border-emerald-400/40 hover:shadow-[0_0_20px_rgba(52,211,153,0.08)]'
                    : isNeutral
                        ? 'border-white/5 hover:border-white/15'
                        : 'border-red-500/20 hover:border-red-400/40 hover:shadow-[0_0_20px_rgba(248,113,113,0.08)]'
                }`}
        >
            {/* Background icon */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {Icon && <Icon className="w-12 h-12 text-white" />}
            </div>

            {/* Accent bottom line */}
            <div
                className={`absolute bottom-0 left-0 h-[2px] w-full transition-all duration-700 ${isPositive
                    ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 group-hover:opacity-100'
                    : isNeutral
                        ? 'bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100'
                        : 'bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-0 group-hover:opacity-100'
                    }`}
            />

            <h3 className="text-gray-400 text-xs font-medium uppercase tracking-widest mb-2">{label}</h3>

            <div className="flex items-end gap-2">
                <span className="text-2xl font-bold font-mono text-white">{value}</span>
                {subValue && <span className="text-sm text-gray-500 mb-1">{subValue}</span>}
            </div>

            {change !== undefined && (
                <div className={`mt-2 flex items-center gap-0.5 text-sm font-bold ${isPositive ? 'text-emerald-400' : isNeutral ? 'text-gray-400' : 'text-red-400'}`}>
                    {isPositive ? <ArrowUpRight className="w-4 h-4" /> : isNeutral ? null : <ArrowDownRight className="w-4 h-4" />}
                    {!isNeutral && `${Math.abs(change).toFixed(2)}%`}
                </div>
            )}
        </motion.div>
    );
};

export default StatsCard;
