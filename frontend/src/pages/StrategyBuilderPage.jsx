import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Play, Activity, CheckCircle2, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const INITIAL_BUY_RULES = [{ col: 'RSI', op: '<', val: '30' }];
const INITIAL_SELL_RULES = [{ col: 'RSI', op: '>', val: '70' }];

export default function StrategyBuilderPage() {
  const [ticker, setTicker] = useState('AAPL');
  const [initialCapital, setInitialCapital] = useState('10000');
  const [buyRules, setBuyRules] = useState(INITIAL_BUY_RULES);
  const [sellRules, setSellRules] = useState(INITIAL_SELL_RULES);
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAddRule = (setter) => {
    setter(prev => [...prev, { col: 'RSI', op: '<', val: '50' }]);
  };

  const handleRemoveRule = (setter, index) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  const handleRuleChange = (setter, index, field, value) => {
    setter(prev => {
      const newRules = [...prev];
      newRules[index][field] = value;
      return newRules;
    });
  };

  const runBacktest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post('http://localhost:5000/backtest-strategy', {
        ticker: ticker.toUpperCase(),
        initial_capital: parseFloat(initialCapital),
        buy_rules: buyRules,
        sell_rules: sellRules
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to run backtest. Check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const renderRuleGroup = (title, rules, setter, colorClass) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-1 h-full ${colorClass}`} />
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
          {title}
        </h3>
        <button 
          onClick={() => handleAddRule(setter)}
          className="text-xs bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3 h-3" /> Add Rule
        </button>
      </div>

      <div className="space-y-3">
        {rules.length === 0 && (
          <p className="text-gray-500 text-sm italic">No rules defined. Will skip this action.</p>
        )}
        <AnimatePresence>
          {rules.map((rule, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex items-center gap-2"
            >
              <select 
                value={rule.col} 
                onChange={e => handleRuleChange(setter, idx, 'col', e.target.value)}
                className="bg-black/40 border border-white/10 text-white text-sm rounded-lg px-3 py-2 flex-1 focus:outline-none focus:border-neon-blue"
              >
                <option value="RSI">RSI</option>
                <option value="MACD">MACD</option>
                <option value="SMA20">SMA 20</option>
                <option value="SMA50">SMA 50</option>
              </select>
              <select 
                value={rule.op} 
                onChange={e => handleRuleChange(setter, idx, 'op', e.target.value)}
                className="bg-black/40 border border-white/10 text-white text-sm rounded-lg px-2 py-2 focus:outline-none focus:border-neon-blue w-[60px]"
              >
                <option value="<">{'<'}</option>
                <option value=">">{'>'}</option>
              </select>
              <input 
                type="number" 
                value={rule.val}
                onChange={e => handleRuleChange(setter, idx, 'val', e.target.value)}
                className="bg-black/40 border border-white/10 text-white text-sm rounded-lg px-3 py-2 flex-1 focus:outline-none focus:border-neon-blue"
                placeholder="Value"
              />
              <button 
                onClick={() => handleRemoveRule(setter, idx)}
                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                title="Remove Rule"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-purple to-neon-blue mb-2">
            Algorithmic Lab
          </h1>
          <p className="text-gray-400">Design technical trading strategies and backtest them instantly.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Controls sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-dark-card/50 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                <Activity className="text-neon-blue" />
                Strategy Parameters
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Target Ticker</label>
                  <input 
                    type="text" 
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    className="w-full bg-black/40 border border-white/10 text-white font-mono text-lg rounded-lg px-4 py-3 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                    placeholder="e.g. AAPL"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Initial Capital ($)</label>
                  <input 
                    type="number" 
                    value={initialCapital}
                    onChange={(e) => setInitialCapital(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 text-emerald-400 font-mono text-lg rounded-lg px-4 py-3 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue transition-all"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {renderRuleGroup("Buy Rules (AND)", buyRules, setBuyRules, "bg-emerald-500")}
                {renderRuleGroup("Sell Rules (AND)", sellRules, setSellRules, "bg-red-500")}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={runBacktest}
                disabled={loading || !ticker}
                className="w-full mt-6 bg-gradient-to-r from-neon-blue to-neon-purple text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-black" />}
                {loading ? 'Simulating 1 Year...' : 'Run Backtest'}
              </motion.button>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-red-200 flex items-start gap-3 mb-6"
                >
                  <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-400 mb-1">Backtest Failed</h3>
                    <p className="text-sm opacity-80">{error}</p>
                  </div>
                </motion.div>
              )}

              {!result && !loading && !error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-gray-500 min-h-[400px] border border-dashed border-white/10 rounded-xl"
                >
                  <Activity className="w-16 h-16 mb-4 opacity-50" />
                  <p>Configure your strategy and run a backtest to view results.</p>
                </motion.div>
              )}

              {loading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col items-center justify-center min-h-[400px]"
                >
                  <div className="w-16 h-16 border-4 border-neon-blue/20 border-t-neon-blue rounded-full animate-spin mb-4" />
                  <p className="text-neon-blue animate-pulse font-mono flex gap-2">
                    Crunching historical data...
                  </p>
                </motion.div>
              )}

              {result && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-dark-card/50 border border-white/10 rounded-xl p-5 flex flex-col justify-center items-center text-center relative overflow-hidden">
                      <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Total Return (ROI)</div>
                      <div className={`text-4xl font-bold font-mono ${result.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {result.roi > 0 ? '+' : ''}{result.roi}%
                      </div>
                      <TrendingUp className={`absolute -bottom-4 -right-4 w-20 h-20 opacity-5 ${result.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
                    </div>
                    <div className="bg-dark-card/50 border border-white/10 rounded-xl p-5 flex flex-col justify-center items-center text-center">
                      <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Final Value</div>
                      <div className="text-3xl font-bold font-mono text-white">
                        ${result.final.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-dark-card/50 border border-white/10 rounded-xl p-5 flex flex-col justify-center items-center text-center">
                      <div className="text-gray-400 text-xs uppercase tracking-wider mb-2">Total Trades</div>
                      <div className="text-3xl font-bold font-mono text-neon-blue">
                        {result.total_trades}
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="bg-dark-card/50 border border-white/10 rounded-xl p-6 h-[400px]">
                    <h3 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Portfolio Growth (1Y)</h3>
                    <ResponsiveContainer width="100%" height="85%">
                      <AreaChart data={result.timeline}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={result.roi >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={result.roi >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#ffffff50" 
                          tick={{ fill: '#ffffff50', fontSize: 12 }}
                          tickFormatter={val => val.split('-').slice(1).join('/')}
                          minTickGap={30}
                        />
                        <YAxis 
                          domain={['auto', 'auto']} 
                          stroke="#ffffff50" 
                          tick={{ fill: '#ffffff50', fontSize: 12 }}
                          tickFormatter={val => `$${val/1000}k`}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#000000d0', borderColor: '#ffffff20', borderRadius: '8px', color: '#fff' }}
                          formatter={(value) => [`$${value.toFixed(2)}`, 'Portfolio Value']}
                          labelStyle={{ color: '#00f3ff' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke={result.roi >= 0 ? '#10b981' : '#ef4444'} 
                          strokeWidth={2}
                          fillOpacity={1} 
                          fill="url(#colorValue)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Trade Log */}
                  {result.trades && result.trades.length > 0 && (
                    <div className="bg-dark-card/50 border border-white/10 rounded-xl p-6">
                      <h3 className="font-bold text-white mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-neon-blue" />
                        Trade Execution Log
                      </h3>
                      <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-gray-400 uppercase bg-white/5 sticky top-0 backdrop-blur-md">
                            <tr>
                              <th className="px-4 py-3 rounded-tl-lg">Date</th>
                              <th className="px-4 py-3">Action</th>
                              <th className="px-4 py-3 text-right">Price</th>
                              <th className="px-4 py-3 text-right rounded-tr-lg">Value</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.trades.map((trade, idx) => (
                              <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="px-4 py-3 font-mono text-gray-300">{trade.date}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${trade.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {trade.type}
                                  </span>
                                </td>
                                <td className="px-4 py-3 font-mono text-right text-gray-300">${trade.price.toFixed(2)}</td>
                                <td className="px-4 py-3 font-mono text-right text-white">${trade.value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
