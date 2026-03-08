import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Search } from 'lucide-react';
import axios from 'axios';
import NewsCard from '../components/NewsCard';
import LoadingSkeleton from '../components/LoadingSkeleton';

const NewsPage = () => {
    const [ticker, setTicker] = useState('');
    const [searchQuery, setSearchQuery] = useState('SPY'); // default to market index
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNews = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/news?ticker=${searchQuery}`);
                setNews(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [searchQuery]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (ticker.trim()) {
            setSearchQuery(ticker.toUpperCase());
        } else {
            setSearchQuery('SPY');
        }
    };

    return (
        <div className="min-h-screen text-white pt-20 pb-12 px-4">
            <div className="max-w-5xl mx-auto">
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center gap-3">
                        <Newspaper className="w-8 h-8 text-emerald-400" /> Market News
                    </h1>

                    <form onSubmit={handleSearch} className="relative w-full md:w-80 z-10">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value)}
                            placeholder="Fetch headlines for TICKER..."
                            className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-emerald-400/50 focus:bg-white/10 transition-all font-mono uppercase shadow-lg"
                        />
                    </form>
                </motion.div>

                <div className="mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                    <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Showing intelligence for:</span>
                    <span className="px-3 py-1 bg-emerald-500/10 rounded text-emerald-400 font-bold font-mono text-lg border border-emerald-500/20">{searchQuery}</span>
                </div>

                {loading ? (
                    <LoadingSkeleton />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {news.length > 0 ? (
                            news.map((n, i) => (
                                <NewsCard key={i} news={n} index={i} />
                            ))
                        ) : (
                            <div className="col-span-full py-16 text-center text-gray-500 bg-white/5 rounded-2xl border border-white/5">
                                <Newspaper className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                No news found for this ticker. Try another.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default NewsPage;
