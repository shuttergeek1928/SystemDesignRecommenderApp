"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip, Legend 
} from "recharts";
import { Card } from "@/components/ui/base";
import { useSystemDesignStore } from "@/store/useSystemDesignStore";
import { Target, AlertTriangle, CheckCircle2, XCircle, BarChart3, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

interface BenchmarkComparisonDto {
  sessionId: string;
  matchedBlueprintTitle: string;
  matchedBlueprintScenarioId: number;
  nodeComparisons: NodeComparisonItem[];
  accuracyScore: number;
  precisionScore: number;
  semanticSimilarity: number;
  aiScores: Record<string, number>;
  baselineScores: Record<string, number>;
}

interface NodeComparisonItem {
  nodeKey: string;
  aiChoice: string;
  baselineChoice: string;
  isExactMatch: boolean;
  isAcceptableAlternative: boolean;
  verdict: string;
}

export function BenchmarkView() {
  const { recommendation } = useSystemDesignStore();
  const [data, setData] = useState<BenchmarkComparisonDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!recommendation?.id) return;
    
    setLoading(true);
    fetch(`http://localhost:5220/api/SystemDesign/${recommendation.id}/benchmark`)
      .then(res => {
        if (!res.ok) throw new Error("Benchmark not available yet");
        return res.json();
      })
      .then(d => {
        setData(d);
        setError(null);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [recommendation?.id]);

  if (loading) {
    return (
      <div className="py-12 text-center animate-pulse">
        <Target className="mx-auto w-8 h-8 text-primary mb-4 animate-spin" />
        <p className="text-muted-foreground">Calculating Benchmark Metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-12 text-center">
        <AlertTriangle className="mx-auto w-8 h-8 text-amber-500 mb-4" />
        <p className="text-muted-foreground">Benchmark data is not available for this session.</p>
        <p className="text-xs text-muted-foreground mt-2 opacity-60">This could be because the design is still generating or no baseline matched.</p>
      </div>
    );
  }

  // Format data for Radar Chart
  const radarData = Object.keys(data.aiScores).map(key => ({
    subject: key,
    AI: data.aiScores[key],
    Baseline: data.baselineScores[key],
    fullMark: 100,
  }));

  return (
    <div className="space-y-8 mt-12 pt-12 border-t border-border/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Expert Benchmark Comparison</h2>
          <p className="text-sm text-muted-foreground">
            Comparing AI output against the baseline: <span className="text-primary font-bold">{data.matchedBlueprintTitle}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Radar Chart */}
        <Card className="p-6">
          <h3 className="font-bold mb-6 flex items-center gap-2">
            <Fingerprint className="w-4 h-4 text-primary" /> Evaluation Fingerprint
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "var(--foreground)", fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "var(--muted-foreground)" }} />
                <Radar name="AI Design" dataKey="AI" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.5} />
                <Radar name="Expert Baseline" dataKey="Baseline" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Legend />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)", borderRadius: "8px" }}
                  itemStyle={{ fontWeight: "bold" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Aggregate Metrics */}
        <Card className="p-6 flex flex-col justify-center space-y-8">
          <h3 className="font-bold mb-2">Accuracy Metrics</h3>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-muted-foreground">Overall Accuracy</span>
              <span className={data.accuracyScore >= 80 ? "text-emerald-500" : data.accuracyScore >= 50 ? "text-amber-500" : "text-rose-500"}>
                {data.accuracyScore.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${data.accuracyScore}%` }} className={cn("h-full", data.accuracyScore >= 80 ? "bg-emerald-500" : data.accuracyScore >= 50 ? "bg-amber-500" : "bg-rose-500")} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-muted-foreground">Exact Precision Match</span>
              <span className="text-primary">{data.precisionScore.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${data.precisionScore}%` }} className="h-full bg-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm font-bold">
              <span className="text-muted-foreground">Semantic Similarity</span>
              <span className="text-indigo-500">{data.semanticSimilarity.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${data.semanticSimilarity}%` }} className="h-full bg-indigo-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Node Comparison Table */}
      <Card className="overflow-hidden">
        <div className="p-4 bg-secondary/50 border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-sm uppercase tracking-wider">Node-Level Comparison</h3>
        </div>
        <div className="divide-y divide-border">
          {data.nodeComparisons.map((node, idx) => (
            <div key={idx} className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-center hover:bg-muted/20 transition-colors">
              <div className="font-bold text-sm uppercase tracking-widest text-muted-foreground">
                {node.nodeKey}
              </div>
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1 uppercase">AI Output</p>
                  <p className="font-medium text-sm">{node.aiChoice || "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-emerald-500/80 mb-1 uppercase">Expert Baseline</p>
                  <p className="font-medium text-sm">{node.baselineChoice || "N/A"}</p>
                </div>
              </div>
              <div className="flex justify-end">
                {node.isExactMatch ? (
                  <span className="flex items-center gap-1 text-emerald-500 text-xs font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Exact Match
                  </span>
                ) : node.isAcceptableAlternative ? (
                  <span className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    <AlertTriangle className="w-3 h-3" /> Acceptable Alt
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-rose-500 text-xs font-bold bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                    <XCircle className="w-3 h-3" /> Divergent
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
