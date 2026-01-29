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
import { MOCK_RECOMMENDATIONS } from "@/api/mockData";
import { RecommendationDetail, ArchitectureChoice } from "@/types/recommendation";
import { cn } from "@/lib/utils";

export function RecommendationsView() {
    const [selectedRecId, setSelectedRecId] = useState(MOCK_RECOMMENDATIONS.recommendations[0].id);
    const [expandedChoice, setExpandedChoice] = useState<string | null>(null);

    const selectedRec = MOCK_RECOMMENDATIONS.recommendations.find(r => r.id === selectedRecId)!;

    return (
        <div className="space-y-12 pb-24">
            {/* Recommendation Tabs */}
            <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
                {MOCK_RECOMMENDATIONS.recommendations.map((rec) => (
                    <button
                        key={rec.id}
                        onClick={() => setSelectedRecId(rec.id)}
                        className={cn(
                            "flex-shrink-0 px-6 py-4 rounded-2xl border-2 transition-all duration-300 text-left min-w-[280px]",
                            selectedRecId === rec.id
                                ? "bg-primary/10 border-primary shadow-lg shadow-primary/20"
                                : "bg-card border-border hover:border-border/80"
                        )}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <span className={cn(
                                "text-xs font-bold uppercase tracking-widest",
                                selectedRecId === rec.id ? "text-primary" : "text-muted-foreground"
                            )}>
                                Recommendation
                            </span>
                            <div className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                                <Zap className="w-3 h-3" /> {rec.confidenceScore}% Match
                            </div>
                        </div>
                        <h3 className="font-bold text-lg leading-tight mb-2">{rec.title}</h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">{rec.description}</p>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={selectedRecId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                >
                    {/* Left Column: Architecture Details */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <Layers className="text-primary w-6 h-6" /> Proposed Architecture
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {selectedRec.architecture.map((choice) => (
                                    <ArchitectureChoiceCard
                                        key={choice.component}
                                        choice={choice}
                                        isExpanded={expandedChoice === choice.component}
                                        onToggle={() => setExpandedChoice(expandedChoice === choice.component ? null : choice.component)}
                                    />
                                ))}
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <ArrowRightLeft className="text-amber-500 w-6 h-6" /> Strategic Trade-offs
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedRec.tradeOffs.map((trade, idx) => (
                                    <Card key={idx} className="p-6 bg-secondary/30">
                                        <h4 className="font-bold text-primary mb-3 text-sm">{trade.factor}</h4>
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="flex-1 p-2 rounded-lg bg-background text-center text-xs font-semibold border border-border">
                                                {trade.choiceA}
                                            </div>
                                            <ArrowRightLeft className="w-4 h-4 text-muted-foreground shrink-0" />
                                            <div className="flex-1 p-2 rounded-lg bg-background text-center text-xs font-semibold border border-border">
                                                {trade.choiceB}
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                                            "{trade.impact}"
                                        </p>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Summaries & Metadata */}
                    <div className="space-y-6">
                        <Card className="p-8 border-primary/20 bg-primary/5">
                            <div className="flex items-center gap-3 mb-6">
                                <ShieldCheck className="text-emerald-500 w-6 h-6" />
                                <h3 className="font-bold text-xl">Design Score</h3>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Confidence</span>
                                        <span className="font-bold text-emerald-500">{selectedRec.confidenceScore}%</span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${selectedRec.confidenceScore}%` }}
                                            className="h-full bg-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border/50 grid grid-cols-1 gap-4 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Learning Curve</span>
                                        <Badge status={selectedRec.productivityImpact.learningCurve}>{selectedRec.productivityImpact.learningCurve}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Dev Speed</span>
                                        <Badge status="Fast">{selectedRec.productivityImpact.developmentSpeed}</Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground">Maintenance</span>
                                        <Badge status={selectedRec.productivityImpact.maintenanceEffort}>{selectedRec.productivityImpact.maintenanceEffort}</Badge>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 space-y-4">
                            <h4 className="font-bold flex items-center gap-2">
                                <Box className="w-4 h-4 text-blue-500" /> Deployment Strategy
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed bg-accent/50 p-4 rounded-xl border border-border/50">
                                {selectedRec.deploymentStrategy}
                            </p>
                        </Card>

                        <div className="p-6 bg-accent rounded-3xl space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-primary/20 rounded-lg shrink-0">
                                    <Info className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold mb-1">Architectural Insight</p>
                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                        This recommendation is optimized for a team size of 10 with a "Fast" learning pace, suggesting more sophisticated patterns like event-driven Go services.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full py-6 text-lg group">
                            Generate Full Report <Cpu className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform" />
                        </Button>
                    </div>
                </motion.div>
            </AnimatePresence>
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
