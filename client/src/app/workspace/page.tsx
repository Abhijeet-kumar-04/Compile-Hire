"use client";

import React from "react";
import { Panel, Group, Separator } from "react-resizable-panels";
import InterviewChatPane from "@/components/workspace/InterviewChatPane";
import CodeEditorPane from "@/components/workspace/CodeEditorPane";
import { GripVertical, LogOut, Settings, LayoutTemplate } from "lucide-react";

export default function WorkspacePage() {
  return (
    <div className="flex h-screen bg-obsidian text-offwhite overflow-hidden selection:bg-indigo-light/30">
      
      {/* Ultra-slim Sidebar */}
      <div className="w-16 border-r border-white/5 bg-obsidian/50 flex flex-col items-center py-4 justify-between z-10 relative">
        <div className="flex flex-col gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-glow/20 flex items-center justify-center text-indigo-light shadow-[0_0_15px_rgba(99,102,241,0.3)] mb-4 cursor-pointer">
            <LayoutTemplate size={20} />
          </div>
          <div className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-coolgray hover:text-white transition-colors cursor-pointer tooltip-wrapper relative group">
            <Settings size={20} />
            <div className="absolute left-14 bg-black px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Settings</div>
          </div>
        </div>
        
        <div className="w-10 h-10 rounded-xl hover:bg-red-500/10 flex items-center justify-center text-coolgray hover:text-red-400 transition-colors cursor-pointer relative group">
          <LogOut size={20} />
          <div className="absolute left-14 bg-black px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">End Interview</div>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="flex-1 h-full">
        <Group direction="horizontal">
          
          {/* Left Pane: Chat */}
          <Panel defaultSize={35} minSize={25} className="bg-obsidian/80">
            <InterviewChatPane />
          </Panel>
          
          {/* Draggable Resizer */}
          <Separator className="w-1.5 bg-black hover:bg-indigo-light/50 active:bg-indigo-light transition-colors flex items-center justify-center group cursor-col-resize">
            <div className="w-1 h-8 rounded-full bg-white/10 group-hover:bg-white/50 transition-colors flex items-center justify-center">
              <GripVertical size={10} className="text-white/30 group-hover:text-white/80" />
            </div>
          </Separator>
          
          {/* Right Pane: Code Editor */}
          <Panel defaultSize={65} minSize={40}>
            <CodeEditorPane />
          </Panel>

        </Group>
      </div>

      {/* Background ambient light */}
      <div className="absolute top-[20%] left-[30%] w-[500px] h-[500px] bg-indigo-glow/5 rounded-full blur-[150px] pointer-events-none" />
    </div>
  );
}
