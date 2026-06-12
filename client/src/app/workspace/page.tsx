"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Panel, Group, Separator } from "react-resizable-panels";
import InterviewChatPane from "@/components/workspace/InterviewChatPane";
import CodeEditorPane from "@/components/workspace/CodeEditorPane";
import { GripVertical, LogOut, Settings, LayoutTemplate, Video, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser, useAuth } from "@clerk/nextjs";

// Live PIP Webcam Feed — stream ref is lifted up so parent can stop tracks
const WebcamFeed = ({ setCameraDenied, streamRef }: { setCameraDenied: (val: boolean) => void, streamRef: React.MutableRefObject<MediaStream | null> }) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        setCameraDenied(false);
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(err => {
        console.error("Webcam access denied:", err);
        setCameraDenied(true);
      });
      
    return () => {
      // Stop tracks when component unmounts
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [setCameraDenied, streamRef]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      drag
      dragMomentum={false}
      className="absolute top-6 right-6 w-48 h-36 bg-black/40 rounded-xl overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] z-50 backdrop-blur-md cursor-grab active:cursor-grabbing"
    >
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-90 scale-x-[-1]" />
      <div className="absolute top-2 right-2 flex gap-1 items-center bg-black/50 px-1.5 py-0.5 rounded backdrop-blur-md border border-white/10">
         <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(239,68,68,0.8)]" />
         <span className="text-[9px] font-bold tracking-widest text-white/80">REC</span>
      </div>
    </motion.div>
  );
};

import { Suspense } from "react";

function WorkspaceContent() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const searchParams = useSearchParams();
  const cameraStreamRef = React.useRef<MediaStream | null>(null);
  const [mounted, setMounted] = useState(false);
  const [code, setCode] = useState("// Loading AI Interview environment...\n\n");
  const [messages, setMessages] = useState<any[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [cameraDenied, setCameraDenied] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [endingStep, setEndingStep] = useState(0);

  const ENDING_STEPS = [
    { label: "Saving Interview Session",       icon: "💾", color: "from-indigo-500 to-violet-500" },
    { label: "Calculating Overall Score",       icon: "🧮", color: "from-blue-500 to-indigo-500" },
    { label: "Analyzing Code Quality",          icon: "💻", color: "from-violet-500 to-purple-500" },
    { label: "Analyzing Problem Solving Skills",icon: "🧩", color: "from-emerald-500 to-teal-500" },
    { label: "Analyzing Communication Skills",  icon: "🗣️", color: "from-yellow-500 to-amber-500" },
    { label: "Generating Detailed Feedback",    icon: "📝", color: "from-pink-500 to-rose-500" },
    { label: "Preparing Your Report",           icon: "📊", color: "from-cyan-500 to-blue-500" },
  ];
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [defaultLanguage, setDefaultLanguage] = useState("javascript");

  // Read preferences from URL query params (set by /setup page)
  const preferences = {
    company:  searchParams.get("company")  || "Google",
    category: searchParams.get("category") || "Data Structures",
    role:     searchParams.get("role")     || "Software Engineer",
  };

  /** Map a free-text category to the most relevant language */
  const getCategoryDefaultLanguage = (category: string): string => {
    const c = category.toLowerCase();
    if (c.includes("sql") || c.includes("dbms") || c.includes("database") || c.includes("db")) return "sql";
    if (c.includes("python") || c.includes("machine learning") || c.includes("ml") || c.includes("data science") || c.includes("ai") || c.includes("deep learning") || c.includes("nlp")) return "python";
    if (c.includes("java") && !c.includes("javascript")) return "java";
    if (c.includes("c++") || c.includes("cpp") || c.includes("competitive")) return "cpp";
    if (c.includes("c#") || c.includes("csharp") || c.includes(".net")) return "csharp";
    if (c.includes("go") || c.includes("golang")) return "go";
    if (c.includes("rust")) return "rust";
    if (c.includes("swift") || c.includes("ios")) return "swift";
    if (c.includes("kotlin") || c.includes("android")) return "kotlin";
    if (c.includes("ruby") || c.includes("rails")) return "ruby";
    if (c.includes("php") || c.includes("laravel")) return "php";
    if (c.includes("scala")) return "scala";
    if (c.includes("typescript") || c.includes("frontend") || c.includes("react") || c.includes("vue") || c.includes("angular") || c.includes("web")) return "typescript";
    if (c.includes("javascript") || c.includes("node") || c.includes("fullstack")) return "javascript";
    if (c.includes("r ") || c.includes("statistics") || c.includes("data analysis")) return "r";
    return "javascript";
  };

  useEffect(() => {
    setMounted(true);
    // If no query params, redirect to dashboard page
    if (!searchParams.get("company") && !searchParams.get("category") && !searchParams.get("role")) {
      window.location.href = '/dashboard';
      return;
    }
    // Auto-start the interview using the params from setup page
    const lang = searchParams.get("language") || getCategoryDefaultLanguage(searchParams.get("category") || "Data Structures");
    setDefaultLanguage(lang);
    setSetupComplete(true);
    setStartTime(Date.now());
    // Init interview
    const prefs = {
      company:  searchParams.get("company")  || "Google",
      category: searchParams.get("category") || "Data Structures",
      role:     searchParams.get("role")     || "Software Engineer",
      language: lang,
    };
    fetch('https://compilehire.onrender.com/api/init-interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(prefs)
    }).then(r => r.json()).then(data => {
      if (data.template) setCode(data.template);
      if (data.message) {
        setMessages([{ role: 'ai', text: data.message }]);
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(data.message);
          window.speechSynthesis.speak(utterance);
        }
      }
    }).catch(() => {
      setCode("// Write your solution here\n\nfunction solution() {\n  \n}\n");
      setMessages([{ role: 'ai', text: 'Welcome to your mock interview. Ready to begin?' }]);
    }).finally(() => setIsInitializing(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Prevent accidental reloads/closing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isEnding || !setupComplete) return;
      e.preventDefault();
      e.returnValue = ''; // Trigger browser's default warning dialog
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isEnding, setupComplete]);


  const handleEndInterview = async () => {
    setIsEnding(true);
    setEndingStep(0);
    setConfirmEnd(false);

    // Stop camera and AI audio immediately
    cameraStreamRef.current?.getTracks().forEach(t => t.stop());
    cameraStreamRef.current = null;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();

    // Advance the step indicator every 800ms to keep user engaged
    let step = 0;
    const stepTimer = setInterval(() => {
      step += 1;
      if (step < ENDING_STEPS.length - 1) {
        setEndingStep(step);
      } else {
        clearInterval(stepTimer);
      }
    }, 800);

    // Artificial minimum wait time so the user can see the animation (7 seconds ensures all 5.6s of steps finish)
    const minDelay = new Promise(resolve => setTimeout(resolve, 7000));

    try {
      let token = null;
      try {
        token = await getToken();
      } catch (err) {
        console.warn('Clerk script blocked by browser, continuing without token.');
      }
      
      console.log('[EndInterview] Calling /api/interview/end...');
      const res = await fetch('https://compilehire.onrender.com/api/interview/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ 
          messages, 
          finalCode: code, 
          language: defaultLanguage,
          preferences,
          elapsedMinutes: startTime ? Math.floor((Date.now() - startTime) / 60000) : 0,
          duration: startTime ? Math.floor((Date.now() - startTime) / 1000) : 0,
          candidateName: user?.fullName || 'Candidate',
          candidateEmail: user?.primaryEmailAddress?.emailAddress || 'unknown@example.com'
        })
      });
      console.log('[EndInterview] Response status:', res.status);
      const data = await res.json();
      console.log('[EndInterview] Response data:', data);

      // Wait for artificial delay to finish
      await minDelay;

      if (data.session) {
        // Generate unique session ID for this interview
        const sessionId = data.savedId || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        // Store full report in localStorage under unique key
        localStorage.setItem(`interviewReport_${sessionId}`, JSON.stringify({
          ...data.session,
          sessionId,
          candidateName: user?.fullName || 'Candidate',
          preferences,
          completedAt: new Date().toISOString(),
        }));
        window.location.href = `/results/${sessionId}`;
      } else {
        throw new Error(data.error || 'No session in response');
      }
    } catch (err: any) {
      console.error('[EndInterview] Error:', err);
      alert('Failed to generate report: ' + err.message);
    } finally {
      clearInterval(stepTimer);
      setIsEnding(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-obsidian text-offwhite overflow-hidden selection:bg-indigo-light/30 relative">
      <WebcamFeed setCameraDenied={setCameraDenied} streamRef={cameraStreamRef} />

      {/* ── Animated Ending Overlay ── */}
      <AnimatePresence>
        {isEnding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[200] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md bg-obsidian border border-white/10 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col items-center overflow-hidden">
              {/* Animated glow background inside the modal */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-3xl">
                <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.3, 0.15] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -top-1/4 -left-1/4 w-[80%] h-[80%] bg-indigo-600 rounded-full blur-[80px]" />
                <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.25, 0.1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -bottom-1/4 -right-1/4 w-[70%] h-[70%] bg-violet-600 rounded-full blur-[90px]" />
              </div>

              <div className="relative z-10 w-full flex flex-col items-center">
                {/* Main spinner */}
                <div className="relative w-20 h-20 mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-transparent border-t-indigo-500 border-r-violet-500"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-2 rounded-full border-2 border-transparent border-b-emerald-500 border-l-blue-500"
                />
                <div className="absolute inset-0 flex items-center justify-center text-3xl">
                  {ENDING_STEPS[Math.min(endingStep, ENDING_STEPS.length - 1)].icon}
                </div>
              </div>

              <h2 className="text-2xl font-black text-white mb-2 text-center tracking-tight">
                Evaluating Your Interview
              </h2>
              <p className="text-white/40 text-sm mb-10 text-center">
                Our AI is carefully reviewing your performance...
              </p>

              {/* Step list */}
              <div className="w-full space-y-3">
                {ENDING_STEPS.map((step, i) => {
                  const isDone    = i < endingStep;
                  const isCurrent = i === endingStep;

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: isDone || isCurrent ? 1 : 0.3, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                        isCurrent ? "bg-white/10 border-white/20 shadow-lg" :
                        isDone    ? "bg-white/[0.04] border-white/5" :
                                    "bg-transparent border-transparent"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                        isDone    ? "bg-emerald-500 text-white" :
                        isCurrent ? `bg-gradient-to-r ${step.color} text-white animate-pulse` :
                                    "bg-white/10 text-white/30"
                      }`}>
                        {isDone ? "✓" : i + 1}
                      </div>
                      <span className={`text-sm font-medium ${
                        isCurrent ? "text-white" : isDone ? "text-white/60" : "text-white/25"
                      }`}>
                        {step.label}
                      </span>
                      {isCurrent && (
                        <motion.div
                          animate={{ opacity: [1, 0.3, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="ml-auto flex gap-1"
                        >
                          {[0,1,2].map(d => (
                            <motion.div key={d} animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: d * 0.15 }} className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                          ))}
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
           {/* Mandatory Camera Overlay */}
      <AnimatePresence>
        {cameraDenied && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center text-center p-6"
          >
            <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
               <Video size={40} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Camera Access Required</h1>
            <p className="text-coolgray max-w-md text-lg mb-8">
              This is a proctored AI interview. You must allow webcam access in your browser to proceed with the technical assessment.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-indigo-light hover:bg-indigo-light/80 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
              Refresh &amp; Allow Camera
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Animated Mesh Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-glow/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-accent/5 rounded-full blur-[150px]" 
        />
      </div>

      {/* Sidebar removed per user request */}

      {/* Main Split Interface - Wrapped in a floating glass container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex-1 h-full p-4 md:p-6 z-10"
      >
        <div className="h-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-obsidian/60 backdrop-blur-xl flex ring-1 ring-white/5">
          {/* @ts-expect-error - react-resizable-panels types are missing direction prop */}
          <Group direction="horizontal">
            
            {/* Left Pane: Chat */}
            <Panel defaultSize={35} minSize={25} className="bg-transparent flex flex-col relative">
              <InterviewChatPane 
                currentCode={code} 
                messages={messages} 
                setMessages={setMessages} 
                isInitializing={isInitializing}
                candidateName={user?.fullName || "Candidate"}
                preferences={preferences}
                startTime={startTime}
              />
            </Panel>
            
            {/* Draggable Resizer (Professional IDE Style) */}
            <Separator className="w-2 flex items-center justify-center group cursor-col-resize z-20 relative outline-none before:absolute before:inset-y-0 before:-inset-x-3 before:content-['']">
              {/* Vertical line that glows on hover/drag */}
              <div className="absolute inset-y-0 w-[1px] bg-white/5 group-hover:bg-indigo-500/40 group-data-[resize-handle-state=drag]:bg-indigo-500 transition-colors delay-100" />
              {/* Floating Grip Pill */}
              <div className="w-1 h-8 rounded-full bg-white/10 group-hover:bg-indigo-400 group-data-[resize-handle-state=drag]:bg-indigo-400 group-data-[resize-handle-state=drag]:scale-110 transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] relative z-10" />
            </Separator>
            
            {/* Right Pane: Code Editor */}
            <Panel defaultSize={65} minSize={40} className="bg-transparent flex flex-col">
              <CodeEditorPane code={code} setCode={setCode} defaultLanguage={defaultLanguage} />
            </Panel>

          </Group>
        </div>
      </motion.div>

      {/* Confirm End Modal */}
      <AnimatePresence>
        {confirmEnd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-lg flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-obsidian border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-14 h-14 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={24} className="text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">End Interview?</h3>
              <p className="text-coolgray text-sm mb-6">The AI will analyze your performance and generate a detailed feedback report.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmEnd(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-coolgray hover:text-white hover:bg-white/5 font-medium text-sm transition-all">Cancel</button>
                <button onClick={handleEndInterview} className="flex-1 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-bold text-sm transition-all">Yes, End It</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed Bottom-Right End Interview Button */}
      {setupComplete && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          onClick={() => setConfirmEnd(true)}
          disabled={isEnding}
          className="fixed bottom-6 right-6 z-[80] flex items-center gap-2.5 px-5 py-3 bg-red-500/20 hover:bg-red-500/30 active:scale-95 text-red-400 rounded-2xl font-bold text-sm border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.25)] hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] backdrop-blur-md transition-all"
        >
          {isEnding ? (
            <><Loader2 size={16} className="animate-spin" /> Generating Report...</>
          ) : (
            <><LogOut size={16} /> End Interview</>
          )}
        </motion.button>
      )}
    </div>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-white/40 text-sm animate-pulse">Loading interview...</div>
      </div>
    }>
      <WorkspaceContent />
    </Suspense>
  );
}
