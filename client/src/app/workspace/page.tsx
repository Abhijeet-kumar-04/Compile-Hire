"use client";

import React, { useEffect, useState } from "react";
import { Panel, Group, Separator } from "react-resizable-panels";
import InterviewChatPane from "@/components/workspace/InterviewChatPane";
import CodeEditorPane from "@/components/workspace/CodeEditorPane";
import { GripVertical, LogOut, Settings, LayoutTemplate, Video } from "lucide-react";
import { motion } from "framer-motion";

export default function WorkspacePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="flex h-screen bg-obsidian text-offwhite overflow-hidden selection:bg-indigo-light/30 relative">
      
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

      {/* Ultra-slim Sidebar */}
      <motion.div 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-16 border-r border-white/5 bg-obsidian/40 backdrop-blur-2xl flex flex-col items-center py-6 justify-between z-10 relative shadow-[4px_0_24px_rgba(0,0,0,0.2)]"
      >
        <div className="flex flex-col gap-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-glow/40 to-indigo-light/20 flex items-center justify-center text-indigo-light shadow-[0_0_20px_rgba(99,102,241,0.4)] mb-2 cursor-pointer border border-indigo-light/30 transition-transform hover:scale-105">
            <LayoutTemplate size={18} />
          </div>
          
          {/* Mock Video Toggle */}
          <div className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-coolgray hover:text-white transition-all cursor-pointer tooltip-wrapper relative group">
            <Video size={18} />
            <div className="absolute left-14 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">Toggle Camera</div>
          </div>

          <div className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-coolgray hover:text-white transition-all cursor-pointer tooltip-wrapper relative group">
            <Settings size={18} />
            <div className="absolute left-14 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">Settings</div>
          </div>
        </div>
        
        <div className="w-10 h-10 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-coolgray hover:text-red-400 transition-all cursor-pointer relative group">
          <LogOut size={18} />
          <div className="absolute left-14 bg-black/80 backdrop-blur-md border border-red-500/20 px-3 py-1.5 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl text-red-400">End Interview</div>
        </div>
      </motion.div>

      {/* Main Split Interface - Wrapped in a floating glass container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex-1 h-full p-4 md:p-6 z-10"
      >
        <div className="h-full rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] bg-obsidian/60 backdrop-blur-xl flex ring-1 ring-white/5">
          <Group direction="horizontal">
            
            {/* Left Pane: Chat */}
            <Panel defaultSize={35} minSize={25} className="bg-transparent flex flex-col">
              <InterviewChatPane />
            </Panel>
            
            {/* Draggable Resizer (Glassy) */}
            <Separator className="w-1 bg-white/5 hover:bg-indigo-light/50 active:bg-indigo-light transition-colors flex items-center justify-center group cursor-col-resize z-20 relative before:absolute before:inset-y-0 before:-inset-x-2 before:content-['']">
              <div className="w-1 h-12 rounded-full bg-white/20 group-hover:bg-white/80 transition-colors flex items-center justify-center shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                <GripVertical size={10} className="text-transparent group-hover:text-black/50 transition-colors" />
              </div>
            </Separator>
            
            {/* Right Pane: Code Editor */}
            <Panel defaultSize={65} minSize={40} className="bg-transparent flex flex-col">
              <CodeEditorPane />
            </Panel>

          </Group>
        </div>
      </motion.div>
    </div>
  );
}
