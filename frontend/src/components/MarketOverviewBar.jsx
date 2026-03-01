import { useEffect, useState } from 'react';
import axios from 'axios';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MarketOverviewBar = () => {
    const [items, setItems] = useState([]);
    const [error, setError] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:5000/market-overview')
            .then(res => setItems(res.data))
            .catch(() => setError(true));
    }, []);

    if (error || items.length === 0) return null;

    // Duplicate for seamless loop
    const displayItems = [...items, ...items];

    return (
        <div className="w-full overflow-hidden bg-black/40 border-b border-white/5 py-2 mb-0">
            <div className="flex animate-marquee gap-10 whitespace-nowrap">
                {displayItems.map((item, i) => {
                    const isPos = item.change_percent >= 0;
                    return (
                        <span key={i} className="flex items-center gap-1.5 text-sm font-mono shrink-0">
                            <span className="text-gray-300 font-semibold tracking-wider">{item.symbol}</span>
                            <span className="text-white font-bold">${item.price.toLocaleString()}</span>
                            <span className={`flex items-center gap-0.5 text-xs font-bold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                                {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                {isPos ? '+' : ''}{item.change_percent.toFixed(2)}%
                            </span>
                            <span className="text-white/10 ml-4">|</span>
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

export default MarketOverviewBar;
