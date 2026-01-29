"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BrainCircuit, Zap, BarChart3, ShieldCheck, Sparkles, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Context-Aware Intelligence",
    description: "Our engine analyzes not just technical needs, but team velocity, learning curves, and existing stack compatibility.",
    icon: BrainCircuit,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Performance Optimization",
    description: "Get recommendations tuned for low latency, high throughput, or massive scalability based on your requirements.",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "Productivity Analytics",
    description: "Visualize how different architecture choices impact your team's long-term developer productivity.",
    icon: BarChart3,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Enterprise Security",
    description: "Architectural patterns that comply with industry standards (NIQ, BP, JPMC levels) right out of the box.",
    icon: ShieldCheck,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

const companies = [
  "NIQ", "BP", "GfK", "JP Morgan & Chase", "TCS", "Infosys"
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full z-[-1]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full z-[-1]" />

      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-24 text-center md:pt-32 md:pb-40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
            <Sparkles className="w-3 h-3" />
            <span>Personalized Architecture Recommendations</span>
          </div>
          <h1 className="text-4xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
            Build Faster with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-400 to-emerald-400">
              Context-Aware Design
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            The decision support system that recommends software architecture by jointly analyzing
            application requirements and developer productivity context.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/get-started"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 rounded-xl text-lg font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/30 w-full sm:w-auto"
            >
              Start Designing <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#demo"
              className="bg-accent hover:bg-accent/80 text-foreground px-8 py-4 rounded-xl text-lg font-semibold border border-border w-full sm:w-auto transition-colors"
            >
              View Demo
            </Link>
          </div>
        </motion.div>

        {/* Floating Code Preview / Mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-20 relative px-4"
        >
          <div className="max-w-5xl mx-auto aspect-[16/9] rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
            <div className="p-4 border-b border-border/50 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
              </div>
              <div className="mx-auto text-xs font-mono text-muted-foreground">recommendation-engine.v1</div>
            </div>
            <div className="p-8 text-left font-mono text-sm space-y-4">
              <div className="flex gap-4">
                <span className="text-primary font-bold">REQ:</span>
                <span className="text-foreground/80">LATENCY &lt; 50ms, SCALE: 1M+ RPS</span>
              </div>
              <div className="flex gap-4">
                <span className="text-emerald-400 font-bold">DEV:</span>
                <span className="text-foreground/80">TEAM: 5 FE, 8 BE | STACK: TS, GO | PACE: AGILE</span>
              </div>
              <div className="h-px bg-border/30 my-4" />
              <div className="space-y-2">
                <p className="text-muted-foreground">// Recommended Stack:</p>
                <p className="text-blue-400">1. Client-Side Rendering (Next.js App Router)</p>
                <p className="text-blue-400">2. Event-Driven SQS / Lambda (Scalability focus)</p>
                <p className="text-blue-400">3. Redis Cache with Write-Through Policy</p>
                <p className="text-pink-400">Confidence Score: 98.4%</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Social Proof */}
      <section className="py-20 border-y border-border/50 bg-secondary/30">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-12">
            Trusted by architects at leading organizations
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {companies.map((company) => (
              <span key={company} className="text-2xl font-bold tracking-tighter text-foreground whitespace-nowrap">
                {company}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container mx-auto px-4 py-32">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Precision Engineering</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our recommendation platform replaces guesswork with data-driven architecture paths.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group p-8 rounded-3xl border border-border bg-card hover:bg-accent transition-all duration-300 hover:border-primary/50 relative"
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", feature.bg)}>
                <feature.icon className={cn("w-6 h-6", feature.color)} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-32">
        <div className="relative rounded-[2.5rem] bg-primary overflow-hidden px-8 py-20 text-center">
          <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-white/10 blur-[100px] rounded-full -rotate-12" />
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 relative z-10">
            Ready to architect your <br className="hidden md:block" /> next big thing?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-12 max-w-xl mx-auto relative z-10">
            Join hundreds of teams delivering high-performing systems with fewer architectural bottlenecks.
          </p>
          <Link
            href="/get-started"
            className="bg-white text-primary hover:bg-white/90 px-10 py-5 rounded-2xl text-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-2xl relative z-10 inline-block"
          >
            Get Started for Free
          </Link>
        </div>
      </section>
    </div>
  );
}
