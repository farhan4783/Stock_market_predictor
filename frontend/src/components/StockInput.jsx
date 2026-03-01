import { useState } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

const POPULAR = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN'];

const StockInput = ({ onSearch, loading, inputRef }) => {
    const [ticker, setTicker] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (ticker.trim()) {
            onSearch(ticker.toUpperCase());
        }
    };

    const handlePill = (sym) => {
        setTicker(sym);
        onSearch(sym);
    };

    return (
        <div className="w-full max-w-lg mx-auto mb-6">
            <form onSubmit={handleSubmit} className="relative">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative group"
                >
                    <div className="absolute inset-0 bg-neon-blue opacity-20 blur-xl rounded-full group-hover:opacity-40 transition-opacity duration-300" />
                    <div className="relative flex items-center bg-dark-card backdrop-blur-md border border-white/10 rounded-full px-6 py-4 shadow-lg focus-within:border-neon-blue focus-within:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all duration-300">
                        <Search className="w-6 h-6 text-gray-400 group-focus-within:text-neon-blue transition-colors shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={ticker}
                            onChange={(e) => setTicker(e.target.value)}
                            placeholder="Enter Stock Ticker (e.g., AAPL)"
                            className="w-full bg-transparent border-none outline-none text-white text-lg ml-4 placeholder-gray-500 uppercase font-mono tracking-wider"
                            disabled={loading}
                        />
                        {loading && (
                            <div className="w-5 h-5 border-2 border-neon-blue border-t-transparent rounded-full animate-spin ml-2 shrink-0" />
                        )}
                    </div>
                </motion.div>
            </form>

            {/* Quick-select pills */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex justify-center gap-2 mt-3 flex-wrap"
            >
                {POPULAR.map(sym => (
                    <motion.button
                        key={sym}
                        onClick={() => handlePill(sym)}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.93 }}
                        disabled={loading}
                        className="px-3 py-1 text-xs font-bold font-mono rounded-full border border-white/10 bg-white/5 text-gray-300 hover:border-neon-blue/50 hover:text-neon-blue hover:bg-neon-blue/5 hover:shadow-[0_0_8px_rgba(0,243,255,0.2)] transition-all duration-200"
                    >
                        {sym}
                    </motion.button>
                ))}
            </motion.div>
        </div>
    );
};

export default StockInput;
