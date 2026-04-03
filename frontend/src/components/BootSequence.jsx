import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const BootSequence = ({ onComplete }) => {
    const [lines, setLines] = useState([]);
    const [progress, setProgress] = useState(0);

    const bootMessages = [
        "INITIALIZING NEURO-CORE...",
        "LOADING GLOBAL MARKET HASH TABLES [■■■■■     ]",
        "ESTABLISHING SECURE WEBSOCKET CONNECTIONS...",
        "DECRYPTING INSTITUTIONAL ORDER FLOW...",
        "CALIBRATING LSTM PREDICTION MODELS...",
        "VERIFYING SENTIMENT ANALYSIS ENGINE [■■■■■■■■■■]",
        "SYSTEM ONLINE. WELCOME TO NEUROSTOCK."
    ];

    useEffect(() => {
        let currentLine = 0;
        
        const typeNextLine = () => {
            if (currentLine < bootMessages.length) {
                setLines(prev => [...prev, bootMessages[currentLine]]);
                setProgress(Math.floor(((currentLine + 1) / bootMessages.length) * 100));
                currentLine++;
                
                // Random delay between 100ms and 400ms for realistic terminal feel
                const delay = Math.random() * 300 + 100;
                setTimeout(typeNextLine, delay);
            } else {
                // Done loading
                setTimeout(() => {
                    onComplete();
                }, 800);
            }
        };

        const timer = setTimeout(typeNextLine, 300);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] bg-black text-[#00f3ff] font-mono p-8 flex flex-col justify-center items-center overflow-hidden"
        >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-[#000] to-[#000] pointer-events-none" />
            
            {/* Scanline overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 mix-blend-overlay"></div>

            <div className="max-w-3xl w-full relative z-10">
                <div className="flex items-center gap-4 mb-8 border-b border-[#00f3ff]/30 pb-4">
                    <div className="w-12 h-12 bg-[#00f3ff]/10 border border-[#00f3ff]/50 rounded text-center flex justify-center items-center animate-pulse">
                        <span className="text-xl font-bold">NS</span>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-widest text-white shadow-[0_0_10px_#00f3ff]">NEUROSTOCK OS v3.0.0</h1>
                        <p className="text-xs text-[#00f3ff]/70">[SECURE ENCLAVE ACTIVE]</p>
                    </div>
                </div>

                <div className="space-y-2 mb-8 min-h-[200px]">
                    {lines.map((line, i) => (
                        <div key={i} className="flex gap-4">
                            <span className="text-white/30">[{new Date().toISOString().split('T')[1].slice(0, 8)}]</span>
                            <span className={i === bootMessages.length - 1 ? 'text-green-400 font-bold' : ''}>
                                {line}
                            </span>
                        </div>
                    ))}
                    {lines.length < bootMessages.length && (
                        <div className="flex gap-4">
                            <span className="text-white/30">[{new Date().toISOString().split('T')[1].slice(0, 8)}]</span>
                            <span className="w-3 h-5 bg-[#00f3ff] animate-pulse"></span>
                        </div>
                    )}
                </div>

                <div className="w-full h-1 bg-white/10 rounded overflow-hidden">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-[#00f3ff] to-[#f300ff]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.2 }}
                    />
                </div>
                <div className="text-right mt-2 text-xs text-[#00f3ff]/50">
                    LOAD {progress}%
                </div>
            </div>
        </motion.div>
    );
};

export default BootSequence;
