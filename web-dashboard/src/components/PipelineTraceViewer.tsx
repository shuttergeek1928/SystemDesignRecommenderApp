"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Activity, CheckCircle2, XCircle, Clock, Search, Bot } from "lucide-react";
import { PipelineTraceStep } from "@/store/useSystemDesignStore";

interface PipelineTraceViewerProps {
  logs: PipelineTraceStep[];
}

export function PipelineTraceViewer({ logs }: PipelineTraceViewerProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const toggleNode = (stepName: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(stepName)) {
      newExpanded.delete(stepName);
    } else {
      newExpanded.add(stepName);
    }
    setExpandedNodes(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
        return <Activity className="w-5 h-5 text-blue-500 animate-pulse" />;
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "error":
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStepIcon = (name: string) => {
    if (name.toLowerCase().includes("initialization")) return <Activity className="w-4 h-4" />;
    if (name.toLowerCase().includes("generation")) return <Bot className="w-4 h-4" />;
    if (name.toLowerCase().includes("critic")) return <Search className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  if (!logs || logs.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-8 font-sans">
      <div className="mb-6 p-4 border border-border/50 bg-card/30 backdrop-blur rounded-xl shadow-sm">
        <h2 className="text-xl font-bold flex items-center gap-2 text-foreground mb-1">
          <Activity className="w-5 h-5 text-primary" /> Agentic Observability Pipeline
        </h2>
        <p className="text-sm text-muted-foreground">Live trace of the AI agent's execution process.</p>
      </div>

      <div className="relative">
        {/* Vertical line connecting nodes */}
        <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-border z-0"></div>

        <div className="space-y-6 relative z-10">
          {logs.map((log, idx) => {
            const isExpanded = expandedNodes.has(log.stepName);
            const isRunning = log.status.toLowerCase() === "running";
            
            return (
              <div key={log.stepName || idx} className="flex gap-4">
                {/* Node Icon Circle */}
                <div className={`w-16 flex-shrink-0 flex justify-center mt-1`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-background
                    ${isRunning ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 
                      log.status.toLowerCase() === 'success' ? 'border-emerald-500' : 
                      log.status.toLowerCase() === 'error' ? 'border-destructive' : 'border-border'}`}>
                    {getStatusIcon(log.status)}
                  </div>
                </div>

                {/* Node Content Card */}
                <div className={`flex-1 border rounded-xl overflow-hidden transition-all duration-300
                  ${isRunning ? 'border-blue-500/50 shadow-lg shadow-blue-500/10 bg-blue-500/5' : 
                    log.status.toLowerCase() === 'error' ? 'border-destructive/50 bg-destructive/5' : 
                    'border-border bg-card hover:border-primary/50'}`}>
                  
                  {/* Card Header (Clickable) */}
                  <div 
                    className="p-4 cursor-pointer flex items-center justify-between"
                    onClick={() => toggleNode(log.stepName)}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-primary/70">{getStepIcon(log.stepName)}</span>
                        <h3 className="font-bold text-base text-foreground">{log.stepName}</h3>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ml-2
                          ${isRunning ? 'bg-blue-500/20 text-blue-400' : 
                            log.status.toLowerCase() === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 
                            log.status.toLowerCase() === 'error' ? 'bg-destructive/20 text-destructive' : 
                            'bg-muted text-muted-foreground'}`}>
                          {log.status}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80">{log.summary}</p>
                    </div>
                    
                    {log.details && (
                      <div className="text-muted-foreground p-1 hover:bg-muted rounded-md transition-colors">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    )}
                  </div>

                  {/* Card Expanded Details */}
                  {isExpanded && log.details && (
                    <div className="border-t border-border/50 bg-background/50 p-4">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Detailed Log / Raw Context</h4>
                      <pre className="text-xs font-mono bg-background p-3 rounded-md border border-border overflow-x-auto whitespace-pre-wrap text-foreground/80 max-h-96 overflow-y-auto">
                        {log.details}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
