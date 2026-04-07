import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FEED_EVENTS = [
    "[SEC] FORM 4 FILED: TSLA INSIDER SELL 150K SHARES",
    "[DARK_POOL] BLOCK TRADE EXECUTED 1.2M AAPL @ $174.40",
    "[NEWS] FLASH: FED CHAIR SIGNALS CAUTIOUS STANCE",
    "[ALG] MAE EXCEEDED ON MSFT NEURAL PREDICTION",
    "[HFT] LIQUIDITY SCARCITY IN NVDA OPTIONS CHAIN < 50DTE",
    "[SYS] NEURO-CORE RECALIBRATING RSI WEIGHTINGS",
    "[ALERT] UNUSUAL PUT ACTIVITY DETECTED SPY 500P",
    "[MACRO] VIX SPIKE > 2% IN LAST 15M",
    "[DATA] CRAWLER INGESTING 4.5M REDDIT SENTIMENT VECTORS",
    "[QUANT] DELTA NEUTRAL ARBITRAGE OPPORTUNITY FOUND IN BTC/ETH"
];

const RawDataStream = () => {
    const [feed, setFeed] = useState([]);

    useEffect(() => {
        // Hydrate initial feed
        const initFeed = [];
        for(let i=0; i<15; i++) {
            const timestamp = new Date(Date.now() - Math.random() * 10000).toISOString().split('T')[1].slice(0,-1);
            initFeed.push(`${timestamp} - ${FEED_EVENTS[Math.floor(Math.random() * FEED_EVENTS.length)]}`);
        }
        setFeed(initFeed);

        const interval = setInterval(() => {
            setFeed(prev => {
                const newFeed = [...prev];
                const timestamp = new Date().toISOString().split('T')[1].slice(0,-1);
                newFeed.push(`${timestamp} - DECIPHERED: ${FEED_EVENTS[Math.floor(Math.random() * FEED_EVENTS.length)]}`);
                if (newFeed.length > 50) newFeed.shift();
                return newFeed;
            });
        }, 800); // Super fast ingest rate

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-0 left-0 right-0 h-8 bg-black/90 border-t border-cyan-500/30 overflow-hidden flex items-center z-40 pointer-events-none shadow-[0_0_15px_rgba(0,243,255,0.2)]">
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 hidden md:block"></div>
            
            <div className="flex whitespace-nowrap animate-[marquee_40s_linear_infinite]">
                {feed.map((log, index) => (
                    <span 
                        key={index} 
                        className={`mx-4 font-mono text-[10px] tracking-wider ${
                            log.includes('DARK_POOL') ? 'text-purple-400' :
                            log.includes('ALERT') || log.includes('SELL') ? 'text-red-500' :
                            log.includes('HFT') || log.includes('DATA') ? 'text-cyan-400' :
                            'text-green-500'
                        }`}
                    >
                        {log}
                    </span>
                ))}
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 hidden md:block"></div>
        </div>
    );
};

export default RawDataStream;
