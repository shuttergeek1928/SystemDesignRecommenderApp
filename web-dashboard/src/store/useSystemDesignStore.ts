import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type SystemDesignForm } from "@/types/form";
import { useAuthStore } from "./useAuthStore";

interface SystemDesignStore {
    formData: Partial<SystemDesignForm>;
    recommendation: {
        id: string;
        generatedAt: string;
        data: {
          ExtractedRequirements: any;
          ArchitectureDesign: any;
          TriggeredRules?: any[];
        }
    } | null;
    isLoading: boolean;
    useRag: boolean;
    useHybrid: boolean;
    ollamaModel: string;
    setFormData: (data: Partial<SystemDesignForm>) => void;
    setUseRag: (value: boolean) => void;
    setUseHybrid: (value: boolean) => void;
    setOllamaModel: (value: string) => void;
    generateRecommendation: (data: SystemDesignForm) => Promise<void>;
    fetchRecommendationById: (id: string) => Promise<boolean>;
    fetchSettings: () => Promise<void>;
    updateSettings: (model: string) => Promise<void>;
    reset: () => void;
}

export const useSystemDesignStore = create<SystemDesignStore>()(
    persist(
        (set, get) => ({
            formData: {},
            recommendation: null,
            isLoading: false,
            useRag: false,
            useHybrid: true,
            ollamaModel: "phi3:latest",

            setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
            setUseRag: (value) => set({ useRag: value, useHybrid: !value && get().useHybrid }),
            setUseHybrid: (value) => set({ useHybrid: value, useRag: !value && get().useRag }),
            setOllamaModel: (value) => set({ ollamaModel: value }),

            fetchSettings: async () => {
                try {
                    const response = await fetch("http://localhost:5220/api/Settings");
                    if (response.ok) {
                        const settings = await response.json();
                        set({ ollamaModel: settings.ollamaModel });
                    }
                } catch (error) {
                    console.error("Error fetching settings:", error);
                }
            },

            updateSettings: async (model) => {
                try {
                    const response = await fetch("http://localhost:5220/api/Settings", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ollamaModel: model }),
                    });
                    if (response.ok) {
                        set({ ollamaModel: model });
                    }
                } catch (error) {
                    console.error("Error updating settings:", error);
                }
            },

            generateRecommendation: async (data) => {
                set({ isLoading: true, formData: data });
                const { useRag, useHybrid } = get();

                const prompt = `Design a system for an application named "${data.appName}" targeting ${data.targetUsers}. 
                Key Requirements: 
                - Scalability: ${data.scalability}
                - Latency: ${data.latency} 
                - Consistency: ${data.consistency}
                - Team Size: ${data.teamSize} developers with ${data.experienceLevel} experience level.
                - Release Cycle: ${data.releaseCycle}
                - Learning Pace: ${data.learningPace}
                - Automation Level: ${data.automationLevel}
                - Request Rate: ${data.requestRate} requests/sec
                - Data Volume: ${data.dataVolume} GB/month
                - Search Complexity: ${data.searchComplexity}
                - Deployment Frequency: ${data.deploymentFrequency}`;

                const authState = useAuthStore.getState();
                const userId = authState.user?.id;
                const teamId = authState.user?.teamId;

                try {
                    const response = await fetch("http://localhost:5220/api/SystemDesign/generate", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            problem_statement: prompt,
                            use_rag: useRag,
                            use_hybrid: useHybrid,
                            user_id: userId,
                            team_id: teamId
                        }),
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to generate recommendation: ${response.statusText}`);
                    }

                    const result = await response.json();

                    set({
                        isLoading: false,
                        recommendation: {
                            id: "rec-" + Math.random().toString(36).substr(2, 9),
                            generatedAt: new Date().toISOString(),
                            data: result
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
                set({ isLoading: true });
                try {
                    const response = await fetch(`http://localhost:5220/api/SystemDesign/${id}`);
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
                                triggeredRules: result.triggeredRules
                            }
                        }
                    });
                    return true;
                } catch (error) {
                    console.error("Error fetching recommendation:", error);
                    set({ isLoading: false });
                    return false;
                }
            },

            reset: () => set({ formData: {}, recommendation: null }),
        }),
        {
            name: "system-design-storage",
        }
    )
);
