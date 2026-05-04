"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Activity, CheckCircle2, XCircle, Clock, Search, Bot } from "lucide-react";
import { PipelineTraceStep } from "@/store/useSystemDesignStore";

interface PipelineTraceViewerProps {
  logs: PipelineTraceStep[];
  isLoading?: boolean;
  agentStatus?: string | null;
}

export function PipelineTraceViewer({ logs, isLoading, agentStatus }: PipelineTraceViewerProps) {
  const [activeNodeIndex, setActiveNodeIndex] = useState<number | null>(null);

  // Define the expected pipeline stages
  const defaultStages = [
    { name: "Initialization", icon: <Activity className="w-5 h-5" /> },
    { name: "Context Retrieval", icon: <Search className="w-5 h-5" /> },
    { name: "Agentic Generation", icon: <Bot className="w-5 h-5" /> },
    { name: "Critic Evaluation", icon: <Activity className="w-5 h-5" /> },
  ];

  // We want to show the current pipeline based on logs, and append pending ones if loading
  const displayNodes = [];
  
  for (let i = 0; i < defaultStages.length; i++) {
    const stage = defaultStages[i];
    const matchingLog = logs?.find(l => l.stepName.toLowerCase().includes(stage.name.toLowerCase()) || 
                                       (stage.name === "Context Retrieval" && l.stepName.toLowerCase().includes("rag")) ||
                                       (stage.name === "Agentic Generation" && l.stepName.toLowerCase().includes("generation")) ||
                                       (stage.name === "Critic Evaluation" && l.stepName.toLowerCase().includes("critic")));
    
    if (matchingLog) {
      displayNodes.push({ ...matchingLog, defaultIcon: stage.icon });
    } else {
      // Pending
      displayNodes.push({
        stepName: stage.name,
        status: "Pending",
        summary: "Awaiting execution...",
        details: "",
        defaultIcon: stage.icon
      });
    }
  }

  // If there are logs that don't match the defaults, just append them (to be safe)
  const matchedNames = displayNodes.filter(n => n.status !== "Pending").map(n => n.stepName);
  const extraLogs = (logs || []).filter(l => !matchedNames.includes(l.stepName));
  const finalNodes = [...displayNodes, ...extraLogs.map(l => ({...l, defaultIcon: <Activity className="w-5 h-5" /> }))];

  // Make sure at least one node is "Running" if isLoading is true and none are running
  if (isLoading && !finalNodes.some(n => n.status.toLowerCase() === "running")) {
    const firstPending = finalNodes.find(n => n.status === "Pending");
    if (firstPending) {
        firstPending.status = "Running";
        firstPending.summary = agentStatus || "Starting...";
    }
  }

  // Find the auto-active node (the running one, or the last success one)
  const autoActiveIndex = finalNodes.findIndex(n => n.status.toLowerCase() === "running");
  const actualActiveIndex = activeNodeIndex !== null ? activeNodeIndex : (autoActiveIndex !== -1 ? autoActiveIndex : (finalNodes.length - 1));

  return (
      <div className="w-full max-w-5xl mx-auto my-8 font-sans">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-3 text-foreground mb-3">
          <Activity className="w-8 h-8 text-primary" /> Agentic Observability Pipeline
        </h2>
        <p className="text-muted-foreground text-lg">
           {isLoading ? "Synthesizing architecture in real-time..." : "Live trace of the AI agent's execution process."}
        </p>
      </div>

      {/* HORIZONTAL PIPELINE */}
      <div className="relative flex justify-between items-start w-full px-4 mb-16">
        {/* Background Line */}
        <div className="absolute left-10 right-10 top-6 -translate-y-1/2 h-1 bg-border/50 z-0 rounded-full"></div>

        {finalNodes.map((node, idx) => {
          const isRunning = node.status.toLowerCase() === "running";
          const isSuccess = node.status.toLowerCase() === "success";
          const isError = node.status.toLowerCase() === "error";
          
          let borderClass = "border-border";
          let bgClass = "bg-card";
          let iconClass = "text-muted-foreground";

          if (isSuccess) { borderClass = "border-emerald-500"; bgClass = "bg-emerald-500/10"; iconClass = "text-emerald-500"; }
          else if (isError) { borderClass = "border-destructive"; bgClass = "bg-destructive/10"; iconClass = "text-destructive"; }
          else if (isRunning) { borderClass = "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"; bgClass = "bg-blue-500/10"; iconClass = "text-blue-500"; }
          
          const isActive = actualActiveIndex === idx;

          return (
            <div 
              key={idx} 
              className="relative z-10 flex flex-col items-center gap-4 cursor-pointer group w-32"
              onClick={() => setActiveNodeIndex(idx)}
            >
              {/* Connecting Active Line (left side) */}
              {idx > 0 && (isSuccess || isRunning) && (
                <div className="absolute right-[50%] top-6 -translate-y-1/2 h-1 w-[200%] bg-primary/50 z-[-1] transition-all duration-1000"></div>
              )}

              {/* Node Circle */}
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 bg-background
                ${borderClass} ${bgClass} 
                ${isActive ? 'scale-125 ring-4 ring-primary/20' : 'hover:scale-110'}`}
              >
                 {isRunning ? <Clock className="w-5 h-5 text-blue-500 animate-[spin_3s_linear_infinite]" /> : 
                  isSuccess ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : 
                  isError ? <XCircle className="w-5 h-5 text-destructive" /> : 
                  <div className={iconClass}>{node.defaultIcon}</div>}
              </div>

              {/* Label */}
              <div className="text-center">
                <p className={`text-sm font-bold transition-colors ${isActive ? 'text-primary' : 'text-foreground'}`}>
                    {node.stepName}
                </p>
                <p className={`text-[10px] uppercase tracking-wider font-bold mt-1
                    ${isRunning ? 'text-blue-400' : isSuccess ? 'text-emerald-500' : isError ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {node.status}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACTIVE NODE DETAILS */}
      {finalNodes.map((node, idx) => {
        if (actualActiveIndex !== idx) return null;

        const isRunning = node.status.toLowerCase() === "running";

        return (
          <div key={`details-${idx}`} className={`p-8 border rounded-3xl bg-card/50 transition-all duration-500 shadow-xl backdrop-blur
            ${isRunning ? 'border-blue-500/30 shadow-blue-500/10' : 'border-primary/20'}`}>
            <h3 className="text-2xl font-bold mb-3 flex items-center gap-3">
                <div className="p-2 bg-background rounded-lg border border-border shadow-sm">
                   {node.defaultIcon}
                </div>
                {node.stepName}
            </h3>
            <p className="text-foreground/80 text-lg mb-6">{node.summary}</p>
            
            {node.details ? (
                <div className="mt-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Search className="w-4 h-4" /> Raw Trace Context
                    </p>
                    <pre className="text-sm font-mono bg-zinc-950 p-6 rounded-2xl border border-zinc-800 overflow-x-auto whitespace-pre-wrap text-zinc-300 max-h-96 overflow-y-auto shadow-inner">
                    {node.details}
                    </pre>
                </div>
            ) : isRunning ? (
                <div className="h-32 flex items-center justify-center border-2 border-dashed border-border rounded-2xl bg-background/50">
                    <p className="text-base text-muted-foreground flex items-center gap-3 font-medium">
                        <Activity className="w-5 h-5 text-blue-500 animate-pulse" /> Processing data stream...
                    </p>
                </div>
            ) : (
                <div className="h-24 flex items-center justify-center border border-border rounded-2xl bg-background/30">
                    <p className="text-sm text-muted-foreground italic">No raw context recorded for this step.</p>
                </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
