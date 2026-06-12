"use client";

import React, { useState, useRef, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { Play, Code2, Terminal, Loader2, ChevronDown, Timer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CodeEditorPane({ code, setCode, defaultLanguage = "javascript" }: { code: string, setCode: (val: string) => void, defaultLanguage?: string }) {
  const [output, setOutput] = useState("Console output will appear here...");
  const [isRunning, setIsRunning] = useState(false);
  const [language, setLanguage] = useState(defaultLanguage);

  // Stopwatch counting up from 0
  const [timeElapsed, setTimeElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // When a new interview starts with a different default language, apply it
  useEffect(() => {
    if (defaultLanguage !== language) {
      setLanguage(defaultLanguage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultLanguage]);

  const prevLanguageRef = useRef("javascript");

  // 16 supported languages with file extensions and Monaco IDs
  const LANGUAGES = [
    { id: "javascript", label: "JavaScript", ext: "js", monacoId: "javascript" },
    { id: "typescript", label: "TypeScript", ext: "ts", monacoId: "typescript" },
    { id: "python",     label: "Python",     ext: "py", monacoId: "python" },
    { id: "java",       label: "Java",       ext: "java", monacoId: "java" },
    { id: "cpp",        label: "C++",        ext: "cpp", monacoId: "cpp" },
    { id: "c",          label: "C",          ext: "c",   monacoId: "c" },
    { id: "csharp",     label: "C#",         ext: "cs",  monacoId: "csharp" },
    { id: "go",         label: "Go",         ext: "go",  monacoId: "go" },
    { id: "rust",       label: "Rust",       ext: "rs",  monacoId: "rust" },
    { id: "swift",      label: "Swift",      ext: "swift", monacoId: "swift" },
    { id: "kotlin",     label: "Kotlin",     ext: "kt",  monacoId: "kotlin" },
    { id: "ruby",       label: "Ruby",       ext: "rb",  monacoId: "ruby" },
    { id: "php",        label: "PHP",        ext: "php", monacoId: "php" },
    { id: "scala",      label: "Scala",      ext: "scala", monacoId: "scala" },
    { id: "r",          label: "R",          ext: "r",   monacoId: "r" },
    { id: "sql",        label: "SQL",        ext: "sql", monacoId: "sql" },
  ];

  const getTemplate = (lang: string) => {
    const templates: Record<string, string> = {
      javascript: "function solution() {\n  // your code here\n}\n\nconsole.log(solution());",
      typescript: "function solution(): void {\n  // your code here\n}\n\nconsole.log(solution());",
      python:     "def solution():\n    pass  # your code here\n\nprint(solution())",
      java:       "class Solution {\n    public static void main(String[] args) {\n        // your code here\n    }\n\n    static Object solve() {\n        return null;\n    }\n}",
      cpp:        "#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}",
      c:          "#include <stdio.h>\n\nint main() {\n    // your code here\n    return 0;\n}",
      csharp:     "using System;\n\nclass Solution {\n    static void Main(string[] args) {\n        // your code here\n    }\n}",
      go:         "package main\n\nimport \"fmt\"\n\nfunc main() {\n    // your code here\n    fmt.Println()\n}",
      rust:       "fn main() {\n    // your code here\n    println!(\"{}\", solution());\n}\n\nfn solution() -> i32 {\n    0\n}",
      swift:      "import Foundation\n\nfunc solution() -> Any {\n    // your code here\n    return 0\n}\n\nprint(solution())",
      kotlin:     "fun main() {\n    // your code here\n    println(solution())\n}\n\nfun solution(): Any {\n    return 0\n}",
      ruby:       "def solution\n  # your code here\nend\n\np solution",
      php:        "<?php\n\nfunction solution() {\n    // your code here\n}\n\necho solution();\n?>",
      scala:      "object Solution {\n  def main(args: Array[String]): Unit = {\n    // your code here\n    println(solution())\n  }\n\n  def solution(): Any = {\n    null\n  }\n}",
      r:          "solution <- function() {\n  # your code here\n  return(NULL)\n}\n\nprint(solution())",
      sql:        "-- Write your SQL query here\nSELECT *\nFROM your_table\nWHERE 1=1;",
    };
    return templates[lang] || "// Start coding...";
  };

  const getLangMeta = (id: string) => LANGUAGES.find(l => l.id === id) || LANGUAGES[0];

  const handleLanguageChange = (newLang: string) => {
    // Extract the leading comment/problem-description block (top lines starting with // or # or --)  
    const lines = code.split("\n");
    const headerLines: string[] = [];
    for (const line of lines) {
      const t = line.trim();
      if (t.startsWith("//") || t.startsWith("#") || t.startsWith("--") || t === "") {
        headerLines.push(line);
      } else {
        break; // stop as soon as we hit actual code
      }
    }
    const problemHeader = headerLines.join("\n").trimEnd();
    const newBody = getTemplate(newLang);
    const finalCode = problemHeader ? `${problemHeader}\n\n${newBody}` : newBody;
    setCode(finalCode);
    prevLanguageRef.current = newLang;
    setLanguage(newLang);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("");
    
    try {
      const response = await fetch('https://compilehire.onrender.com/api/execute', {
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
      <div className="flex items-center justify-between p-3 border-b border-white/5 bg-black/20 backdrop-blur-md flex-nowrap overflow-x-auto overflow-y-hidden scrollbar-hide">
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 text-coolgray text-sm font-medium bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <Code2 size={16} className="text-indigo-light" />
            <span>solution.{getLangMeta(language).ext}</span>
          </div>
          
          <div className="relative group">
            <select 
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="appearance-none flex items-center gap-2 text-coolgray text-sm font-medium bg-white/5 pl-3 pr-8 py-1.5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors focus:outline-none focus:ring-1 focus:ring-indigo-light"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.id} value={lang.id} className="bg-obsidian text-offwhite">
                  {lang.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-coolgray pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          {/* Interview Timer */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold font-mono transition-colors ${
            timeElapsed > 45 * 60 // Pulse red if over 45 minutes
              ? "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.2)]" 
              : "bg-white/5 text-white/80 border-white/10"
          }`}>
            <Timer size={14} className={timeElapsed > 45 * 60 ? "text-red-400" : "text-indigo-400"} />
            {formatTime(timeElapsed)}
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
      </div>

      {/* Monaco Editor Wrapper */}
      <div className="flex-1 min-h-0 relative bg-obsidian/80 backdrop-blur-sm">
        <Editor
          height="100%"
          language={getLangMeta(language).monacoId}
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
