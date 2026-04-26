"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Save,
  RefreshCw,
  Cpu,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useSystemDesignStore } from "@/store/useSystemDesignStore";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const {
    ollamaModel,
    geminiModel,
    geminiApiKey,
    preferredProvider,
    extractionProvider,
    extractionModel,
    generationProvider,
    generationModel,
    fetchSettings,
    updateSettings,
  } = useSystemDesignStore();

  const [localOllamaModel, setLocalOllamaModel] = useState(ollamaModel);
  const [localGeminiModel, setLocalGeminiModel] = useState(geminiModel);
  const [localGeminiApiKey, setLocalGeminiApiKey] = useState(geminiApiKey);
  
  const [localExtProvider, setLocalExtProvider] = useState(extractionProvider);
  const [localExtModel, setLocalExtModel] = useState(extractionModel);
  const [localGenProvider, setLocalGenProvider] = useState(generationProvider);
  const [localGenModel, setLocalGenModel] = useState(generationModel);

  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const [isModelConfigOpen, setIsModelConfigOpen] = useState(true);

  useEffect(() => {
    fetchSettings();
    fetchAvailableModels();
  }, [fetchSettings]);

  useEffect(() => {
    setLocalOllamaModel(ollamaModel);
    setLocalGeminiModel(geminiModel);
    setLocalGeminiApiKey(geminiApiKey);
    setLocalExtProvider(extractionProvider);
    setLocalExtModel(extractionModel);
    setLocalGenProvider(generationProvider);
    setLocalGenModel(generationModel);
  }, [ollamaModel, geminiModel, geminiApiKey, extractionProvider, extractionModel, generationProvider, generationModel]);

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
      await updateSettings({
        ollamaModel: localOllamaModel,
        geminiModel: localGeminiModel,
        geminiApiKey: localGeminiApiKey,
        extractionProvider: localExtProvider,
        extractionModel: localExtModel,
        generationProvider: localGenProvider,
        generationModel: localGenModel,
      });
      setMessage({ text: "Settings saved successfully!", type: "success" });
    } catch (error) {
      setMessage({ text: "Failed to save settings.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 md:px-8 bg-secondary/20">
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
              <p className="text-muted-foreground">
                Configure the backend core and AI engine parameters.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {/* AI Pipeline Configuration Collapsible */}
            <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
              <button
                onClick={() => setIsModelConfigOpen(!isModelConfigOpen)}
                className="w-full flex items-center justify-between p-8 hover:bg-accent/50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-primary/20 p-3 rounded-2xl">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">AI Pipeline Configuration</h2>
                    <p className="text-sm text-muted-foreground">
                      Configure the models for each step of the recommendation process.
                    </p>
                  </div>
                </div>
                {isModelConfigOpen ? (
                  <ChevronUp className="w-6 h-6 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-muted-foreground" />
                )}
              </button>

              <AnimatePresence>
                {isModelConfigOpen ? (
                  <motion.div
                    key="model-config-content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="p-8 pt-0 space-y-8 border-t border-border/50 bg-secondary/5">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-8">
                        {/* 1. Extraction Phase */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-xl">
                              <Cpu className="w-5 h-5 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold">1. Requirement Extraction</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Choose the model that will parse your natural language statements.
                          </p>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => setLocalExtProvider("ollama")}
                              className={cn(
                                "p-3 rounded-xl border-2 transition-all text-center",
                                localExtProvider === "ollama"
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/30",
                              )}
                            >
                              <span className="font-bold text-sm block">Local</span>
                            </button>
                            <button
                              onClick={() => setLocalExtProvider("gemini")}
                              className={cn(
                                "p-3 rounded-xl border-2 transition-all text-center",
                                localExtProvider === "gemini"
                                  ? "border-blue-500 bg-blue-500/5"
                                  : "border-border hover:border-blue-500/30",
                              )}
                            >
                              <span className="font-bold text-sm block">Gemini</span>
                            </button>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Model</label>
                            {localExtProvider === "ollama" ? (
                              <select
                                value={localExtModel}
                                onChange={(e) => setLocalExtModel(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none"
                              >
                                {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                            ) : (
                              <select
                                value={localExtModel}
                                onChange={(e) => setLocalExtModel(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 outline-none"
                              >
                                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash-Lite</option>
                              </select>
                            )}
                          </div>
                        </div>

                        {/* 2. Generation Phase */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-500/10 p-2 rounded-xl">
                              <RefreshCw className="w-5 h-5 text-blue-500" />
                            </div>
                            <h3 className="text-lg font-semibold">2. Architecture Generation</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Choose the brain that will design your system components.
                          </p>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => setLocalGenProvider("ollama")}
                              className={cn(
                                "p-3 rounded-xl border-2 transition-all text-center",
                                localGenProvider === "ollama"
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/30",
                              )}
                            >
                              <span className="font-bold text-sm block">Local</span>
                            </button>
                            <button
                              onClick={() => setLocalGenProvider("gemini")}
                              className={cn(
                                "p-3 rounded-xl border-2 transition-all text-center",
                                localGenProvider === "gemini"
                                  ? "border-blue-500 bg-blue-500/5"
                                  : "border-border hover:border-blue-500/30",
                              )}
                            >
                              <span className="font-bold text-sm block">Gemini</span>
                            </button>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Model</label>
                            {localGenProvider === "ollama" ? (
                              <select
                                value={localGenModel}
                                onChange={(e) => setLocalGenModel(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/50 outline-none"
                              >
                                {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                            ) : (
                              <select
                                value={localGenModel}
                                onChange={(e) => setLocalGenModel(e.target.value)}
                                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 outline-none"
                              >
                                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                                <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                                <option value="gemini-3-flash-preview">Gemini 3 Flash</option>
                              </select>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* API Credentials */}
                      <div className="pt-6 border-t border-border/30">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                          <div>
                            <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 block">Gemini API Key</label>
                            <input
                              type="password"
                              value={localGeminiApiKey}
                              onChange={(e) => setLocalGeminiApiKey(e.target.value)}
                              placeholder="Enter your Google AI Studio API Key"
                              className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500/50 outline-none"
                            />
                          </div>
                          <div className="lg:pt-7">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Required for any cloud-based options. Your keys are stored locally in your browser and never shared with anyone else.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          {message && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                                message.type === "success"
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : "bg-red-500/10 text-red-500",
                              )}
                            >
                              {message.type === "success" ? (
                                <CheckCircle2 className="w-4 h-4" />
                              ) : (
                                <AlertCircle className="w-4 h-4" />
                              )}
                              {message.text}
                            </motion.div>
                          )}
                        </div>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 w-full sm:w-auto justify-center"
                        >
                          {isSaving ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                          Apply Configuration
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Architecture Node Configuration */}
            <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/10 p-2 rounded-xl">
                    <Settings className="w-5 h-5 text-purple-500" />
                  </div>
                  <h2 className="text-xl font-semibold">
                    Architecture Configuration
                  </h2>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Customize the architectural nodes (Database, Cache, etc.) and
                  define team-level defaults or personal overrides.
                </p>
                <div className="pt-4 flex justify-end">
                  <button
                    onClick={() =>
                      (window.location.href = "/settings/node-config")
                    }
                    className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/20"
                  >
                    Manage Node Keys & Settings
                  </button>
                </div>
              </div>
            </div>

            {/* Additional info */}
            <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-8">
              <h3 className="font-semibold mb-2">How it works</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                When you change the Ollama model here, it updates an in-memory
                application setting in the .NET backend. The .NET backend uses
                this model name for its own LLM operations and passes it along
                to the Python RAG service when requesting architectural designs.
                This ensures consistency across the entire system.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
