"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, CheckCircle2, Info, Lightbulb, Zap } from "lucide-react";
import { systemDesignSchema, type SystemDesignForm } from "@/types/form";
import { Button, Card, Input, Label, Textarea } from "@/components/ui/base";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const STEPS = [
    { id: "tech", title: "Technical Requirements", description: "Scale, Performance & Consistency" },
    { id: "team", title: "Team Context", description: "Size, Experience & Stack" },
    { id: "scale", title: "Scale & Traffic", description: "Volumes, Rates & Complexity" },
    { id: "agile", title: "Agility & Pace", description: "Releases & Learning" },
];

import { useSystemDesignStore } from "@/store/useSystemDesignStore";

export function RequirementForm() {
    const [currentStep, setCurrentStep] = useState(0);
    const { generateRecommendation, isLoading, useRag, setUseRag, useHybrid, setUseHybrid } = useSystemDesignStore();
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const {
        register,
        handleSubmit,
        trigger,
        formState: { errors },
        watch
    } = useForm<SystemDesignForm>({
        resolver: zodResolver(systemDesignSchema),
        defaultValues: {
            teamSize: 5,
            latency: "medium",
            scalability: "medium",
            consistency: "eventual",
            experienceLevel: "mid",
            releaseCycle: "weekly",
            learningPace: "moderate",
            automationLevel: "medium",
            requestRate: 0,
            dataVolume: 0,
            searchComplexity: "simple",
            deploymentFrequency: "medium",
        },
    });

    const watchTeamSize = watch("teamSize");

    const nextStep = async () => {
        const fields = currentStep === 0
            ? ["appName", "targetUsers", "latency", "scalability", "consistency", "additionalContext"]
            : currentStep === 1
                ? ["teamSize", "experienceLevel"]
                : currentStep === 2
                    ? ["requestRate", "dataVolume", "searchComplexity", "deploymentFrequency"]
                    : [];

        // @ts-ignore
        const isValid = await trigger(fields);
        if (isValid) setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    };

    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

    const onSubmit = async (data: SystemDesignForm) => {
        const success = await generateRecommendation(data);
        if (success) {
            setSuccess(true);
        }
    };

    if (success) {
        return (
            <Card className="max-w-2xl mx-auto p-12 text-center">
                <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Analysis Complete!</h2>
                <p className="text-muted-foreground mb-10">
                    Our engine has analyzed your requirements and generated a personalized architecture report.
                </p>
                <Button className="w-full" onClick={() => router.push("/dashboard")}>
                    View Recommendations
                </Button>
            </Card>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
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
                                        : "border-border text-muted-foreground"
                                )}
                            >
                                {idx < currentStep ? <CheckCircle2 className="w-6 h-6" /> : idx + 1}
                            </div>
                            <span className={cn("text-xs font-semibold uppercase tracking-wider", idx === currentStep ? "text-primary" : "text-muted-foreground")}>
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
                                <h2 className="text-2xl md:text-3xl font-bold mb-2">{STEPS[currentStep].title}</h2>
                                <p className="text-muted-foreground">{STEPS[currentStep].description}</p>
                            </div>

                            {/* Step 1: Technical */}
                            {currentStep === 0 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Application Name</Label>
                                            <Input placeholder="e.g. Nexus Core API" {...register("appName")} />
                                            {errors.appName && <p className="text-destructive text-xs mt-1">{errors.appName.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Target Users</Label>
                                            <Input placeholder="e.g. Enterprise DevOps" {...register("targetUsers")} />
                                            {errors.targetUsers && <p className="text-destructive text-xs mt-1">{errors.targetUsers.message}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Additional Context / Natural Language Requirements</Label>
                                        <Textarea 
                                            placeholder="Describe your application's unique needs or specific constraints in plain English..." 
                                            className="min-h-[100px] bg-secondary/20 border-white/5 focus:border-primary/50"
                                            {...register("additionalContext")} 
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Scalability Requirements</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {["low", "medium", "high", "extreme"].map((val) => (
                                                <label key={val} className="cursor-pointer group">
                                                    <input type="radio" value={val} className="peer hidden" {...register("scalability")} />
                                                    <div className="p-3 text-center border border-border rounded-xl text-sm font-medium transition-all group-hover:bg-accent peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary capitalize">
                                                        {val}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Latency Tolerance</Label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {["low", "medium", "high"].map((val) => (
                                                <label key={val} className="cursor-pointer group">
                                                    <input type="radio" value={val} className="peer hidden" {...register("latency")} />
                                                    <div className="p-3 text-center border border-border rounded-xl text-sm font-medium transition-all group-hover:bg-accent peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary capitalize">
                                                        {val}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                             {/* Step 2: Team */}
                            {currentStep === 1 && (
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <Label>Team Size</Label>
                                        <div className="flex items-center gap-6">
                                            <input
                                                type="range"
                                                min="1" max="50"
                                                className="flex-grow accent-primary"
                                                {...register("teamSize", { valueAsNumber: true })}
                                            />
                                            <span className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center font-bold">
                                                {watchTeamSize}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Experience Level</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            {["junior", "mid", "senior", "mixed"].map((val) => (
                                                <label key={val} className="cursor-pointer group">
                                                    <input type="radio" value={val} className="peer hidden" {...register("experienceLevel")} />
                                                    <div className="p-4 border border-border rounded-2xl flex items-center gap-3 transition-all group-hover:bg-accent peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary capitalize">
                                                        <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
                                                            <div className="w-2 h-2 rounded-full bg-current opacity-0 peer-checked:opacity-100" />
                                                        </div>
                                                        {val} Team
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                             {/* Step 3: Scale & Traffic */}
                             {currentStep === 2 && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Avg. Request Rate (req/s)</Label>
                                            <Input type="number" {...register("requestRate", { valueAsNumber: true })} />
                                            {errors.requestRate && <p className="text-destructive text-xs mt-1">{errors.requestRate.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Data Volume (GB/month)</Label>
                                            <Input type="number" {...register("dataVolume", { valueAsNumber: true })} />
                                            {errors.dataVolume && <p className="text-destructive text-xs mt-1">{errors.dataVolume.message}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Search Complexity</Label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {["simple", "complex"].map((val) => (
                                                <label key={val} className="cursor-pointer group">
                                                    <input type="radio" value={val} className="peer hidden" {...register("searchComplexity")} />
                                                    <div className="p-3 text-center border border-border rounded-xl text-sm font-medium transition-all group-hover:bg-accent peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary capitalize">
                                                        {val}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Deployment & Update Freq.</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {["low", "medium", "high", "daily"].map((val) => (
                                                <label key={val} className="cursor-pointer group">
                                                    <input type="radio" value={val} className="peer hidden" {...register("deploymentFrequency")} />
                                                    <div className="p-3 text-center border border-border rounded-xl text-sm font-medium transition-all group-hover:bg-accent peer-checked:bg-primary/10 peer-checked:border-primary peer-checked:text-primary capitalize">
                                                        {val}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Agility */}
                            {currentStep === 3 && (
                                <div className="space-y-8">
                                    <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 flex gap-4">
                                        <Lightbulb className="text-primary w-6 h-6 shrink-0" />
                                        <div>
                                            <p className="font-semibold text-primary mb-1 text-sm">Pro Tip</p>
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                For companies like BP or NIQ, weekly release cycles with high automation are recommended for stability.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Release Cycle</Label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {["daily", "weekly", "monthly", "quarterly"].map((val) => (
                                                <label key={val} className="cursor-pointer group">
                                                    <input type="radio" value={val} className="peer hidden" {...register("releaseCycle")} />
                                                    <div className="p-3 text-center border border-border rounded-xl text-sm font-medium transition-all group-hover:bg-accent peer-checked:bg-primary peer-checked:text-white capitalize">
                                                        {val}
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Learning Pace</Label>
                                        <div className="space-y-3">
                                            {["fast", "moderate", "slow"].map((val) => (
                                                <label key={val} className="cursor-pointer group block">
                                                    <input type="radio" value={val} className="peer hidden" {...register("learningPace")} />
                                                    <div className="p-4 border border-border rounded-2xl transition-all group-hover:bg-accent peer-checked:border-primary flex justify-between items-center">
                                                        <div>
                                                            <p className="font-bold capitalize">{val}</p>
                                                            <p className="text-xs text-muted-foreground">{val === 'fast' ? 'Team picks up new tools in < 2 weeks' : 'Prioritizes stability over new tech'}</p>
                                                        </div>
                                                        <div className="w-6 h-6 rounded-full bg-secondary peer-checked:bg-primary items-center justify-center flex">
                                                            {/* Just a visual indicator */}
                                                        </div>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Engine Toggles */}
                            {currentStep === STEPS.length - 1 && (
                                <div className="space-y-4 mt-10">
                                    <div className="p-4 border border-primary/20 bg-primary/5 rounded-2xl flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/20 rounded-lg">
                                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">Hybrid Reasoning Engine</p>
                                                <p className="text-xs text-muted-foreground italic">Rules + LLM synthesis (Recommended)</p>
                                            </div>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setUseHybrid(!useHybrid)}
                                            className={cn(
                                                "w-12 h-6 rounded-full p-1 transition-colors duration-200",
                                                useHybrid ? "bg-primary" : "bg-secondary"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-4 h-4 bg-white rounded-full transition-transform duration-200",
                                                useHybrid ? "translate-x-6" : "translate-x-0"
                                            )} />
                                        </button>
                                    </div>

                                    <div className="p-4 border border-primary/20 bg-primary/5 rounded-2xl flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/20 rounded-lg">
                                                <Zap className="w-4 h-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">RAG-Enhanced Analysis</p>
                                                <p className="text-xs text-muted-foreground italic">Tech-specific documentation insights</p>
                                            </div>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => setUseRag(!useRag)}
                                            className={cn(
                                                "w-12 h-6 rounded-full p-1 transition-colors duration-200",
                                                useRag ? "bg-primary" : "bg-secondary"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-4 h-4 bg-white rounded-full transition-transform duration-200",
                                                useRag ? "translate-x-6" : "translate-x-0"
                                            )} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="mt-12 flex justify-between items-center">
                                <Button
                                    key={`prev-${currentStep}`}
                                    type="button"
                                    variant="outline"
                                    onClick={prevStep}
                                    className={cn("gap-2", currentStep === 0 && "opacity-0 pointer-events-none")}
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
