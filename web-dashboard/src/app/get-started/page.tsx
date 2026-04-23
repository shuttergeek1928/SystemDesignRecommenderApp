"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RequirementForm } from "@/components/views/RequirementForm";
import { useAuthStore } from "@/store/useAuthStore";

export default function GetStartedPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !user) {
      router.push("/login");
    }
  }, [isMounted, user, router]);

  if (!isMounted || !user) return null;

  return (
    <div className="min-h-[calc(100vh-16rem)] py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Tell us about your project
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our recommendation engine takes 12+ variables into account to find
            the perfect architectural match for your team and business goals.
          </p>
        </div>

        <RequirementForm />
      </div>
    </div>
  );
}
