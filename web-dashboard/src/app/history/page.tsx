"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Card } from "@/components/ui/base";
import { Calendar, Clock, BrainCircuit, Cpu, ChevronRight, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useSystemDesignStore } from "@/store/useSystemDesignStore";

interface HistoryItem {
  id: string;
  appName: string;
  description: string;
  highlights: string[];
  createdAt: string;
}

export default function HistoryPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { fetchRecommendationById } = useSystemDesignStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const fetchHistory = async () => {
      try {
        // Fetch using both userId and teamId to get personal + team history
        let url = `http://localhost:5220/api/SystemDesign/history?userId=${user.id}`;
        if (user.teamId) {
          url += `&teamId=${user.teamId}`;
        }

        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, router, isMounted]);

  const handleCardClick = async (id: string) => {
    setLoadingId(id);
    const success = await fetchRecommendationById(id);
    if (success) {
      router.push(`/history/${id}`);
    } else {
      setLoadingId(null);
      alert("Failed to load recommendation");
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this design? This action cannot be undone.")) return;

    try {
      const res = await fetch(`http://localhost:5220/api/SystemDesign/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setHistory(history.filter((item) => item.id !== id));
      } else {
        alert("Failed to delete design");
      }
    } catch (err) {
      console.error("Failed to delete history item", err);
      alert("An error occurred while deleting");
    }
  };

  if (!isMounted || !user) return null;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-background">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold mb-3 flex items-center gap-3">
            <Clock className="w-10 h-10 text-primary" />
            Design History
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Review and manage your past architecture recommendations. Your
            designs are automatically saved and synced across your team.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="font-medium">
              Loading your architecture history...
            </span>
          </div>
        ) : history.length === 0 ? (
          <Card className="text-center py-24 border-dashed border-2 bg-muted/20 rounded-[3rem]">
            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <BrainCircuit className="w-10 h-10 text-primary/40" />
            </div>
            <h2 className="text-3xl font-bold mb-3">No Designs Yet</h2>
            <p className="text-muted-foreground mb-10 max-w-md mx-auto text-lg">
              Ready to build something amazing? Start your first system design
              recommendation now.
            </p>
            <Link
              href="/get-started"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 rounded-full font-bold transition-all inline-flex items-center gap-2 shadow-xl shadow-primary/20 hover:-translate-y-1"
            >
              Start Designing <ChevronRight className="w-5 h-5" />
            </Link>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {history.map((item) => (
              <Card
                key={item.id}
                className={cn(
                  "p-5 px-8 border border-border/40 bg-card hover:border-primary/40 transition-all duration-500 group cursor-pointer relative overflow-hidden flex items-center justify-between gap-6 rounded-[2rem]",
                  loadingId === item.id
                    ? "opacity-70 pointer-events-none"
                    : "hover:shadow-xl hover:shadow-primary/5 hover:translate-x-2",
                )}
                onClick={() => handleCardClick(item.id)}
              >
                {loadingId === item.id && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-md flex items-center justify-center z-10">
                    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}

                <div className="flex items-center gap-8 flex-1 min-w-0">
                  <div className="hidden sm:flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/5 text-primary shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-sm">
                    <BrainCircuit className="w-8 h-8" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-xl leading-tight group-hover:text-primary transition-colors truncate">
                        {item.appName}
                      </h3>
                      <div className="h-1 w-1 rounded-full bg-border" />
                      <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                        {new Date(item.createdAt).toLocaleDateString(
                          undefined,
                          { month: "short", day: "numeric" },
                        )}
                      </span>
                    </div>
                    <p className="text-muted-foreground/80 text-sm line-clamp-1 mb-4 font-medium italic">
                      {item.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {item.highlights.map((highlight, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] uppercase tracking-wider font-extrabold bg-secondary/80 text-secondary-foreground px-3 py-1 rounded-lg border border-border/50"
                        >
                          {highlight}
                        </span>
                      ))}
                      <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/40 ml-auto pt-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(item.createdAt).toLocaleTimeString(
                          undefined,
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={(e) => handleDelete(e, item.id)}
                    className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Design"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <div className="flex items-center text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0 bg-primary/5 px-4 py-2 rounded-full">
                    <span className="hidden md:inline mr-1">View Details</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
