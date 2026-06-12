"use client";

import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, Code2, Terminal } from "lucide-react";

export default function CodeEditorPane() {
  const [code, setCode] = useState("// Write your solution here\n\nfunction reverseLinkedList(head) {\n  \n}");
  const [output, setOutput] = useState("Console output will appear here...");
  const [isRunning, setIsRunning] = useState(false);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput("Running compilation...");
    
    try {
      const response = await fetch('http://localhost:5000/api/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, language: 'javascript' }) // Hardcoded js for now, will map to dashboard context later
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
    <div className="flex flex-col h-full bg-obsidian">
      {/* Editor Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/5 bg-obsidian/80">
        <div className="flex items-center gap-2 text-coolgray text-sm font-medium">
          <Code2 size={16} className="text-indigo-light" />
          <span>solution.js</span>
        </div>
        <button 
          onClick={handleRunCode}
          disabled={isRunning}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${isRunning ? 'bg-white/10 text-coolgray cursor-not-allowed' : 'bg-emerald-accent/20 text-emerald-accent hover:bg-emerald-accent/30'}`}
        >
          <Play size={14} className={isRunning ? "opacity-50" : ""} />
          {isRunning ? "Running..." : "Run Code"}
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0 relative">
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
            padding: { top: 20 },
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
          }}
        />
      </div>

      {/* Mock Terminal Output */}
      <div className="h-48 border-t border-white/5 bg-[#1e1e1e] flex flex-col">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5 bg-black/20 text-xs font-semibold text-coolgray">
          <Terminal size={14} /> Output
        </div>
        <div className="flex-1 p-4 font-mono text-sm text-white/80 whitespace-pre-wrap overflow-y-auto">
          {output}
        </div>
      </div>
    </div>
  );
}
