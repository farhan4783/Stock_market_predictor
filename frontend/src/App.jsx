import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Background from './components/Background';
import StockInput from './components/StockInput';
import StatsCard from './components/StatsCard';
import PredictionChart from './components/PredictionChart';
import SentimentGauge from './components/SentimentGauge';
import ThemeToggle from './components/ThemeToggle';
import CommandPalette from './components/CommandPalette';
import LoadingSkeleton from './components/LoadingSkeleton';
import LearnerDashboard from './pages/Learner/LearnerDashboard';
import ModulePage from './pages/Learner/ModulePage';
import LessonPage from './pages/Learner/LessonPage';
import QuizPage from './pages/Learner/QuizPage';
import { TrendingUp, DollarSign, Activity, AlertCircle, Download, GraduationCap } from 'lucide-react';
import { exportPredictionsToCSV, exportHistoricalToCSV } from './utils/exportCSV';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Link } from 'react-router-dom';

function HomePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(7);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    '/': () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    },
    'ctrl+k': () => {
      setCommandPaletteOpen(true);
    }
  });

  const handleSearch = async (ticker) => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      const [predRes, sentRes] = await Promise.all([
        axios.post('http://localhost:5000/predict', { ticker: ticker, days: days }),
        axios.post('http://localhost:5000/sentiment', { ticker: ticker })
      ]);

      setData(predRes.data);
      setSentiment(sentRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to fetch prediction. Ensure model is trained.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (data) {
      exportPredictionsToCSV(data, data.ticker);
      exportHistoricalToCSV(data.historical, data.ticker);
    }
  };


  return (
    <div className="min-h-screen text-white dark:text-white light:text-gray-900 font-sans selection:bg-neon-blue selection:text-black relative overflow-hidden">
      <Background />
      <ThemeToggle />
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSearch={handleSearch}
        onExportCSV={handleExportCSV}
      />

      <div className="container mx-auto px-4 py-12 relative z-10">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12">

          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue via-white to-neon-purple drop-shadow-[0_0_15px_rgba(0,243,255,0.5)] mb-4">
            NEUROSTOCK
          </h1>
          <p className="text-gray-400 text-lg uppercase tracking-[0.3em] font-light">
            AI-Powered Market Intelligence
          </p>

          {/* Learner Button */}
          <Link to="/learner">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white font-bold shadow-lg hover:shadow-green-500/50 transition-all"
            >
              <GraduationCap className="w-5 h-5" />
              Learn Stock Market
            </motion.button>
          </Link>
        </motion.div>

        <StockInput onSearch={handleSearch} loading={loading} inputRef={searchInputRef} />

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
          {loading && <LoadingSkeleton />}

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

          {data && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-6xl mx-auto"
            >
              {/* Export Button */}
              <div className="flex justify-end mb-4">
                <motion.button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-neon-blue/10 hover:bg-neon-blue/20 border border-neon-blue/30 rounded-lg text-neon-blue transition-all duration-300 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-4 h-4 group-hover:animate-bounce" />
                  <span className="font-medium">Export to CSV</span>
                </motion.button>
              </div>

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
                  icon={TrendingUp}
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2">
                  <PredictionChart data={data.historical} predictions={data.predictions} />
                </div>
                <div className="lg:col-span-1">
                  {sentiment && (
                    <SentimentGauge
                      score={sentiment.score}
                      label={sentiment.label}
                      color={sentiment.color}
                      news={sentiment.news}
                    />
                  )}
                </div>
              </div>

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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/learner" element={<LearnerDashboard />} />
        <Route path="/learner/module/:moduleId" element={<ModulePage />} />
        <Route path="/learner/module/:moduleId/lesson/:lessonId" element={<LessonPage />} />
        <Route path="/learner/module/:moduleId/quiz" element={<QuizPage />} />
      </Routes>
    </Router>
  );
}

export default App;
