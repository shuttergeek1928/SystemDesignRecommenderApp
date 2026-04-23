import { z } from "zod";

export const systemDesignSchema = z.object({
  // Step 1: Technical Requirements
  appName: z.string().min(2, "App name is required"),
  targetUsers: z.string().min(2, "Target users description is required"),
  userCount: z.number().min(0, "User count must be at least 0"),
  trafficPattern: z.enum(["steady", "bursty", "seasonal"]),
  latency: z.enum(["low", "medium", "high"]),
  scalability: z.enum(["low", "medium", "high", "extreme"]),
  consistency: z.enum(["eventual", "strong"]),
  availabilitySlo: z.enum(["99", "99.9", "99.99", "99.999"]),
  additionalContext: z.string().optional(),

  // Step 2: Team Context
  preferredStack: z.string().optional(),
  teamSize: z.number().min(1, "Team size must be at least 1"),
  experienceLevel: z.enum(["junior", "mid", "senior", "mixed"]),

  // Step 3: Scale & Traffic
  requestRate: z.number().min(0, "Request rate must be at least 0"),
  dataVolume: z.number().min(0, "Data volume must be at least 0"),
  searchComplexity: z.enum(["simple", "complex"]),
  deploymentFrequency: z.enum(["low", "medium", "high", "daily"]),
  readWriteRatio: z.enum(["read-heavy", "balanced", "write-heavy"]),
  dataRetention: z.enum(["days", "months", "years", "permanent"]),

  // Step 4: Agility & Pace
  releaseCycle: z.enum(["daily", "weekly", "monthly", "quarterly"]),
  learningPace: z.enum(["fast", "moderate", "slow"]),
  automationLevel: z.enum(["low", "medium", "high"]),

  // Step 5: Infrastructure & Compliance
  budget: z.enum(["startup", "growth", "enterprise"]),
  regionStrategy: z.enum(["single-region", "multi-region", "global"]),
  compliance: z.array(z.string()).optional(),
  securitySensitivity: z.enum([
    "public",
    "internal",
    "confidential",
    "regulated",
  ]),
});

export type SystemDesignForm = z.infer<typeof systemDesignSchema>;
