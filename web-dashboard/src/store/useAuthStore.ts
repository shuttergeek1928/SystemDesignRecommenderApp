import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  username: string;
  email: string;
  teamId: string | null;
  teamName?: string;
}

interface AuthStore {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateTeam: (teamId: string | null, teamName?: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      login: (user) => set({ user }),
      logout: () => set({ user: null }),
      updateTeam: (teamId, teamName) =>
        set((state) => ({
          user: state.user ? { ...state.user, teamId, teamName } : null,
        })),
    }),
    {
      name: "auth-storage",
    },
  ),
);
