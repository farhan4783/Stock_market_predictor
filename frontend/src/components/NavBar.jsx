import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Star, GitCompare, Home } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

const NavBar = () => {
    const { watchlist } = useWatchlist();
    const location = useLocation();

    const links = [
        { to: '/', label: 'Home', icon: Home },
        { to: '/watchlist', label: 'Watchlist', icon: Star, badge: watchlist.length },
        { to: '/compare', label: 'Compare', icon: GitCompare },
    ];

    return (
        <motion.nav
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/5"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <TrendingUp className="w-5 h-5 text-cyan-400 group-hover:text-white transition-colors" />
                    <span className="font-bold text-lg tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
                        NEUROSTOCK
                    </span>
                </Link>

                {/* Nav Links */}
                <div className="flex items-center gap-1">
                    {links.map(({ to, label, icon: Icon, badge }) => {
                        const isActive = location.pathname === to;
                        return (
                            <Link key={to} to={to}>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                    ${isActive
                                            ? 'bg-cyan-400/15 text-cyan-400 shadow-[0_0_10px_rgba(0,243,255,0.15)]'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{label}</span>
                                    {badge > 0 && (
                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-400 text-black text-[9px] font-black rounded-full flex items-center justify-center shadow-[0_0_6px_#00f3ff]">
                                            {badge > 9 ? '9+' : badge}
                                        </span>
                                    )}
                                </motion.div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </motion.nav>
    );
};

export default NavBar;
