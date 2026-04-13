"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Layers,
    ArrowRightLeft,
    Zap,
    ShieldCheck,
    Cpu,
    CheckCircle2,
    XCircle,
    Box,
    Info,
    ChevronDown,
    ChevronUp
} from "lucide-react";
import { Card, Button } from "@/components/ui/base";
import { useSystemDesignStore } from "@/store/useSystemDesignStore";
import { RecommendationDetail, ArchitectureChoice } from "@/types/recommendation";
import { cn } from "@/lib/utils";

export function RecommendationsView() {
    const { recommendation, isLoading } = useSystemDesignStore();
    const [expandedChoice, setExpandedChoice] = useState<string | null>(null);

    if (isLoading) {
        return (
            <div className="py-20 text-center animate-pulse">
                <Cpu className="mx-auto w-12 h-12 text-primary mb-6 animate-spin" />
                <h2 className="text-2xl font-bold">Synthesizing Architecture...</h2>
                <p className="text-muted-foreground mt-2">Checking reliability models and cost trade-offs</p>
            </div>
        )
    }

    if (!recommendation) {
        return (
            <div className="py-20 text-center">
                <Info className="mx-auto w-12 h-12 text-muted-foreground mb-6" />
                <h2 className="text-2xl font-bold">No Recommendation Yet</h2>
                <p className="text-muted-foreground mt-2">Finish the "Get Started" wizard to see architectural advice.</p>
                <Button className="mt-8" onClick={() => window.location.href = "/get-started"}>
                    Go to Wizard
                </Button>
            </div>
        )
    }

    const { ArchitectureDesign: arch, ExtractedRequirements: req } = recommendation.data;

    // Convert keys to an array for rendering
    const choices = Object.entries(arch).map(([key, value]: [string, any]) => ({
        component: key,
        selection: value.choice,
        rationale: value.justification,
        alternatives: [], // In progress
        pros: [], // In progress
        cons: [], // In progress
    }));

    return (
        <div className="space-y-12 pb-24">
            {/* Header / Requirement Summary */}
            <header className="p-8 border-2 border-primary/20 bg-primary/5 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Recommendation for {req.title || "Your System"}
                    </h1>
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-500 uppercase">
                        <Zap className="w-3 h-3" /> AI Analysis Mode
                    </div>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed max-w-4xl">
                    {req.description}
                </p>
                <div className="flex flex-wrap gap-2">
                    <div className="px-3 py-1 rounded-full bg-background border border-border text-[11px] font-bold uppercase tracking-wider">
                        Users: {typeof req.context.users === 'number' ? req.context.users.toLocaleString() : req.context.users}
                    </div>
                    <div className="px-3 py-1 rounded-full bg-background border border-border text-[11px] font-bold uppercase tracking-wider">
                        Latency: {req.context.latency_requirement_ms}ms
                    </div>
                    <div className="px-3 py-1 rounded-full bg-background border border-border text-[11px] font-bold uppercase tracking-wider">
                        SLO: {req.context.availability_slo}
                    </div>
                    <div className="px-3 py-1 rounded-full bg-background border border-border text-[11px] font-bold uppercase tracking-wider text-primary">
                        Consistency: {req.context.consistency_model}
                    </div>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
                {/* Left Column: Architecture Details */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Layers className="text-primary w-6 h-6" /> Proposed Architecture
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {choices.map((choice) => (
                                <ArchitectureChoiceCard
                                    key={choice.component}
                                    choice={choice}
                                    isExpanded={expandedChoice === choice.component}
                                    onToggle={() => setExpandedChoice(expandedChoice === choice.component ? null : choice.component)}
                                />
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Summaries & Metadata */}
                <div className="space-y-6">
                    <Card className="p-8 border-primary/20 bg-primary/5">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck className="text-emerald-500 w-6 h-6" />
                            <h3 className="font-bold text-xl">Integrity Score</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between text-sm mb-2 font-bold select-none">
                                    <span className="text-muted-foreground uppercase tracking-widest text-[10px]">Confidence Match</span>
                                    <span className="text-emerald-500">94%</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "94%" }}
                                        className="h-full bg-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-border/50 grid grid-cols-1 gap-2 text-sm leading-relaxed">
                                <div className="flex flex-col gap-1">
                                    <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Strategy Context</span>
                                    <p className="text-xs font-medium">Provider: AWS (Joint Analysis Mode)</p>
                                </div>
                                <div className="flex flex-col gap-1 mt-2">
                                    <span className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Cloud Strategy</span>
                                    <p className="text-xs font-medium">{req.context.region_strategy}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="p-8 bg-zinc-900 text-white rounded-[2rem] space-y-4 border border-zinc-800 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                             <Cpu className="w-24 h-24" />
                        </div>
                        <h4 className="font-bold flex items-center gap-2 relative z-10">
                            <Zap className="w-4 h-4 text-amber-500" /> Architecture Insight
                        </h4>
                        <p className="text-xs text-zinc-400 leading-relaxed relative z-10 italic">
                            The choices above are synthesized by analyzing the interplay between ${req.context.users.toLocaleString()} users and your "${req.context.traffic_pattern}" traffic pattern, ensuring cost-efficiency at "${req.context.budget}" budget levels.
                        </p>
                        <Button className="w-full bg-white text-black hover:bg-zinc-200 mt-4 relative z-10" onClick={() => window.print()}>
                            Export PDF Report
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function ArchitectureChoiceCard({ choice, isExpanded, onToggle }: { choice: ArchitectureChoice, isExpanded: boolean, onToggle: () => void }) {
    return (
        <Card className={cn(
            "group border transition-all duration-300 overflow-hidden",
            isExpanded ? "border-primary ring-1 ring-primary/50" : "hover:border-primary/50"
        )}>
            <div
                className="p-6 cursor-pointer flex items-center justify-between"
                onClick={onToggle}
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Box className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{choice.component}</p>
                        <h4 className="font-bold text-lg">{choice.selection}</h4>
                    </div>
                </div>
                {isExpanded ? <ChevronUp className="text-muted-foreground" /> : <ChevronDown className="text-muted-foreground" />}
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6 space-y-6 border-t border-border mt-2 pt-6"
                    >
                        <div className="space-y-2">
                            <p className="text-xs font-bold text-primary uppercase tracking-wider">Rationale</p>
                            <p className="text-sm text-foreground/80 leading-relaxed">{choice.rationale}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-2">
                                    <CheckCircle2 className="w-3 h-3" /> Advantages
                                </p>
                                <ul className="space-y-2">
                                    {choice.pros.map((pro, i) => (
                                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500" /> {pro}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-2">
                                    <XCircle className="w-3 h-3" /> Considerations
                                </p>
                                <ul className="space-y-2">
                                    {choice.cons.map((con, i) => (
                                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-rose-500" /> {con}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="p-4 bg-secondary rounded-xl">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Evaluated Alternatives</p>
                            <div className="flex flex-wrap gap-2">
                                {choice.alternatives.map((alt) => (
                                    <span key={alt} className="px-2 py-1 bg-background border border-border rounded text-[10px] font-medium text-muted-foreground">
                                        {alt}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </Card>
    );
}

function Badge({ children, status }: { children: React.ReactNode, status: string }) {
    const variants: Record<string, string> = {
        "Low": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        "Medium": "bg-amber-500/10 text-amber-500 border-amber-500/20",
        "High": "bg-rose-500/10 text-rose-500 border-rose-500/20",
        "Fast": "bg-blue-500/10 text-blue-500 border-blue-500/20",
        "Balanced": "bg-purple-500/10 text-purple-500 border-purple-500/20",
        "Steady": "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    };

    return (
        <span className={cn(
            "px-2 py-0.5 rounded text-[10px] font-bold border",
            variants[status] || "bg-accent text-foreground"
        )}>
            {children}
        </span>
    )
}
