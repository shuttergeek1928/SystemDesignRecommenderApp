"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Sparkles, Brain, Cpu, Terminal } from "lucide-react";
import Link from "next/link";
import { Button, Card, Textarea, Label } from "@/components/ui/base";
import axios from "axios";
import { ShieldCheck, AlertTriangle, Layers, Clock, CheckCircle2 } from "lucide-react";

export default function DemoPage() {
    const [mode, setMode] = useState<"standard" | "rag" | "hybrid" | "intelligent">("intelligent");
    const [input, setInput] = useState("");
    const [response, setResponse] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!input.trim()) return;

        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            const res = await axios.post("http://localhost:5220/api/SystemDesign/generate", {
                problem_statement: input,
                use_rag: mode === "rag" || mode === "intelligent",
                use_hybrid: mode === "hybrid" || mode === "intelligent"
            });

            setResponse(res.data);
        } catch (err: any) {
            console.error("API Error:", err);
            setError(err.response?.data?.error || "Failed to get response from the API.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050510] text-[#E0E0FF] selection:bg-primary/40 font-sans tracking-tight">
            {/* Ultra-Premium Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
            </div>

            <div className="container mx-auto px-4 py-16 relative z-10 max-w-6xl">
                {/* Minimal Header */}
                <header className="mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6"
                    >
                        <Sparkles className="w-3.5 h-3.5" /> Next-Gen Architecture Engine
                    </motion.div>
                    <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                        Contextual <span className="text-primary italic">Intelligence</span>
                    </h1>
                    <p className="text-muted-foreground/80 max-w-2xl mx-auto text-lg leading-relaxed text-center">
                        Synthesize complex requirements into enterprise-grade designs using our hybrid reasoning protocol.
                    </p>
                </header>

                <div className="space-y-12">
                    {/* Input Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto"
                    >
                        <Card className="p-8 bg-black/40 backdrop-blur-3xl border-white/5 relative group overflow-hidden shadow-2xl rounded-[2rem]">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="relative z-10 space-y-8 text-left">
                                {/* Mode Selection */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Engine Protocol</Label>
                                        <span className="text-[10px] text-primary font-bold">Recommended: Intelligent</span>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 p-1.5 bg-black/50 border border-white/5 rounded-2xl">
                                        {[
                                            { id: "standard", label: "LLM Only", icon: Cpu },
                                            { id: "rag", label: "RAG Mode", icon: Sparkles },
                                            { id: "hybrid", label: "Rule Engine", icon: Terminal },
                                            { id: "intelligent", label: "Intelligent", icon: Brain },
                                        ].map((m) => (
                                            <button
                                                key={m.id}
                                                onClick={() => setMode(m.id as any)}
                                                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[11px] font-black uppercase transition-all duration-300 ${
                                                    mode === m.id
                                                        ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]"
                                                        : "text-muted-foreground hover:bg-white/5"
                                                }`}
                                            >
                                                <m.icon className="w-4 h-4" /> {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest opacity-60">Design Challenge</Label>
                                    <Textarea
                                        placeholder="Describe your system requirements..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="h-36 bg-black/40 border-white/5 focus:border-primary/40 focus:ring-primary/20 rounded-2xl text-lg font-medium placeholder:text-muted-foreground/30 transition-all font-mono"
                                    />
                                </div>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !input.trim()}
                                    className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-wider group relative overflow-hidden text-white"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3 w-full">
                                        {isLoading ? <Cpu className="w-6 h-6 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                        {isLoading ? "Synthesizing Architecture..." : "Generate Recommendation"}
                                    </span>
                                </Button>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Result Interface */}
                    <AnimatePresence>
                        {response && (
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-12"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start text-left">
                                    {/* Column 1: Requirements & Context */}
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] pl-2">System Context</h3>
                                        <Card className="p-6 bg-white/[0.02] border-white/5 rounded-[2rem] space-y-8">
                                            <div>
                                                <h4 className="text-2xl font-bold mb-2 tracking-tight">{response.extractedRequirements?.title}</h4>
                                                <p className="text-xs text-muted-foreground leading-relaxed">{response.extractedRequirements?.description}</p>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em]">Contextual Dimensions</p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {[
                                                        { label: "Users", val: response.extractedRequirements?.context?.users, color: "text-blue-400" },
                                                        { label: "Requests", val: (response.extractedRequirements?.context?.request_rate ?? "N/A") + "/s", color: "text-purple-400" },
                                                        { label: "Data", val: (response.extractedRequirements?.context?.data_volume_gb ?? "N/A") + " GB", color: "text-emerald-400" },
                                                        { label: "Availability", val: response.extractedRequirements?.context?.availability_slo, color: "text-amber-400" },
                                                    ].map((stat) => (
                                                        <div key={stat.label} className="p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                                                            <p className="text-[10px] opacity-50 font-bold uppercase mb-1">{stat.label}</p>
                                                            <p className={`text-xl font-black ${stat.color}`}>{stat.val || "N/A"}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Reasoning Anchors */}
                                            {response.triggeredRules?.length > 0 && (
                                                <div className="space-y-4 border-t border-white/5 pt-8">
                                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Reasoning Anchors</p>
                                                    <div className="space-y-3">
                                                        {response.triggeredRules.map((rule: any, i: number) => (
                                                            <div key={i} className="p-3 bg-primary/5 border border-primary/20 rounded-xl relative overflow-hidden group">
                                                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 transition-transform">
                                                                    <ShieldCheck className="w-8 h-8" />
                                                                </div>
                                                                <p className="text-[10px] font-black uppercase text-primary mb-0.5">{rule.dimension}</p>
                                                                <p className="text-xs font-bold leading-tight">{rule.recommendation}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    </div>

                                    {/* Architecture Comparison */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <h3 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] pl-2">Architectural Blueprint</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {Object.entries(response.architectureDesign || {}).map(([key, design]: any) => {
                                                const anchor = response.triggeredRules?.find((r: any) => r.dimension.toLowerCase().includes(key.toLowerCase()));
                                                const hasConflict = anchor && !design.choice.toLowerCase().includes(anchor.recommendation.toLowerCase());

                                                return (
                                                    <Card key={key} className={`p-6 bg-white/[0.02] border-white/5 rounded-[2rem] hover:bg-white/[0.04] transition-all relative overflow-hidden group ${hasConflict ? 'border-amber-500/20' : ''}`}>
                                                        <div className="flex justify-between items-start mb-6">
                                                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center text-primary uppercase font-black text-xs">
                                                                {key.charAt(0)}
                                                            </div>
                                                            {hasConflict && (
                                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                                    <AlertTriangle className="w-3 h-3 text-center" /> Rule Anchor Conflict
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        <h5 className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">{key} Node</h5>
                                                        <h4 className="text-xl font-black mb-3 text-white leading-tight">{design.choice}</h4>
                                                        
                                                        <p className="text-xs text-muted-foreground leading-relaxed mb-6 font-medium italic opacity-70 border-l-2 border-primary/20 pl-4">
                                                            "{design.justification}"
                                                        </p>

                                                        <div className="space-y-2 mt-4 pt-4 border-t border-white/5">
                                                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-40">
                                                                <span>Engine Comparison</span>
                                                                <span className="text-emerald-500">Match found</span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                                <div className="p-2 bg-black/40 rounded-xl border border-white/5">
                                                                    <p className="text-[8px] opacity-30 uppercase mb-0.5">LLM Choice</p>
                                                                    <p className="text-[10px] font-bold truncate">Proposed</p>
                                                                </div>
                                                                <div className={`p-2 rounded-xl border ${anchor ? 'bg-primary/5 border-primary/20' : 'bg-white/5 border-white/10'}`}>
                                                                    <p className="text-[8px] opacity-30 uppercase mb-0.5">Deterministic Anchor</p>
                                                                    <p className="text-[10px] font-black text-primary truncate">{anchor?.recommendation || "Verified"}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-black uppercase tracking-widest text-center">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
