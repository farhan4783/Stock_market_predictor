import { createContext, useContext, useState, useEffect } from 'react';

const WatchlistContext = createContext();

export const WatchlistProvider = ({ children }) => {
    const [watchlist, setWatchlist] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('neurostock-watchlist') || '[]');
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('neurostock-watchlist', JSON.stringify(watchlist));
    }, [watchlist]);

    const addToWatchlist = (ticker) => {
        setWatchlist(prev => prev.includes(ticker) ? prev : [...prev, ticker]);
    };

    const removeFromWatchlist = (ticker) => {
        setWatchlist(prev => prev.filter(t => t !== ticker));
    };

    const isInWatchlist = (ticker) => watchlist.includes(ticker);

    return (
        <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}>
            {children}
        </WatchlistContext.Provider>
    );
};

export const useWatchlist = () => useContext(WatchlistContext);
