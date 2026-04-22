"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Card } from "@/components/ui/base";
import { Calendar, Clock, BrainCircuit, Cpu, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

import { useSystemDesignStore } from "@/store/useSystemDesignStore";

interface HistoryItem {
    id: string;
    title: string;
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
            router.push("/dashboard");
        } else {
            setLoadingId(null);
            alert("Failed to load recommendation");
        }
    };

    if (!isMounted || !user) return null;

    return (
        <div className="min-h-screen pt-24 pb-12 bg-background">
            <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        <Clock className="w-8 h-8 text-primary" />
                        Design History
                    </h1>
                    <p className="text-muted-foreground">
                        Review your past architecture recommendations and team designs.
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-muted-foreground">Loading history...</div>
                ) : history.length === 0 ? (
                    <Card className="text-center py-16">
                        <BrainCircuit className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">No History Yet</h2>
                        <p className="text-muted-foreground mb-6">
                            You haven't generated any system designs yet.
                        </p>
                        <Link 
                            href="/get-started" 
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-full font-semibold transition-all inline-block"
                        >
                            Start Designing
                        </Link>
                    </Card>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {history.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                            No design history found. Start a new session!
                        </div>
                    ) : (
                        history.map((item) => (
                            <Card 
                                key={item.id} 
                                className={cn(
                                    "p-6 border border-border/50 bg-card hover:border-primary/50 transition-all duration-300 group cursor-pointer relative overflow-hidden",
                                    loadingId === item.id ? "opacity-70 pointer-events-none" : "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1"
                                )}
                                onClick={() => handleCardClick(item.id)}
                            >
                                {loadingId === item.id && (
                                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    </div>
                                )}
                                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                                    <Cpu className="w-16 h-16 text-primary" />
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3 bg-secondary/50 w-fit px-2 py-1 rounded-md">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    {new Date(item.createdAt).toLocaleDateString(undefined, { 
                                        year: 'numeric', month: 'short', day: 'numeric', 
                                        hour: '2-digit', minute: '2-digit' 
                                    })}
                                </div>
                                <h3 className="font-bold text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors relative z-10 pr-4">
                                    {item.title}
                                </h3>
                                <div className="mt-6 flex items-center text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 relative z-10">
                                    View Architecture <ChevronRight className="w-4 h-4 ml-1" />
                                </div>
                            </Card>
                        ))
                    )}</div>
                )}
            </div>
        </div>
    );
}
