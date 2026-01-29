"use client";

import { motion } from "framer-motion";
import {
    BarChart3,
    Cpu,
    Layers,
    Settings,
    Zap,
    TrendingUp,
    CheckCircle2,
    AlertCircle,
    FileText,
    Clock,
    Code2
} from "lucide-react";
import { Card } from "@/components/ui/base";
import { cn } from "@/lib/utils";

const RECOMMENDATION = {
    stack: [
        { name: "Next.js (App Router)", type: "Frontend", reason: "Agile dev. cycle & SSR support" },
        { name: "Node.js + NestJS", type: "Backend", reason: "Standard for BP scale & TypeScript support" },
        { name: "PostgreSQL + Prisma", type: "Database", reason: "Strong consistency & Relational needs" },
        { name: "Redis", type: "Caching", reason: "Sub-50ms latency target" },
        { name: "GitHub Actions", type: "CI/CD", reason: "Matches high automation preference" },
    ],
    metrics: [
        { name: "Latency Score", value: 92, status: "Excellent" },
        { name: "Scalability", value: 85, status: "High" },
        { name: "Dev Velocity", value: 98, status: "Top 2%" },
        { name: "Maintenance", value: 74, status: "Moderate" },
    ],
    roadmap: [
        { week: 1, task: "Core Architecture Setup", details: "Initial Infra & Auth" },
        { week: 2, task: "API Development", details: "Core Entities & CRUD" },
        { week: 4, task: "Performance Tuning", details: "Redis Integration" },
        { week: 6, task: "Production Hardening", details: "Load testing & Security" },
    ]
};

export function RecommendationDashboard() {
    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Recommendation</h1>
                    <p className="text-muted-foreground">Analysis based on Nexus Core API requirements</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-accent rounded-xl text-sm font-semibold border border-border">
                        <FileText className="w-4 h-4" /> Export Report
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold shadow-lg shadow-primary/20">
                        <Settings className="w-4 h-4" /> Apply Blueprint
                    </button>
                </div>
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {RECOMMENDATION.metrics.map((metric, idx) => (
                    <Card key={metric.name} className="p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp className="w-12 h-12" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{metric.name}</p>
                        <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold">{metric.value}%</span>
                            <span className="text-xs font-semibold text-emerald-500 mb-1 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> {metric.status}
                            </span>
                        </div>
                        <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${metric.value}%` }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className="h-full bg-primary"
                            />
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recommended Stack */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Layers className="w-5 h-5 text-primary" /> Recommended Tech Stack
                    </h2>
                    <div className="space-y-4">
                        {RECOMMENDATION.stack.map((item, idx) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-5 bg-card border border-border rounded-2xl flex items-center justify-between gap-4 hover:border-primary/30 transition-colors group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                                        <Code2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold">{item.name}</h4>
                                        <p className="text-xs text-muted-foreground">{item.type} • {item.reason}</p>
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">
                                    <Clock className="w-3 h-3" /> Production Grade
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Learning Roadmap */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" /> Dev Productivity Path
                    </h2>
                    <Card className="p-6">
                        <div className="space-y-8 relative">
                            <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
                            {RECOMMENDATION.roadmap.map((item, idx) => (
                                <div key={item.week} className="relative pl-10">
                                    <div className="absolute left-2.5 top-0 w-3 h-3 rounded-full bg-primary border-4 border-background -translate-x-1/2" />
                                    <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider">Week {item.week}</p>
                                    <h4 className="font-bold text-sm mb-1">{item.task}</h4>
                                    <p className="text-xs text-muted-foreground leading-relaxed">{item.details}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-border">
                            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    <span className="font-bold text-amber-500">Note:</span> Your team's <strong>Fast Learning Pace</strong> allows for these advanced architectural patterns.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
