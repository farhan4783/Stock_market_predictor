import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Star, GitCompare, Home, GraduationCap, Briefcase, Newspaper, Filter, LayoutGrid, Menu, X, Activity, Globe2, Cpu, Layers } from 'lucide-react';
import { useWatchlist } from '../context/WatchlistContext';

const NavBar = () => {
    const { watchlist } = useWatchlist();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const links = [
        { to: '/', label: 'Home', icon: Home },
        { to: '/portfolio', label: 'Portfolio', icon: Briefcase },
        { to: '/watchlist', label: 'Watchlist', icon: Star, badge: watchlist.length },
        { to: '/news', label: 'News', icon: Newspaper },
        { to: '/screener', label: 'Screener', icon: Filter },
        { to: '/heatmap', label: 'Heatmap', icon: LayoutGrid },
        { to: '/compare', label: 'Compare', icon: GitCompare },
        { to: '/strategy', label: 'Strategy', icon: Activity },
        { to: '/options', label: 'Options', icon: Layers },
        { to: '/bot', label: 'Trade Bot', icon: Cpu },
        { to: '/learner', label: 'Learn', icon: GraduationCap },
        { to: '/global', label: 'Global', icon: Globe2 },
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

                {/* Desktop Nav Links */}
                <div className="hidden lg:flex items-center gap-1">
                    {links.map(({ to, label, icon: Icon, badge }) => {
                        const isActive = to === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(to);
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
                                    <span>{label}</span>
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

                {/* Mobile Menu Toggle */}
                <button
                    className="lg:hidden p-2 text-gray-400 hover:text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Nav Dropdown */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-black/95 backdrop-blur-3xl border-b border-white/5 overflow-hidden"
                    >
                        <div className="px-4 py-4 flex flex-col gap-2">
                            {links.map(({ to, label, icon: Icon, badge }) => {
                                const isActive = to === '/'
                                    ? location.pathname === '/'
                                    : location.pathname.startsWith(to);
                                return (
                                    <Link key={to} to={to} onClick={() => setIsMobileMenuOpen(false)}>
                                        <div className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-cyan-500/10 text-cyan-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-5 h-5" />
                                                <span className="font-bold">{label}</span>
                                            </div>
                                            {badge > 0 && (
                                                <span className="bg-cyan-400 text-black text-xs font-black px-2 py-0.5 rounded-full">
                                                    {badge}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default NavBar;
