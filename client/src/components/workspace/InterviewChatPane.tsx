"use client";

import React, { useState, useEffect } from "react";
import { Send, User, Mic, MicOff, AudioLines, Loader2, LogOut, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

// Removed Typewriter Component to eliminate voice latency

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



export default function InterviewChatPane({ 
  currentCode, 
  messages, 
  setMessages, 
  isInitializing, 
  candidateName,
  preferences,
  startTime,
  onEndInterview,
  isEnding
}: { 
  currentCode?: string, 
  messages: any[], 
  setMessages: any, 
  isInitializing: boolean, 
  candidateName?: string,
  preferences?: any,
  startTime?: number | null,
  onEndInterview?: () => void,
  isEnding?: boolean
}) {
  const [input, setInput] = useState("");
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const recognitionRef = React.useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Instantly stop speaking if the user toggles mute on
  useEffect(() => {
    if (isMuted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
    }
  }, [isMuted]);

  const speak = (text: string) => {
    if (isMuted) return; // Respect mute toggle
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

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim()) return;
    
    const newMessages = [...messages, { role: "user", text: textToSend }];
    setMessages(newMessages);
    if (!overrideText) setInput("");
    
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages, 
          currentCode,
          preferences,
          elapsedMinutes: startTime ? Math.floor((Date.now() - startTime) / 60000) : 0
        })
      });
      
      const data = await response.json();
      if (data.text) {
        setMessages([...newMessages, { role: "ai", text: data.text }]);
        speak(data.text);
      } else {
        throw new Error(data.error || "Failed to get AI response");
      }
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages([...newMessages, { role: "ai", text: "I'm having trouble connecting to my AI brain. Please check your API key." }]);
    }
  };

  const isListeningRef = React.useRef(false);

  // Cleanup mic on unmount
  React.useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    // --- TURN OFF ---
    if (isListeningRef.current) {
        isListeningRef.current = false;
        setIsListening(false);
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch(_) {}
            recognitionRef.current = null;
        }
        return;
    }

    // --- TURN ON ---
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
        alert("Speech Recognition is not supported. Please use Chrome or Edge.");
        return;
    }

    const recognition = new SR();
    recognition.continuous = true;       // stay on until we abort
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (e: any) => {
        let text = '';
        for (let i = 0; i < e.results.length; i++) {
            text += e.results[i][0].transcript;
        }
        setInput(text);
    };

    recognition.onerror = (e: any) => {
        console.error('SpeechRecognition error:', e.error);
        if (e.error === 'not-allowed') {
            alert("Microphone access denied. Click the microphone icon in your browser's address bar to allow access.");
            isListeningRef.current = false;
            setIsListening(false);
            return;
        }
        // For 'network' and other transient errors, just restart after a short pause
        if (isListeningRef.current) {
            setTimeout(() => {
                if (isListeningRef.current) {
                    try { recognition.start(); } catch(_) {}
                }
            }, 500);
        }
    };

    recognition.onend = () => {
        // If still supposed to be listening (browser killed it), restart
        if (isListeningRef.current) {
            try { recognition.start(); } catch(_) {}
        }
    };

    try {
        recognition.start();
        recognitionRef.current = recognition;
        isListeningRef.current = true;
        setIsListening(true);
    } catch(e) {
        console.error('Could not start recognition:', e);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-offwhite font-sans relative">
      {/* Premium Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <AICoreAvatar isSpeaking={isAiSpeaking} />
          <div>
            <h2 className="font-bold text-sm tracking-tight text-white/90 flex items-center gap-2">
               AI Interviewer 
               <span className="text-coolgray/50 text-xs px-2 py-0.5 rounded-full border border-white/5 bg-white/5">
                  {candidateName || 'Candidate'}
               </span>
               {preferences && (
                 <span className="text-indigo-light/80 text-[10px] px-2 py-0.5 rounded-full border border-indigo-light/20 bg-indigo-glow/20">
                    {preferences.company} • {preferences.role}
                 </span>
               )}
            </h2>
            <p className="text-xs text-indigo-light flex items-center gap-1 font-medium mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-light animate-pulse shadow-[0_0_5px_rgba(99,102,241,0.8)]" /> 
              {isAiSpeaking ? "Speaking..." : "Listening..."}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Mute Toggle */}
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`flex items-center justify-center p-2 rounded-lg transition-colors border ${
              isMuted 
                ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' 
                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white/90'
            }`}
            title={isMuted ? "Unmute AI" : "Mute AI"}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          {onEndInterview && (
            <button 
              onClick={onEndInterview}
              disabled={isEnding}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-colors border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
            >
              {isEnding ? <Loader2 size={14} className="animate-spin" /> : <LogOut size={14} />}
              End Interview
            </button>
          )}
        </div>
      </div>

      {/* Chat History with smooth entrance */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
        {isInitializing ? (
           <div className="flex justify-center items-center h-full text-sm text-coolgray/50 animate-pulse">
             Initializing AI Interviewer...
           </div>
        ) : (
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
              
              <div className={`p-4 rounded-2xl max-w-[85%] text-[17px] leading-relaxed shadow-lg backdrop-blur-sm ${
                msg.role === "user" 
                  ? "bg-gradient-to-br from-indigo-glow/40 to-indigo-light/20 border border-indigo-light/30 text-white rounded-br-sm" 
                  : "bg-white/5 border border-white/10 text-coolgray rounded-bl-sm"
              }`}>
                {msg.role === "ai" ? (
                  <ReactMarkdown
                    components={{
                      code: ({ node, inline, className, children, ...props }: any) => {
                        return inline ? (
                          <code className="bg-black/30 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-[15px]" {...props}>
                            {children}
                          </code>
                        ) : (
                          <pre className="bg-black/40 p-3 rounded-xl overflow-x-auto my-2 border border-white/5">
                            <code className="text-emerald-300 font-mono text-[15px]" {...props}>
                              {children}
                            </code>
                          </pre>
                        );
                      },
                      p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
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
                onClick={() => handleSend()}
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
