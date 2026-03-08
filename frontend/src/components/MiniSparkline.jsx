import { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';
import axios from 'axios';

const MiniSparkline = ({ ticker }) => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchSparkline = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/historical-range?ticker=${ticker}&period=7d`);
                if (res.data && res.data.length > 0) {
                    setData(res.data.map(d => ({ value: d.close })));
                }
            } catch (e) {
                // Return empty smoothly
            }
        };
        fetchSparkline();
    }, [ticker]);

    if (data.length === 0) return <div className="w-16 h-8 bg-white/5 rounded animate-pulse" />;

    const startIdx = 0;
    const endIdx = data.length - 1;
    const isUp = data[endIdx].value >= data[startIdx].value;
    const color = isUp ? '#34d399' : '#f87171'; // emerald-400 or red-400

    const prices = data.map(d => d.value);
    const min = Math.min(...prices) * 0.99;
    const max = Math.max(...prices) * 1.01;

    return (
        <div className="w-20 h-8 opacity-70 hover:opacity-100 transition-opacity">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <YAxis domain={[min, max]} hide />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
export default MiniSparkline;
