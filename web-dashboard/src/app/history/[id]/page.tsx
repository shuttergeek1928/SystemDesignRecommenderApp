"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSystemDesignStore } from "@/store/useSystemDesignStore";
import { RecommendationsView } from "@/components/views/RecommendationsView";
import { Button } from "@/components/ui/base";
import { ChevronLeft } from "lucide-react";

export default function HistoryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { fetchRecommendationById, recommendation, isLoading } = useSystemDesignStore();

  useEffect(() => {
    if (id && typeof id === "string") {
      fetchRecommendationById(id);
    }
  }, [id, fetchRecommendationById]);

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/history")}
            className="gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to History
          </Button>
        </div>
        
        {/* Reuse the RecommendationsView which now handles scores correctly */}
        <RecommendationsView />
      </div>
    </div>
  );
}
