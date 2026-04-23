"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Save,
  RefreshCw,
  Cpu,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useSystemDesignStore } from "@/store/useSystemDesignStore";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const {
    ollamaModel,
    geminiModel,
    geminiApiKey,
    preferredProvider,
    fetchSettings,
    updateSettings,
  } = useSystemDesignStore();

  const [localOllamaModel, setLocalOllamaModel] = useState(ollamaModel);
  const [localGeminiModel, setLocalGeminiModel] = useState(geminiModel);
  const [localGeminiApiKey, setLocalGeminiApiKey] = useState(geminiApiKey);
  const [localProvider, setLocalProvider] = useState(preferredProvider);

  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchAvailableModels();
  }, [fetchSettings]);

  useEffect(() => {
    setLocalOllamaModel(ollamaModel);
    setLocalGeminiModel(geminiModel);
    setLocalGeminiApiKey(geminiApiKey);
    setLocalProvider(preferredProvider);
  }, [ollamaModel, geminiModel, geminiApiKey, preferredProvider]);

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
        preferredProvider: localProvider,
      });
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
              <p className="text-muted-foreground">
                Configure the backend core and AI engine parameters.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {/* Provider Selection */}
            <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
              <h2 className="text-xl font-semibold mb-6">AI Provider</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setLocalProvider("ollama")}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all text-left",
                    localProvider === "ollama"
                      ? "border-primary bg-primary/5 ring-4 ring-primary/10"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Cpu
                      className={cn(
                        "w-6 h-6",
                        localProvider === "ollama"
                          ? "text-primary"
                          : "text-muted-foreground",
                      )}
                    />
                    <span className="font-bold">Ollama</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Local inference using your CPU/GPU. Private and free.
                  </p>
                </button>
                <button
                  onClick={() => setLocalProvider("gemini")}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all text-left",
                    localProvider === "gemini"
                      ? "border-blue-500 bg-blue-500/5 ring-4 ring-blue-500/10"
                      : "border-border hover:border-blue-500/50",
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <RefreshCw
                      className={cn(
                        "w-6 h-6",
                        localProvider === "gemini"
                          ? "text-blue-500"
                          : "text-muted-foreground",
                      )}
                    />
                    <span className="font-bold">Google Gemini</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Cloud-based inference. Highly reliable and ultra-fast.
                  </p>
                </button>
              </div>
            </div>

            {/* Model Configuration */}
            <div className="bg-card border border-border rounded-[2rem] p-8 shadow-sm">
              {localProvider === "ollama" ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Ollama Settings</h3>
                    <button
                      onClick={fetchAvailableModels}
                      className="p-2 hover:bg-accent rounded-full transition-colors"
                    >
                      <RefreshCw
                        className={cn(
                          "w-4 h-4",
                          isLoadingModels && "animate-spin",
                        )}
                      />
                    </button>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Active Model
                    </label>
                    <select
                      value={localOllamaModel}
                      onChange={(e) => setLocalOllamaModel(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Select a model...</option>
                      {availableModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                      {!availableModels.includes(localOllamaModel) &&
                        localOllamaModel && (
                          <option value={localOllamaModel}>
                            {localOllamaModel} (configured)
                          </option>
                        )}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Gemini Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Gemini API Key
                      </label>
                      <input
                        type="password"
                        value={localGeminiApiKey}
                        onChange={(e) => setLocalGeminiApiKey(e.target.value)}
                        placeholder="Enter your Google AI Studio API Key"
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Model Version
                      </label>
                      <select
                        value={localGeminiModel}
                        onChange={(e) => setLocalGeminiModel(e.target.value)}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="gemini-3.1-flash-lite-preview">
                          Gemini 3.1 Flash-Lite (Preview)
                        </option>
                        <option value="gemini-3-flash-preview">
                          Gemini 3 Flash (Preview)
                        </option>
                        <option value="gemini-2.0-flash-exp">
                          Gemini 2.0 Flash (Experimental)
                        </option>
                        <option value="gemini-1.5-flash">
                          Gemini 1.5 Flash (Stable)
                        </option>
                        <option value="gemini-1.5-pro">
                          Gemini 1.5 Pro (Intelligent)
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
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
