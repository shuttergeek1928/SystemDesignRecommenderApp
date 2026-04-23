import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Team } from "@/types/team";

interface TeamStore {
  users: User[];
  teams: Team[];
  isLoading: boolean;

  // User Actions
  addUser: (user: User) => void;
  updateUser: (id: string, user: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => void;

  // Team Actions
  addTeam: (team: Team) => void;
  updateTeam: (id: string, team: Partial<Team>) => void;
  deleteTeam: (id: string) => void;

  // Assignment Logic
  assignUserToTeam: (
    userId: string,
    teamId: string,
  ) => Promise<{ success: boolean; message: string }>;
  unassignUserFromTeam: (userId: string, teamId: string) => Promise<void>;
  fetchRealData: () => Promise<void>;
}

export const useTeamStore = create<TeamStore>()(
  persist(
    (set, get) => ({
      users: [],
      teams: [],
      isLoading: false,

      fetchRealData: async () => {
        set({ isLoading: true });
        try {
          const [usersRes, teamsRes] = await Promise.all([
            fetch("http://localhost:5220/api/Auth/users"),
            fetch("http://localhost:5220/api/Teams"),
          ]);

          if (usersRes.ok && teamsRes.ok) {
            const backendUsers = await usersRes.json();
            const backendTeams = await teamsRes.json();

            const mappedUsers: User[] = backendUsers.map((u: any) => ({
              id: u.id,
              name: u.username,
              description: u.email,
              role: u.role || "Member",
              primarySkills: JSON.parse(u.primarySkills || "[]"),
              secondarySkills: JSON.parse(u.secondarySkills || "[]"),
              additionalSkills: JSON.parse(u.additionalSkills || "[]"),
              productivity: u.productivity,
              morale: u.morale,
              satisfaction: u.satisfaction,
              performance: u.performance,
              learningPace: u.learningPace || "Moderate",
              goal: u.goal || "",
              teamIds: u.teamId ? [u.teamId] : [],
            }));

            const mappedTeams: Team[] = backendTeams.map((t: any) => {
              const teamMembers = mappedUsers.filter((u: User) =>
                u.teamIds.includes(t.id),
              );

              // Calculate averages
              const count = teamMembers.length;
              const avgProd =
                count > 0
                  ? teamMembers.reduce(
                      (acc: number, m: User) => acc + m.productivity,
                      0,
                    ) / count
                  : 95;
              const avgMorale =
                count > 0
                  ? teamMembers.reduce(
                      (acc: number, m: User) => acc + m.morale,
                      0,
                    ) / count
                  : 90;
              const avgSat =
                count > 0
                  ? teamMembers.reduce(
                      (acc: number, m: User) => acc + m.satisfaction,
                      0,
                    ) / count
                  : 92;
              const avgPerf =
                count > 0
                  ? teamMembers.reduce(
                      (acc: number, m: User) => acc + m.performance,
                      0,
                    ) / count
                  : 94;

              return {
                id: t.id,
                name: t.name,
                description: "Enterprise System Design Workspace",
                managerId: t.managerId || "",
                product: "Architecture Generator",
                status: "Active",
                productivity: Math.round(avgProd),
                morale: Math.round(avgMorale),
                satisfaction: Math.round(avgSat),
                performance: Math.round(avgPerf),
              };
            });

            set({ users: mappedUsers, teams: mappedTeams, isLoading: false });
          }
        } catch (error) {
          console.error("Failed to fetch real data", error);
          set({ isLoading: false });
        }
      },

      addUser: (user) => set((state) => ({ users: [...state.users, user] })),
      updateUser: async (id, updatedUser) => {
        const state = get();
        const existingUser = state.users.find((u) => u.id === id);
        if (!existingUser) return;

        const fullUser = { ...existingUser, ...updatedUser };

        try {
          const res = await fetch(
            `http://localhost:5220/api/Auth/users/${id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                role: fullUser.role,
                primarySkills: fullUser.primarySkills,
                secondarySkills: fullUser.secondarySkills,
                additionalSkills: fullUser.additionalSkills,
                productivity: fullUser.productivity,
                morale: fullUser.morale,
                satisfaction: fullUser.satisfaction,
                performance: fullUser.performance,
                learningPace: fullUser.learningPace,
                goal: fullUser.goal,
              }),
            },
          );

          if (res.ok) {
            get().fetchRealData();
          }
        } catch (error) {
          console.error("Failed to update user", error);
        }
      },
      deleteUser: (id) =>
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
          teams: state.teams.map((t) =>
            t.managerId === id ? { ...t, managerId: "" } : t,
          ),
        })),

      addTeam: async (team) => {
        try {
          const res = await fetch("http://localhost:5220/api/Teams", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: team.name,
              ownerId: "00000000-0000-0000-0000-000000000000",
            }), // Admin creation mocked
          });
          if (res.ok) {
            get().fetchRealData();
          }
        } catch (err) {}
      },
      updateTeam: (id, updatedTeam) =>
        set((state) => ({
          teams: state.teams.map((t) =>
            t.id === id ? { ...t, ...updatedTeam } : t,
          ),
        })),
      deleteTeam: (id) =>
        set((state) => ({
          teams: state.teams.filter((t) => t.id !== id),
          users: state.users.map((u) => ({
            ...u,
            teamIds: u.teamIds.filter((tid) => tid !== id),
          })),
        })),

      assignUserToTeam: async (userId, teamId) => {
        const state = get();
        const user = state.users.find((u) => u.id === userId);
        if (!user) return { success: false, message: "User not found" };

        try {
          const res = await fetch(
            `http://localhost:5220/api/Teams/${teamId}/add-member`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: user.description }), // email is stored in description
            },
          );

          if (res.ok) {
            get().fetchRealData();
            return { success: true, message: "User assigned successfully" };
          }
          return {
            success: false,
            message: "Failed to assign. User may already be in a team.",
          };
        } catch (err) {
          return { success: false, message: "Network error" };
        }
      },

      unassignUserFromTeam: async (userId, teamId) => {
        try {
          const res = await fetch(
            `http://localhost:5220/api/Teams/${teamId}/remove-member/${userId}`,
            {
              method: "POST",
            },
          );
          if (res.ok) {
            get().fetchRealData();
          }
        } catch (err) {}
      },
    }),
    {
      name: "teams-storage",
    },
  ),
);
