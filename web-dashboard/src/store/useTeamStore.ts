import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Team } from "@/types/team";

interface TeamStore {
    users: User[];
    teams: Team[];
    isLoading: boolean;

    // User Actions
    addUser: (user: User) => void;
    updateUser: (id: string, user: Partial<User>) => void;
    deleteUser: (id: string) => void;

    // Team Actions
    addTeam: (team: Team) => void;
    updateTeam: (id: string, team: Partial<Team>) => void;
    deleteTeam: (id: string) => void;

    // Assignment Logic
    assignUserToTeam: (userId: string, teamId: string) => { success: boolean, message: string };
    unassignUserFromTeam: (userId: string, teamId: string) => void;
}

export const useTeamStore = create<TeamStore>()(
    persist(
        (set, get) => ({
            users: [
                {
                    id: "u1",
                    name: "Alex Johnson",
                    description: "Senior Architect with a focus on distributed systems.",
                    role: "Software Architect",
                    primarySkills: ["Go", "Kubernetes", "AWS"],
                    secondarySkills: ["React", "PostgreSQL"],
                    additionalSkills: ["Terraform", "Docker"],
                    productivity: 85,
                    morale: 90,
                    satisfaction: 88,
                    performance: 92,
                    learningPace: "Fast",
                    goal: "Master serverless architectures",
                    teamIds: ["t1"]
                },
                {
                    id: "u2",
                    name: "Sarah Smith",
                    description: "Full-stack developer who loves UI/UX.",
                    role: "Senior Developer",
                    primarySkills: ["React", "TypeScript", "Tailwind"],
                    secondarySkills: ["Node.js", "GraphQL"],
                    additionalSkills: ["Figma", "Storybook"],
                    productivity: 95,
                    morale: 85,
                    satisfaction: 92,
                    performance: 94,
                    learningPace: "Fast",
                    goal: "Lead a frontend transformation project",
                    teamIds: ["t1", "t2"]
                }
            ],
            teams: [
                {
                    id: "t1",
                    name: "Core Infrastructure",
                    description: "Responsible for the foundational layers of the recommendation engine.",
                    managerId: "u1",
                    product: "Context-Aware Engine",
                    status: "Active",
                    productivity: 88,
                    morale: 85,
                    satisfaction: 90,
                    performance: 87
                },
                {
                    id: "t2",
                    name: "User Experience",
                    description: "Focuses on providing a seamless interface for architects.",
                    managerId: "u2",
                    product: "Recommendation Dashboard",
                    status: "Active",
                    productivity: 92,
                    morale: 88,
                    satisfaction: 85,
                    performance: 90
                }
            ],
            isLoading: false,

            addUser: (user) => set((state) => ({ users: [...state.users, user] })),
            updateUser: (id, updatedUser) => set((state) => ({
                users: state.users.map(u => u.id === id ? { ...u, ...updatedUser } : u)
            })),
            deleteUser: (id) => set((state) => ({
                users: state.users.filter(u => u.id !== id),
                teams: state.teams.map(t => t.managerId === id ? { ...t, managerId: "" } : t)
            })),

            addTeam: (team) => set((state) => ({ teams: [...state.teams, team] })),
            updateTeam: (id, updatedTeam) => set((state) => ({
                teams: state.teams.map(t => t.id === id ? { ...t, ...updatedTeam } : t)
            })),
            deleteTeam: (id) => set((state) => ({
                teams: state.teams.filter(t => t.id !== id),
                users: state.users.map(u => ({ ...u, teamIds: u.teamIds.filter(tid => tid !== id) }))
            })),

            assignUserToTeam: (userId, teamId) => {
                const state = get();
                const user = state.users.find(u => u.id === userId);
                if (!user) return { success: false, message: "User not found" };

                // Logic: A user can be in multiple teams, but we check productivity impact (mock)
                if (user.teamIds.includes(teamId)) return { success: false, message: "User already in team" };

                // Mock productivity check: limit 3 teams
                if (user.teamIds.length >= 3) {
                    return { success: false, message: "User has reached maximum productivity limit (3 teams)" };
                }

                set((state) => ({
                    users: state.users.map(u => u.id === userId ? { ...u, teamIds: [...u.teamIds, teamId] } : u)
                }));
                return { success: true, message: "User assigned successfully" };
            },

            unassignUserFromTeam: (userId, teamId) => {
                set((state) => ({
                    users: state.users.map(u => u.id === userId ? { ...u, teamIds: u.teamIds.filter(tid => tid !== teamId) } : u)
                }));
            }
        }),
        {
            name: "teams-storage",
        }
    )
);
