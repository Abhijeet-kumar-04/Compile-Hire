"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Clock, Calendar, ChevronRight, Award, ArrowLeft, Inbox } from "lucide-react";
import Link from "next/link";

export default function HistoryPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const token = await getToken();
        const res = await fetch("http://localhost:5000/api/history", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-white/50 mb-6">You need to be logged in to view your interview history.</p>
          <a href="/" className="px-6 py-3 bg-indigo-600 rounded-xl font-bold">Go Home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-indigo-500/30">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[50vw] h-[50vw] bg-emerald-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-10">
          <a href="/" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-white via-indigo-200 to-white bg-clip-text text-transparent">
            Interview History
          </h1>
          <p className="text-white/40 text-sm">Review your past performance and detailed feedback</p>
        </motion.div>

        {history.length === 0 ? (
           <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
             <div className="flex justify-center mb-6">
               <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                 <Inbox size={32} className="text-white/40" />
               </div>
             </div>
             <h3 className="text-lg font-bold text-white mb-2">No interviews yet</h3>
             <p className="text-white/40 mb-6 text-sm">You haven't completed any interviews. Time to get started!</p>
             <a href="/dashboard" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all text-sm">
               Start an Interview
             </a>
           </div>
        ) : (
          <div className="grid gap-4">
            {history.map((session: any, i) => {
              const date = new Date(session.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              const mins = Math.floor((session.duration || 0) / 60);
              const secs = (session.duration || 0) % 60;
              
              const vc = session.overallScore >= 7.5 ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" : 
                         session.overallScore >= 5.5 ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" : 
                         "text-red-400 bg-red-400/10 border-red-400/20";
              
              const pref = session.reportData?.preferences || {};
              const title = pref.role ? `${pref.company || 'Unknown'} - ${pref.role}` : `Interview Session`;

              return (
                <Link key={session.id} href={`/results/${session.id}`}>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all group cursor-pointer"
                  >
                    <div className="flex items-start sm:items-center gap-4 mb-4 sm:mb-0">
                      <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0 border border-indigo-500/30 text-indigo-300">
                        <Award size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg group-hover:text-indigo-300 transition-colors">{title}</h3>
                        <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                          <span className="flex items-center gap-1"><Calendar size={12} /> {date}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {mins}m {secs}s</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-white/30 font-bold uppercase tracking-wider mb-1">Score</span>
                        <div className={`px-3 py-1 rounded-full border text-sm font-bold ${vc}`}>
                          {session.overallScore?.toFixed(1)}/10
                        </div>
                      </div>
                      <ChevronRight className="text-white/20 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
