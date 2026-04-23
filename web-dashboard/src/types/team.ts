import { z } from "zod";

// --- User Types & Schema ---

export const userSkillSchema = z.object({
  name: z.string(),
  level: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
});

export const userSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  role: z.string(),
  primarySkills: z.array(z.string()),
  secondarySkills: z.array(z.string()),
  additionalSkills: z.array(z.string()),
  productivity: z.number().min(0).max(100),
  morale: z.number().min(0).max(100),
  satisfaction: z.number().min(0).max(100),
  performance: z.number().min(0).max(100),
  learningPace: z.enum(["Fast", "Moderate", "Slow"]),
  goal: z.string(),
  teamIds: z.array(z.string()), // A user can be in multiple teams
});

export type User = z.infer<typeof userSchema>;

// --- Team Types & Schema ---

export const teamSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Team name is required"),
  description: z.string().optional(),
  managerId: z.string(), // ID of the user who is the manager
  product: z.string(),
  status: z.enum(["Active", "On Hold", "Completed"]),
  // Aggregated/Team-level metrics
  productivity: z.number().min(0).max(100),
  morale: z.number().min(0).max(100),
  satisfaction: z.number().min(0).max(100),
  performance: z.number().min(0).max(100),
});

export type Team = z.infer<typeof teamSchema>;

// --- Composed Types for UI ---

export interface TeamWithMembers extends Team {
  members: User[];
  manager?: User;
}
