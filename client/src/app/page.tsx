"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Code2, FileText, Bot, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-obsidian text-offwhite selection:bg-indigo-glow/30 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-glow/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-accent/10 rounded-full blur-[150px]" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-6 py-3 rounded-2xl">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Fluid AI Logo" width={32} height={32} className="rounded-lg" />
            <span className="font-bold text-xl tracking-tight">Fluid AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-coolgray">
            <a href="#features" className="hover:text-offwhite transition-colors">Features</a>
            <a href="#ide" className="hover:text-offwhite transition-colors">Workspace</a>
            <a href="#pricing" className="hover:text-offwhite transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium hover:text-indigo-glow transition-colors">Sign In</button>
            <button className="bg-indigo-glow hover:bg-indigo-glow/90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              Start Free Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-20 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-accent animate-pulse" />
          <span className="text-sm font-medium text-coolgray">Platform version 2.0 is live</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 max-w-5xl leading-tight"
        >
          Stop Guessing. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-glow to-emerald-accent">Start Compiling.</span><br/>
          Land the Offer.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-coolgray max-w-2xl mb-12 leading-relaxed"
        >
          An AI-powered technical interviewer, advanced resume parser, and professional coding environment—all in one dark-mode workspace.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <button className="bg-indigo-glow hover:bg-indigo-glow/90 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center gap-2">
            Launch Workspace <ChevronRight size={20} />
          </button>
          <button className="glass-panel hover:bg-white/10 px-8 py-4 rounded-xl text-lg font-semibold transition-all flex items-center gap-2">
            View Documentation
          </button>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full text-left">
          {[
            { icon: Bot, title: "AI Interviewer", desc: "Dynamic conversational simulations adapting to your code and logic in real-time." },
            { icon: Code2, title: "Pro IDE Environment", desc: "Split-pane execution environment powered by Monaco, mimicking real-world interviews." },
            { icon: FileText, title: "Resume Analyzer", desc: "Instant PDF parsing with ATS scoring and actionable bullet-point rewriting." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + (i * 0.1) }}
              className="glass-panel p-8 rounded-2xl hover:-translate-y-1 transition-transform cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-glow/20 flex items-center justify-center mb-6 text-indigo-glow">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-coolgray leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
