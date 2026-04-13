import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type SystemDesignForm } from "@/types/form";

interface SystemDesignStore {
    formData: Partial<SystemDesignForm>;
    recommendation: {
        id: string;
        generatedAt: string;
        data: {
          ExtractedRequirements: any;
          ArchitectureDesign: any;
        }
    } | null;
    isLoading: boolean;
    useRag: boolean;
    setFormData: (data: Partial<SystemDesignForm>) => void;
    setUseRag: (value: boolean) => void;
    generateRecommendation: (data: SystemDesignForm) => Promise<void>;
    reset: () => void;
}

export const useSystemDesignStore = create<SystemDesignStore>()(
    persist(
        (set, get) => ({
            formData: {},
            recommendation: null,
            isLoading: false,
            useRag: false,

            setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),
            setUseRag: (value) => set({ useRag: value }),

            generateRecommendation: async (data) => {
                set({ isLoading: true, formData: data });
                const { useRag } = get();

                const prompt = `Design a system for an application named "${data.appName}" targeting ${data.targetUsers}. 
                Key Requirements: 
                - Scalability: ${data.scalability}
                - Latency: ${data.latency} 
                - Consistency: ${data.consistency}
                - Team Size: ${data.teamSize} developers with ${data.experienceLevel} experience level.
                - Release Cycle: ${data.releaseCycle}
                - Learning Pace: ${data.learningPace}
                - Automation Level: ${data.automationLevel}`;

                try {
                    const response = await fetch("http://localhost:5000/api/SystemDesign/generate", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            problem_statement: prompt,
                            use_rag: useRag
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
                } catch (error) {
                    console.error("Error generating system design:", error);
                    set({ isLoading: false });
                    // Fallback or error handled by the UI
                }
            },

            reset: () => set({ formData: {}, recommendation: null }),
        }),
        {
            name: "system-design-storage",
        }
    )
);
