"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface GlitchLinkProps {
  text: string;
  className?: string;
  children?: React.ReactNode;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*<>[]{}";

export default function GlitchLink({ text, className = "", children }: GlitchLinkProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isGlitching, setIsGlitching] = useState(false);
  const [isResolved, setIsResolved] = useState(false);
  
  // Track intervals so we can clean them up if component unmounts
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const scramble = (targetText: string, duration: number, onComplete: () => void) => {
    let iteration = 0;
    const maxIterations = duration / 30; // 30ms per frame
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setDisplayText((prev) =>
        prev
          .split("")
          .map((_, idx) => {
            if (idx < (iteration / maxIterations) * targetText.length) {
              return targetText[idx];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      iteration++;

      if (iteration >= maxIterations) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplayText(targetText);
        onComplete();
      }
    }, 30);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isGlitching) return; // Prevent spam clicking

    setIsGlitching(true);
    
    // Scramble to target message
    scramble("[COMING SOON]", 500, () => {
      setIsResolved(true);
      
      // Hold for 2 seconds
      timeoutRef.current = setTimeout(() => {
        setIsResolved(false);
        // Scramble back to original text
        scramble(text, 500, () => {
          setIsGlitching(false);
        });
      }, 2000);
    });
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`${className} ${
        isResolved ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)] font-mono tracking-tight" : ""
      } relative overflow-hidden transition-all duration-200`}
      whileTap={{ scale: 0.97 }}
    >
      {/* If children are passed (like an icon + text), we replace the text part but keep the structure if possible.
          To keep it simple and robust, if it's glitching we only show the glitch text.
          If not glitching, we show the original children (which might include icons). */}
      {isGlitching || isResolved ? (
        <span>{displayText}</span>
      ) : (
        children || text
      )}
    </motion.button>
  );
}
