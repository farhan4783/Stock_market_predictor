import { useState, useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import { motion } from 'framer-motion';
import { Globe2 } from 'lucide-react';

const GlobalMarketPage = () => {
    const globeEl = useRef();
    const [hubs, setHubs] = useState([]);
    const [arcsData, setArcsData] = useState([]);

    useEffect(() => {
        // Mock data for major global financial hubs
        const marketHubs = [
            { name: 'New York (NYSE)', lat: 40.7128, lng: -74.0060, size: 1.5, color: '#00f3ff', status: 'Bullish (+1.2%)' },
            { name: 'London (LSE)', lat: 51.5074, lng: -0.1278, size: 1.2, color: '#f300ff', status: 'Neutral (-0.1%)' },
            { name: 'Tokyo (TSE)', lat: 35.6762, lng: 139.6503, size: 1.3, color: '#ff003c', status: 'Bearish (-1.5%)' },
            { name: 'Hong Kong (HKEX)', lat: 22.3193, lng: 114.1694, size: 1.1, color: '#ffea00', status: 'Volatile (+0.5%)' },
            { name: 'Shanghai (SSE)', lat: 31.2304, lng: 121.4737, size: 1.2, color: '#00ffaa', status: 'Bullish (+0.9%)' },
            { name: 'Frankfurt (FSE)', lat: 50.1109, lng: 8.6821, size: 1.0, color: '#ff8800', status: 'Bearish (-0.8%)' },
            { name: 'Sydney (ASX)', lat: -33.8688, lng: 151.2093, size: 1.0, color: '#00f3ff', status: 'Bullish (+0.4%)' },
            { name: 'Mumbai (BSE)', lat: 19.0760, lng: 72.8777, size: 1.1, color: '#00ffaa', status: 'Bullish (+1.8%)' }
        ];

        setHubs(marketHubs);

        // Generate flow arcs representing institutional capital flow
        const arcs = [];
        for (let i = 0; i < 15; i++) {
            const startNode = marketHubs[Math.floor(Math.random() * marketHubs.length)];
            let endNode = marketHubs[Math.floor(Math.random() * marketHubs.length)];
            while (endNode === startNode) {
                endNode = marketHubs[Math.floor(Math.random() * marketHubs.length)];
            }
            arcs.push({
                startLat: startNode.lat,
                startLng: startNode.lng,
                endLat: endNode.lat,
                endLng: endNode.lng,
                color: [startNode.color, endNode.color]
            });
        }
        setArcsData(arcs);

        // Auto-rotate globe
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 1.0;
        }
    }, []);

    return (
        <div className="min-h-screen pt-20 flex flex-col relative bg-black">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#000] to-[#000] pointer-events-none z-0" />
            
            <div className="container mx-auto px-4 relative z-10 pointers-event-none mb-4">
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col md:items-start mb-2 border-b border-white/10 pb-4">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-blue via-white to-neon-purple flex items-center gap-3">
                        <Globe2 className="w-8 h-8 text-neon-blue" />
                        Global Markets
                    </h1>
                    <p className="text-sm text-gray-500 uppercase tracking-widest mt-2">
                        Real-time institutional liquidity radar
                    </p>
                </motion.div>
                
                <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
                    {hubs.map((hub, idx) => (
                        <div key={idx} className="bg-dark-card/50 border border-white/10 p-3 rounded-xl min-w-[200px] flex-shrink-0 backdrop-blur-sm">
                            <h3 className="text-gray-400 font-mono text-xs">{hub.name}</h3>
                            <div className="text-white font-bold">{hub.status}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-1 w-full relative cursor-move flex justify-center items-center overflow-hidden">
                <div style={{ height: '70vh', width: '100vw', display: 'flex', justifyContent: 'center' }}>
                    <Globe
                        ref={globeEl}
                        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                        pointsData={hubs}
                        pointLat="lat"
                        pointLng="lng"
                        pointColor="color"
                        pointAltitude={0.05}
                        pointRadius="size"
                        pointsMerge={true}
                        labelsData={hubs}
                        labelLat="lat"
                        labelLng="lng"
                        labelDotRadius={0.5}
                        labelDotOrientation="bottom"
                        labelColor={(d) => d.color}
                        labelText="name"
                        labelSize={1.5}
                        labelResolution={2}
                        labelAltitude={0.01}
                        arcsData={arcsData}
                        arcColor="color"
                        arcDashLength={0.4}
                        arcDashGap={4}
                        arcDashInitialGap={() => Math.random() * 5}
                        arcDashAnimateTime={2000}
                        backgroundColor="rgba(0,0,0,0)"
                    />
                </div>
                
                {/* Overlay Scanning Lines */}
                <div className="absolute inset-0 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 mix-blend-overlay"></div>
            </div>
        </div>
    );
};

export default GlobalMarketPage;
