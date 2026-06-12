"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Code2, Database, Layout, Building2, Briefcase, ChevronRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  
  const [config, setConfig] = useState({
    category: "DSA",
    company: "Google",
    role: "Software Engineer",
    language: "javascript"
  });

  const categories = [
    { id: "DSA", name: "Data Structures & Algorithms", icon: <Code2 size={24} /> },
    { id: "WEB", name: "Web Development", icon: <Layout size={24} /> },
    { id: "DBMS", name: "Database Management", icon: <Database size={24} /> }
  ];

  const languages = [
    { id: "javascript", name: "JavaScript" },
    { id: "python", name: "Python 3" },
    { id: "cpp", name: "C++" },
    { id: "java", name: "Java" }
  ];

  const handleStartInterview = () => {
    // In a real app, we'd save this config to context/state management
    localStorage.setItem("interview_config", JSON.stringify(config));
    router.push("/workspace");
  };

  return (
    <div className="min-h-screen bg-obsidian text-offwhite selection:bg-indigo-light/30 relative overflow-hidden flex items-center justify-center p-6">
      {/* Background glow */}
      <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] bg-indigo-glow/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-emerald-accent/10 rounded-full blur-[140px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl glass-panel p-8 md:p-12 rounded-3xl relative z-10"
      >
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Configure Your Interview</h1>
          <p className="text-coolgray text-lg">Customize the AI simulation to match your exact target role.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Left Column: Core Settings */}
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-indigo-light" /> Interview Category
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {categories.map((cat) => (
                  <div 
                    key={cat.id}
                    onClick={() => setConfig({...config, category: cat.id})}
                    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all ${config.category === cat.id ? 'bg-indigo-glow/20 border-indigo-light text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-white/5 border-white/5 text-coolgray hover:bg-white/10'}`}
                  >
                    <div className={config.category === cat.id ? "text-indigo-light" : "text-coolgray"}>
                      {cat.icon}
                    </div>
                    <span className="font-medium">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Code2 size={18} className="text-indigo-light" /> Programming Language
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {languages.map((lang) => (
                  <div 
                    key={lang.id}
                    onClick={() => setConfig({...config, language: lang.id})}
                    className={`text-center p-3 rounded-xl cursor-pointer border transition-all font-medium ${config.language === lang.id ? 'bg-indigo-glow/20 border-indigo-light text-white' : 'bg-white/5 border-white/5 text-coolgray hover:bg-white/10'}`}
                  >
                    {lang.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Target Specifics */}
          <div className="space-y-8 flex flex-col justify-between">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 size={18} className="text-emerald-accent" /> Target Company
                </h3>
                <input 
                  type="text" 
                  value={config.company}
                  onChange={(e) => setConfig({...config, company: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-emerald-accent/50 transition-colors"
                  placeholder="e.g. Google, Meta, Stripe..."
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Briefcase size={18} className="text-emerald-accent" /> Target Role
                </h3>
                <input 
                  type="text" 
                  value={config.role}
                  onChange={(e) => setConfig({...config, role: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-emerald-accent/50 transition-colors"
                  placeholder="e.g. Senior Frontend Engineer..."
                />
              </div>
            </div>

            <button 
              onClick={handleStartInterview}
              className="w-full bg-gradient-to-r from-indigo-glow to-indigo-light hover:opacity-90 text-white px-8 py-5 rounded-xl text-lg font-bold transition-all shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 mt-auto"
            >
              Start AI Simulation <ChevronRight size={20} />
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
