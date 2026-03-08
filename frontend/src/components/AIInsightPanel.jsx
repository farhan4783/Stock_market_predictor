import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, Target, Activity } from 'lucide-react';

const AIInsightPanel = ({ ticker, predictions, metadata }) => {
    const [techData, setTechData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTech = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/technical-analysis?ticker=${ticker}`);
                setTechData(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchTech();
    }, [ticker]);

    if (!predictions || predictions.length === 0) return null;

    const currentPrice = techData?.current_price || predictions[0].price;
    const lastPred = predictions[predictions.length - 1];
    const prices = predictions.map(p => p.price);
    const maxTarget = Math.max(...prices);
    const minTarget = Math.min(...prices);

    const isBullish = lastPred.price > currentPrice;
    const changePct = lastPred.change_percent;

    // Generate dynamic insight paragraph
    const generateInsight = () => {
        if (!techData) return "Analyzing latest market patterns and executing neural models...";

        let sentiment = isBullish ? "bullish" : "bearish";
        let confidence = (metadata.test_mae < (currentPrice * 0.02)) ? "high confidence" : "moderate confidence";
        let rsiText = techData.rsi > 70 ? "overbought" : techData.rsi < 30 ? "oversold" : "neutral";

        return `NEUROSTOCK's LSTM engine projects a ${changePct > 0 ? 'gains' : 'correction'} of ${Math.abs(changePct).toFixed(2)}% over the selected window with ${confidence}. Technicals show RSI at ${techData.rsi} (${rsiText}), while MACD is ${techData.macd > 0 ? "positive" : "negative"}. The primary near-term resistance sits around $${techData.resistance}, with support holding at $${techData.support}. Overall AI synthesis indicates a ${sentiment} trajectory.`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-gradient-to-r from-indigo-900/30 via-purple-900/20 to-cyan-900/30 rounded-2xl p-6 border border-white/10 relative overflow-hidden my-6 glass-card"
        >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />

            <div className="flex items-start gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(188,19,254,0.4)]">
                    <Sparkles className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1">
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-purple-300 flex items-center gap-2">
                        NeuroAI Synthesis <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-white border border-white/20">Beta</span>
                    </h3>

                    <p className="text-gray-300 text-sm mt-3 leading-relaxed tracking-wide min-h-[4rem]">
                        {loading ? (
                            <span className="flex items-center gap-2 text-gray-500 animate-pulse">
                                <Activity className="w-4 h-4" /> Crunching technical indicators...
                            </span>
                        ) : generateInsight()}
                    </p>

                    {!loading && techData && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5 pt-5 border-t border-white/10">
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Signal</div>
                                <div className={`flex items-center gap-1 font-bold ${isBullish ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {isBullish ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    {isBullish ? 'BULLISH' : 'BEARISH'}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                                    <Target className="w-3 h-3" /> Target Range
                                </div>
                                <div className="text-white font-mono text-sm font-bold">
                                    ${minTarget.toFixed(2)} - ${maxTarget.toFixed(2)}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Support / Rest</div>
                                <div className="text-white font-mono text-sm">
                                    ${techData.support} / ${techData.resistance}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Model Error (MAE)</div>
                                <div className="text-white font-mono text-sm group relative">
                                    ${metadata.test_mae.toFixed(3)}
                                    <span className="absolute -top-7 left-0 bg-black text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                        Historical model mean absolute error
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default AIInsightPanel;
