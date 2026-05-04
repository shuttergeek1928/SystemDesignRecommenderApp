"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/shared/Navbar";
import { Card } from "@/components/ui/base";
import { BookOpen, Database, Target, LayoutGrid, CheckCircle2, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Blueprint {
  scenario_id?: number;
  scenarioId?: number;
  title: string;
  description: string;
  context: any;
  ground_truth_architecture?: any;
  groundTruthArchitecture?: any;
  acceptable_alternatives?: any;
  acceptableAlternatives?: any;
}

export default function BlueprintsExplorer() {
  const [blueprints, setBlueprints] = useState<Blueprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:5220/api/Blueprints")
      .then(res => {
        if (!res.ok) throw new Error(`API returned ${res.status}`);
        return res.json();
      })
      .then(data => {
        console.log("Blueprints API response (first item):", JSON.stringify(data[0], null, 2));
        setBlueprints(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch blueprints", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Normalize: get the ground truth architecture regardless of casing (Pascal, camel, or snake)
  const getGT = (bp: any) => bp.GroundTruthArchitecture || bp.ground_truth_architecture || bp.groundTruthArchitecture || {};
  const getScenarioId = (bp: any) => bp.ScenarioId || bp.scenario_id || bp.scenarioId || 0;

  const getNodeKeys = (baseline: any): string[] => {
    if (!baseline) return [];
    // Handle both { nodes: { database: {choice: ...} } } and direct keys
    const nodes = baseline.nodes || baseline.Nodes;
    if (nodes) return Object.keys(nodes);
    return Object.keys(baseline).filter(k => k !== '_t'); // exclude BSON type discriminator
  };

  const getNodeChoice = (baseline: any, nodeKey: string): string | null => {
    const nodes = baseline?.nodes || baseline?.Nodes;
    const node = nodes?.[nodeKey] || baseline?.[nodeKey];
    if (!node) return null;
    return node.choice || node.Choice || null;
  };

  const baselineCount = (gt: any) => {
    let count = 0;
    if (gt?.baseline_A_expert || gt?.baselineAExpert) count++;
    if (gt?.baseline_B_llm || gt?.baselineBllm) count++;
    if (gt?.baseline_C_rag || gt?.baselineCrag) count++;
    if (gt?.baseline_D_hybrid || gt?.baselineDhybrid) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 md:px-6 pt-28 pb-20">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
              <p className="text-sm text-muted-foreground">
                Explore the {blueprints.length} Ground Truth Baselines used by the AI Evaluation Engine
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-3 animate-pulse">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">Loading Reference Blueprints...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <p className="text-lg font-semibold mb-2">Could not load blueprints</p>
            <p className="text-sm text-muted-foreground">Ensure the .NET API is running on localhost:5220</p>
            <p className="text-xs text-muted-foreground mt-1">{error}</p>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
              <Card className="p-4 text-center">
                <p className="text-2xl font-black text-primary">{blueprints.length}</p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mt-1">Total Scenarios</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-black text-emerald-500">
                  {blueprints.filter(b => (getGT(b).baseline_A_expert || getGT(b).baselineAExpert)).length}
                </p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mt-1">Expert (A)</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-black text-amber-500">
                  {blueprints.filter(b => (getGT(b).baseline_B_llm || getGT(b).baselineBllm)).length}
                </p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mt-1">LLM-Only (B)</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-black text-blue-500">
                  {blueprints.filter(b => (getGT(b).baseline_C_rag || getGT(b).baselineCrag)).length}
                </p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mt-1">RAG (C)</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-black text-violet-500">
                  {blueprints.filter(b => (getGT(b).baseline_D_hybrid || getGT(b).baselineDhybrid)).length}
                </p>
                <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider mt-1">Hybrid (D)</p>
              </Card>
            </div>

            {/* Blueprint Cards */}
            <div className="space-y-4">
              {blueprints.map((bp, idx) => {
                const gt = getGT(bp);
                const scenarioId = getScenarioId(bp);
                const baselineA = gt.baseline_A_expert || gt.baselineAExpert;
                const baselineB = gt.baseline_B_llm || gt.baselineBllm;
                const baselineC = gt.baseline_C_rag || gt.baselineCrag;
                const baselineD = gt.baseline_D_hybrid || gt.baselineDhybrid;
                const isExpanded = expandedId === scenarioId;

                return (
                  <Card key={scenarioId} className="overflow-hidden border-border/50">
                    <div
                      className="p-6 cursor-pointer flex items-center justify-between hover:bg-accent/30 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : scenarioId)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                          {scenarioId}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg flex items-center gap-2">
                            <Target className="w-4 h-4 text-primary" /> {bp.Title || bp.title || "Unknown Scenario"}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{bp.Description || bp.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${baselineA ? 'bg-emerald-500/20 text-emerald-600' : 'bg-secondary text-muted-foreground'}`}>A</span>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${baselineB ? 'bg-amber-500/20 text-amber-600' : 'bg-secondary text-muted-foreground'}`}>B</span>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${baselineC ? 'bg-blue-500/20 text-blue-600' : 'bg-secondary text-muted-foreground'}`}>C</span>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${baselineD ? 'bg-violet-500/20 text-violet-600' : 'bg-secondary text-muted-foreground'}`}>D</span>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-border"
                        >
                          <div className="p-6 space-y-6">
                            <div className="flex flex-wrap gap-2">
                              {(bp.Context?.Users || bp.context?.users) && (
                                <span className="text-[10px] border border-border px-2 py-1 rounded-lg font-medium">👤 {bp.Context?.Users || bp.context?.users} users</span>
                              )}
                              {(bp.Context?.TrafficPattern || bp.context?.traffic_pattern || bp.context?.trafficPattern) && (
                                <span className="text-[10px] border border-border px-2 py-1 rounded-lg font-medium">📊 {bp.Context?.TrafficPattern || bp.context?.traffic_pattern || bp.context?.trafficPattern}</span>
                              )}
                              {(bp.Context?.ConsistencyModel || bp.context?.consistency_model || bp.context?.consistencyModel) && (
                                <span className="text-[10px] border border-primary/30 px-2 py-1 rounded-lg font-medium text-primary">🔒 {bp.Context?.ConsistencyModel || bp.context?.consistency_model || bp.context?.consistencyModel}</span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                              {/* Baseline A */}
                              <div className={`p-4 rounded-xl border ${baselineA ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-secondary/30 border-border'}`}>
                                <p className="text-[10px] uppercase font-bold text-emerald-600 mb-3 flex items-center gap-2">
                                  <CheckCircle2 className="w-3 h-3" /> Expert (A)
                                </p>
                                {baselineA ? (
                                  <div className="space-y-2">
                                    {getNodeKeys(baselineA).map(nodeKey => (
                                      <div key={nodeKey} className="text-[11px]">
                                        <span className="font-bold capitalize text-foreground/70">{nodeKey}:</span> <span className="text-foreground">{getNodeChoice(baselineA, nodeKey) || '—'}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : <p className="text-xs text-muted-foreground italic">Missing</p>}
                              </div>

                              {/* Baseline B */}
                              <div className={`p-4 rounded-xl border ${baselineB ? 'bg-amber-500/5 border-amber-500/20' : 'bg-secondary/30 border-border'}`}>
                                <p className="text-[10px] uppercase font-bold text-amber-600 mb-3 flex items-center gap-2">
                                  <LayoutGrid className="w-3 h-3" /> LLM-Only (B)
                                </p>
                                {baselineB ? (
                                  <div className="space-y-2">
                                    {getNodeKeys(baselineB).map(nodeKey => (
                                      <div key={nodeKey} className="text-[11px]">
                                        <span className="font-bold capitalize text-foreground/70">{nodeKey}:</span> <span className="text-foreground">{getNodeChoice(baselineB, nodeKey) || '—'}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : <p className="text-xs text-muted-foreground italic">Pending</p>}
                              </div>

                              {/* Baseline C */}
                              <div className={`p-4 rounded-xl border ${baselineC ? 'bg-blue-500/5 border-blue-500/20' : 'bg-secondary/30 border-border'}`}>
                                <p className="text-[10px] uppercase font-bold text-blue-600 mb-3 flex items-center gap-2">
                                  <Database className="w-3 h-3" /> RAG (C)
                                </p>
                                {baselineC ? (
                                  <div className="space-y-2">
                                    {getNodeKeys(baselineC).map(nodeKey => (
                                      <div key={nodeKey} className="text-[11px]">
                                        <span className="font-bold capitalize text-foreground/70">{nodeKey}:</span> <span className="text-foreground">{getNodeChoice(baselineC, nodeKey) || '—'}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : <p className="text-xs text-muted-foreground italic">Pending</p>}
                              </div>

                              {/* Baseline D */}
                              <div className={`p-4 rounded-xl border ${baselineD ? 'bg-violet-500/5 border-violet-500/20' : 'bg-secondary/30 border-border'}`}>
                                <p className="text-[10px] uppercase font-bold text-violet-600 mb-3 flex items-center gap-2">
                                  <Target className="w-3 h-3" /> Hybrid (D)
                                </p>
                                {baselineD ? (
                                  <div className="space-y-2">
                                    {getNodeKeys(baselineD).map(nodeKey => (
                                      <div key={nodeKey} className="text-[11px]">
                                        <span className="font-bold capitalize text-foreground/70">{nodeKey}:</span> <span className="text-foreground">{getNodeChoice(baselineD, nodeKey) || '—'}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : <p className="text-xs text-muted-foreground italic">Pending</p>}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
