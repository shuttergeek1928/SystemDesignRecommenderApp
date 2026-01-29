import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type SystemDesignForm } from "@/types/form";

interface SystemDesignStore {
    formData: Partial<SystemDesignForm>;
    recommendation: any | null;
    isLoading: boolean;
    setFormData: (data: Partial<SystemDesignForm>) => void;
    generateRecommendation: (data: SystemDesignForm) => Promise<void>;
    reset: () => void;
}

export const useSystemDesignStore = create<SystemDesignStore>()(
    persist(
        (set) => ({
            formData: {},
            recommendation: null,
            isLoading: false,

            setFormData: (data) => set((state) => ({ formData: { ...state.formData, ...data } })),

            generateRecommendation: async (data) => {
                set({ isLoading: true, formData: data });
                // Mock API Call
                await new Promise((resolve) => setTimeout(resolve, 2000));

                set({
                    isLoading: false,
                    recommendation: {
                        // Mocked recommendation logic
                        id: "rec-" + Math.random().toString(36).substr(2, 9),
                        generatedAt: new Date().toISOString(),
                    },
                });
            },

            reset: () => set({ formData: {}, recommendation: null }),
        }),
        {
            name: "system-design-storage",
        }
    )
);
