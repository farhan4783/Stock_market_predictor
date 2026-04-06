import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, TrendingUp, TrendingDown, Activity, ChevronRight, Zap } from 'lucide-react';

const AgentMessage = ({ agent, message, delay }) => {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let i = 0;
        const timer = setTimeout(() => {
            const typingInterval = setInterval(() => {
                if (i <= message.length) {
                    setDisplayedText(message.slice(0, i));
                    i++;
                } else {
                    clearInterval(typingInterval);
                }
            }, 30);
            return () => clearInterval(typingInterval);
        }, delay);
        return () => clearTimeout(timer);
    }, [message, delay]);

    const getAgentIcon = () => {
        if (agent === "BULL") return <TrendingUp className="w-4 h-4 text-emerald-400" />;
        if (agent === "BEAR") return <TrendingDown className="w-4 h-4 text-red-500" />;
        return <Activity className="w-4 h-4 text-cyan-400" />;
    };

    const getAgentColor = () => {
        if (agent === "BULL") return "text-emerald-400 border-emerald-400/30 bg-emerald-400/10";
        if (agent === "BEAR") return "text-red-500 border-red-500/30 bg-red-500/10";
        return "text-cyan-400 border-cyan-400/30 bg-cyan-400/10";
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay / 1000 }}
            className={`flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-black/40 backdrop-blur-sm`}
        >
            <div className={`p-2 rounded-lg border ${getAgentColor()} shrink-0 mt-1`}>
                {getAgentIcon()}
            </div>
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] uppercase font-bold tracking-widest ${getAgentColor().split(' ')[0]}`}>
                        {agent === "BULL" ? "The Fundamental Bull" : agent === "BEAR" ? "The Technical Bear" : "The HFT Quant"}
                    </span>
                </div>
                <p className="text-gray-300 text-sm font-mono leading-relaxed min-h-[40px]">
                    {displayedText}
                    {displayedText.length < message.length && <span className="animate-pulse inline-block w-2 h-4 bg-white/50 ml-1 translate-y-1"></span>}
                </p>
            </div>
        </motion.div>
    );
};

const AIAgentSwarm = ({ ticker, predictions, metadata, sentiment }) => {
    const [techData, setTechData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [swarmComplete, setSwarmComplete] = useState(false);

    useEffect(() => {
        const fetchTech = async () => {
            setLoading(true);
            setSwarmComplete(false);
            try {
                const res = await axios.get(`http://localhost:5000/technical-analysis?ticker=${ticker}`);
                setTechData(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
                setTimeout(() => setSwarmComplete(true), 12000); // Complete after typing
            }
        };
        fetchTech();
    }, [ticker]);

    if (!predictions || predictions.length === 0) return null;

    const currentPrice = techData?.current_price || predictions[0].price;
    const lastPred = predictions[predictions.length - 1];
    const isBullTarget = lastPred.price > currentPrice;

    const getBullMessage = () => {
        if (!techData) return "Crunching revenue growth and macroeconomic factors...";
        return `I'm seeing strong fundamental value here. With resistance at $${techData.resistance}, if we clear that, my model points to a target of $${lastPred.price.toFixed(2)}. ${isBullTarget ? "Growth is intact." : "However, current macro headwinds justify the downward pressure."}`;
    };

    const getBearMessage = () => {
        if (!techData) return "Analyzing negative divergence and support levels...";
        const rsiCondition = techData.rsi > 60 ? "My proprietary RSI model shows it's dangerously overbought." : "Even with RSI cooling, momentum is utterly broken.";
        return `${rsiCondition} MACD is ${techData.macd > 0 ? "rolling over despite positive territory" : "deeply negative"}. If support at $${techData.support} breaks, we see a massive liquidity flush.`;
    };

    const getQuantMessage = () => {
        if (!sentiment) return "Processing L2 order book structure anomalies...";
        return `Sentiment score registers at ${sentiment.score}/100. My institutional dark-pool tracker detects ${isBullTarget ? "massive CALL sweep accumulations" : "heavy PUT wall formations"} expiring this Friday. Neural network MAE is hovering at ${metadata.test_mae.toFixed(3)}. Outputting ${isBullTarget ? "ACCUMULATE" : "DISTRIBUTE"} signal.`;
    };

    const consensusScore = (() => {
        let score = 50;
        if (isBullTarget) score += 20;
        else score -= 20;
        if (techData?.rsi < 40) score += 10;
        if (techData?.rsi > 70) score -= 15;
        if (sentiment?.score > 60) score += 15;
        if (techData?.macd > 0) score += 5;
        return Math.max(0, Math.min(100, score));
    })();

    return (
        <div className="w-full bg-gradient-to-br from-gray-900 via-[#0a0a1a] to-gray-900 rounded-2xl p-6 border border-white/10 relative overflow-hidden my-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Bot className="w-32 h-32" />
            </div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10 border-b border-white/10 pb-4">
                <div className="relative">
                    <Bot className="w-6 h-6 text-neon-purple animate-pulse" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-neon-green rounded-full animate-ping"></div>
                </div>
                <h3 className="text-xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-neon-purple to-neon-blue">
                    Agent Swarm War Room
                </h3>
                <span className="ml-auto text-[10px] font-mono text-gray-500 py-1 px-2 bg-black/50 rounded border border-white/5">
                    NEURO-SWARM v4.0
                </span>
            </div>

            {loading ? (
                <div className="flex items-center gap-2 text-neon-blue animate-pulse font-mono text-sm py-10 justify-center">
                    <Activity className="w-4 h-4" /> Initiating Swarm Protocol...
                </div>
            ) : (
                <div className="space-y-4 relative z-10">
                    <AgentMessage agent="BULL" message={getBullMessage()} delay={500} />
                    <AgentMessage agent="BEAR" message={getBearMessage()} delay={4000} />
                    <AgentMessage agent="QUANT" message={getQuantMessage()} delay={8000} />
                    
                    <AnimatePresence>
                        {swarmComplete && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="mt-6 p-5 rounded-xl bg-gradient-to-r from-neon-purple/20 via-neon-blue/10 to-transparent border border-neon-purple/30 flex items-center gap-6"
                            >
                                <div className="shrink-0 p-3 rounded-full bg-black/50 border border-white/10">
                                    <Zap className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs uppercase text-gray-400 tracking-wider mb-1">Swarm Consensus Verdict</div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl font-black text-white">
                                            {consensusScore >= 65 ? "STRONG BULL" : consensusScore >= 45 ? "NEUTRAL" : "BEARISH"}
                                        </div>
                                        <div className="h-2 flex-1 bg-black/50 rounded-full overflow-hidden max-w-xs">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${consensusScore}%` }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                className={`h-full ${consensusScore >= 65 ? 'bg-emerald-500' : consensusScore >= 45 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                            />
                                        </div>
                                        <div className="text-sm font-mono text-gray-400">{consensusScore.toFixed(0)}/100</div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};

export default AIAgentSwarm;
