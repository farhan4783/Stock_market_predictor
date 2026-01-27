import { useState } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

const StockInput = ({ onSearch, loading }) => {
    const [ticker, setTicker] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (ticker.trim()) {
            onSearch(ticker.toUpperCase());
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative w-full max-w-md mx-auto mb-8">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative group"
            >
                <div className="absolute inset-0 bg-neon-blue opacity-20 blur-xl rounded-full group-hover:opacity-40 transition-opacity duration-300"></div>
                <div className="relative flex items-center bg-dark-card backdrop-blur-md border border-white/10 rounded-full px-6 py-4 shadow-lg focus-within:border-neon-blue focus-within:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all duration-300">
                    <Search className="w-6 h-6 text-gray-400 group-focus-within:text-neon-blue transition-colors" />
                    <input
                        type="text"
                        value={ticker}
                        onChange={(e) => setTicker(e.target.value)}
                        placeholder="Enter Stock Ticker (e.g., AAPL)"
                        className="w-full bg-transparent border-none outline-none text-white text-lg ml-4 placeholder-gray-500 uppercase font-mono tracking-wider"
                        disabled={loading}
                    />
                    {loading && (
                        <div className="w-5 h-5 border-2 border-neon-blue border-t-transparent rounded-full animate-spin ml-2"></div>
                    )}
                </div>
            </motion.div>
        </form>
    );
};

export default StockInput;
