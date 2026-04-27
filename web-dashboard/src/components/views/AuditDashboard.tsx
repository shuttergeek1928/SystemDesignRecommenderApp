"use client";

import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts';
import { Card } from "@/components/ui/base";
import { ShieldCheck, Target, Rocket, MessageSquare, Award, Info, HelpCircle } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from "@/lib/utils";

interface AuditDashboardProps {
    scores: any;
    rules: any[];
}

export function AuditDashboard({ scores, rules }: AuditDashboardProps) {
    console.log("AuditDashboard: Received scores object:", scores);
    console.log("AuditDashboard: Received rules array:", rules);

    const s = {
        alignment: scores.industryAlignmentScore ?? scores.IndustryAlignmentScore ?? 0,
        compliance: scores.constraintFulfillmentScore ?? scores.ConstraintFulfillmentScore ?? 0,
        readiness: scores.deploymentReadinessScore ?? scores.DeploymentReadinessScore ?? 0,
        rubric: scores.rubricScore ?? scores.RubricScore ?? 0,
        report: scores.criticReport ?? scores.CriticReport ?? "No critique available.",
    };

    const data = [
        { subject: 'Industry Alignment', A: s.alignment, fullMark: 100 },
        { subject: 'Rule Compliance', A: s.compliance, fullMark: 100 },
        { subject: 'Deployment Readiness', A: s.readiness, fullMark: 100 },
        { subject: 'Agentic Rubric', A: s.rubric, fullMark: 100 },
        { subject: 'Total Grade', A: (s.alignment + s.compliance + s.readiness + s.rubric) / 4, fullMark: 100 },
    ];

    return (
        <div className="space-y-8 mt-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="p-8 border-primary/20 bg-zinc-950/50 backdrop-blur-xl flex flex-col lg:col-span-2 order-2 lg:order-1">
                    <div className="flex items-center gap-3 mb-6">
                        <MessageSquare className="text-primary w-6 h-6" />
                        <h2 className="text-2xl font-bold">Critic Agent Report</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[600px] pr-4 custom-scrollbar">
                        {(() => {
                            // Clean the report text: remove dashes from headers and hide the final score line
                            const cleanReport = s.report
                                ?.replace(/[-]{2,}\s*(.*?)\s*[-]{2,}/g, '$1') // Remove --- title ---, --title--, etc.
                                ?.replace(/FINAL_SCORE: \d+/g, '') // Hide the score line from the text
                                ?.trim();

                            return (
                                <div className="prose prose-invert prose-sm max-w-none 
                                    prose-headings:text-primary prose-headings:font-bold prose-headings:mt-12 prose-headings:mb-8 prose-headings:pb-2 prose-headings:border-b prose-headings:border-white/10
                                    prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:mb-8
                                    prose-strong:text-zinc-100 prose-strong:font-bold prose-strong:text-sm
                                    prose-em:text-zinc-500 prose-em:text-[11px] prose-em:not-italic prose-em:block prose-em:mt-2 prose-em:ml-1
                                    prose-ul:list-none prose-ul:pl-0 prose-li:mb-12 prose-li:bg-white/5 prose-li:p-8 prose-li:rounded-[2rem] prose-li:border prose-li:border-white/5
                                    prose-hr:border-zinc-800 prose-hr:my-12">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            h3: ({ node, ...props }) => <h3 className="text-xl text-primary font-bold border-b border-primary/20 pb-3 mb-8 mt-12" {...props} />,
                                            strong: ({ node, children, ...props }) => {
                                                const text = typeof children === 'string' ? children : '';
                                                if (text.includes('SCORE:')) {
                                                    return (
                                                        <span className="block mt-14 pt-8 border-t border-white/10 text-[11px] font-black tracking-[0.4em] text-primary uppercase text-right" {...props}>
                                                            {text}
                                                        </span>
                                                    );
                                                }
                                                return <span className="text-primary font-bold text-[11px] block mb-3 tracking-[0.2em] uppercase opacity-70" {...props}>{children}</span>;
                                            },
                                            em: ({ node, ...props }) => <span className="text-zinc-300 text-[14px] leading-relaxed italic block pl-1 opacity-90 mt-3 border-l-2 border-primary/20 pl-6" {...props} />,
                                            li: ({ node, ...props }) => <li className="mb-10 last:mb-0 bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/5 hover:border-primary/20 transition-all duration-500 shadow-xl" {...props} />
                                        }}
                                    >
                                        {cleanReport}
                                    </ReactMarkdown>
                                </div>
                            );
                        })()}
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Audit Status</span>
                            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                                Research Validated
                            </span>
                        </div>
                    </div>
                </Card>

                <Card className="p-8 border-primary/20 bg-background/50 backdrop-blur-xl lg:col-span-1 order-1 lg:order-2">
                    <div className="flex items-center gap-3 mb-8">
                        <Award className="text-primary w-6 h-6" />
                        <h2 className="text-2xl font-bold">Architectural Radar</h2>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                                <PolarGrid stroke="#444" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#999', fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#666' }} />
                                <Radar
                                    name="Design Score"
                                    dataKey="A"
                                    stroke="#ec4899"
                                    fill="#ec4899"
                                    fillOpacity={0.4}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-8">
                        <ScoreCard
                            label="Alignment"
                            score={s.alignment}
                            icon={<Target className="w-4 h-4" />}
                            help="Compares your design against 40+ high-scale industry blueprints (Netflix, Uber, etc.) to ensure pattern validity."
                        />
                        <ScoreCard
                            label="Compliance"
                            score={s.compliance}
                            icon={<ShieldCheck className="w-4 h-4" />}
                            help="Calculated by cross-referencing your 'Compliance' tags (GDPR, HIPAA) against active architectural rules."
                        />
                        <ScoreCard
                            label="Readiness"
                            score={s.readiness}
                            icon={<Rocket className="w-4 h-4" />}
                            help="Heuristic score based on service specificity (e.g. 'Amazon RDS' vs 'Database') and operational maturity."
                        />
                        <ScoreCard
                            label="Rubric"
                            score={s.rubric}
                            icon={<MessageSquare className="w-4 h-4" />}
                            help="Final agentic score from the Gemini 1.5 Pro Critic Agent after analyzing all trade-offs and constraints."
                        />
                    </div>
                </Card>
            </div>

            {/* NEW: RULE AUDIT SECTION */}
            {rules && rules.length > 0 && (
                <Card className="p-8 border-primary/10 bg-zinc-950/30">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="text-primary w-6 h-6" />
                            <h2 className="text-2xl font-bold">Rule Engine Audit</h2>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Matched ({rules.filter(r => r.isMatched).length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                                <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Idle ({rules.filter(r => !r.isMatched).length})</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {rules.map((rule, idx) => (
                            <div 
                                key={idx} 
                                className={cn(
                                    "p-4 rounded-xl border transition-all duration-300",
                                    rule.isMatched 
                                        ? "bg-emerald-500/5 border-emerald-500/20" 
                                        : "bg-white/5 border-white/5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                                        rule.isMatched ? "bg-emerald-500/20 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                                    )}>
                                        {rule.dimension}
                                    </span>
                                    {rule.isMatched ? (
                                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                    ) : (
                                        <HelpCircle className="w-3 h-3 text-zinc-700" />
                                    )}
                                </div>
                                <p className="text-[11px] font-bold text-zinc-300 mb-1 line-clamp-1">{rule.condition}</p>
                                <p className="text-[10px] text-zinc-500 italic leading-snug line-clamp-2">{rule.recommendation}</p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}

function ScoreCard({ label, score, icon, help }: { label: string, score: number, icon: React.ReactNode, help: string }) {
    return (
        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 group/card hover:border-primary/30 transition-all relative">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-zinc-500">
                    {icon}
                    <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
                </div>
                <div className="group relative">
                    <HelpCircle className="w-3 h-3 text-zinc-600 cursor-help hover:text-primary transition-colors" />
                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-zinc-900 border border-border rounded-lg text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-2xl">
                        {help}
                    </div>
                </div>
            </div>
            <div className="text-xl font-bold">{score}%</div>
        </div>
    );
}
