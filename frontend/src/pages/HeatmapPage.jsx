import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import axios from 'axios';
import HeatmapGrid from '../components/HeatmapGrid';

const HeatmapPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [topRes, overRes] = await Promise.all([
                    axios.get('http://localhost:5000/top-movers'),
                    axios.get('http://localhost:5000/market-overview')
                ]);

                const combined = [
                    ...topRes.data.gainers,
                    ...topRes.data.losers,
                    ...overRes.data.map(item => ({ ...item, symbol: item.symbol })) // normalize
                ];

                // Remove duplicates by symbol
                const unique = Array.from(new Map(combined.map(item => [item.symbol, item])).values());
                setData(unique);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen text-white pt-20 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-yellow-400 to-emerald-400 flex items-center gap-3 mb-2">
                            <LayoutGrid className="w-8 h-8 text-yellow-500" /> Market Heatmap
                        </h1>
                        <p className="text-sm text-gray-500 uppercase tracking-widest">Visualizing real-time momentum across major assets</p>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono font-bold uppercase tracking-widest bg-dark-card/50 p-3 rounded-xl border border-white/5">

                    </div>
                </motion.div>

                {loading ? (
                    <div className="w-full h-[600px] bg-white/5 rounded-3xl animate-pulse" />
                ) : (
                    <HeatmapGrid data={data} />
                )}
            </div>
        </div>
    );
};
export default HeatmapPage;
