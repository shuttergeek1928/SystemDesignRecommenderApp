"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Lightbulb,
  Zap,
  HelpCircle,
} from "lucide-react";
import { systemDesignSchema, type SystemDesignForm } from "@/types/form";
import { Button, Card, Input, Label, Textarea } from "@/components/ui/base";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useSystemDesignStore } from "@/store/useSystemDesignStore";

const STEPS = [
  {
    id: "tech",
    title: "Technical Requirements",
    description: "Scale, Performance & Consistency",
  },
  {
    id: "team",
    title: "Team Context",
    description: "Size, Experience & Stack",
  },
  {
    id: "scale",
    title: "Scale & Traffic",
    description: "Volumes, Rates & Complexity",
  },
  {
    id: "agile",
    title: "Agility & Pace",
    description: "Releases & Learning",
  },
  {
    id: "infra",
    title: "Infrastructure & Compliance",
    description: "Cloud, Budget & Security",
  },
];

function HelpText({ text }: { text: string }) {
  return (
    <p className="text-xs text-muted-foreground flex items-start gap-1.5 mt-1">
      <HelpCircle className="w-3 h-3 shrink-0 mt-0.5" />
      <span>{text}</span>
    </p>
  );
}

function RadioGroup({
  options,
  name,
  register,
  columns = 4,
}: {
  options: string[];
  name: string;
  register: any;
  columns?: number;
}) {
  return (
    <div
      className={`grid gap-3`}
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
    >
      {options.map((val) => (
        <label key={val} className="cursor-pointer group">
          <input
            type="radio"
            value={val}
            className="peer hidden"
            {...register(name)}
          />
          <div className="p-3 text-center border border-border rounded-xl text-sm font-medium transition-all group-hover:bg-accent peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary capitalize">
            {val.replace(/-/g, " ")}
          </div>
        </label>
      ))}
    </div>
  );
}

export function RequirementForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const {
    generateRecommendation,
    isLoading,
    useRag,
    setUseRag,
    useHybrid,
    setUseHybrid,
  } = useSystemDesignStore();
  const [success, setSuccess] = useState(false);
  const [complianceValues, setComplianceValues] = useState<string[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    formState: { errors },
    watch,
  } = useForm<SystemDesignForm>({
    resolver: zodResolver(systemDesignSchema),
    defaultValues: {
      teamSize: 5,
      userCount: 1000,
      latency: "medium",
      scalability: "medium",
      consistency: "eventual",
      trafficPattern: "steady",
      availabilitySlo: "99.9",
      experienceLevel: "mid",
      releaseCycle: "weekly",
      learningPace: "moderate",
      automationLevel: "medium",
      requestRate: 100,
      dataVolume: 10,
      searchComplexity: "simple",
      deploymentFrequency: "medium",
      readWriteRatio: "balanced",
      dataRetention: "years",
      budget: "growth",
      regionStrategy: "single-region",
      compliance: [],
      securitySensitivity: "internal",
    },
  });

  const watchTeamSize = watch("teamSize");

  const stepFields: Record<number, string[]> = {
    0: [
      "appName",
      "targetUsers",
      "userCount",
      "trafficPattern",
      "latency",
      "scalability",
      "consistency",
      "availabilitySlo",
      "additionalContext",
    ],
    1: ["teamSize", "experienceLevel"],
    2: [
      "requestRate",
      "dataVolume",
      "searchComplexity",
      "deploymentFrequency",
      "readWriteRatio",
      "dataRetention",
    ],
    3: ["releaseCycle", "learningPace", "automationLevel"],
    4: ["budget", "regionStrategy", "securitySensitivity"],
  };

  const nextStep = async () => {
    const fields = stepFields[currentStep] || [];
    // @ts-ignore
    const isValid = await trigger(fields);
    if (isValid) setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const toggleCompliance = (val: string) => {
    const updated = complianceValues.includes(val)
      ? complianceValues.filter((v) => v !== val)
      : [...complianceValues, val];
    setComplianceValues(updated);
    setValue("compliance", updated);
  };

  const onSubmit = async (data: SystemDesignForm) => {
    generateRecommendation(data);
    router.push("/recommendations");
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-12">
        <div className="flex justify-between mb-4">
          {STEPS.map((step, idx) => (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  idx <= currentStep
                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "border-border text-muted-foreground",
                )}
              >
                {idx < currentStep ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  idx === currentStep
                    ? "text-primary"
                    : "text-muted-foreground",
                )}
              >
                {step.id}
              </span>
            </div>
          ))}
        </div>
        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      <Card className="p-8 md:p-12">
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-10 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  {STEPS[currentStep].title}
                </h2>
                <p className="text-muted-foreground">
                  {STEPS[currentStep].description}
                </p>
              </div>

              {/* Step 1: Technical */}
              {currentStep === 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <Label>Application Name</Label>
                      <Input
                        placeholder="e.g. Nexus Core API"
                        {...register("appName")}
                      />
                      <HelpText text="The name of the application or system you are designing." />
                      {errors.appName && (
                        <p className="text-destructive text-xs mt-1">
                          {errors.appName.message}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Target Users</Label>
                      <Input
                        placeholder="e.g. Enterprise DevOps"
                        {...register("targetUsers")}
                      />
                      <HelpText text="Who are the primary users? (e.g. consumers, developers, internal teams)" />
                      {errors.targetUsers && (
                        <p className="text-destructive text-xs mt-1">
                          {errors.targetUsers.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Expected User Count</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 100000"
                        {...register("userCount", { valueAsNumber: true })}
                      />
                      <HelpText text="Total number of concurrent or monthly active users expected." />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        Additional Context / Natural Language Requirements
                      </Label>
                      <Textarea
                        placeholder="Describe your application's unique needs..."
                        className="min-h-[120px] bg-secondary/20 border-white/5 focus:border-primary/50"
                        {...register("additionalContext")}
                      />
                      <HelpText text="Any special requirements like real-time features, legacy integrations, or unique constraints." />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Label>Availability SLO</Label>
                      <RadioGroup
                        options={["99", "99.9", "99.99", "99.999"]}
                        name="availabilitySlo"
                        register={register}
                        columns={4}
                      />
                      <HelpText text="Service Level Objective — 99.99% means ~4 min downtime/month." />
                    </div>

                    <div className="space-y-4">
                      <Label>Traffic Pattern</Label>
                      <RadioGroup
                        options={["steady", "bursty", "seasonal"]}
                        name="trafficPattern"
                        register={register}
                        columns={3}
                      />
                      <HelpText text="Steady = consistent load. Bursty = sudden spikes. Seasonal = periodic peaks." />
                    </div>

                    <div className="space-y-4">
                      <Label>Scalability Requirements</Label>
                      <RadioGroup
                        options={["low", "medium", "high", "extreme"]}
                        name="scalability"
                        register={register}
                        columns={4}
                      />
                      <HelpText text="How much the system needs to grow. Extreme = millions of users." />
                    </div>

                    <div className="space-y-4">
                      <Label>Latency Tolerance</Label>
                      <RadioGroup
                        options={["low", "medium", "high"]}
                        name="latency"
                        register={register}
                        columns={3}
                      />
                      <HelpText text="Low = sub-50ms (real-time). Medium = 50-500ms. High = seconds acceptable." />
                    </div>

                    <div className="space-y-4">
                      <Label>Consistency Model</Label>
                      <RadioGroup
                        options={["eventual", "strong"]}
                        name="consistency"
                        register={register}
                        columns={2}
                      />
                      <HelpText text="Eventual = faster, tolerates stale reads. Strong = ACID, critical for financial data." />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Team */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="space-y-4">
                    <Label>Team Size</Label>
                    <div className="flex items-center gap-6 p-4 bg-secondary/10 rounded-2xl border border-border">
                      <input
                        type="range"
                        min="1"
                        max="50"
                        className="flex-grow accent-primary"
                        {...register("teamSize", { valueAsNumber: true })}
                      />
                      <span className="w-12 h-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-bold shadow-lg shadow-primary/20">
                        {watchTeamSize}
                      </span>
                    </div>
                    <HelpText text="Number of developers. Smaller teams favor simpler architectures." />
                  </div>

                  <div className="space-y-4">
                    <Label>Experience Level</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {["junior", "mid", "senior", "mixed"].map((val) => (
                        <label key={val} className="cursor-pointer group">
                          <input
                            type="radio"
                            value={val}
                            className="peer hidden"
                            {...register("experienceLevel")}
                          />
                          <div className="p-4 border border-border rounded-2xl flex items-center gap-3 transition-all group-hover:bg-accent peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary capitalize">
                            <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-current opacity-0 peer-checked:opacity-100" />
                            </div>
                            {val}
                          </div>
                        </label>
                      ))}
                    </div>
                    <HelpText text="Average skill level of the team." />
                  </div>
                </div>
              )}

              {/* Step 3: Scale & Traffic */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label>Avg. Request Rate (req/s)</Label>
                        <Input
                          type="number"
                          {...register("requestRate", { valueAsNumber: true })}
                        />
                        <HelpText text="Average requests per second." />
                      </div>
                      <div className="space-y-2">
                        <Label>Data Volume (GB/month)</Label>
                        <Input
                          type="number"
                          {...register("dataVolume", { valueAsNumber: true })}
                        />
                        <HelpText text="Data ingested/stored per month." />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Search Complexity</Label>
                      <RadioGroup
                        options={["simple", "complex"]}
                        name="searchComplexity"
                        register={register}
                        columns={2}
                      />
                      <HelpText text="Simple = ID/key lookups. Complex = full-text, fuzzy matching." />
                    </div>

                    <div className="space-y-4">
                      <Label>Deployment & Update Freq.</Label>
                      <RadioGroup
                        options={["low", "medium", "high", "daily"]}
                        name="deploymentFrequency"
                        register={register}
                        columns={4}
                      />
                      <HelpText text="How often new code is deployed to production." />
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Label>Read/Write Ratio</Label>
                      <RadioGroup
                        options={["read-heavy", "balanced", "write-heavy"]}
                        name="readWriteRatio"
                        register={register}
                        columns={3}
                      />
                      <HelpText text="Read-heavy = blogs. Write-heavy = IoT. Affects caching strategy." />
                    </div>

                    <div className="space-y-4">
                      <Label>Data Retention</Label>
                      <RadioGroup
                        options={["days", "months", "years", "permanent"]}
                        name="dataRetention"
                        register={register}
                        columns={4}
                      />
                      <HelpText text="How long data must be kept." />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Agility */}
              {currentStep === 3 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="space-y-8">
                    <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 flex gap-4">
                      <Lightbulb className="text-primary w-6 h-6 shrink-0" />
                      <div>
                        <p className="font-semibold text-primary mb-1 text-sm">
                          Pro Tip
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          Weekly release cycles with high automation are
                          recommended for enterprise stability.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Release Cycle</Label>
                      <RadioGroup
                        options={["daily", "weekly", "monthly", "quarterly"]}
                        name="releaseCycle"
                        register={register}
                        columns={2}
                      />
                      <HelpText text="How frequently your team ships new versions." />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Learning Pace</Label>
                    <div className="space-y-3">
                      {["fast", "moderate", "slow"].map((val) => (
                        <label key={val} className="cursor-pointer group block">
                          <input
                            type="radio"
                            value={val}
                            className="peer hidden"
                            {...register("learningPace")}
                          />
                          <div className="p-4 border border-border rounded-2xl transition-all group-hover:bg-accent peer-checked:border-primary flex justify-between items-center">
                            <div>
                              <p className="font-bold capitalize">{val}</p>
                              <p className="text-xs text-muted-foreground">
                                {val === "fast"
                                  ? "Picks up tools in < 2 weeks"
                                  : val === "moderate"
                                    ? "Needs 2-4 weeks"
                                    : "Prioritizes stability"}
                              </p>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                    <HelpText text="How quickly your team adopts new technologies." />
                  </div>
                </div>
              )}

              {/* Step 5: Infrastructure & Compliance */}
              {currentStep === 4 && (
                <div className="space-y-10">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label>Budget Tier</Label>
                        <RadioGroup
                          options={["startup", "growth", "enterprise"]}
                          name="budget"
                          register={register}
                          columns={3}
                        />
                        <HelpText text="Startup = cost-sensitive. Enterprise = premium SLAs." />
                      </div>

                      <div className="space-y-4">
                        <Label>Region Strategy (AWS)</Label>
                        <RadioGroup
                          options={["single-region", "multi-region", "global"]}
                          name="regionStrategy"
                          register={register}
                          columns={3}
                        />
                        <HelpText text="Single = one region. Global = CDN worldwide." />
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="space-y-4">
                        <Label>Security Sensitivity</Label>
                        <RadioGroup
                          options={["public", "internal", "confidential", "regulated"]}
                          name="securitySensitivity"
                          register={register}
                          columns={2}
                        />
                        <HelpText text="Public = open. Regulated = HIPAA/PCI, zero-trust." />
                      </div>

                      <div className="space-y-4">
                        <Label>Compliance Requirements</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {["GDPR", "HIPAA", "SOC2", "PCI-DSS", "None"].map(
                            (val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => toggleCompliance(val)}
                                className={cn(
                                  "p-3 text-center border rounded-xl text-sm font-medium transition-all",
                                  complianceValues.includes(val)
                                    ? "bg-primary/10 border-primary text-primary"
                                    : "border-border hover:bg-accent",
                                )}
                              >
                                {val}
                              </button>
                            ),
                          )}
                        </div>
                        <HelpText text="Select all applicable regulations." />
                      </div>
                    </div>
                  </div>

                  {/* Engine Toggles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-border">
                    <div className="p-6 border border-primary/20 bg-primary/5 rounded-3xl flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/20 rounded-2xl">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold">Hybrid Engine</p>
                          <p className="text-xs text-muted-foreground italic">
                            Rules + LLM synthesis
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUseHybrid(!useHybrid)}
                        className={cn(
                          "w-14 h-8 rounded-full p-1.5 transition-colors duration-200",
                          useHybrid ? "bg-primary" : "bg-secondary",
                        )}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm",
                            useHybrid ? "translate-x-6" : "translate-x-0",
                          )}
                        />
                      </button>
                    </div>

                    <div className="p-6 border border-primary/20 bg-primary/5 rounded-3xl flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/20 rounded-2xl">
                          <Zap className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold">RAG Analysis</p>
                          <p className="text-xs text-muted-foreground italic">
                            Documentation insights
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUseRag(!useRag)}
                        className={cn(
                          "w-14 h-8 rounded-full p-1.5 transition-colors duration-200",
                          useRag ? "bg-primary" : "bg-secondary",
                        )}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 bg-white rounded-full transition-transform duration-200 shadow-sm",
                            useRag ? "translate-x-6" : "translate-x-0",
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-12 flex justify-between items-center">
                <Button
                  key={`prev-${currentStep}`}
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className={cn(
                    "gap-2",
                    currentStep === 0 && "opacity-0 pointer-events-none",
                  )}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                {currentStep === STEPS.length - 1 ? (
                  <Button
                    key="submit-btn"
                    type="submit"
                    disabled={isLoading}
                    className="min-w-[140px]"
                  >
                    {isLoading ? "Analyzing..." : "Get Recommendations"}
                  </Button>
                ) : (
                  <Button
                    key={`next-${currentStep}`}
                    type="button"
                    onClick={nextStep}
                    className="gap-2"
                  >
                    Continue <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </form>
      </Card>
    </div>
  );
}
