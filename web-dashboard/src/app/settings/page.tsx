"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Settings, Save, RefreshCw, Cpu, CheckCircle2, AlertCircle } from "lucide-react";
import { useSystemDesignStore } from "@/store/useSystemDesignStore";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { ollamaModel, fetchSettings, updateSettings } = useSystemDesignStore();
    const [selectedModel, setSelectedModel] = useState(ollamaModel);
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    useEffect(() => {
        fetchSettings();
        fetchAvailableModels();
    }, [fetchSettings]);

    useEffect(() => {
        setSelectedModel(ollamaModel);
    }, [ollamaModel]);

    const fetchAvailableModels = async () => {
        setIsLoadingModels(true);
        try {
            const response = await fetch("http://localhost:5220/api/Settings/models");
            if (response.ok) {
                const models = await response.json();
                setAvailableModels(models);
            }
        } catch (error) {
            console.error("Error fetching models:", error);
        } finally {
            setIsLoadingModels(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            await updateSettings(selectedModel);
            setMessage({ text: "Settings saved successfully!", type: "success" });
        } catch (error) {
            setMessage({ text: "Failed to save settings.", type: "error" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-16rem)] py-12 px-4 md:px-8 bg-secondary/20">
            <div className="container mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/20 p-3 rounded-2xl">
                            <Settings className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Application Settings</h1>
                            <p className="text-muted-foreground">Configure the backend core and AI engine parameters.</p>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {/* Ollama Model Configuration */}
                        <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-500/10 p-2 rounded-xl">
                                        <Cpu className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <h2 className="text-xl font-semibold">Ollama Configuration</h2>
                                </div>
                                <button
                                    onClick={fetchAvailableModels}
                                    disabled={isLoadingModels}
                                    className="p-2 hover:bg-accent rounded-full transition-colors disabled:opacity-50"
                                    title="Refresh available models"
                                >
                                    <RefreshCw className={cn("w-4 h-4", isLoadingModels && "animate-spin")} />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Active Ollama Model</label>
                                    <div className="relative">
                                        <select
                                            value={selectedModel}
                                            onChange={(e) => setSelectedModel(e.target.value)}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        >
                                            <option value="">Select a model...</option>
                                            {availableModels.map((model) => (
                                                <option key={model} value={model}>
                                                    {model}
                                                </option>
                                            ))}
                                            {!availableModels.includes(selectedModel) && selectedModel && (
                                                <option value={selectedModel}>{selectedModel} (configured)</option>
                                            )}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
                                            <Cpu className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        This model will be used by both the .NET backend for requirement extraction and the Python RAG engine for design generation.
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        {message && (
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                                                    message.type === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                                )}
                                            >
                                                {message.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                                {message.text}
                                            </motion.div>
                                        )}
                                    </div>
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving || selectedModel === ollamaModel}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 shadow-lg shadow-primary/20 w-full sm:w-auto justify-center"
                                    >
                                        {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        Save Settings
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Additional info */}
                        <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-8">
                            <h3 className="font-semibold mb-2">How it works</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                When you change the Ollama model here, it updates an in-memory application setting in the .NET backend. 
                                The .NET backend uses this model name for its own LLM operations and passes it along to the Python RAG service 
                                when requesting architectural designs. This ensures consistency across the entire system.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
