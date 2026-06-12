"use client";

import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Cpu } from "lucide-react";

// Sub-component for glitching text
const GlitchText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState("");
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayText(text.slice(0, i) + (Math.random() > 0.5 ? "_" : ""));
      i++;
      if (i > text.length) i = 0;
    }, 80);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
};

export default function TesseractCore() {
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState<{x: number[], y: number[], z: number[], duration: number}[]>([]);
  
  // Initialize particles once on mount to avoid hydration mismatch and jumping
  useEffect(() => {
    const pts = Array.from({ length: 15 }).map(() => ({
      x: [(Math.random() - 0.5) * 600, (Math.random() - 0.5) * 600],
      y: [(Math.random() - 0.5) * 600, (Math.random() - 0.5) * 600],
      z: [(Math.random() - 0.5) * 600, (Math.random() - 0.5) * 600],
      duration: 3 + Math.random() * 3
    }));
    setParticles(pts);
  }, []);

  // Parallax Mouse Tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 100, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 30 });
  
  const rotateXParallax = useTransform(springY, [-0.5, 0.5], [20, -20]);
  const rotateYParallax = useTransform(springX, [-0.5, 0.5], [-20, 20]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovered(false);
  };

  return (
    <div 
      className="absolute inset-0 flex justify-center items-center w-full h-full [perspective:1200px] z-20 cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{ rotateX: rotateXParallax, rotateY: rotateYParallax }}
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative flex justify-center items-center w-[600px] h-[600px] [transform-style:preserve-3d]"
      >
        {/* Data Beams (Injections) - Only active on hover */}
        {isHovered && (
          <>
            <motion.div animate={{ height: [0, 400, 0], opacity: [0, 1, 0], top: [-200, 200, 400] }} transition={{ duration: 1, repeat: Infinity }} className="absolute left-1/4 w-1 bg-white/80 shadow-[0_0_20px_#fff] blur-[1px]" />
            <motion.div animate={{ width: [0, 400, 0], opacity: [0, 1, 0], left: [-200, 200, 400] }} transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }} className="absolute top-1/3 h-1 bg-cyan-400/80 shadow-[0_0_20px_#22d3ee] blur-[1px]" />
            <motion.div animate={{ height: [0, 400, 0], opacity: [0, 1, 0], top: [400, 100, -200] }} transition={{ duration: 0.8, repeat: Infinity, delay: 0.6 }} className="absolute right-1/4 w-1 bg-emerald-400/80 shadow-[0_0_20px_#34d399] blur-[1px]" />
          </>
        )}

        {/* Floating Energy Particles */}
        <div className="absolute inset-0 [transform-style:preserve-3d] pointer-events-none">
          {particles.map((p, i) => (
             <motion.div
               key={i}
               animate={{ x: p.x, y: p.y, z: p.z, opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
               transition={{ duration: p.duration, repeat: Infinity, ease: "linear" }}
               className="absolute top-1/2 left-1/2 w-2 h-2 bg-cyan-300 rounded-full shadow-[0_0_15px_#67e8f9]"
             />
          ))}
        </div>

        {/* Massive Outer Frame (Tesseract 1) */}
        <motion.div
          animate={{ 
            rotateX: [0, 360], 
            rotateY: [0, 360], 
            rotateZ: [0, 360],
            scale: isHovered ? 1.1 : 1 
          }}
          transition={{ rotateX: { duration: 40, repeat: Infinity, ease: "linear" }, rotateY: { duration: 40, repeat: Infinity, ease: "linear" }, rotateZ: { duration: 40, repeat: Infinity, ease: "linear" }, scale: { duration: 0.5 } }}
          className="absolute w-[360px] h-[360px] [transform-style:preserve-3d]"
        >
          {/* 6 Faces of Outer Cube */}
          {[
            { transform: 'translateZ(180px)' },
            { transform: 'translateZ(-180px) rotateY(180deg)' },
            { transform: 'translateX(180px) rotateY(90deg)' },
            { transform: 'translateX(-180px) rotateY(-90deg)' },
            { transform: 'translateY(-180px) rotateX(90deg)' },
            { transform: 'translateY(180px) rotateX(-90deg)' }
          ].map((face, i) => (
            <div key={i} className={`absolute inset-0 border backdrop-blur-[2px] overflow-hidden flex items-center justify-center transition-all duration-500 ${isHovered ? 'bg-blue-400/20 border-cyan-300/60 shadow-[0_0_80px_rgba(34,211,238,0.4),inset_0_0_80px_rgba(34,211,238,0.4)]' : 'bg-blue-500/5 border-blue-400/30 shadow-[0_0_50px_rgba(59,130,246,0.1),inset_0_0_50px_rgba(59,130,246,0.2)]'}`} style={face}>
              {/* Micro-circuit pattern */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#3b82f633_1px,transparent_1px),linear-gradient(to_bottom,#3b82f633_1px,transparent_1px)] bg-[size:20px_20px] opacity-30" />
              {/* Glitching / Typing Matrix Code */}
              <div className="text-white font-mono text-sm font-bold whitespace-pre drop-shadow-[0_0_8px_rgba(255,255,255,1)] z-10 relative">
                 <GlitchText text={`CompileHire.init(candidate);\nwait(simulateInterview());\nscore = analyze(code);\n\nif (score > 0.95) {\n  generateReport();\n}\n\n// Processing...`} />
              </div>
            </div>
          ))}

          {/* Inner Lustrous Cyan Tesseract (Tesseract 2) */}
          <motion.div
            animate={{ 
              rotateX: [360, 0], 
              rotateY: [360, 0], 
              rotateZ: [360, 0],
              scale: isHovered ? 1.25 : 1
            }}
            transition={{ rotateX: { duration: 25, repeat: Infinity, ease: "linear" }, rotateY: { duration: 25, repeat: Infinity, ease: "linear" }, rotateZ: { duration: 25, repeat: Infinity, ease: "linear" }, scale: { duration: 0.5, ease: "backOut" } }}
            className="absolute inset-0 m-auto w-[180px] h-[180px] [transform-style:preserve-3d]"
          >
            {[
              { transform: 'translateZ(90px)' },
              { transform: 'translateZ(-90px) rotateY(180deg)' },
              { transform: 'translateX(90px) rotateY(90deg)' },
              { transform: 'translateX(-90px) rotateY(-90deg)' },
              { transform: 'translateY(-90px) rotateX(90deg)' },
              { transform: 'translateY(90px) rotateX(-90deg)' }
            ].map((face, i) => (
              <div key={i} className={`absolute inset-0 border-2 flex items-center justify-center transition-all duration-500 ${isHovered ? 'bg-cyan-200/30 border-white shadow-[0_0_80px_rgba(255,255,255,0.8),inset_0_0_80px_rgba(255,255,255,0.8)]' : 'bg-cyan-400/10 border-cyan-300 shadow-[0_0_50px_rgba(34,211,238,0.5),inset_0_0_50px_rgba(34,211,238,0.6)]'}`} style={face}>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent" />
              </div>
            ))}

            {/* Absolute Central Energy Pulse & Brain */}
            <div className="absolute inset-0 flex justify-center items-center [transform:translateZ(0px)] [transform-style:preserve-3d]">
              <Cpu size={56} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] relative z-20" strokeWidth={1.5} />
              <motion.div 
                animate={{ scale: [1, isHovered ? 3.5 : 2.5, 1], opacity: [0.4, 0.7, 0.4] }} 
                transition={{ duration: isHovered ? 0.5 : 1.5, repeat: Infinity, ease: "easeInOut" }} 
                className="absolute w-20 h-20 bg-white/70 rounded-full blur-[20px] shadow-[0_0_60px_rgba(255,255,255,0.6)] z-10" 
              />
              <div className="absolute w-10 h-10 bg-white/60 rounded-full blur-[6px] z-30" />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
