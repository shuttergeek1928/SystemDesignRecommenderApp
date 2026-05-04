import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as signalR from "@microsoft/signalr";
import { type SystemDesignForm } from "@/types/form";
import { useAuthStore } from "./useAuthStore";

export interface NodeDefinition {
  key: string;
  displayName: string;
}

export interface NodeSetting {
  nodeKey: string;
  choice: string;
  justification: string;
  isOverride: boolean;
}

export interface PipelineTraceStep {
  stepId: string;
  stepName: string;
  status: string;
  summary: string;
  details: string;
  timestamp: string;
}

interface SystemDesignStore {
  formData: Partial<SystemDesignForm>;
  recommendation: {
    id: string;
    generatedAt: string;
    data: {
      ExtractedRequirements?: any;
      ArchitectureDesign?: any;
      TriggeredRules?: any[];
      Rules?: any[];
      EvaluationScores?: any;
      extractedRequirements?: any;
      architectureDesign?: any;
      triggeredRules?: any[];
      rules?: any[];
      evaluationScores?: any;
    };
  } | null;
  isLoading: boolean;
  useRag: boolean;
  useHybrid: boolean;
  ollamaModel: string;
  geminiModel: string;
  geminiApiKey: string;
  preferredProvider: string;
  extractionProvider: string;
  extractionModel: string;
  generationProvider: string;
  generationModel: string;
  evaluationProvider: string;
  evaluationModel: string;
  agentStatus: string | null;
  pipelineLogs: PipelineTraceStep[];
  connectionId: string | null;
  initSignalR: () => void;
  setFormData: (data: Partial<SystemDesignForm>) => void;
  setUseRag: (value: boolean) => void;
  setUseHybrid: (value: boolean) => void;
  setOllamaModel: (value: string) => void;
  setGeminiModel: (value: string) => void;
  setGeminiApiKey: (value: string) => void;
  setPreferredProvider: (value: string) => void;
  generateRecommendation: (data: SystemDesignForm) => Promise<boolean>;
  fetchRecommendationById: (id: string) => Promise<boolean>;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: {
    ollamaModel?: string;
    geminiModel?: string;
    geminiApiKey?: string;
    preferredProvider?: string;
    extractionProvider?: string;
    extractionModel?: string;
    generationProvider?: string;
    generationModel?: string;
    evaluationProvider?: string;
    evaluationModel?: string;
  }) => Promise<void>;
  reset: () => void;

  // Node Definitions & Settings
  nodeDefinitions: NodeDefinition[];
  nodeSettings: NodeSetting[];
  fetchNodeDefinitions: () => Promise<void>;
  saveNodeDefinition: (def: NodeDefinition) => Promise<void>;
  deleteNodeDefinition: (key: string) => Promise<void>;
  fetchNodeSettings: (
    teamId?: string | null,
    userId?: string | null,
  ) => Promise<void>;
  saveNodeSettings: (
    settings: NodeSetting[],
    teamId?: string | null,
    userId?: string | null,
  ) => Promise<void>;
}

export const useSystemDesignStore = create<SystemDesignStore>()(
  persist(
    (set, get) => ({
      formData: {},
      recommendation: null,
      isLoading: false,
      useRag: false,
      useHybrid: true,
      ollamaModel: "qwen2.5-coder:7b",
      geminiModel: "gemini-3-flash-preview",
      geminiApiKey: "",
      preferredProvider: "ollama",
      extractionProvider: "ollama",
      extractionModel: "qwen2.5-coder:7b",
      generationProvider: "gemini",
      generationModel: "gemini-3-flash-preview",
      evaluationProvider: "gemini",
      evaluationModel: "gemini-1.5-pro",
      nodeDefinitions: [],
      nodeSettings: [],
      agentStatus: null,
      pipelineLogs: [],
      connectionId: null,

      initSignalR: () => {
        if (get().connectionId) return; // Already connected
        
        const connection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5220/hubs/agentStatus")
            .withAutomaticReconnect()
            .build();

        connection.on("ReceiveAgentStatus", (message: string) => {
            set({ agentStatus: message });
        });

        connection.on("ReceivePipelineUpdate", (step: PipelineTraceStep) => {
            set((state) => {
                // If step with same name exists, update it, else append
                const existingIndex = state.pipelineLogs.findIndex(s => s.stepName === step.stepName);
                if (existingIndex >= 0) {
                    const newLogs = [...state.pipelineLogs];
                    newLogs[existingIndex] = step;
                    return { pipelineLogs: newLogs };
                }
                return { pipelineLogs: [...state.pipelineLogs, step] };
            });
        });

        connection.start()
            .then(() => {
                set({ connectionId: connection.connectionId });
            })
            .catch(err => console.error("Error connecting to SignalR: ", err));
      },

      setFormData: (data) =>
        set((state) => ({ formData: { ...state.formData, ...data } })),
      setUseRag: (value) =>
        set({ useRag: value, useHybrid: !value && get().useHybrid }),
      setUseHybrid: (value) =>
        set({ useHybrid: value, useRag: !value && get().useRag }),
      setOllamaModel: (value) => set({ ollamaModel: value }),
      setGeminiModel: (value) => set({ geminiModel: value }),
      setGeminiApiKey: (value) => set({ geminiApiKey: value }),
      setPreferredProvider: (value) => set({ preferredProvider: value }),

      fetchSettings: async () => {
        try {
          const response = await fetch("http://localhost:5220/api/Settings");
          if (response.ok) {
            const settings = await response.json();
            set({
              ollamaModel: settings.ollamaModel,
              geminiModel: settings.geminiModel,
              geminiApiKey: settings.geminiApiKey,
              preferredProvider: settings.preferredProvider,
              extractionProvider: settings.extractionProvider,
              extractionModel: settings.extractionModel,
              generationProvider: settings.generationProvider,
              generationModel: settings.generationModel,
              evaluationProvider: settings.evaluationProvider,
              evaluationModel: settings.evaluationModel,
            });
          }
        } catch (error) {
          console.error("Error fetching settings:", error);
        }
      },

      updateSettings: async (settings) => {
        try {
          const currentSettings = {
            ollamaModel: get().ollamaModel,
            geminiModel: get().geminiModel,
            geminiApiKey: get().geminiApiKey,
            preferredProvider: get().preferredProvider,
            extractionProvider: get().extractionProvider,
            extractionModel: get().extractionModel,
            generationProvider: get().generationProvider,
            generationModel: get().generationModel,
            evaluationProvider: get().evaluationProvider,
            evaluationModel: get().evaluationModel,
            ...settings,
          };

          const response = await fetch("http://localhost:5220/api/Settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(currentSettings),
          });
          if (response.ok) {
            set(currentSettings);
          }
        } catch (error) {
          console.error("Error updating settings:", error);
        }
      },

      generateRecommendation: async (data) => {
        if (get().isLoading) return false;
        
        // Ensure SignalR is connected
        get().initSignalR();
        
        set({ isLoading: true, formData: data, agentStatus: "Starting Agentic Loop...", pipelineLogs: [], recommendation: null });
        const { useRag, useHybrid, connectionId } = get();

        const prompt = `Design a system for an application named "${data.appName}" targeting ${data.targetUsers} (${data.userCount} users). 
                Key Requirements: 
                - Scalability: ${data.scalability}, Traffic: ${data.trafficPattern}
                - Latency: ${data.latency}, Availability SLO: ${data.availabilitySlo}%
                - Consistency: ${data.consistency}
                - Team Size: ${data.teamSize} developers with ${data.experienceLevel} experience level.
                - Release Cycle: ${data.releaseCycle}, Learning Pace: ${data.learningPace}
                - Request Rate: ${data.requestRate} req/s, Data Volume: ${data.dataVolume} GB/month
                - Read/Write Ratio: ${data.readWriteRatio}, Data Retention: ${data.dataRetention}
                - Search Complexity: ${data.searchComplexity}, Deployment Frequency: ${data.deploymentFrequency}
                - Budget: ${data.budget}, Region: ${data.regionStrategy} (AWS)
                - Security: ${data.securitySensitivity}, Compliance: ${(data.compliance || []).join(", ") || "None"}
                ${data.additionalContext ? `- Additional Context: ${data.additionalContext}` : ""}`;

        const authState = useAuthStore.getState();
        const userId = authState.user?.id;
        const teamId = authState.user?.teamId;

        const mappedRequirements = {
          title: data.appName,
          description: data.additionalContext,
          context: {
            users: data.userCount,
            traffic_pattern: data.trafficPattern,
            latency_requirement_ms:
              data.latency === "low"
                ? 50
                : data.latency === "medium"
                  ? 200
                  : 1000,
            availability_slo: data.availabilitySlo + "%",
            consistency_model: data.consistency,
            budget: data.budget,
            compliance: data.compliance || [],
            cloud_provider: "aws",
            region_strategy: data.regionStrategy,
            team_size: data.teamSize,
            experience_level: data.experienceLevel,
            request_rate: data.requestRate,
            data_volume_gb: data.dataVolume,
            search_complexity: data.searchComplexity,
            deployment_frequency: data.deploymentFrequency,
            read_write_ratio: data.readWriteRatio,
            data_retention: data.dataRetention,
            security_sensitivity: data.securitySensitivity,
          },
        };

        try {
          const response = await fetch(
            "http://localhost:5220/api/SystemDesign/generate",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                problem_statement: prompt,
                use_rag: useRag,
                use_hybrid: useHybrid,
                user_id: userId,
                team_id: teamId,
                connection_id: connectionId,
                requirements: mappedRequirements,
              }),
            },
          );

          if (!response.ok) {
            throw new Error(
              `Failed to generate recommendation: ${response.statusText}`,
            );
          }

          const result = await response.json();

          set({
            isLoading: false,
            agentStatus: "Done",
            recommendation: {
              id: result.sessionId || result.SessionId || "rec-" + Math.random().toString(36).substr(2, 9),
              generatedAt: new Date().toISOString(),
              data: result,
            },
          });
          return true;
        } catch (error) {
          console.error("Error generating system design:", error);
          set({ isLoading: false });
          return false;
        }
      },

      fetchRecommendationById: async (id: string) => {
        set({ isLoading: true, agentStatus: "Initializing...", recommendation: null });
        try {
          const response = await fetch(
            `http://localhost:5220/api/SystemDesign/${id}`,
          );
          if (!response.ok) throw new Error("Failed to fetch session");

          const result = await response.json();
          set({
            isLoading: false,
            recommendation: {
              id: result.id || id,
              generatedAt: result.createdAt || new Date().toISOString(),
              data: {
                // Match the structure expected by the UI (combining the fields)
                extractedRequirements: result.extractedRequirements,
                architectureDesign: result.architectureDesign,
                triggeredRules: result.triggeredRules,
                rules: result.rules || result.Rules,
                evaluationScores: result.evaluationScores,
              },
            },
            pipelineLogs: result.pipelineLogs || [],
          });
          return true;
        } catch (error) {
          console.error("Error fetching recommendation:", error);
          set({ isLoading: false });
          return false;
        }
      },

      reset: () => set({ formData: {}, recommendation: null }),

      fetchNodeDefinitions: async () => {
        try {
          const response = await fetch(
            "http://localhost:5220/api/NodeSettings/definitions",
          );
          if (response.ok) {
            const data = await response.json();
            set({ nodeDefinitions: data });
          }
        } catch (error) {
          console.error("Error fetching node definitions:", error);
        }
      },

      saveNodeDefinition: async (def) => {
        try {
          const response = await fetch(
            "http://localhost:5220/api/NodeSettings/definitions",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(def),
            },
          );
          if (response.ok) {
            get().fetchNodeDefinitions();
          }
        } catch (error) {
          console.error("Error saving node definition:", error);
        }
      },

      deleteNodeDefinition: async (key) => {
        try {
          const response = await fetch(
            `http://localhost:5220/api/NodeSettings/definitions/${key}`,
            {
              method: "DELETE",
            },
          );
          if (response.ok) {
            get().fetchNodeDefinitions();
          }
        } catch (error) {
          console.error("Error deleting node definition:", error);
        }
      },

      fetchNodeSettings: async (teamId, userId) => {
        try {
          const url = new URL("http://localhost:5220/api/NodeSettings/merged");
          if (teamId) url.searchParams.append("teamId", teamId);
          if (userId) url.searchParams.append("userId", userId);

          const response = await fetch(url.toString());
          if (response.ok) {
            const data = await response.json();
            set({ nodeSettings: data });
          }
        } catch (error) {
          console.error("Error fetching node settings:", error);
        }
      },

      saveNodeSettings: async (settings, teamId, userId) => {
        try {
          const response = await fetch(
            "http://localhost:5220/api/NodeSettings/save",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                teamId,
                userId,
                settings,
              }),
            },
          );
          if (response.ok) {
            get().fetchNodeSettings(teamId, userId);
          }
        } catch (error) {
          console.error("Error saving node settings:", error);
        }
      },
    }),
    {
      name: "system-design-storage",
    },
  ),
);
