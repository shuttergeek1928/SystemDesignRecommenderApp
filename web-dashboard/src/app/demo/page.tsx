"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Sparkles, Brain, Cpu, Terminal } from "lucide-react";
import Link from "next/link";
import { Button, Card, Textarea, Label } from "@/components/ui/base";
import axios from "axios";
import { ShieldCheck, AlertTriangle, Layers, Clock, CheckCircle2, Sun, Moon } from "lucide-react";

export default function DemoPage() {
    const [mode, setMode] = useState<"standard" | "rag" | "hybrid" | "intelligent">("intelligent");
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const [input, setInput] = useState("");
    const [response, setResponse] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

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
        <div className={`min-h-screen transition-colors duration-500 ${theme === "dark"
                ? "bg-[#050510] text-[#E0E0FF]"
                : "bg-[#FFFFFF] text-[#0F172A]"
            } selection:bg-primary/40 font-sans tracking-tight`}>

            {/* Ultra-Premium Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className={`absolute top-[-20%] left-[-10%] w-[60%] h-[60%] blur-[150px] rounded-full animate-pulse transition-all duration-1000 ${theme === "dark" ? "bg-blue-600/10" : "bg-blue-400/20"
                    }`} />
                <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] blur-[150px] rounded-full animate-pulse transition-all duration-1000 ${theme === "dark" ? "bg-purple-600/10" : "bg-purple-400/20"
                    }`} />
                {theme === "dark" && <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />}
            </div>

            <div className="container mx-auto px-4 py-8 relative z-10 max-w-6xl">
                {/* Top Nav / Theme Toggle */}
                <div className="flex justify-between items-center mb-8">
                    <Link
                        href="/"
                        className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${theme === "dark" ? "text-muted-foreground hover:text-primary" : "text-slate-500 hover:text-primary-foreground bg-slate-100 px-4 py-2 rounded-full"
                            }`}
                    >
                        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                        Portal Home
                    </Link>

                    <button
                        onClick={toggleTheme}
                        className={`p-3 rounded-2xl border transition-all duration-300 shadow-sm ${theme === "dark"
                                ? "bg-white/5 border-white/10 text-yellow-400 hover:bg-white/10"
                                : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50 shadow-slate-200"
                            }`}
                    >
                        {theme === "dark" ? <Sun className="w-5 h-5 shadow-primary/50" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>

                {/* Minimal Header */}
                <header className="mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest mb-6 ${theme === "dark" ? "bg-primary/10 border-primary/20 text-primary" : "bg-blue-600 text-white border-blue-700 shadow-lg shadow-blue-500/20"
                            }`}
                    >
                        <Sparkles className="w-3.5 h-3.5" /> Next-Gen Architecture Engine
                    </motion.div>
                    <h1 className={`text-4xl md:text-7xl font-extrabold tracking-tighter mb-4 ${theme === "dark" ? "bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60" : "text-slate-950"
                        }`}>
                        Contextual <span className={theme === "dark" ? "text-primary italic" : "text-blue-600 italic"}>Intelligence</span>
                    </h1>
                    <p className={`max-w-2xl mx-auto text-lg leading-relaxed text-center font-medium ${theme === "dark" ? "text-muted-foreground/80" : "text-slate-600"
                        }`}>
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
                        <Card className={`p-8 backdrop-blur-3xl relative group overflow-hidden shadow-2xl rounded-[2.5rem] transition-all border ${theme === "dark" ? "bg-black/40 border-white/5" : "bg-white border-slate-200 shadow-slate-200/40"
                            }`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative z-10 space-y-8 text-left">
                                {/* Mode Selection */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Label className={`text-[10px] font-black uppercase tracking-widest ${theme === "light" ? "text-slate-900" : "opacity-60"}`}>Engine Protocol</Label>
                                        <span className={`text-[10px] font-bold ${theme === "light" ? "text-blue-600" : "text-primary"}`}>High Accuracy: Intelligent</span>
                                    </div>
                                    <div className={`flex flex-wrap gap-2 p-1.5 border rounded-2xl ${theme === "dark" ? "bg-black/50 border-white/5" : "bg-slate-50 border-slate-200"
                                        }`}>
                                        {[
                                            { id: "standard", label: "LLM Only", icon: Cpu },
                                            { id: "rag", label: "RAG Mode", icon: Sparkles },
                                            { id: "hybrid", label: "Rule Engine", icon: Terminal },
                                            { id: "intelligent", label: "Intelligent", icon: Brain },
                                        ].map((m) => (
                                            <button
                                                key={m.id}
                                                onClick={() => setMode(m.id as any)}
                                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${mode === m.id
                                                        ? (theme === "dark" ? "bg-primary text-white shadow-xl shadow-primary/20" : "bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]")
                                                        : (theme === "dark" ? "text-muted-foreground hover:bg-white/5" : "text-slate-500 hover:bg-white hover:shadow-sm")
                                                    }`}
                                            >
                                                <m.icon className="w-3.5 h-3.5" /> {m.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className={`text-[10px] font-black uppercase tracking-widest ${theme === "light" ? "text-slate-900" : "opacity-60"}`}>Design Challenge</Label>
                                    <Textarea
                                        placeholder="Describe your system requirements in detail..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className={`h-36 rounded-2xl text-lg font-medium transition-all font-mono border-2 ${theme === "dark" ? "bg-black/40 border-white/5 focus:border-primary/40 focus:ring-primary/20" : "bg-white border-slate-100 focus:border-blue-500/40 focus:ring-blue-500/10 text-slate-900 placeholder:text-slate-300"
                                            }`}
                                    />
                                </div>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !input.trim()}
                                    className={`w-full h-16 rounded-2xl text-lg font-black uppercase tracking-wider group relative overflow-hidden transition-transform active:scale-[0.98] ${theme === "light" ? "bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/40" : ""
                                        }`}
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3 w-full">
                                        {isLoading ? <Cpu className="w-6 h-6 animate-spin text-white" /> : <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                        {isLoading ? "Synthesizing Architecture..." : "Generate Architecture"}
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
                                        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] pl-2 ${theme === "light" ? "text-blue-700" : "text-primary"}`}>System Context</h3>
                                        <Card className={`p-6 rounded-[2rem] space-y-8 border shadow-xl ${theme === "dark" ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-200 shadow-slate-100/50"
                                            }`}>
                                            <div>
                                                <h4 className={`text-2xl font-bold mb-2 tracking-tight ${theme === "light" ? "text-slate-900" : "text-white"}`}>{response.extractedRequirements?.title}</h4>
                                                <p className={`text-xs leading-relaxed ${theme === "light" ? "text-slate-500" : "text-muted-foreground"}`}>{response.extractedRequirements?.description}</p>
                                            </div>

                                            <div className="space-y-4">
                                                <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em]">Contextual Dimensions</p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {[
                                                        { label: "Users", val: response.extractedRequirements?.context?.users, color: theme === "dark" ? "text-blue-400" : "text-blue-700" },
                                                        { label: "Requests", val: (response.extractedRequirements?.context?.request_rate ?? "N/A") + "/s", color: theme === "dark" ? "text-purple-400" : "text-purple-700" },
                                                        { label: "Data", val: (response.extractedRequirements?.context?.data_volume_gb ?? "N/A") + " GB", color: theme === "dark" ? "text-emerald-400" : "text-emerald-700" },
                                                        { label: "Availability", val: response.extractedRequirements?.context?.availability_slo, color: theme === "dark" ? "text-amber-400" : "text-amber-700" },
                                                    ].map((stat) => (
                                                        <div key={stat.label} className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-white/[0.03] border-white/5" : "bg-slate-50 border-slate-100"
                                                            }`}>
                                                            <p className="text-[10px] opacity-50 font-bold uppercase mb-1">{stat.label}</p>
                                                            <p className={`text-xl font-black ${stat.color}`}>{stat.val || "N/A"}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Reasoning Anchors */}
                                            {response.triggeredRules?.length > 0 && (
                                                <div className={`space-y-4 border-t pt-8 ${theme === "dark" ? "border-white/5" : "border-slate-100"}`}>
                                                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === "light" ? "text-blue-700" : "text-primary"}`}>Reasoning Anchors</p>
                                                    <div className="space-y-3">
                                                        {response.triggeredRules.map((rule: any, i: number) => (
                                                            <div key={i} className={`p-3 rounded-xl relative overflow-hidden group border ${theme === "dark" ? "bg-primary/5 border-primary/20" : "bg-blue-50 border-blue-100"
                                                                }`}>
                                                                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:rotate-12 transition-transform">
                                                                    <ShieldCheck className={`w-8 h-8 ${theme === "light" ? "text-blue-600" : "text-primary"}`} />
                                                                </div>
                                                                <p className={`text-[10px] font-black uppercase mb-0.5 ${theme === "light" ? "text-blue-800" : "text-primary"}`}>{rule.dimension}</p>
                                                                <p className={`text-xs font-bold leading-tight ${theme === "light" ? "text-slate-800" : "text-white"}`}>{rule.recommendation}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </Card>
                                    </div>

                                    {/* Architecture Blueprint Grid */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] pl-2 ${theme === "light" ? "text-blue-700" : "text-primary"}`}>Architectural Blueprint</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {Object.entries(response.architectureDesign || {}).map(([key, design]: any) => {
                                                const anchor = response.triggeredRules?.find((r: any) => r.dimension.toLowerCase().includes(key.toLowerCase()));
                                                const hasConflict = anchor && !design.choice.toLowerCase().includes(anchor.recommendation.toLowerCase());

                                                return (
                                                    <Card key={key} className={`p-6 rounded-[2.5rem] hover:scale-[1.01] transition-all relative overflow-hidden group border shadow-xl ${theme === "dark"
                                                            ? `bg-white/[0.02] border-white/5 ${hasConflict ? 'border-amber-500/20 shadow-amber-500/5' : ''}`
                                                            : `bg-white border-slate-200 ${hasConflict ? 'border-amber-400/50 shadow-amber-200/20' : 'shadow-slate-200/20'}`
                                                        }`}>
                                                        <div className="flex justify-between items-start mb-6">
                                                            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${theme === "dark" ? "bg-white/5 text-primary" : "bg-blue-50 text-blue-700"
                                                                }`}>
                                                                {key.charAt(0).toUpperCase()}
                                                            </div>
                                                            {hasConflict && (
                                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse">
                                                                    <AlertTriangle className="w-3 h-3 text-center" /> Anchor Conflict
                                                                </div>
                                                            )}
                                                        </div>

                                                        <h5 className="text-[10px] font-black opacity-30 uppercase tracking-[0.2em] mb-1">{key} Node</h5>
                                                        <h4 className={`text-xl font-black mb-3 leading-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{design.choice}</h4>

                                                        <p className={`text-xs leading-relaxed mb-6 font-medium italic border-l-2 pl-4 ${theme === "dark" ? "text-muted-foreground opacity-70 border-primary/20" : "text-slate-500 border-blue-200"
                                                            }`}>
                                                            "{design.justification}"
                                                        </p>

                                                        <div className={`space-y-3 mt-4 pt-4 border-t ${theme === "dark" ? "border-white/5" : "border-slate-50"}`}>
                                                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest opacity-40">
                                                                <span>Intelligence Comparison</span>
                                                                <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-2.5 h-2.5" /> Verified</span>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <div className={`p-2.5 rounded-xl border ${theme === "dark" ? "bg-black/40 border-white/5" : "bg-slate-50/50 border-slate-100"}`}>
                                                                    <p className="text-[8px] opacity-30 uppercase mb-0.5">LLM Proposed</p>
                                                                    <p className={`text-[9px] font-bold truncate ${theme === "light" ? "text-slate-700" : ""}`}>Creative Option</p>
                                                                </div>
                                                                <div className={`p-2.5 rounded-xl border ${anchor
                                                                        ? (theme === "dark" ? 'bg-primary/5 border-primary/20' : 'bg-blue-50 border-blue-200 shadow-sm')
                                                                        : (theme === "dark" ? 'bg-white/3 border-white/5' : 'bg-slate-50/50 border-slate-100')
                                                                    }`}>
                                                                    <p className="text-[8px] opacity-30 uppercase mb-0.5">Rule Anchor</p>
                                                                    <p className={`text-[9px] font-black truncate ${theme === "light" ? "text-blue-800" : "text-primary"}`}>{anchor?.recommendation || "System Match"}</p>
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
