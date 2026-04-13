"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Sparkles, Brain, Cpu, Terminal } from "lucide-react";
import Link from "next/link";
import { Button, Card, Textarea, Label } from "@/components/ui/base";
import axios from "axios";

export default function DemoPage() {
    const [input, setInput] = useState("");
    const [response, setResponse] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!input.trim()) return;

        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            const res = await axios.post("https://localhost:7123/OllamaChat", {
                messages: [
                    {
                        role: "user",
                        content: input,
                    },
                ],
                model: "qwen3-coder:480b-cloud", // Using the model from backend config as default
                temperature: 0,
            });

            setResponse(res.data.answer);
        } catch (err: any) {
            console.error("API Error:", err);
            setError(err.response?.data?.error || "Failed to get response from the API. Please ensure the .NET backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
            {/* Background Decorations */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="container mx-auto px-4 py-12 relative z-10 max-w-4xl">
                {/* Header */}
                <header className="mb-12">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </Link>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                            Interactive <span className="text-primary">Demo</span>
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Experience our context-aware architecture engine in real-time. Describe your project requirements and get instant recommendations.
                    </p>
                </header>

                <div className="grid gap-8">
                    {/* Input Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Card className="p-6 md:p-8 bg-card/50 backdrop-blur-md border-border/50">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="requirements" className="flex items-center gap-2">
                                        <Terminal className="w-4 h-4 text-primary" />
                                        Enter your System Requirements
                                    </Label>
                                    <Textarea
                                        id="requirements"
                                        placeholder="e.g., I need a scalable e-commerce backend with low latency for search and high availability for checkout..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="h-40 resize-none bg-background/50 border-border/30 focus:border-primary/50 transition-all font-mono"
                                    />
                                </div>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={isLoading || !input.trim()}
                                    className="w-full md:w-auto min-w-[200px] h-14 text-lg"
                                    size="lg"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <Cpu className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Suggest Me <Send className="w-5 h-5" />
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>

                    {/* Response Section */}
                    <AnimatePresence mode="wait">
                        {(response || error || isLoading) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Card className="p-6 md:p-8 overflow-hidden relative border-primary/20 bg-primary/5 shadow-2xl shadow-primary/5">
                                    <div className="absolute top-0 right-0 p-4">
                                        <Brain className="w-8 h-8 text-primary/20" />
                                    </div>

                                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                        <Cpu className="w-5 h-5 text-primary" />
                                        Recommended Architecture
                                    </h3>

                                    {isLoading ? (
                                        <div className="space-y-4">
                                            <div className="h-4 bg-primary/10 rounded-full w-3/4 animate-pulse" />
                                            <div className="h-4 bg-primary/10 rounded-full w-full animate-pulse" />
                                            <div className="h-4 bg-primary/10 rounded-full w-5/6 animate-pulse" />
                                        </div>
                                    ) : error ? (
                                        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-mono">
                                            {error}
                                        </div>
                                    ) : (
                                        <div className="prose prose-invert max-w-none">
                                            <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/90 bg-black/20 p-6 rounded-2xl border border-white/5">
                                                {response}
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
