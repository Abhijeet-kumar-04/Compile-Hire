"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Code2, Database, Layout, Building2, Briefcase, ChevronRight, Sparkles, Terminal, Award, Folder } from "lucide-react";
import { useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

// ── Data ──────────────────────────────────────────────────────────────────────
const COMPANIES = ["Amazon", "Google", "Microsoft", "Meta", "Apple", "Netflix"];
const CATEGORIES = [
  "Data Structures & Algorithms", "System Design", "DBMS & SQL", "Machine Learning",
  "Frontend Development", "Backend Development", "Mobile Development (iOS/Android)"
];
const ROLES = [
  "Software Engineer (SDE-1)", "Software Engineer (SDE-2)", "Senior Software Engineer",
  "Staff Engineer", "Data Scientist", "Frontend Engineer", "Backend Engineer", "Full-Stack Engineer"
];
const LANGUAGES = [
  { id: "javascript", name: "JavaScript" },
  { id: "python", name: "Python 3" },
  { id: "cpp", name: "C++" },
  { id: "java", name: "Java" },
  { id: "go", name: "Go" },
  { id: "rust", name: "Rust" },
  { id: "sql", name: "SQL" },
  { id: "typescript", name: "TypeScript" }
];
const DIFFICULTIES = [
  { key: "easy",   label: "Easy",   desc: "Fresh grad / Intern level", color: "emerald" },
  { key: "medium", label: "Medium", desc: "2–4 years experience",      color: "yellow" },
  { key: "hard",   label: "Hard",   desc: "Senior / Staff level",      color: "red" },
];

interface PastInterview {
  sessionId: string;
  completedAt: string;
  preferences?: { company?: string; role?: string; category?: string };
  overallScore?: number;
  verdict?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  
  const [company, setCompany] = useState("Google");
  const [customCompany, setCustomCompany] = useState("");
  const [category, setCategory] = useState("Data Structures & Algorithms");
  const [role, setRole] = useState("Software Engineer (SDE-1)");
  const [language, setLanguage] = useState("javascript");
  const [difficulty, setDifficulty] = useState("medium");

  const finalCompany = customCompany.trim() || company;

  const handleStartInterview = () => {
    const params = new URLSearchParams({
      company: finalCompany,
      category,
      role,
      language,
      difficulty
    });
    router.push(`/workspace?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans overflow-hidden relative flex flex-col justify-center py-12 px-6">
      {/* Animated background meshes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-5%] w-[45vw] h-[45vw] bg-indigo-600/10 rounded-full blur-[130px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-emerald-500/5 rounded-full blur-[150px]"
        />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        
        {/* Floating User Button */}
        <div className="absolute top-0 right-0 p-4">
          <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 shadow-[0_0_15px_rgba(99,102,241,0.5)] border-2 border-indigo-light" } }}>
            <UserButton.MenuItems>
              <UserButton.Link
                label="Interview History"
                href="/history"
                labelIcon={<Folder size={16} />}
              />
            </UserButton.MenuItems>
          </UserButton>
        </div>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-indigo-300 text-sm font-semibold mb-6 bg-indigo-500/10 px-4 py-2 rounded-full border border-indigo-500/20">
            <Sparkles size={14} className="text-indigo-400" />
            AI Mock Interview Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight bg-gradient-to-r from-white via-indigo-100 to-white bg-clip-text text-transparent">
            Configure Your Interview
          </h1>
          <p className="text-white/50 text-lg max-w-2xl mx-auto">
            Customize the AI simulation. The AI will generate a tailored roadmap and ask coding questions based on your specific role, category, and language choices.
          </p>
        </motion.div>

        {/* Main Grid: Utilizing full screen (max-w-7xl) with 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          
          {/* LEFT COLUMN: Role & Skill Selection */}
          <div className="lg:col-span-7 bg-white/[0.03] border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl flex flex-col gap-10">
            
            {/* Category */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-white/60 uppercase tracking-widest mb-4">
                <Code2 size={18} className="text-indigo-400" /> Interview Category
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORIES.slice(0, 4).map(c => (
                  <button key={c} onClick={() => setCategory(c)}
                    className={`py-4 px-4 rounded-xl text-sm font-semibold border transition-all text-left ${
                      category === c
                        ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                        : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white/90"
                    }`}>
                    {c}
                  </button>
                ))}
              </div>
              <div className="mt-3 relative">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-base text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer"
                >
                  <option disabled value="">Or select another category...</option>
                  {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0a0a0f]">{c}</option>)}
                </select>
                <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none rotate-90" />
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-white/60 uppercase tracking-widest mb-4">
                <Terminal size={18} className="text-emerald-400" /> Programming Language
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {LANGUAGES.map(lang => (
                  <button key={lang.id} onClick={() => setLanguage(lang.id)}
                    className={`py-3 px-2 rounded-xl text-sm font-semibold border transition-all ${
                      language === lang.id
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                        : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white/90"
                    }`}>
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-white/60 uppercase tracking-widest mb-4">
                <Award size={18} className="text-yellow-400" /> Difficulty Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {DIFFICULTIES.map(d => (
                  <button key={d.key} onClick={() => setDifficulty(d.key)}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      difficulty === d.key
                        ? d.color === "emerald" ? "bg-emerald-500/15 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                        : d.color === "yellow"  ? "bg-yellow-500/15 border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                        :                         "bg-red-500/15 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                        : "bg-white/5 border-white/5 hover:bg-white/10"
                    }`}>
                    <div className={`text-base font-bold mb-1.5 ${
                      difficulty === d.key
                        ? d.color === "emerald" ? "text-emerald-400" : d.color === "yellow" ? "text-yellow-400" : "text-red-400"
                        : "text-white/70"
                    }`}>{d.label}</div>
                    <div className="text-xs text-white/40 leading-relaxed">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Target Details & CTA */}
          <div className="lg:col-span-5 bg-white/[0.03] border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
            <div className="space-y-10">
              
              {/* Company */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-white/60 uppercase tracking-widest mb-4">
                  <Building2 size={18} className="text-indigo-400" /> Target Company
                </label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {COMPANIES.map(c => (
                    <button key={c} onClick={() => { setCompany(c); setCustomCompany(""); }}
                      className={`py-2 px-4 rounded-full text-sm font-semibold border transition-all ${
                        company === c && !customCompany
                          ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/90"
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Or type a custom company name..."
                  value={customCompany}
                  onChange={e => setCustomCompany(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-base text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-white/50 transition-all"
                />
              </div>

              {/* Role */}
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-white/60 uppercase tracking-widest mb-4">
                  <Briefcase size={18} className="text-indigo-400" /> Target Role
                </label>
                <div className="relative">
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full appearance-none bg-white/5 border border-white/10 rounded-xl px-5 py-4 pr-12 text-base text-white focus:outline-none focus:ring-1 focus:ring-white/50 transition-all cursor-pointer"
                  >
                    {ROLES.map(r => <option key={r} value={r} className="bg-[#0a0a0f]">{r}</option>)}
                  </select>
                  <ChevronRight size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none rotate-90" />
                </div>
              </div>

            </div>

            {/* Start Button Area */}
            <div className="mt-12 pt-8 border-t border-white/10">
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-5 mb-6 text-sm text-indigo-200/70">
                <p className="flex items-center gap-2 font-medium mb-2 text-indigo-300">
                  <Sparkles size={16} /> AI Configuration Ready
                </p>
                <p>The AI will adopt the persona of a Senior Engineer at <strong>{finalCompany}</strong> and ask a <strong>{difficulty}</strong> level <strong>{category}</strong> question in <strong>{LANGUAGES.find(l => l.id === language)?.name}</strong>.</p>
              </div>

              <motion.button
                onClick={handleStartInterview}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(99,102,241,0.5)] hover:shadow-[0_0_50px_rgba(99,102,241,0.7)] transition-all"
              >
                Begin AI Interview
                <ChevronRight size={22} />
              </motion.button>
            </div>

          </div>

        </motion.div>


      </div>
    </div>
  );
}
