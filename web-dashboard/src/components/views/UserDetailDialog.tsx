"use client";

import { motion } from "framer-motion";
import {
  X,
  GraduationCap,
  PieChart,
  Zap,
  Heart,
  Star,
  Target,
  Briefcase,
  Globe,
  Award,
} from "lucide-react";
import { Button, Card } from "@/components/ui/base";
import { User } from "@/types/team";
import { cn } from "@/lib/utils";

export function UserDetailDialog({
  user,
  onClose,
  onEdit,
}: {
  user: User;
  onClose: () => void;
  onEdit: () => void;
}) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header Section */}
        <div className="p-8 pb-0 flex justify-between items-start">
          <div className="flex gap-6 items-center">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-1">
                {user.name}
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-sm text-primary font-semibold flex items-center gap-1">
                  <Briefcase className="w-3 h-3" /> {user.role}
                </span>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" /> {user.learningPace}{" "}
                  Learner
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto no-scrollbar grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Metrics Section */}
          <div className="lg:col-span-1 space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground mb-4">
              Performance Metrics
            </h3>
            <div className="space-y-4">
              <MetricBar
                label="Productivity"
                value={user.productivity}
                icon={Zap}
                color="bg-blue-500"
              />
              <MetricBar
                label="Morale"
                value={user.morale}
                icon={Heart}
                color="bg-rose-500"
              />
              <MetricBar
                label="Satisfaction"
                value={user.satisfaction}
                icon={Star}
                color="bg-amber-500"
              />
              <MetricBar
                label="Direct Performance"
                value={user.performance}
                icon={Target}
                color="bg-emerald-500"
              />
            </div>

            <Card className="p-6 bg-accent/30 border-none space-y-3 mt-8">
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" /> Primary Goal
              </h4>
              <p className="text-sm text-foreground/80 leading-relaxed italic">
                "{user.goal}"
              </p>
            </Card>
          </div>

          {/* Skills & Background Section */}
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h3 className="font-bold flex items-center gap-2 mb-6 text-xl">
                <GraduationCap className="w-6 h-6 text-primary" /> Expertise &
                Skills
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3 tracking-widest">
                    Primary Stack
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.primarySkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold border border-primary/20"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-3 tracking-widest">
                    Secondary Stack
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.secondarySkills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-secondary text-foreground rounded-lg text-xs font-semibold border border-border"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-bold flex items-center gap-2 mb-4 text-xl">
                <PieChart className="w-6 h-6 text-blue-500" /> Experience
                Description
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {user.description ||
                  "Detailed experience profile pending update from resource manager."}
              </p>
            </section>

            <section>
              <h3 className="font-bold flex items-center gap-2 mb-4 text-lg">
                <Globe className="w-5 h-5 text-emerald-500" /> Additional
                Capabilities
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.additionalSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-accent rounded text-[10px] font-medium text-muted-foreground uppercase tracking-tight"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="p-8 border-t border-border flex justify-end gap-3 bg-secondary/20">
          <Button variant="outline" onClick={onClose}>
            Close Profile
          </Button>
          <Button onClick={onEdit}>Edit User Details</Button>
        </div>
      </motion.div>
    </div>
  );
}

function MetricBar({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Icon className="w-3.5 h-3.5" /> {label}
        </span>
        <span className="font-bold">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={cn("h-full", color)}
        />
      </div>
    </div>
  );
}
