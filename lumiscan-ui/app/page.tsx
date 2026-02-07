'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { OrbitControls } from '@react-three/drei';
import { AreaChart, Area, YAxis, ResponsiveContainer } from 'recharts';
import { ShieldCheck, ShieldAlert, Lock, Activity } from 'lucide-react';
import { LumiscanEye } from '../components/LumiscanEye';

// --- CONFIGURATION ---
const START_PRICE = 95000;
// A slightly more jagged crash pattern for realism
const CRASH_PATTERN = [0.995, 0.99, 0.98, 0.97, 0.95, 0.92, 0.88, 0.84, 0.80, 0.78, 0.75, 0.75, 0.76];

export default function Home() {
  const [volatility, setVolatility] = useState(0.0);
  const [priceHistory, setPriceHistory] = useState([]);
  const [isShutterClosed, setIsShutterClosed] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(START_PRICE);
  const simStep = useRef(0);

  // --- INITIALIZATION ---
  useEffect(() => {
    const initialData = [];
    let price = START_PRICE;
    for (let i = 0; i < 60; i++) {
      price = price * (1 + (Math.random() * 0.002 - 0.001));
      initialData.push({ time: i, value: price });
    }
    setPriceHistory(initialData);
  }, []);

  // --- HEARTBEAT LOOP ---
  useEffect(() => {
    // NOMINAL SPEED: Slow (1.5s). CRASH SPEED: Fast (0.2s).
    const tickRate = isSimulating ? 200 : 1500; 

    const interval = setInterval(() => {
      setPriceHistory(prev => {
        const lastPrice = prev[prev.length - 1]?.value || START_PRICE;
        let newPrice = lastPrice;
        let currentVol = 0.0;

        if (isSimulating) {
           // --- CRASH LOGIC ---
           if (simStep.current < CRASH_PATTERN.length) {
              const multiplier = CRASH_PATTERN[simStep.current];
              // Add some noise to the drop so it isn't a perfect line
              newPrice = START_PRICE * multiplier + (Math.random() * 150 - 75);
              simStep.current++;
              // Ramps up volatility visual
              currentVol = 0.2 + (simStep.current / CRASH_PATTERN.length); 
           } else {
              // Bottom of the crash
              newPrice = lastPrice * (1 + (Math.random() * 0.01 - 0.005));
              currentVol = 1.0; 
              if (!isShutterClosed) setIsShutterClosed(true);
           }
        } else {
           // --- NORMAL LOGIC (Drift) ---
           // Very small movements
           newPrice = lastPrice * (1 + (Math.random() * 0.003 - 0.0015));
           currentVol = 0.0;
        }

        setCurrentPrice(newPrice);
        setVolatility(currentVol);
        
        const newHistory = [...prev, { time: Date.now(), value: newPrice }];
        if (newHistory.length > 60) newHistory.shift();
        return newHistory;
      });
    }, tickRate);

    return () => clearInterval(interval);
  }, [isSimulating, isShutterClosed]);

  const triggerCrash = () => {
    setIsSimulating(true);
    simStep.current = 0;
  };

  const resetSystem = () => {
    setIsSimulating(false);
    setIsShutterClosed(false);
    simStep.current = 0;
    setVolatility(0.0);
    setCurrentPrice(START_PRICE);
  };

  return (
    <main className="h-screen w-full bg-black relative overflow-hidden flex flex-col items-center justify-center font-sans selection:bg-orange-500/30">
      
      {/* --- ATMOSPHERE (Subtle) --- */}
      <div className={`absolute top-0 w-full h-full pointer-events-none transition-opacity duration-[2000ms] ${isShutterClosed ? "opacity-40" : "opacity-10"}`}
           style={{
             background: `radial-gradient(circle at 50% 50%, ${isShutterClosed ? '#ff0000' : '#FF5F1F'}, transparent 60%)`
           }}>
      </div>

      {/* --- LAYER 1: THE 3D EYE (Unobstructed) --- */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
          <ambientLight intensity={0.3} />
          {/* Eye is slightly scaled up to fill the background nicely */}
          <group scale={[1.2, 1.2, 1.2]}>
             <LumiscanEye dangerLevel={volatility} isShutterClosed={isShutterClosed} />
          </group>
          <EffectComposer>
            <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={400} intensity={isShutterClosed ? 2.5 : 1.2} />
          </EffectComposer>
          <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} enablePan={false} />
        </Canvas>
      </div>

      {/* --- LAYER 2: THE GRAPH (Horizon) --- */}
      {/* Low opacity so it doesn't block the bottom rings of the eye */}
      <div className="absolute bottom-0 w-full h-[35%] z-10 px-0 pb-0 opacity-40 mix-blend-screen">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={priceHistory}>
                <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isShutterClosed ? "#ff0000" : "#fbbf24"} stopOpacity={0.5}/>
                        <stop offset="95%" stopColor={isShutterClosed ? "#ff0000" : "#fbbf24"} stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={isShutterClosed ? "#ef4444" : "#fbbf24"} 
                    strokeWidth={2}
                    fill="url(#colorValue)" 
                    isAnimationActive={true} // Re-enabled for smoother drift
                    animationDuration={isSimulating ? 200 : 1500} // Matches tick rate
                />
                <YAxis domain={['auto', 'auto']} hide />
            </AreaChart>
          </ResponsiveContainer>
      </div>

      {/* --- LAYER 3: THE ETHEREAL HUD (Floating) --- */}
      {/* No background box. Just text floating in the void. */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none">
         
         {/* THE PRICE (Center) */}
         <div className="flex flex-col items-center justify-center space-y-2">
             
             {/* The "Shield Ring" - Minimalist */}
             <div className={`absolute w-[280px] h-[280px] rounded-full border border-white/10 transition-all duration-1000 
                ${isShutterClosed ? "border-red-500/40 scale-110" : "scale-100 opacity-50"}`}>
             </div>
             
             {/* Status Icon */}
             <div className={`transition-all duration-500 ${isShutterClosed ? "text-red-500 scale-125" : "text-orange-400/80"}`}>
                 {isShutterClosed ? <Lock size={20} /> : <ShieldCheck size={20} />}
             </div>

             {/* Value */}
             <div className={`text-6xl font-extralight tracking-tighter transition-all duration-300 ${isShutterClosed ? "text-red-500 blur-[0.5px]" : "text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"}`}>
                ${currentPrice.toLocaleString(undefined, {maximumFractionDigits: 0})}
             </div>

             {/* Label */}
             <div className="text-[10px] tracking-[0.5em] text-white/40 font-mono">
                 BTC / USD
             </div>
         </div>
      </div>

      {/* --- LAYER 4: CONTROLS & HEADER --- */}
      <div className="absolute inset-0 z-50 pointer-events-none flex flex-col justify-between p-12">
          
          {/* Header */}
          <div className="w-full flex justify-between items-start pointer-events-auto">
             <div>
                <h1 className="text-3xl font-thin tracking-[0.4em] text-white/80">LUMISCAN</h1>
                <div className="flex items-center gap-2 mt-2">
                    <Activity size={10} className={isShutterClosed ? "text-red-500" : "text-green-500"} />
                    <p className="text-[9px] text-gray-500 tracking-[0.2em]">FLARE FDC // RISK SENTINEL</p>
                </div>
             </div>
          </div>

          {/* Bottom Controls */}
          <div className="w-full flex justify-center pointer-events-auto pb-10">
             <div className="flex gap-6">
                 <button 
                    onClick={triggerCrash}
                    disabled={isSimulating}
                    className="group flex flex-col items-center gap-1 disabled:opacity-30"
                 >
                    <div className="px-6 py-2 rounded-full border border-red-500/30 text-red-500/50 text-[10px] tracking-widest hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-500">
                        INJECT THREAT
                    </div>
                 </button>
                 
                 <button 
                    onClick={resetSystem}
                    className="px-6 py-2 rounded-full border border-white/10 text-gray-600 text-[10px] tracking-widest hover:border-white/50 hover:text-white transition-all duration-500"
                 >
                    RESET
                 </button>
             </div>
          </div>
      </div>

    </main>
  );
}