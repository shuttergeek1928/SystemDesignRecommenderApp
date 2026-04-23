import { z } from "zod";

export const systemDesignSchema = z.object({
  // Step 1: Technical Requirements
  appName: z.string().min(2, "App name is required"),
  targetUsers: z.string().min(2, "Target users description is required"),
  latency: z.enum(["low", "medium", "high"]),
  scalability: z.enum(["low", "medium", "high", "extreme"]),
  consistency: z.enum(["eventual", "strong"]),

  // Step 2: Tech Stack & Experience
  preferredStack: z.string().optional(),
  teamSize: z.number().min(1, "Team size must be at least 1"),
  experienceLevel: z.enum(["junior", "mid", "senior", "mixed"]),

  // Step 3: Agility & Productivity
  releaseCycle: z.enum(["daily", "weekly", "monthly", "quarterly"]),
  learningPace: z.enum(["fast", "moderate", "slow"]),
  automationLevel: z.enum(["low", "medium", "high"]),

  // Step 4: Scale & Traffic
  requestRate: z.number().min(0, "Request rate must be at least 0"),
  dataVolume: z.number().min(0, "Data volume must be at least 0"),
  searchComplexity: z.enum(["simple", "complex"]),
  deploymentFrequency: z.enum(["low", "medium", "high", "daily"]),
  additionalContext: z.string().optional(),
});

export type SystemDesignForm = z.infer<typeof systemDesignSchema>;
