import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Briefcase } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import CountUp from 'react-countup';
import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';

const PortfolioCard = ({ currentValues, loading }) => {
    const { holdings } = usePortfolio();

    const totalInvested = holdings.reduce((sum, h) => sum + (h.shares * h.avgBuy), 0);
    const currentValue = holdings.reduce((sum, h) => {
        const val = currentValues.find(v => v.symbol === h.ticker);
        const price = val ? val.price : h.avgBuy;
        return sum + (h.shares * price);
    }, 0);

    const totalPnL = currentValue - totalInvested;
    const pnlPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
    const isPos = totalPnL > 0;

    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (isPos && !loading) {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [isPos, loading]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-cyan-900/30 rounded-2xl p-6 border border-white/10 relative overflow-hidden glass-card"
        >
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none z-0 opacity-50">
                    <Confetti width={800} height={300} recycle={false} numberOfPieces={150} />
                </div>
            )}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <div className="flex items-center gap-3 mb-6 relative z-10">
                <Briefcase className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-gray-200 uppercase tracking-widest">Portfolio Summary</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" /> Total Value
                    </div>
                    {loading ? (
                        <div className="w-32 h-8 bg-white/5 animate-pulse rounded" />
                    ) : (
                        <div className="text-3xl md:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 tracking-tight drop-shadow-md">
                            $<CountUp end={currentValue} decimals={2} duration={1.5} separator="," />
                        </div>
                    )}
                </div>

                <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Invested</div>
                    <div className="text-xl md:text-2xl font-bold font-mono text-gray-400">
                        $<CountUp end={totalInvested} decimals={2} duration={1} separator="," />
                    </div>
                </div>

                <div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Return</div>
                    {loading ? (
                        <div className="w-24 h-8 bg-white/5 animate-pulse rounded" />
                    ) : (
                        <div className={`text-xl md:text-2xl font-bold font-mono flex items-center gap-2 ${isPos ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]' : 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.3)]'}`}>
                            {isPos ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                            <div>
                                {isPos ? '+' : ''}$<CountUp end={Math.abs(totalPnL)} decimals={2} duration={1.5} separator="," />
                                <span className="text-sm opacity-80 ml-2">({isPos ? '+' : ''}<CountUp end={pnlPercent} decimals={2} duration={1.5} />%)</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
export default PortfolioCard;
