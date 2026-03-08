import { motion } from 'framer-motion';
import { ExternalLink, Clock } from 'lucide-react';

const NewsCard = ({ news, index, delay = 0 }) => {
    // Determine sentiment roughly from keywords
    const title = news.title.toLowerCase();
    const isPositive = title.match(/surge|jump|record|up|upgrade|beats|growth|win|soar|buy/i);
    const isNegative = title.match(/drop|fall|plunge|miss|down|downgrade|loss|lawsuit|sell|crash|probe/i);

    const sentiment = isPositive ? 'Bullish' : isNegative ? 'Bearish' : 'Neutral';
    const sentimentColor = isPositive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        : isNegative ? 'bg-red-500/20 text-red-400 border-red-500/30'
            : 'bg-gray-500/20 text-gray-400 border-gray-500/30';

    return (
        <motion.a
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + (index * 0.05) }}
            className="block w-full bg-dark-card/40 border border-white/5 hover:border-cyan-400/30 rounded-xl p-5 backdrop-blur-sm transition-all group lg:min-h-[140px]"
        >
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                            {news.source}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border ${sentimentColor} font-bold`}>
                            {sentiment}
                        </span>
                    </div>
                    <h4 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors leading-tight mb-3">
                        {news.title}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5" />
                            {news.time}
                        </span>
                    </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-cyan-500/20 transition-colors border border-white/5">
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-cyan-400" />
                </div>
            </div>
        </motion.a>
    );
};
export default NewsCard;
