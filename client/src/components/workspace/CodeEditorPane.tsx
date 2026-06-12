"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, Code2, Terminal, Loader2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CodeEditorPane() {
  const [code, setCode] = useState("// Write your solution here\n\nfunction reverseLinkedList(head) {\n  \n}\n\nreverseLinkedList();");
  const [output, setOutput] = useState("Console output will appear here...");
  const [isRunning, setIsRunning] = useState(false);
  const [language, setLanguage] = useState("javascript");

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("");
    
    try {
      const response = await fetch('http://localhost:5000/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      
      const data = await response.json();
      if (data.run) {
         let result = data.run.output;
         if (data.compile && data.compile.output) {
            result = data.compile.output + "\n" + result;
         }
         setOutput(result || "Code executed successfully with no output.");
      } else {
         setOutput("Execution failed:\n" + JSON.stringify(data, null, 2));
      }
    } catch (err: any) {
      setOutput("Error connecting to execution server:\n" + err.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent font-sans">
      {/* Floating Action Bar (Header) */}
      <div className="flex items-center justify-between p-3 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-coolgray text-sm font-medium bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <Code2 size={16} className="text-indigo-light" />
            <span>solution.js</span>
          </div>
          
          <div className="flex items-center gap-2 text-coolgray text-sm font-medium bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors">
            <span>JavaScript</span>
            <ChevronDown size={14} />
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleRunCode}
          disabled={isRunning}
          className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] ${isRunning ? 'bg-white/10 text-coolgray shadow-none cursor-not-allowed' : 'bg-emerald-accent/20 text-emerald-accent border border-emerald-accent/30'}`}
        >
          {isRunning ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Running...
            </>
          ) : (
            <>
              <Play size={14} /> Run Code
            </>
          )}
        </motion.button>
      </div>

      {/* Monaco Editor Wrapper */}
      <div className="flex-1 min-h-0 relative bg-obsidian/80 backdrop-blur-sm">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={code}
          onChange={(value) => setCode(value || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "var(--font-jetbrains-mono)",
            fontLigatures: true,
            padding: { top: 24, bottom: 24 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
            lineHeight: 24,
          }}
        />
      </div>

      {/* Premium Terminal Output */}
      <div className="h-56 border-t border-white/5 bg-black/40 backdrop-blur-md flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="flex items-center gap-2 px-4 py-2 bg-black/40 text-xs font-semibold text-coolgray border-b border-white/5">
          <Terminal size={14} className="text-indigo-light" /> 
          <span className="tracking-wider uppercase">Terminal Output</span>
        </div>
        <div className="flex-1 p-4 font-mono text-sm text-white/90 whitespace-pre-wrap overflow-y-auto relative">
          <AnimatePresence mode="wait">
            {isRunning ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-2"
              >
                <div className="h-4 w-1/3 bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-1/4 bg-white/10 rounded animate-pulse delay-75" />
                <div className="h-4 w-1/2 bg-white/10 rounded animate-pulse delay-150" />
              </motion.div>
            ) : (
              <motion.div
                key="output"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {output || <span className="text-coolgray/50">Ready for execution...</span>}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
