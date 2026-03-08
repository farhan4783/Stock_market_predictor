import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Filter, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ScreenerPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterPE, setFilterPE] = useState(100);
    const [filterDiv, setFilterDiv] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get('http://localhost:5000/screener');
                setData(res.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredData = data.filter(item => {
        if (item.pe && item.pe > filterPE) return false;
        if (item.dividendYield !== undefined && item.dividendYield < filterDiv) return false;
        return true;
    });

    return (
        <div className="min-h-screen text-white pt-20 pb-12 px-4">
            <div className="max-w-6xl mx-auto">
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-center gap-3 mb-8">
                    <Filter className="w-8 h-8 text-blue-400" />
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                        Stock Screener
                    </h1>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1 bg-dark-card/40 border border-white/5 rounded-xl p-6 h-fit backdrop-blur-sm sticky top-24">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 border-b border-white/10 pb-3">Filters</h3>

                        <div className="space-y-8">
                            <div>
                                <div className="flex justify-between text-sm mb-3">
                                    <span className="text-gray-300 font-bold">Max P/E Ratio</span>
                                    <span className="font-mono text-blue-400 bg-blue-500/10 px-2 rounded">{filterPE}</span>
                                </div>
                                <input
                                    type="range"
                                    min="5" max="150"
                                    value={filterPE}
                                    onChange={(e) => setFilterPE(Number(e.target.value))}
                                    className="w-full accent-blue-500"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between text-sm mb-3">
                                    <span className="text-gray-300 font-bold">Min Yield %</span>
                                    <span className="font-mono text-cyan-400 bg-cyan-500/10 px-2 rounded">{filterDiv}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0" max="10" step="0.5"
                                    value={filterDiv}
                                    onChange={(e) => setFilterDiv(Number(e.target.value))}
                                    className="w-full accent-cyan-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Results Table */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="w-full h-96 bg-white/5 animate-pulse rounded-2xl" />
                        ) : (
                            <div className="bg-dark-card/30 border border-white/5 rounded-2xl overflow-x-auto backdrop-blur-sm">
                                <table className="w-full text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="bg-white/5 text-xs text-gray-400 uppercase tracking-widest border-b border-white/10">
                                            <th className="p-5 font-bold">Company</th>
                                            <th className="p-5 font-bold">Sector</th>
                                            <th className="p-5 font-bold text-right">Price</th>
                                            <th className="p-5 font-bold text-right">P/E</th>
                                            <th className="p-5 font-bold text-right">Yield</th>
                                            <th className="p-5"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.map((item, i) => (
                                            <motion.tr
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                key={item.ticker}
                                                onClick={() => navigate(`/?ticker=${item.ticker}`)}
                                                className="border-b border-white/5 last:border-0 hover:bg-white/10 transition-colors cursor-pointer group"
                                            >
                                                <td className="p-5">
                                                    <div className="font-bold text-blue-400 font-mono text-lg">{item.ticker}</div>
                                                    <div className="text-xs text-gray-500 truncate max-w-[150px] mt-0.5">{item.name}</div>
                                                </td>
                                                <td className="p-5 text-sm text-gray-300">{item.sector}</td>
                                                <td className="p-5 text-right font-mono text-white text-lg">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                                <td className="p-5 text-right font-mono text-gray-300">{item.pe ? item.pe.toFixed(1) : '-'}</td>
                                                <td className="p-5 text-right font-mono text-cyan-400">{item.dividendYield ? `${item.dividendYield.toFixed(2)}%` : '-'}</td>
                                                <td className="p-5 text-right">
                                                    <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                                {filteredData.length === 0 && (
                                    <div className="p-16 text-center text-gray-500">
                                        <Filter className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        No listed assets match these criteria. Relax the filters.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ScreenerPage;
