import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function NeuroChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am NeuroChat. I can analyze RSI, MACD, predict future prices, or check market sentiment. What ticker should we look at?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Default ticker, ideally we'd pull this from a global context or search bar
  const [currentTicker, setCurrentTicker] = useState('AAPL');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
        scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  const extractTicker = (text) => {
    const words = text.split(' ');
    for (const word of words) {
        const clean = word.replace(/[^a-zA-Z]/g, '').toUpperCase();
        // naive ticker extraction
        if (clean.length > 0 && clean.length <= 5 && clean !== 'WHAT' && clean !== 'IS' && clean !== 'THE' && clean !== 'RSI' && clean !== 'MACD') {
            if (clean === clean.toUpperCase() && word === clean) {
                return clean; // Found an all-caps word
            }
        }
    }
    return null;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    const extracted = extractTicker(userMessage);
    if (extracted) {
        setCurrentTicker(extracted);
    }
    
    // In a real app we might pass the ticker explicitly via UI or context
    const tickerToUse = extracted || currentTicker;

    try {
      const res = await axios.post('http://localhost:5000/chat', {
        message: userMessage,
        ticker: tickerToUse
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Neural connection severed. Please ensure the backend is running.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-neon-blue to-neon-purple rounded-full shadow-[0_0_20px_rgba(0,243,255,0.4)] text-black z-50 flex items-center justify-center cursor-pointer border border-white/20 hover:shadow-[0_0_30px_rgba(0,243,255,0.8)] transition-shadow"
          >
            <MessageSquare className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 w-[380px] h-[550px] bg-[#0a0f1a]/95 backdrop-blur-xl border border-neon-blue/30 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/40">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-neon-blue/20 flex items-center justify-center border border-neon-blue/50 shadow-[0_0_10px_rgba(0,243,255,0.5)]">
                  <Sparkles className="w-4 h-4 text-neon-blue" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm flex items-center gap-2 m-0 p-0">
                    NeuroChat <span className="px-1.5 py-0.5 rounded text-[10px] bg-neon-purple/20 text-neon-purple border border-neon-purple/30">v2.0</span>
                  </h3>
                  <p className="text-xs text-neon-blue/70 m-0 mt-0.5">Context: {currentTicker}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-neon-purple/20 border border-neon-purple/50 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-neon-purple" />
                    </div>
                  )}
                  <div 
                    className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-gradient-to-br from-neon-blue to-emerald-400 text-black rounded-tr-none shadow-[0_0_15px_rgba(0,243,255,0.2)] font-medium' 
                        : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none font-light'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-neon-purple/20 border border-neon-purple/50 flex items-center justify-center shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5 text-neon-purple" />
                  </div>
                  <div className="bg-white/5 border border-white/10 text-gray-400 p-3 rounded-2xl rounded-tl-none text-sm flex items-center justify-center gap-1.5 w-16 h-10">
                    <span className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-white/10 bg-black/40">
              <form onSubmit={handleSend} className="relative flex">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Neuro..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-neon-blue/50 focus:ring-1 focus:ring-neon-blue/50 transition-all font-light"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-neon-blue rounded-lg text-black hover:bg-neon-blue/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
