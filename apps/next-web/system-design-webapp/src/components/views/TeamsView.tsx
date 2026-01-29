"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users,
    UserPlus,
    Plus,
    UsersRound,
    Search,
    Filter,
    LayoutGrid,
    List as ListIcon
} from "lucide-react";
import { Button, Card, Input } from "@/components/ui/base";
import { useTeamStore } from "@/store/useTeamStore";
import { TeamCard, UserCard } from "./TeamComponents";
import { UserDetailDialog } from "./UserDetailDialog";
import { TeamForm, UserForm } from "./ManagementForms";
import { Team, User } from "@/types/team";
import { cn } from "@/lib/utils";

export function TeamsView() {
    const { teams, users, deleteTeam, deleteUser, assignUserToTeam, unassignUserFromTeam } = useTeamStore();
    const [activeTab, setActiveTab] = useState<"teams" | "users">("teams");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Modal & Dialog States
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isManagingTeam, setIsManagingTeam] = useState<string | null>(null);
    const [editingTeam, setEditingTeam] = useState<Team | null>(null);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showTeamCreate, setShowTeamCreate] = useState(false);
    const [showUserInvite, setShowUserInvite] = useState(false);

    const filteredTeams = teams.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="space-y-8">
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex bg-secondary p-1 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab("teams")}
                        className={cn(
                            "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                            activeTab === "teams" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <UsersRound className="w-4 h-4" /> Teams
                    </button>
                    <button
                        onClick={() => setActiveTab("users")}
                        className={cn(
                            "px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                            activeTab === "users" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <UserPlus className="w-4 h-4" /> Users
                    </button>
                </div>

                <div className="flex flex-1 max-w-md gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder={activeTab === "teams" ? "Search teams..." : "Search users..."}
                            className="pl-11 h-11"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" className="w-11 h-11 p-0 shrink-0">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>

                <Button
                    className="gap-2 shrink-0"
                    onClick={() => activeTab === "teams" ? setShowTeamCreate(true) : setShowUserInvite(true)}
                >
                    <Plus className="w-4 h-4" /> {activeTab === "teams" ? "Create Team" : "Invite User"}
                </Button>
            </div>

            {/* Grid/List Toggle */}
            <div className="flex justify-end gap-2">
                <button
                    onClick={() => setViewMode("grid")}
                    className={cn("p-2 rounded-lg transition-colors", viewMode === "grid" ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-accent")}
                >
                    <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setViewMode("list")}
                    className={cn("p-2 rounded-lg transition-colors", viewMode === "list" ? "text-primary bg-primary/10" : "text-muted-foreground hover:bg-accent")}
                >
                    <ListIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === "teams" ? (
                        <div className={cn(
                            "grid gap-6",
                            viewMode === "grid" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
                        )}>
                            {filteredTeams.map(team => {
                                const members = users.filter(u => u.teamIds.includes(team.id));
                                const manager = users.find(u => u.id === team.managerId);
                                return (
                                    <TeamCard
                                        key={team.id}
                                        team={team}
                                        members={members}
                                        manager={manager}
                                        onDelete={() => deleteTeam(team.id)}
                                        onEdit={() => setEditingTeam(team)}
                                        onViewMembers={() => setIsManagingTeam(team.id)}
                                    />
                                );
                            })}
                            {filteredTeams.length === 0 && <EmptyState label="No teams found" />}
                        </div>
                    ) : (
                        <div className={cn(
                            "grid gap-6",
                            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
                        )}>
                            {filteredUsers.map(user => (
                                <UserCard
                                    key={user.id}
                                    user={user}
                                    onDelete={() => deleteUser(user.id)}
                                    onEdit={() => setSelectedUser(user)}
                                />
                            ))}
                            {filteredUsers.length === 0 && <EmptyState label="No users found" />}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Modals & Dialogs */}
            <AnimatePresence>
                {selectedUser && (
                    <UserDetailDialog
                        user={selectedUser}
                        onClose={() => setSelectedUser(null)}
                    />
                )}
                {isManagingTeam && (
                    <TeamManagerModal
                        teamId={isManagingTeam}
                        onClose={() => setIsManagingTeam(null)}
                    />
                )}

                {(showTeamCreate || editingTeam) && (
                    <TeamForm
                        initialData={editingTeam || undefined}
                        onClose={() => { setShowTeamCreate(false); setEditingTeam(null); }}
                    />
                )}

                {(showUserInvite || editingUser) && (
                    <UserForm
                        initialData={editingUser || undefined}
                        onClose={() => { setShowUserInvite(false); setEditingUser(null); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function TeamManagerModal({ teamId, onClose }: { teamId: string; onClose: () => void }) {
    const { teams, users, assignUserToTeam, unassignUserFromTeam } = useTeamStore();
    const team = teams.find(t => t.id === teamId)!;
    const teamMembers = users.filter(u => u.teamIds.includes(teamId));
    const availableUsers = users.filter(u => !u.teamIds.includes(teamId));

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
                className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
            >
                <div className="p-6 border-b border-border flex justify-between items-center bg-accent/50">
                    <div>
                        <h3 className="text-xl font-bold">Manage Members: {team.name}</h3>
                        <p className="text-xs text-muted-foreground">{teamMembers.length} active members</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto no-scrollbar space-y-8">
                    <section className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary">Active Members</h4>
                        <div className="space-y-2">
                            {teamMembers.map(member => (
                                <div key={member.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl border border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{member.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{member.role}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                                        onClick={() => unassignUserFromTeam(member.id, teamId)}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Available Resources</h4>
                        <div className="space-y-2">
                            {availableUsers.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-card rounded-xl border border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-muted-foreground text-xs font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{user.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{user.role}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        className="h-8 text-xs"
                                        onClick={() => {
                                            const res = assignUserToTeam(user.id, teamId);
                                            if (!res.success) alert(res.message);
                                        }}
                                    >
                                        Assign
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </motion.div>
        </div>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="col-span-full py-32 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-muted-foreground opacity-30">
                <Users className="w-10 h-10" />
            </div>
            <div>
                <h3 className="text-xl font-bold">{label}</h3>
                <p className="text-muted-foreground text-sm">Try adjusting your search or filters.</p>
            </div>
            <Button variant="outline">Clear Search</Button>
        </div>
    );
}

import { X } from "lucide-react";
