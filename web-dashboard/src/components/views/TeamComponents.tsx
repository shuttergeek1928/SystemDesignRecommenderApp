"use client";

import { motion } from "framer-motion";
import {
  Users,
  User as UserIcon,
  BarChart3,
  Heart,
  Star,
  Target,
  ShieldCheck,
  MoreHorizontal,
  Settings2,
  Trash2,
} from "lucide-react";
import { Card, Button } from "@/components/ui/base";
import { User, Team } from "@/types/team";
import { cn } from "@/lib/utils";

// --- User Card ---
export function UserCard({
  user,
  onEdit,
  onDelete,
}: {
  user: User;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <Card className="p-6 hover:border-primary/50 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 bg-accent rounded-lg hover:text-primary transition-colors"
        >
          <Settings2 className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 bg-accent rounded-lg hover:text-rose-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <UserIcon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-bold text-lg leading-tight">{user.name}</h4>
          <p className="text-xs text-muted-foreground">{user.role}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
        {user.description || "No description provided."}
      </p>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span>Primary Skills</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.primarySkills.map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-bold"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
        <MetricSmall
          icon={BarChart3}
          label="Prod."
          value={user.productivity}
          color="text-blue-500"
        />
        <MetricSmall
          icon={Heart}
          label="Morale"
          value={user.morale}
          color="text-rose-500"
        />
      </div>
    </Card>
  );
}

// --- Team Card ---
export function TeamCard({
  team,
  members,
  manager,
  onEdit,
  onDelete,
  onViewMembers,
}: {
  team: Team;
  members: User[];
  manager?: User;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewMembers?: () => void;
}) {
  return (
    <Card className="p-8 hover:border-primary/50 transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold">{team.name}</h3>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                  team.status === "Active"
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-500 border-amber-500/20",
                )}
              >
                {team.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Manager:{" "}
              <span className="text-foreground font-semibold">
                {manager?.name || "N/A"}
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Settings2 className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
        {team.description}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Metric
          icon={BarChart3}
          label="Productivity"
          value={team.productivity}
          color="bg-blue-500"
        />
        <Metric
          icon={Heart}
          label="Morale"
          value={team.morale}
          color="bg-rose-500"
        />
        <Metric
          icon={Star}
          label="Satisfaction"
          value={team.satisfaction}
          color="bg-amber-500"
        />
        <Metric
          icon={Target}
          label="Performance"
          value={team.performance}
          color="bg-emerald-500"
        />
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-border">
        <div className="flex -space-x-2">
          {members.slice(0, 5).map((m, i) => (
            <div
              key={m.id}
              className="w-8 h-8 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] font-bold text-primary ring-2 ring-transparent group-hover:ring-primary/20 transition-all"
            >
              {m.name.charAt(0)}
            </div>
          ))}
          {members.length > 5 && (
            <div className="w-8 h-8 rounded-full border-2 border-background bg-accent flex items-center justify-center text-[10px] font-bold">
              +{members.length - 5}
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary font-bold"
          onClick={onViewMembers}
        >
          Manage Team <ArrowRightLeft className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}

// --- Internal Helper Components ---

function Metric({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className="flex items-end gap-1.5">
        <span className="text-lg font-bold">{value}%</span>
      </div>
      <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          className={cn("h-full", color)}
        />
      </div>
    </div>
  );
}

function MetricSmall({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className={cn("w-3 h-3", color)} />
      <div className="flex-1">
        <div className="flex justify-between text-[8px] font-bold text-muted-foreground uppercase mb-0.5">
          <span>{label}</span>
          <span className="text-foreground">{value}%</span>
        </div>
        <div className="h-1 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn("h-full", color.replace("text-", "bg-"))}
            style={{ width: `${value}%` }}
          />
        </div>
      </div>
    </div>
  );
}

import { ArrowRightLeft } from "lucide-react";
