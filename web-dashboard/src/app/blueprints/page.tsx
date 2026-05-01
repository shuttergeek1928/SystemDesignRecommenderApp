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

  // Normalize: get the ground truth architecture regardless of casing
  const getGT = (bp: Blueprint) => bp.ground_truth_architecture || bp.groundTruthArchitecture || {};
  const getScenarioId = (bp: Blueprint) => bp.scenario_id ?? bp.scenarioId ?? 0;

  const getNodeKeys = (baseline: any): string[] => {
    if (!baseline) return [];
    // Handle both { database: {choice: ...} } and { nodes: { database: {choice: ...} } }
    if (baseline.nodes) return Object.keys(baseline.nodes);
    return Object.keys(baseline).filter(k => k !== '_t'); // exclude BSON type discriminator
  };

  const getNodeChoice = (baseline: any, nodeKey: string): string | null => {
    const node = baseline?.nodes?.[nodeKey] || baseline?.[nodeKey];
    if (!node) return null;
    return node.choice || node.Choice || null;
  };

  const baselineCount = (gt: any) => {
    let count = 0;
    if (gt?.baseline_A_expert || gt?.baselineAExpert) count++;
    if (gt?.baseline_B_automated || gt?.baselineBAutomated) count++;
    if (gt?.baseline_C_hybrid || gt?.baselineCHybrid) count++;
    return count;
  };

  return (
    <div className="min-h-screen bg-background">
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <Card className="p-5 text-center">
                <p className="text-3xl font-black text-primary">{blueprints.length}</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">Total Scenarios</p>
              </Card>
              <Card className="p-5 text-center">
                <p className="text-3xl font-black text-emerald-500">
                  {blueprints.filter(b => baselineCount(getGT(b)) >= 1).length}
                </p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">With Baseline A</p>
              </Card>
              <Card className="p-5 text-center">
                <p className="text-3xl font-black text-amber-500">
                  {blueprints.filter(b => baselineCount(getGT(b)) >= 2).length}
                </p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">With Baseline B</p>
              </Card>
              <Card className="p-5 text-center">
                <p className="text-3xl font-black text-blue-500">
                  {blueprints.filter(b => baselineCount(getGT(b)) >= 3).length}
                </p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">With Baseline C</p>
              </Card>
            </div>

            {/* Blueprint Cards */}
            <div className="space-y-4">
              {blueprints.map((bp, idx) => {
                const gt = getGT(bp);
                const scenarioId = getScenarioId(bp);
                const baselineA = gt.baseline_A_expert || gt.baselineAExpert;
                const baselineB = gt.baseline_B_automated || gt.baselineBAutomated;
                const baselineC = gt.baseline_C_hybrid || gt.baselineCHybrid;
                const isExpanded = expandedId === scenarioId;

                return (
                  <Card key={scenarioId} className="overflow-hidden">
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
                            <Target className="w-4 h-4 text-primary" /> {bp.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">{bp.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {/* Baseline badges */}
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${baselineA ? 'bg-emerald-500/20 text-emerald-600' : 'bg-secondary text-muted-foreground'}`}>A</span>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${baselineB ? 'bg-amber-500/20 text-amber-600' : 'bg-secondary text-muted-foreground'}`}>B</span>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${baselineC ? 'bg-blue-500/20 text-blue-600' : 'bg-secondary text-muted-foreground'}`}>C</span>
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
                            {/* Context Tags */}
                            <div className="flex flex-wrap gap-2">
                              {bp.context?.users && (
                                <span className="text-[10px] border border-border px-2 py-1 rounded-lg font-medium">
                                  👤 {typeof bp.context.users === 'number' ? bp.context.users.toLocaleString() : bp.context.users} users
                                </span>
                              )}
                              {(bp.context?.traffic_pattern || bp.context?.trafficPattern) && (
                                <span className="text-[10px] border border-border px-2 py-1 rounded-lg font-medium">
                                  📊 {bp.context.traffic_pattern || bp.context.trafficPattern}
                                </span>
                              )}
                              {(bp.context?.consistency_model || bp.context?.consistencyModel) && (
                                <span className="text-[10px] border border-primary/30 px-2 py-1 rounded-lg font-medium text-primary">
                                  🔒 {bp.context.consistency_model || bp.context.consistencyModel}
                                </span>
                              )}
                              {bp.context?.budget && (
                                <span className="text-[10px] border border-border px-2 py-1 rounded-lg font-medium">
                                  💰 {bp.context.budget}
                                </span>
                              )}
                            </div>

                            {/* Baselines Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Baseline A */}
                              <div className={`p-4 rounded-xl border ${baselineA ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-secondary/30 border-border'}`}>
                                <p className="text-[10px] uppercase font-bold text-emerald-600 mb-3 flex items-center gap-2">
                                  <CheckCircle2 className="w-3 h-3" /> Baseline A — Expert
                                </p>
                                {baselineA ? (
                                  <div className="space-y-2">
                                    {getNodeKeys(baselineA).map(nodeKey => (
                                      <div key={nodeKey} className="text-xs">
                                        <span className="font-bold capitalize text-foreground/70">{nodeKey}:</span>{" "}
                                        <span className="text-foreground">{getNodeChoice(baselineA, nodeKey) || '—'}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground italic">Not available</p>
                                )}
                              </div>

                              {/* Baseline B */}
                              <div className={`p-4 rounded-xl border ${baselineB ? 'bg-amber-500/5 border-amber-500/20' : 'bg-secondary/30 border-border'}`}>
                                <p className="text-[10px] uppercase font-bold text-amber-600 mb-3 flex items-center gap-2">
                                  <LayoutGrid className="w-3 h-3" /> Baseline B — RAG
                                </p>
                                {baselineB ? (
                                  <div className="space-y-2">
                                    {getNodeKeys(baselineB).map(nodeKey => (
                                      <div key={nodeKey} className="text-xs">
                                        <span className="font-bold capitalize text-foreground/70">{nodeKey}:</span>{" "}
                                        <span className="text-foreground">{getNodeChoice(baselineB, nodeKey) || '—'}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground italic">Run generator script</p>
                                )}
                              </div>

                              {/* Baseline C */}
                              <div className={`p-4 rounded-xl border ${baselineC ? 'bg-blue-500/5 border-blue-500/20' : 'bg-secondary/30 border-border'}`}>
                                <p className="text-[10px] uppercase font-bold text-blue-600 mb-3 flex items-center gap-2">
                                  <LayoutGrid className="w-3 h-3" /> Baseline C — Hybrid
                                </p>
                                {baselineC ? (
                                  <div className="space-y-2">
                                    {getNodeKeys(baselineC).map(nodeKey => (
                                      <div key={nodeKey} className="text-xs">
                                        <span className="font-bold capitalize text-foreground/70">{nodeKey}:</span>{" "}
                                        <span className="text-foreground">{getNodeChoice(baselineC, nodeKey) || '—'}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground italic">Run generator script</p>
                                )}
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
