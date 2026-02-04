import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, Download, Sun, Moon, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const CommandPalette = ({ isOpen, onClose, onSearch, onExportCSV }) => {
    const [query, setQuery] = useState('');
    const inputRef = useRef(null);
    const { theme, toggleTheme } = useTheme();

    const commands = [
        {
            id: 'search',
            label: 'Search Stock',
            icon: Search,
            action: () => {
                if (query) {
                    onSearch(query.toUpperCase());
                    onClose();
                }
            },
            shortcut: '↵'
        },
        {
            id: 'export',
            label: 'Export to CSV',
            icon: Download,
            action: () => {
                onExportCSV();
                onClose();
            },
            shortcut: 'E'
        },
        {
            id: 'theme',
            label: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
            icon: theme === 'dark' ? Sun : Moon,
            action: () => {
                toggleTheme();
                onClose();
            },
            shortcut: 'T'
        }
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-32"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: -20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: -20 }}
                    className="w-full max-w-2xl bg-dark-card/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Search Input */}
                    <div className="flex items-center gap-3 p-4 border-b border-white/10">
                        <Search className="w-5 h-5 text-gray-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Type a command or search..."
                            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
                        />
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Commands List */}
                    <div className="max-h-96 overflow-y-auto p-2">
                        {filteredCommands.length > 0 ? (
                            filteredCommands.map((cmd) => (
                                <motion.button
                                    key={cmd.id}
                                    onClick={cmd.action}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors group"
                                    whileHover={{ x: 4 }}
                                >
                                    <cmd.icon className="w-5 h-5 text-neon-blue group-hover:text-neon-purple transition-colors" />
                                    <span className="flex-1 text-left text-white">{cmd.label}</span>
                                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">
                                        {cmd.shortcut}
                                    </span>
                                </motion.button>
                            ))
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No commands found
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-500">
                        <div className="flex gap-4">
                            <span><kbd className="bg-white/5 px-2 py-1 rounded">↵</kbd> to select</span>
                            <span><kbd className="bg-white/5 px-2 py-1 rounded">ESC</kbd> to close</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CommandPalette;
