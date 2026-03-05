import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Building2, TrendingUp, DollarSign, BarChart2, ChevronUp, ChevronDown } from 'lucide-react';

const StockInfoCard = ({ ticker }) => {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!ticker) return;
        setLoading(true);
        setInfo(null);
        axios.get(`http://localhost:5000/stock-info?ticker=${ticker}`)
            .then(res => setInfo(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [ticker]);

    if (loading) {
        return (
            <div className="bg-dark-card/30 rounded-xl p-5 border border-white/5 animate-pulse">
                <div className="h-4 w-40 bg-white/10 rounded mb-3" />
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => <div key={i} className="h-12 bg-white/5 rounded" />)}
                </div>
            </div>
        );
    }

    if (!info || info.error) return null;

    const stats = [
        { label: 'Sector', value: info.sector, icon: Building2, color: 'text-cyan-400' },
        { label: 'Market Cap', value: info.market_cap, icon: DollarSign, color: 'text-emerald-400' },
        { label: 'P/E Ratio', value: info.pe_ratio === 'N/A' ? 'N/A' : info.pe_ratio, icon: BarChart2, color: 'text-purple-400' },
        { label: '52W High', value: info.fifty_two_week_high ? `$${info.fifty_two_week_high}` : 'N/A', icon: ChevronUp, color: 'text-green-400' },
        { label: '52W Low', value: info.fifty_two_week_low ? `$${info.fifty_two_week_low}` : 'N/A', icon: ChevronDown, color: 'text-red-400' },
        { label: 'Dividend', value: info.dividend_yield, icon: TrendingUp, color: 'text-yellow-400' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-dark-card/30 rounded-xl p-5 border border-white/5 mb-7"
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-white font-bold text-lg leading-tight">{info.name}</h3>
                    <p className="text-gray-500 text-xs mt-0.5">{info.industry}</p>
                </div>
                <span className="px-2 py-1 text-xs font-bold rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
                    {ticker}
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {stats.map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-white/5 rounded-lg p-3 border border-white/5">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Icon className={`w-3 h-3 ${color}`} />
                            <span className="text-gray-500 text-[10px] uppercase tracking-widest">{label}</span>
                        </div>
                        <div className="text-white font-bold text-sm truncate">{value ?? 'N/A'}</div>
                    </div>
                ))}
            </div>

            {info.description && (
                <p className="text-gray-500 text-xs leading-relaxed border-t border-white/5 pt-3 line-clamp-2">
                    {info.description}
                </p>
            )}
        </motion.div>
    );
};

export default StockInfoCard;
