import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import { useState, useRef, Suspense } from 'react';

function Stars(props) {
    const ref = useRef();
    const [sphere] = useState(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }));

    useFrame((state, delta) => {
        ref.current.rotation.x -= delta / 10;
        ref.current.rotation.y -= delta / 15;
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
                <PointMaterial
                    transparent
                    color="#00f3ff"
                    size={0.0025}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    );
}

const Background = () => {
    return (
        <div className="fixed inset-0 z-[-1] bg-[#030614] overflow-hidden">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <Suspense fallback={null}>
                    <Stars />
                </Suspense>
            </Canvas>
            
            {/* Cyberpunk Grid Overlay */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, #00f3ff 1px, transparent 1px),
                        linear-gradient(to bottom, #bc13fe 1px, transparent 1px)
                    `,
                    backgroundSize: '4rem 4rem',
                    transform: 'perspective(500px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
                    animation: 'grid-move 20s linear infinite'
                }}
            />
            
            <style jsx="true">{`
                @keyframes grid-move {
                    0% { transform: perspective(500px) rotateX(60deg) translateY(0) translateZ(-200px); }
                    100% { transform: perspective(500px) rotateX(60deg) translateY(4rem) translateZ(-200px); }
                }
            `}</style>

            {/* Glowing Orbs */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-neon-blue rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-neon-purple rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />

            {/* Radial glow at center & bottom fade */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,243,255,0.05)_0%,_transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#02040a] via-transparent to-black/30 pointer-events-none" />
        </div>
    );
};

export default Background;
