"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Code2, FileText, Bot, ChevronRight, MousePointer2, Cpu, Check, Database, Network, Folder, User } from "lucide-react";
import TesseractCore from "@/components/TesseractCore";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { toast } from "sonner";
import GlitchLink from "@/components/GlitchLink";
export default function Home() {
  return (
    <div className="min-h-screen bg-obsidian text-offwhite selection:bg-indigo-light/30 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-indigo-glow/20 rounded-full blur-[120px]" />
      <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-emerald-accent/15 rounded-full blur-[140px]" />
      <div className="absolute bottom-[-10%] left-[20%] w-[600px] h-[600px] bg-indigo-light/10 rounded-full blur-[150px]" />

      {/* Modern Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-6 bg-obsidian/40 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between glass-panel px-6 py-3 rounded-2xl relative">
          {/* Left Side */}
          <div className="flex items-center gap-3 flex-1">
            <Image src="/logo.png" alt="CompileHire Logo" width={32} height={32} className="rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
            <span className="font-bold text-xl tracking-tight">CompileHire</span>
          </div>
          
          {/* Middle */}
          <div className="hidden md:flex items-center justify-center gap-8 text-base font-medium text-coolgray shrink-0">
            <a href="#features" className="hover:text-offwhite transition-colors">Features</a>
            <a href="#ide" className="hover:text-offwhite transition-colors">Workspace</a>
            <a href="#pricing" className="hover:text-offwhite transition-colors">Pricing</a>

          </div>

          {/* Right Side */}
          <div className="flex items-center justify-end gap-5 flex-1">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-base font-medium hover:text-indigo-light transition-colors">Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="bg-gradient-to-r from-indigo-glow to-indigo-light hover:opacity-90 text-white px-6 py-2.5 rounded-xl text-base font-semibold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                  Start Free Trial
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 shadow-[0_0_15px_rgba(99,102,241,0.5)] border-2 border-indigo-light" } }}>
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Interview History"
                    href="/history"
                    labelIcon={<Folder size={16} />}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </Show>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-48 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
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
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tighter mb-6 w-full leading-tight whitespace-nowrap"
            >
              Stop Guessing. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-glow via-indigo-light to-emerald-accent drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">Start Compiling.</span><br />
              Land the Offer.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-coolgray max-w-lg mb-10 leading-relaxed whitespace-normal"
            >
              An AI-powered technical interviewer, advanced resume parser, and professional coding environment—all in one dark-mode workspace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
            >
              <Link href="/dashboard" className="w-full sm:w-auto bg-gradient-to-r from-indigo-glow to-indigo-light hover:opacity-90 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] flex items-center justify-center gap-2">
                Launch Workspace <ChevronRight size={20} />
              </Link>
              <GlitchLink text="View Documentation" className="w-full sm:w-auto glass-panel hover:bg-white/5 px-8 py-4 rounded-xl text-lg font-semibold transition-all flex items-center justify-center gap-2 group">
                <span className="group-hover:text-indigo-light transition-colors">View Documentation</span>
              </GlitchLink>
            </motion.div>
          </div>

          {/* Right Column - Advanced Alive 3D AI Core */}
          <div className="hidden lg:flex justify-center items-center relative h-[600px] w-full [perspective:1200px]">

            {/* Background intense glow */}
            <div className="absolute inset-0 bg-indigo-glow/20 rounded-full blur-[100px] animate-pulse" />

            {/* The Nested Tesseracts (High-Resolution & Interactive) */}
            <TesseractCore />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full text-left">
          {[
            { icon: Bot, title: "AI Interviewer", desc: "Dynamic conversational simulations adapting to your code and logic in real-time." },
            { icon: Code2, title: "Pro IDE Environment", desc: "Split-pane execution environment powered by Monaco, mimicking real-world interviews." },
            { icon: FileText, title: "Resume Analyzer", desc: "Instant PDF parsing with ATS scoring and actionable bullet-point rewriting." }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="glass-panel p-8 rounded-2xl flex flex-col hover:-translate-y-1 transition-transform h-full"
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-glow/20 flex items-center justify-center mb-6 text-indigo-glow">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-coolgray leading-relaxed flex-grow mb-6">{feature.desc}</p>
              
              <div className="mt-auto pt-6 border-t border-white/5">
                <GlitchLink text="Launch Module" className="text-indigo-light hover:text-white font-medium text-sm flex items-center transition-colors">
                  Launch Module
                </GlitchLink>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pricing Section */}
        <div id="pricing" className="mt-40 w-full mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, transparent pricing</h2>
            <p className="text-coolgray text-lg max-w-xl mx-auto">Start compiling your future for free. Upgrade when you need more power and advanced AI simulations.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
            {[
              { name: "Starter", price: "Free", desc: "Perfect for casual practice.", features: ["3 AI Interviews / month", "Basic Code Execution", "1 Resume Parsing", "Community Support"], button: "Get Started" },
              { name: "Pro", price: "$19/mo", desc: "For serious candidates.", features: ["Unlimited AI Interviews", "Advanced System Design Env", "Unlimited Resume Parsing", "Priority Support"], button: "Start 7-Day Trial", popular: true },
              { name: "Teams", price: "$99/mo", desc: "For hiring managers.", features: ["Team Dashboards", "Custom Question Banks", "Candidate Analytics", "Dedicated Account Manager"], button: "Contact Sales" }
            ].map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`glass-panel p-8 rounded-3xl relative flex flex-col ${plan.popular ? 'border-indigo-glow/50 shadow-[0_0_30px_rgba(99,102,241,0.15)] scale-105 z-10 bg-indigo-glow/5' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-glow to-indigo-light text-white px-4 py-1 rounded-full text-xs font-bold tracking-wide shadow-lg">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-coolgray text-sm mb-6">{plan.desc}</p>
                <div className="mb-8">
                  <span className="text-5xl font-bold tracking-tighter">{plan.price}</span>
                </div>
                <div className="flex-grow space-y-4 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-3 text-sm text-coolgray">
                      <div className="w-5 h-5 rounded-full bg-emerald-accent/20 flex items-center justify-center flex-shrink-0 text-emerald-accent">
                        <Check size={14} strokeWidth={3} />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <GlitchLink text={plan.button} className={`w-full py-4 rounded-xl text-sm font-semibold transition-all ${plan.popular ? 'bg-indigo-glow hover:bg-indigo-light text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]' : 'glass-panel hover:bg-white/10'}`}>
                  {plan.button}
                </GlitchLink>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-obsidian/80 backdrop-blur-xl relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <Image src="/logo.png" alt="CompileHire Logo" width={28} height={28} className="rounded-lg shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              <span className="font-bold text-lg tracking-tight">CompileHire</span>
            </div>
            <p className="text-coolgray text-sm leading-relaxed">
              Stop guessing what the interviewer wants. Start compiling your skills into offers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Platform</h4>
            <ul className="space-y-3 text-sm text-coolgray">
              <li><GlitchLink text="AI Interviewer" className="hover:text-indigo-light transition-colors" /></li>
              <li><GlitchLink text="Coding Environment" className="hover:text-indigo-light transition-colors" /></li>
              <li><GlitchLink text="Resume Analyzer" className="hover:text-indigo-light transition-colors" /></li>
              <li><GlitchLink text="Pricing" className="hover:text-indigo-light transition-colors" /></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Resources</h4>
            <ul className="space-y-3 text-sm text-coolgray">
              <li><GlitchLink text="Documentation" className="hover:text-indigo-light transition-colors" /></li>
              <li><GlitchLink text="Interview Guide" className="hover:text-indigo-light transition-colors" /></li>
              <li><GlitchLink text="Blog" className="hover:text-indigo-light transition-colors" /></li>
              <li><GlitchLink text="Community" className="hover:text-indigo-light transition-colors" /></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-3 text-sm text-coolgray">
              <li><GlitchLink text="Privacy Policy" className="hover:text-indigo-light transition-colors" /></li>
              <li><GlitchLink text="Terms of Service" className="hover:text-indigo-light transition-colors" /></li>
              <li><GlitchLink text="Contact Us" className="hover:text-indigo-light transition-colors" /></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 py-8 text-center text-sm text-coolgray/60">
          <p>© {new Date().getFullYear()} CompileHire. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
