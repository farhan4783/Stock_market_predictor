import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import NavBar from './components/NavBar';
import MarketOverviewBar from './components/MarketOverviewBar';
import StockInfoCard from './components/StockInfoCard';
import LearnerDashboard from './pages/Learner/LearnerDashboard';
import ModulePage from './pages/Learner/ModulePage';
import LessonPage from './pages/Learner/LessonPage';
import QuizPage from './pages/Learner/QuizPage';
import VirtualTradingPage from './pages/Learner/VirtualTradingPage';
import WatchlistPage from './pages/WatchlistPage';
import ComparePage from './pages/ComparePage';
import PortfolioPage from './pages/PortfolioPage';
import NewsPage from './pages/NewsPage';
import ScreenerPage from './pages/ScreenerPage';
import HeatmapPage from './pages/HeatmapPage';
import StrategyBuilderPage from './pages/StrategyBuilderPage';
import { WatchlistProvider, useWatchlist } from './context/WatchlistContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { TrendingUp, DollarSign, Activity, AlertCircle, Download, GraduationCap, Star, Target } from 'lucide-react';
import { exportPredictionsToCSV, exportHistoricalToCSV } from './utils/exportCSV';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { Link } from 'react-router-dom';
import TopMovers from './components/TopMovers';
import AIInsightPanel from './components/AIInsightPanel';
import HistoricalAccuracyTracker from './components/HistoricalAccuracyTracker';
import NeuroChat from './components/NeuroChat';

function App() {
  return (
    <PortfolioProvider>
      <WatchlistProvider>
        <Router>
          <NavBar />
          <NeuroChat />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/screener" element={<ScreenerPage />} />
            <Route path="/heatmap" element={<HeatmapPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/strategy" element={<StrategyBuilderPage />} />
            <Route path="/learner" element={<LearnerDashboard />} />
            <Route path="/learner/module/:moduleId" element={<ModulePage />} />
            <Route path="/learner/module/:moduleId/lesson/:lessonId" element={<LessonPage />} />
            <Route path="/learner/module/:moduleId/quiz" element={<QuizPage />} />
            <Route path="/learner/simulator" element={<VirtualTradingPage />} />
          </Routes>
        </Router>
      </WatchlistProvider>
    </PortfolioProvider>
  );
}

function HomePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [sentiment, setSentiment] = useState(null);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(7);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [commandTicker, setCommandTicker] = useState('');
  const searchInputRef = useRef(null);
  const { addToWatchlist, removeFromWatchlist, isInWatchlist } = useWatchlist();
  const [searchParams] = useSearchParams();

  useKeyboardShortcuts({
    '/': () => { if (searchInputRef.current) searchInputRef.current.focus(); },
    'ctrl+k': () => setCommandPaletteOpen(true),
  });

  const handleSearch = async (ticker) => {
    if (!ticker) return;
    setLoading(true);
    setError(null);
    setData(null);
    setSentiment(null);
    try {
      const [predRes, sentRes] = await Promise.all([
        axios.post('http://localhost:5000/predict', { ticker, days }),
        axios.post('http://localhost:5000/sentiment', { ticker }),
      ]);
      setData(predRes.data);
      setSentiment(sentRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to fetch prediction. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when days changes if a ticker is already loaded
  useEffect(() => {
    if (data?.ticker) {
      handleSearch(data.ticker);
    }
  }, [days]);

  // Auto-trigger from URL param ?ticker=SYM (e.g., from Watchlist Zap button)
  useEffect(() => {
    const tickerParam = searchParams.get('ticker');
    if (tickerParam) {
      setCommandTicker(tickerParam.toUpperCase());
      handleSearch(tickerParam.toUpperCase());
    }
  }, []);

  const handleExportCSV = () => {
    if (data) {
      exportPredictionsToCSV(data, data.ticker);
      exportHistoricalToCSV(data.historical, data.ticker);
    }
  };

  const handleCommandSearch = (ticker) => {
    setCommandTicker(ticker.toUpperCase());
    handleSearch(ticker.toUpperCase());
  };

  const tickerStarred = data ? isInWatchlist(data.ticker) : false;

  return (
    <div className="min-h-screen text-white font-sans selection:bg-neon-blue selection:text-black relative overflow-hidden">
      <Background />
      <ThemeToggle />
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSearch={handleCommandSearch}
        onExportCSV={handleExportCSV}
      />

      {/* Market Overview Bar — right below fixed NavBar */}
      <div className="pt-14">
        <MarketOverviewBar />
      </div>

      <div className="container mx-auto px-4 py-10 relative z-10">
        {/* Hero */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue via-white to-neon-purple drop-shadow-[0_0_15px_rgba(0,243,255,0.5)] mb-3">
            NEUROSTOCK
          </h1>
          <p className="text-gray-400 text-base uppercase tracking-[0.3em] font-light mb-5">
            AI-Powered Market Intelligence
          </p>
          <Link to="/learner">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white font-bold shadow-lg hover:shadow-green-500/50 transition-all text-sm"
            >
              <GraduationCap className="w-4 h-4" />
              Learn Stock Market
            </motion.button>
          </Link>
        </motion.div>

        <TopMovers />

        <StockInput
          onSearch={handleSearch}
          loading={loading}
          inputRef={searchInputRef}
          externalTicker={commandTicker}
        />

        {/* Day selector */}
        <div className="flex justify-center mb-8 gap-3">
          {[3, 7, 14, 30].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-1.5 rounded-full border text-sm transition-all duration-300 ${days === d
                ? 'bg-neon-blue text-black font-bold shadow-[0_0_10px_#00f3ff] border-neon-blue'
                : 'bg-transparent text-gray-400 hover:text-white border-white/10 hover:border-white/30'}`}
            >
              {d}d
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
              {/* Action Row */}
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black font-mono text-white">{data.ticker}</span>
                  <motion.button
                    onClick={() => tickerStarred ? removeFromWatchlist(data.ticker) : addToWatchlist(data.ticker)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`p-1.5 rounded-lg transition-all ${tickerStarred ? 'text-yellow-400 bg-yellow-400/10' : 'text-gray-500 hover:text-yellow-400 hover:bg-yellow-400/10'}`}
                    title={tickerStarred ? 'Remove from watchlist' : 'Add to watchlist'}
                  >
                    <Star className={`w-5 h-5 ${tickerStarred ? 'fill-yellow-400' : ''}`} />
                  </motion.button>
                </div>
                <motion.button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-neon-blue/10 hover:bg-neon-blue/20 border border-neon-blue/30 rounded-lg text-neon-blue transition-all duration-300 group text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-4 h-4 group-hover:animate-bounce" />
                  Export CSV
                </motion.button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-7">
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
                  subValue={`${data.metadata.sequence_length}d window`}
                  icon={Activity}
                  delay={0.3}
                />
                <StatsCard
                  label="AI Confidence"
                  value={`${Math.max(0, 100 - (data.metadata.test_mae * 100)).toFixed(1)}%`}
                  icon={Target}
                  delay={0.4}
                />
              </div>

              <AIInsightPanel
                ticker={data.ticker}
                predictions={data.predictions}
                metadata={data.metadata}
              />

              {/* Company Info Card */}
              <StockInfoCard ticker={data.ticker} />

              {/* Historical Accuracy Tracker */}
              {data.backtest && data.backtest.length > 0 && (
                <HistoricalAccuracyTracker backtestData={data.backtest} />
              )}

              {/* Chart + Sentiment */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 mb-7">
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
                      rsi={sentiment.rsi}
                      trend={sentiment.trend}
                    />
                  )}
                </div>
              </div>

              {/* Prediction Details + Model Insights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-dark-card/30 rounded-xl p-6 border border-white/5">
                  <h3 className="text-neon-blue font-bold mb-4 uppercase tracking-wider text-xs">Prediction Details</h3>
                  <div className="space-y-2.5">
                    {data.predictions.map((pred, i) => (
                      <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0 last:pb-0">
                        <span className="text-gray-400 font-mono text-sm">{pred.date}</span>
                        <span className="text-white font-bold font-mono">${pred.price.toFixed(2)}</span>
                        <span className={`text-xs font-bold ${pred.change_percent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {pred.change_percent >= 0 ? '+' : ''}{pred.change_percent.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-dark-card/30 rounded-xl p-6 border border-white/5">
                  <h3 className="text-neon-purple font-bold mb-4 uppercase tracking-wider text-xs">Model Insights</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    This prediction is generated using an LSTM neural network, trained on historical OHLCV data with technical indicators.
                    The model analyzes patterns over the last <span className="text-white/70">{data.metadata.sequence_length} days</span> to forecast future trends.
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-gray-600 uppercase tracking-wider">Training MAE</div>
                      <div className="text-white font-mono">{data.metadata.test_mae?.toFixed(4)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 uppercase tracking-wider">Sequence</div>
                      <div className="text-white font-mono">{data.metadata.sequence_length}d</div>
                    </div>
                  </div>
                  <p className="text-white/30 text-xs mt-4">⚠ For educational purposes only.</p>
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
