"use client";

import React, { useState, useEffect } from "react";
import { Send, User, Mic, MicOff, AudioLines } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Typewriter Component for AI messages
const TypewriterMessage = ({ text, onComplete }: { text: string, onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    setDisplayedText("");
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 20); // 20ms per character
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return <span>{displayedText}</span>;
};

// Glowing AI Core Avatar
const AICoreAvatar = ({ isSpeaking }: { isSpeaking: boolean }) => (
  <div className="relative w-8 h-8 flex items-center justify-center">
    {isSpeaking && (
      <motion.div 
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-indigo-light"
      />
    )}
    <motion.div 
      animate={isSpeaking ? { scale: [1, 1.1, 1] } : {}}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="w-full h-full rounded-full bg-gradient-to-br from-indigo-glow to-indigo-light flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.6)] z-10"
    >
      <AudioLines size={14} className="text-white" />
    </motion.div>
  </div>
);

// Live PIP Webcam Feed
const WebcamFeed = () => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => console.error("Webcam access denied:", err));
      
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      className="absolute top-20 right-4 w-32 h-24 bg-black/40 rounded-xl overflow-hidden border border-white/10 shadow-2xl z-30 backdrop-blur-md cursor-grab active:cursor-grabbing"
    >
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-90 scale-x-[-1]" />
      <div className="absolute top-2 right-2 flex gap-1 items-center bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-md border border-white/10">
         <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
         <span className="text-[9px] font-bold tracking-widest text-white/80">REC</span>
      </div>
    </motion.div>
  );
};

export default function InterviewChatPane() {
  const [input, setInput] = useState("");
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [messages, setMessages] = useState([
    { role: "ai", text: "Welcome to your mock interview. I am the AI Senior Engineer. Today we will be testing your algorithms and data structures knowledge. Are you ready to begin?" }
  ]);
  const [isListening, setIsListening] = useState(false);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onstart = () => setIsAiSpeaking(true);
        utterance.onend = () => setIsAiSpeaking(false);
        window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { role: "user", text: input }]);
    setInput("");
    
    setTimeout(() => {
      const responseText = "Great! Your first task is to implement a function that reverses a singly linked list. Please write your solution in the editor on the right.";
      setMessages(prev => [...prev, { role: "ai", text: responseText }]);
      speak(responseText);
    }, 1000);
  };

  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Speech Recognition is not supported in this browser.");
        return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
        setInput(transcript);
    };

    isListening ? recognition.stop() : recognition.start();
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-offwhite font-sans relative">
      <WebcamFeed />
      
      {/* Premium Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <AICoreAvatar isSpeaking={isAiSpeaking} />
          <div>
            <h2 className="font-bold text-sm tracking-tight text-white/90">AI Interviewer</h2>
            <p className="text-xs text-indigo-light flex items-center gap-1 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-light animate-pulse shadow-[0_0_5px_rgba(99,102,241,0.8)]" /> 
              {isAiSpeaking ? "Speaking..." : "Listening..."}
            </p>
          </div>
        </div>
      </div>

      {/* Chat History with smooth entrance */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              key={idx} 
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className="mt-auto mb-1">
                {msg.role === "user" ? (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-coolgray to-white flex items-center justify-center text-obsidian shadow-lg">
                    <User size={12} />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-indigo-glow flex items-center justify-center text-white shadow-lg">
                    <AudioLines size={12} />
                  </div>
                )}
              </div>
              
              <div className={`p-3.5 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-lg backdrop-blur-sm ${
                msg.role === "user" 
                  ? "bg-gradient-to-br from-indigo-glow/40 to-indigo-light/20 border border-indigo-light/30 text-white rounded-br-sm" 
                  : "bg-white/5 border border-white/10 text-coolgray rounded-bl-sm"
              }`}>
                {msg.role === "ai" && idx === messages.length - 1 ? (
                  <TypewriterMessage text={msg.text} />
                ) : (
                  msg.text
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Glassmorphic Input Area */}
      <div className="p-4 border-t border-white/5 bg-black/20 backdrop-blur-md">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-glow to-emerald-accent rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative flex items-center w-full bg-obsidian/80 border border-white/10 rounded-xl">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask a clarifying question..."
              className="w-full bg-transparent py-3.5 pl-4 pr-24 text-sm text-white placeholder-coolgray/50 focus:outline-none transition-colors"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              <button 
                onClick={toggleListening}
                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isListening ? 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-white/5 text-coolgray hover:text-white hover:bg-white/10'}`}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
              <button 
                onClick={handleSend}
                className="w-8 h-8 rounded-lg bg-indigo-light text-white flex items-center justify-center hover:bg-indigo-glow transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
