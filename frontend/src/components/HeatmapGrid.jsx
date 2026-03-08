import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HeatmapGrid = ({ data }) => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-wrap gap-2">
            {data.map((item, idx) => {
                const isPos = item.change_percent >= 0;
                let bgClass = '';
                if (item.change_percent > 5) bgClass = 'bg-[#10B981]'; // bright green
                else if (item.change_percent > 0) bgClass = 'bg-[#059669]'; // dark green
                else if (item.change_percent > -5) bgClass = 'bg-[#DC2626]'; // dark red
                else bgClass = 'bg-[#EF4444]'; // bright red

                let sizeClass = 'flex-1 min-w-[120px] min-h-[120px] max-w-[200px] aspect-square';

                return (
                    <motion.div
                        key={item.symbol}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => navigate(`/?ticker=${item.symbol}`)}
                        className={`${sizeClass} ${bgClass} rounded-xl flex flex-col items-center justify-center cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:z-10 hover:scale-[1.05] transition-all p-2 text-center text-white border border-white/10`}
                    >
                        <span className="font-black text-2xl drop-shadow-md">{item.symbol}</span>
                        <span className="font-mono text-sm opacity-90 drop-shadow-md mt-1 font-bold">
                            {isPos ? '+' : ''}{item.change_percent.toFixed(2)}%
                        </span>
                        <span className="font-mono text-xs opacity-70 mt-1">${item.price.toFixed(2)}</span>
                    </motion.div>
                );
            })}
        </div>
    );
};
export default HeatmapGrid;
