"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  RadialBarChart, RadialBar, Cell, Tooltip, Legend
} from "recharts";
import { CheckCircle, TrendingUp, TrendingDown, AlertTriangle, Star, ArrowLeft, Clock, Building2, Briefcase, BookOpen } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Report {
  overallScore: number;
  verdict: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  breakdown: {
    problemSolving: number;
    codeQuality: number;
    edgeCaseHandling: number;
    communication: number;
    timeComplexity: number;
    technicalDepth: number;
  };
  candidateName: string;
  preferences: { company: string; category: string; role: string };
  completedAt: string;
  duration?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const PARAMS = [
  { key: "problemSolving",   label: "Problem Solving",    weight: 0.25, icon: "🧩" },
  { key: "codeQuality",      label: "Code Quality",       weight: 0.20, icon: "💻" },
  { key: "edgeCaseHandling", label: "Edge Cases",         weight: 0.15, icon: "🛡️" },
  { key: "communication",    label: "Communication",      weight: 0.15, icon: "🗣️" },
  { key: "timeComplexity",   label: "Time Complexity",    weight: 0.15, icon: "⏱️" },
  { key: "technicalDepth",   label: "Technical Depth",    weight: 0.10, icon: "🔬" },
];

const verdictColor = (v: string) => {
  if (v === "Strong Hire") return { bg: "from-emerald-500/20 to-emerald-600/10", text: "text-emerald-400", border: "border-emerald-500/40" };
  if (v === "Hire")         return { bg: "from-green-500/20 to-green-600/10",    text: "text-green-400",   border: "border-green-500/40" };
  if (v === "Borderline")   return { bg: "from-yellow-500/20 to-yellow-600/10",  text: "text-yellow-400",  border: "border-yellow-500/40" };
  if (v === "No Hire")      return { bg: "from-orange-500/20 to-orange-600/10",  text: "text-orange-400",  border: "border-orange-500/40" };
  return                           { bg: "from-red-500/20 to-red-600/10",        text: "text-red-400",     border: "border-red-500/40" };
};

const scoreColor = (s: number) =>
  s >= 7.5 ? "#10b981" : s >= 5.5 ? "#f59e0b" : "#ef4444";

// Custom RadialBar label
const CustomLabel = ({ cx, cy, innerRadius, outerRadius, value }: any) => {
  const r = innerRadius + (outerRadius - innerRadius) / 2;
  const angle = -Math.PI / 2;
  const x = cx + r * Math.cos(angle);
  const y = cy + r * Math.sin(angle);
  return null; // labels shown elsewhere
};

// ── Donut Score Chart ─────────────────────────────────────────────────────────
function DonutScore({ score }: { score: number }) {
  const filled = score;
  const empty = 10 - score;
  const data = [
    { name: "Score", value: filled, fill: scoreColor(score) },
    { name: "Remaining", value: empty, fill: "rgba(255,255,255,0.05)" },
  ];
  return (
    <div className="relative w-48 h-48 mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%" cy="50%"
          innerRadius="65%" outerRadius="100%"
          startAngle={90} endAngle={-270}
          data={data}
          barSize={16}
        >
          <RadialBar dataKey="value" cornerRadius={8} background={{ fill: "rgba(255,255,255,0.04)" }}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.fill} />
            ))}
          </RadialBar>
        </RadialBarChart>
      </ResponsiveContainer>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black text-white">{score.toFixed(1)}</span>
        <span className="text-xs text-white/40 font-medium">out of 10</span>
      </div>
    </div>
  );
}

// ── Radar Chart ───────────────────────────────────────────────────────────────
function SkillRadar({ breakdown }: { breakdown: Report["breakdown"] }) {
  const data = PARAMS.map(p => ({
    subject: p.label,
    score: (breakdown as any)[p.key] || 0,
    fullMark: 10,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 600 }}
        />
        <PolarRadiusAxis
          angle={90} domain={[0, 10]}
          tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 9 }}
          tickCount={6}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke="#6366f1"
          fill="#6366f1"
          fillOpacity={0.25}
          strokeWidth={2}
          dot={{ r: 3, fill: "#6366f1", strokeWidth: 0 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ── Bar Row ───────────────────────────────────────────────────────────────────
function BarRow({ label, score, weight, icon, index }: { label: string; score: number; weight: number; icon: string; index: number }) {
  const pct = (score / 10) * 100;
  const color = score >= 7.5 ? "from-emerald-500 to-emerald-400" :
                score >= 5.5 ? "from-yellow-500 to-yellow-400" :
                              "from-red-500 to-red-400";
  const textColor = score >= 7.5 ? "text-emerald-400" : score >= 5.5 ? "text-yellow-400" : "text-red-400";
  const zone = score >= 7.5 ? "Strong" : score >= 5.5 ? "Average" : "Weak";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 }}
      className="group"
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-sm font-semibold text-white/80">{label}</span>
          <span className="text-[10px] bg-white/5 border border-white/10 text-white/30 px-1.5 py-0.5 rounded-full">{(weight * 100).toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            score >= 7.5 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
            score >= 5.5 ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" :
                          "bg-red-500/10 border-red-500/30 text-red-400"
          }`}>{zone}</span>
          <span className={`text-sm font-bold ${textColor}`}>{score.toFixed(1)}</span>
        </div>
      </div>
      <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 + index * 0.07 }}
          className={`h-full rounded-full bg-gradient-to-r ${color} relative`}
        >
          <div className="absolute inset-0 rounded-full opacity-40 animate-pulse" style={{ background: "inherit" }} />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ── Weakness Analysis ─────────────────────────────────────────────────────────
function WeaknessAnalysis({ breakdown, improvements }: { breakdown: Report["breakdown"]; improvements: string[] }) {
  const weak = PARAMS.filter(p => ((breakdown as any)[p.key] || 0) < 6).sort(
    (a, b) => ((breakdown as any)[a.key] || 0) - ((breakdown as any)[b.key] || 0)
  );

  if (weak.length === 0) return (
    <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
      <CheckCircle className="text-emerald-400 shrink-0" size={20} />
      <span className="text-sm text-emerald-300/90">No critical weaknesses detected. Excellent overall performance!</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {weak.map((p, i) => {
        const score = (breakdown as any)[p.key] || 0;
        const improvement = improvements[i] || "Focus on practicing this area more.";
        return (
          <motion.div
            key={p.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                <span className="text-sm font-bold text-red-300">{p.icon} {p.label}</span>
              </div>
              <span className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                {score.toFixed(1)}/10
              </span>
            </div>
            <p className="text-xs text-red-200/60 mb-3">
              This area accounts for <strong>{(p.weight * 100).toFixed(0)}%</strong> of your total score.
              A score of {score.toFixed(1)} is below the hiring threshold of 6.0.
            </p>
            <div className="flex gap-2 items-start p-3 bg-white/5 rounded-lg border border-white/5">
              <TrendingUp size={13} className="text-indigo-light shrink-0 mt-0.5" />
              <p className="text-xs text-white/70">{improvement}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = React.use(params);
  const [report, setReport] = useState<Report | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!sessionId) return;

    const fetchReport = async () => {
      // 1. Try local storage first (instant load right after an interview)
      const raw = localStorage.getItem(`interviewReport_${sessionId}`);
      if (raw) {
        try { 
          const parsed = JSON.parse(raw);
          // If it has overallScore, it's the direct report object
          if (parsed && parsed.overallScore !== undefined) {
            setReport(parsed);
            return;
          }
        } catch { /* ignore */ }
      }

      // 2. If not in local storage (e.g. from history page), fetch from DB
      try {
        const res = await fetch(`http://localhost:5000/api/results/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.session) {
            setReport(data.session);
          }
        }
      } catch (err) {
        console.error("Failed to fetch report from DB", err);
      }
    };

    fetchReport();
  }, [sessionId]);

  if (!mounted) return null;

  if (!report) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-2xl font-bold mb-2">No Report Found</h1>
          <p className="text-white/50 mb-6">Complete an interview first to see your results here.</p>
          <a href="/workspace" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all">
            Start Interview
          </a>
        </div>
      </div>
    );
  }

  const vc = verdictColor(report.verdict);
  const completedDate = new Date(report.completedAt).toLocaleString("en-IN", {
    dateStyle: "medium", timeStyle: "short"
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-indigo-500/30">
      {/* Animated background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-emerald-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">

        {/* ── Top Bar ── */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-10">
          <a href="/workspace" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            New Interview
          </a>
          <div className="flex items-center gap-3 text-xs text-white/30">
            <Clock size={12} /> {completedDate}
            <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full font-mono text-[10px] text-white/20">#{sessionId}</span>
          </div>
        </motion.div>

        {/* ── Hero Header ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
            Interview Report
          </h1>
          <p className="text-white/40 text-sm">Powered by Llama 3 · CompileHire AI</p>
        </motion.div>

        {/* ── Candidate & Meta ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { icon: <Star size={14} />, label: "Candidate", value: report.candidateName || "Candidate" },
            { icon: <Building2 size={14} />, label: "Company", value: report.preferences?.company || "—" },
            { icon: <Briefcase size={14} />, label: "Role", value: report.preferences?.role || "—" },
            { icon: <BookOpen size={14} />, label: "Category", value: report.preferences?.category || "—" },
            { icon: <Clock size={14} />, label: "Duration", value: report.duration ? `${Math.floor(report.duration / 60)}m ${report.duration % 60}s` : "—" },
          ].map(({ icon, label, value }, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-1.5 text-white/40 text-xs mb-1">{icon} {label}</div>
              <div className="font-bold text-sm text-white truncate">{value}</div>
            </div>
          ))}
        </motion.div>

        {/* ── Main 2-col grid ── */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">

          {/* Left — Donut + Verdict */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center">
            <DonutScore score={report.overallScore} />
            <div className={`mt-6 px-6 py-2.5 rounded-full border font-black text-lg bg-gradient-to-r ${vc.bg} ${vc.text} ${vc.border}`}>
              {report.verdict}
            </div>
            <p className="text-xs text-white/30 mt-3">Overall Performance Verdict</p>

            {/* Score legend */}
            <div className="mt-5 w-full grid grid-cols-3 gap-2 text-center">
              {[
                { range: "0–5", label: "No Hire", color: "text-red-400" },
                { range: "5–7", label: "Borderline", color: "text-yellow-400" },
                { range: "7–10", label: "Hire", color: "text-emerald-400" },
              ].map(({ range, label, color }) => (
                <div key={range} className="bg-white/5 rounded-lg p-2">
                  <div className={`text-xs font-bold ${color}`}>{range}</div>
                  <div className="text-[10px] text-white/30">{label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Radar Chart */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-1">Skill Radar</h3>
            <p className="text-xs text-white/30 mb-4">Comparative view across all 6 dimensions</p>
            {report.breakdown && <SkillRadar breakdown={report.breakdown} />}
          </motion.div>
        </div>

        {/* ── Score Breakdown Bars ── */}
        {report.breakdown && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Score Breakdown</h3>
                <p className="text-xs text-white/30 mt-0.5">Each parameter scored 0–10 with hiring weight</p>
              </div>
            </div>
            <div className="space-y-4">
              {PARAMS.map((p, i) => (
                <BarRow
                  key={p.key}
                  label={p.label}
                  score={(report.breakdown as any)[p.key] || 0}
                  weight={p.weight}
                  icon={p.icon}
                  index={i}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── 2-col: Strengths + Weakness Analysis ── */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Strengths */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-emerald-400" />
              <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">Strengths</h3>
            </div>
            <div className="space-y-3">
              {(report.strengths || []).map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex gap-3 p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
                  <div className="w-5 h-5 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle size={11} className="text-emerald-400" />
                  </div>
                  <p className="text-sm text-white/75 leading-relaxed">{s}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Weakness Analysis */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown size={16} className="text-red-400" />
              <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">Weakness Analysis</h3>
            </div>
            {report.breakdown && (
              <WeaknessAnalysis breakdown={report.breakdown} improvements={report.improvements || []} />
            )}
          </motion.div>
        </div>

        {/* ── Detailed Feedback ── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider mb-4">📋 Detailed Feedback</h3>
          <div className="text-sm text-white/65 leading-relaxed whitespace-pre-wrap">
            {report.feedback}
          </div>
        </motion.div>

        {/* ── Action Buttons ── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="flex gap-4 justify-center">
          <a href="/workspace"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)]">
            Start New Interview
          </a>
          <a href="/"
            className="px-8 py-3 bg-white/10 hover:bg-white/15 text-white/80 rounded-xl font-bold text-sm border border-white/10 transition-all">
            Back to Home
          </a>
        </motion.div>

        <div className="text-center text-xs text-white/20 mt-8 pb-6">
          CompileHire · AI-Powered Technical Interviews · Report generated by Llama 3.3-70B
        </div>
      </div>
    </div>
  );
}
