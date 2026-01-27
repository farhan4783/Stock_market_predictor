import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Background from './components/Background';
import StockInput from './components/StockInput';
import StatsCard from './components/StatsCard';
import PredictionChart from './components/PredictionChart';
import { TrendingUp, DollarSign, Activity, AlertCircle } from 'lucide-react';

function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(7);

  const handleSearch = async (ticker) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await axios.post('http://localhost:5000/predict', {
        ticker: ticker,
        days: days
      });
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to fetch prediction. Ensure model is trained.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-neon-blue selection:text-black relative overflow-hidden">
      <Background />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue via-white to-neon-purple drop-shadow-[0_0_15px_rgba(0,243,255,0.5)] mb-4">
            NEUROSTOCK
          </h1>
          <p className="text-gray-400 text-lg uppercase tracking-[0.3em] font-light">
            AI-Powered Market Intelligence
          </p>
        </motion.div>

        <StockInput onSearch={handleSearch} loading={loading} />

        <div className="flex justify-center mb-8 gap-4">
          {[3, 7, 14, 30].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-full border border-white/10 text-sm transition-all duration-300 ${days === d ? 'bg-neon-blue text-black font-bold shadow-[0_0_10px_#00f3ff]' : 'bg-transparent text-gray-400 hover:text-white hover:border-white/30'}`}
            >
              {d} Days
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-center gap-3"
            >
              <AlertCircle />
              <span>{error}</span>
            </motion.div>
          )}

          {data && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-6xl mx-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatsCard
                  label="Current Price"
                  value={`$${data.current_price.toFixed(2)}`}
                  icon={DollarSign}
                  delay={0.1}
                />
                <StatsCard
                  label="Predicted Change"
                  value={`${data.predictions[data.predictions.length - 1].change_percent.toFixed(2)}%`}
                  change={data.predictions[data.predictions.length - 1].change_percent}
                  icon={TrendingUp} // Logic to swap icon could be added
                  delay={0.2}
                />
                <StatsCard
                  label="Model Accuracy (MAE)"
                  value={data.metadata.test_mae.toFixed(4)}
                  subValue={`Based on ${data.metadata.sequence_length} days`}
                  icon={Activity}
                  delay={0.3}
                />
              </div>

              <PredictionChart data={data.historical} predictions={data.predictions} />

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-dark-card/30 rounded-xl p-6 border border-white/5">
                  <h3 className="text-neon-blue font-bold mb-4 uppercase tracking-wider text-sm">Prediction Details</h3>
                  <div className="space-y-3">
                    {data.predictions.map((pred, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <span className="text-gray-400 font-mono">{pred.date}</span>
                        <span className="text-white font-bold">${pred.price.toFixed(2)}</span>
                        <span className={`text-xs ${pred.change_percent >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                          {pred.change_percent >= 0 ? '+' : ''}{pred.change_percent.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-dark-card/30 rounded-xl p-6 border border-white/5">
                  <h3 className="text-neon-purple font-bold mb-4 uppercase tracking-wider text-sm">Model Insights</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    This prediction is generated using a Long Short-Term Memory (LSTM) neural network, trained on historical data.
                    The model analyzes patterns over the last {data.metadata.sequence_length} days to forecast future trends.
                    <br /><br />
                    <span className="text-white/50 text-xs">Note: Predictions are for educational purposes only.</span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
