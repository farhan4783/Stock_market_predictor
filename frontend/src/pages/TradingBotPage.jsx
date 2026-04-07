import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Square, Settings, Cpu, Zap, Link2, Box, ArrowRight, ShieldAlert, CheckCircle } from 'lucide-react';
import Background from '../components/Background';
import ThemeToggle from '../components/ThemeToggle';

const LOGIC_NODES = [
    { id: 'n1', type: 'CONDITION', label: 'IF RSI < 30', color: 'bg-cyan-500', glow: 'shadow-cyan-500/50' },
    { id: 'n2', type: 'CONDITION', label: 'IF MACD > SIGNAL', color: 'bg-purple-500', glow: 'shadow-purple-500/50' },
    { id: 'n3', type: 'ACTION', label: 'EXECUTE BUY ($10K)', color: 'bg-emerald-500', glow: 'shadow-emerald-500/50' },
    { id: 'n4', type: 'ACTION', label: 'CLOSE POSITION', color: 'bg-red-500', glow: 'shadow-red-500/50' },
    { id: 'n5', type: 'SAFETY', label: 'STOP LOSS @ -5%', color: 'bg-yellow-500', glow: 'shadow-yellow-500/50' },
    { id: 'n6', type: 'DATA', label: 'INGEST TWITTER API', color: 'bg-blue-500', glow: 'shadow-blue-500/50' },
];

export default function TradingBotPage() {
    const [isRunning, setIsRunning] = useState(false);
    const [pipeline, setPipeline] = useState([]);
    const [deployStatus, setDeployStatus] = useState('OFFLINE');

    const handleNodeDrop = (node) => {
        if (pipeline.length >= 5) return;
        setPipeline([...pipeline, node]);
    };

    const removeFromPipeline = (index) => {
        setPipeline(pipeline.filter((_, i) => i !== index));
    };

    const toggleBot = () => {
        if (isRunning) {
            setIsRunning(false);
            setDeployStatus('OFFLINE');
        } else {
            setIsRunning(true);
            setDeployStatus('COMPILING...');
            setTimeout(() => setDeployStatus('DEPLOYED'), 2000);
        }
    };

    return (
        <div className="min-h-screen text-white font-sans selection:bg-cyan-500/30 overflow-hidden relative">
            <Background />
            <ThemeToggle />

            <div className="pt-24 pb-12 px-4 container mx-auto relative z-10 flex flex-col h-screen">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end mb-8 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 uppercase mb-2 drop-shadow-[0_0_15px_rgba(0,243,255,0.4)] flex items-center gap-3">
                            <Cpu className="w-8 h-8 text-cyan-400" />
                            Visual Algorithm Builder
                        </h1>
                        <p className="text-gray-400 font-mono tracking-widest text-sm uppercase">Quantum Neural Bot Configuration</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded border font-mono text-xs font-bold ${
                            deployStatus === 'OFFLINE' ? 'bg-gray-500/10 border-gray-500/30 text-gray-400' :
                            deployStatus === 'COMPILING...' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400 animate-pulse' :
                            'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        }`}>
                            STATUS: {deployStatus}
                        </div>

                        <button
                            onClick={toggleBot}
                            disabled={pipeline.length === 0 && !isRunning}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-black tracking-widest transition-all shadow-lg ${
                                isRunning 
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]' 
                                    : pipeline.length === 0 
                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5' 
                                        : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30 hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]'
                            }`}
                        >
                            {isRunning ? <><Square className="w-5 h-5 fill-current" /> HALT BOT</> : <><Play className="w-5 h-5 fill-current" /> DEPLOY TO MAINNET</>}
                        </button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
                    {/* Node Palette */}
                    <div className="lg:col-span-1 bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Box className="w-32 h-32" />
                        </div>
                        <h3 className="text-cyan-400 font-bold mb-6 font-mono text-xs uppercase tracking-widest flex items-center gap-2 border-b border-white/10 pb-4">
                            <Zap className="w-4 h-4" /> Available Logic Nodes
                        </h3>
                        
                        <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            {LOGIC_NODES.map(node => (
                                <motion.div 
                                    key={node.id}
                                    drag
                                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                                    dragElastic={0.8}
                                    dragSnapToOrigin={true}
                                    onDragEnd={(_, info) => {
                                        if (info.offset.x > 100) handleNodeDrop(node);
                                    }}
                                    className={`relative z-50 cursor-grab active:cursor-grabbing p-4 rounded-xl border border-white/20 bg-black/80 backdrop-blur-md shadow-lg ${node.glow}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${node.color} shadow-[0_0_10px_currentColor]`} />
                                        <div>
                                            <div className="text-[10px] text-gray-400 font-mono mb-1">{node.type}</div>
                                            <div className="text-sm font-bold tracking-wide">{node.label}</div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10 text-center text-xs text-gray-500 font-mono animate-pulse">
                            DRAG NODES RIGHT TO BUILD PIPELINE &rarr;
                        </div>
                    </div>

                    {/* Logic Pipeline Canvas */}
                    <div className="lg:col-span-3 bg-[#020205] border border-white/10 rounded-2xl p-8 relative overflow-hidden flex flex-col">
                        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
                        
                        {/* Terminal Decoration */}
                        <div className="absolute top-4 right-4 text-[10px] text-gray-600 font-mono text-right pointer-events-none">
                            NEURO-CORE PIPELINE COMPILER<br/>
                            MEM_ALLOC: 4096MB<br/>
                            THREADS: 128
                        </div>

                        <h3 className="text-purple-400 font-bold mb-8 font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                            <Link2 className="w-4 h-4" /> Execution Pipeline Canvas
                        </h3>

                        {pipeline.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-600 font-mono border-2 border-dashed border-white/10 rounded-2xl mx-8 my-4 bg-white/[0.02]">
                                <Settings className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg uppercase tracking-widest">Pipeline Empty</p>
                                <p className="text-xs mt-2 opacity-50">Drag nodes here to assemble algorithmic strategy</p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col justify-center items-center gap-6 z-10 relative">
                                <AnimatePresence>
                                    {pipeline.map((node, index) => (
                                        <motion.div 
                                            key={`${node.id}-${index}`}
                                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
                                            className="relative flex flex-col items-center"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div 
                                                    className={`w-64 p-5 rounded-xl border border-white/20 bg-black/90 backdrop-blur-xl shadow-xl flex items-center gap-4 group ${
                                                        isRunning ? `border-${node.color.split('-')[1]}-500 shadow-[0_0_30px_rgba(currentColor)] animate-pulse` : ''
                                                    }`}
                                                >
                                                    <div className={`w-4 h-4 rounded-full ${node.color} shadow-[0_0_15px_currentColor] shrink-0`} />
                                                    <div className="flex-1 font-bold tracking-wide">{node.label}</div>
                                                    
                                                    {!isRunning && (
                                                        <button onClick={() => removeFromPipeline(index)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-500 transition-colors">
                                                            ✕
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Connector line */}
                                            {index < pipeline.length - 1 && (
                                                <div className="relative h-12 w-[2px] bg-white/10 my-2">
                                                    {isRunning && (
                                                        <motion.div 
                                                            className="absolute top-0 w-full h-1/2 bg-cyan-400 rounded-full shadow-[0_0_10px_#00f3ff]"
                                                            animate={{ top: ['0%', '100%'] }}
                                                            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Execution Socket at Bottom */}
                                <motion.div 
                                    className={`mt-6 flex flex-col items-center justify-center p-4 rounded-full border-2 border-dashed ${
                                        isRunning ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10'
                                    }`}
                                >
                                    {isRunning ? <CheckCircle className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" /> : <ShieldAlert className="w-8 h-8 text-gray-600" />}
                                </motion.div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Ambient Background Glow */}
            <div className={`absolute inset-x-0 bottom-0 h-96 pointer-events-none z-0 transition-opacity duration-1000 ${
                isRunning ? 'opacity-30' : 'opacity-0'
            }`}>
                <div className="absolute inset-0 bg-gradient-to-t from-cyan-900 via-transparent to-transparent"></div>
            </div>
        </div>
    );
}
