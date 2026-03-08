import { createContext, useContext, useState, useEffect } from 'react';

const PortfolioContext = createContext();

export const PortfolioProvider = ({ children }) => {
    const [holdings, setHoldings] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('neurostock-portfolio') || '[]');
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('neurostock-portfolio', JSON.stringify(holdings));
    }, [holdings]);

    const addHolding = (ticker, shares, avgBuy) => {
        setHoldings(prev => {
            const existing = prev.find(h => h.ticker === ticker);
            if (existing) {
                // Update existing holding (weighted average)
                const totalShares = existing.shares + shares;
                const totalCost = (existing.shares * existing.avgBuy) + (shares * avgBuy);
                const newAvg = totalCost / totalShares;
                return prev.map(h => h.ticker === ticker ? { ...h, shares: totalShares, avgBuy: newAvg } : h);
            }
            return [...prev, { ticker, shares, avgBuy }];
        });
    };

    const removeHolding = (ticker) => {
        setHoldings(prev => prev.filter(h => h.ticker !== ticker));
    };

    return (
        <PortfolioContext.Provider value={{ holdings, addHolding, removeHolding }}>
            {children}
        </PortfolioContext.Provider>
    );
};

export const usePortfolio = () => useContext(PortfolioContext);
