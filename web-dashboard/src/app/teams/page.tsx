"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useTeamStore } from "@/store/useTeamStore";
import { TeamsView } from "@/components/views/TeamsView";
import { Building2 } from "lucide-react";

export default function TeamsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  // We will inject fetchRealData into useTeamStore
  const fetchRealData = useTeamStore((state: any) => state.fetchRealData);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!user) {
      router.push("/login");
      return;
    }

    // Trigger fetching real data from backend
    if (fetchRealData) {
      fetchRealData();
    }
  }, [user, router, isMounted, fetchRealData]);

  if (!isMounted || !user) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-3 flex items-center gap-3">
            <Building2 className="w-10 h-10 text-primary" />
            Organization Directory
          </h1>
          <p className="text-muted-foreground text-lg">
            Manage all workspaces, resources, and access control across the
            platform.
          </p>
        </div>

        <TeamsView />
      </div>
    </div>
  );
}
