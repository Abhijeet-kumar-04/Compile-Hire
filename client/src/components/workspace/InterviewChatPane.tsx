"use client";

import React, { useState, useEffect } from "react";
import { Send, Bot, User, Code2, Play, Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";

export default function InterviewChatPane() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Welcome to your mock interview. I am the AI Senior Engineer. Today we will be testing your algorithms and data structures knowledge. Are you ready to begin?" }
  ]);

  const [isListening, setIsListening] = useState(false);

  // Text-to-Speech Synthesis
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Stop any current speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    setMessages([...messages, { role: "user", text: input }]);
    setInput("");
    
    // Mock AI response
    setTimeout(() => {
      const responseText = "Great! Your first task is to implement a function that reverses a linked list. You can write your solution in the editor on the right.";
      setMessages(prev => [...prev, { role: "ai", text: responseText }]);
      speak(responseText);
    }, 1000);
  };

  // Speech-to-Text Recognition
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert("Speech Recognition is not supported in this browser. Please use Chrome or Edge.");
        return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
    };
    recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
        setInput(transcript);
    };

    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
  };

  return (
    <div className="flex flex-col h-full bg-obsidian text-offwhite font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-obsidian/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-glow/20 flex items-center justify-center text-indigo-light">
            <Bot size={18} />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-tight">AI Interviewer</h2>
            <p className="text-xs text-emerald-accent flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-accent animate-pulse" /> Active Session
            </p>
          </div>
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx} 
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === "user" ? "bg-indigo-glow/20 text-indigo-light" : "bg-white/5 text-coolgray"}`}>
              {msg.role === "user" ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div className={`p-3 rounded-2xl max-w-[85%] text-sm leading-relaxed ${msg.role === "user" ? "bg-indigo-glow/10 border border-indigo-light/20 text-white rounded-tr-sm" : "bg-white/5 border border-white/5 text-coolgray rounded-tl-sm"}`}>
              {msg.text}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5 bg-obsidian">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask a clarifying question..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-20 text-sm text-white placeholder-coolgray/50 focus:outline-none focus:border-indigo-light/50 transition-colors"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button 
              onClick={toggleListening}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isListening ? 'bg-red-500/20 text-red-400' : 'bg-emerald-accent/10 text-emerald-accent hover:bg-emerald-accent/20'}`}
              title="Voice Input"
            >
              {isListening ? <MicOff size={14} /> : <Mic size={14} />}
            </button>
            <button 
              onClick={handleSend}
              className="w-8 h-8 rounded-lg bg-indigo-glow/20 text-indigo-light flex items-center justify-center hover:bg-indigo-glow/40 transition-colors"
              title="Send Message"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
