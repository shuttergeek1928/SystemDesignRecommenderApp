"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Save, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button, Input, Card, Label } from "@/components/ui/base";
import { teamSchema, userSchema, Team, User } from "@/types/team";
import { useTeamStore } from "@/store/useTeamStore";
import { useState } from "react";

// --- Team Form ---
export function TeamForm({ initialData, onClose }: { initialData?: Team; onClose: () => void }) {
    const { addTeam, updateTeam, users } = useTeamStore();
    const { register, handleSubmit, formState: { errors } } = useForm<Team>({
        resolver: zodResolver(teamSchema),
        defaultValues: initialData || {
            id: Math.random().toString(36).substr(2, 9),
            status: "Active",
            productivity: 80,
            morale: 80,
            satisfaction: 80,
            performance: 80,
        }
    });

    const onSubmit = (data: Team) => {
        if (initialData) updateTeam(initialData.id, data);
        else addTeam(data);
        onClose();
    };

    return (
        <FormContainer title={initialData ? "Edit Team" : "Create New Team"} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Team Name</Label>
                        <Input {...register("name")} placeholder="e.g. Platform Engineering" />
                        {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <textarea
                            {...register("description")}
                            className="w-full bg-background border border-border rounded-xl p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                            placeholder="What does this team do?"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Team Manager</Label>
                            <select {...register("managerId")} className="w-full bg-background border border-border rounded-xl p-3 text-sm outline-none">
                                <option value="">Select Manager</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Success Metrics (Initial)</Label>
                            <Input type="number" {...register("performance", { valueAsNumber: true })} placeholder="Initial Performance %" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Product Focus</Label>
                        <Input {...register("product")} placeholder="e.g. Internal Microservices" />
                    </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-border">
                    <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="flex-1 gap-2"><Save className="w-4 h-4" /> {initialData ? "Save Changes" : "Create Team"}</Button>
                </div>
            </form>
        </FormContainer>
    );
}

// --- User Form ---
export function UserForm({ initialData, onClose }: { initialData?: User; onClose: () => void }) {
    const { addUser, updateUser } = useTeamStore();
    const [primarySkills, setPrimarySkills] = useState<string[]>(initialData?.primarySkills || []);

    const { register, handleSubmit, formState: { errors } } = useForm<User>({
        resolver: zodResolver(userSchema),
        defaultValues: initialData || {
            id: Math.random().toString(36).substr(2, 9),
            teamIds: [],
            primarySkills: [],
            secondarySkills: [],
            additionalSkills: [],
            productivity: 85,
            morale: 90,
            satisfaction: 90,
            performance: 90,
            learningPace: "Moderate",
        }
    });

    const onSubmit = (data: User) => {
        const finalData = { ...data, primarySkills };
        if (initialData) updateUser(initialData.id, finalData);
        else addUser(finalData);
        onClose();
    };

    return (
        <FormContainer title={initialData ? "Edit User Profile" : "Invite New User"} onClose={onClose}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Full Name</Label>
                            <Input {...register("name")} placeholder="John Doe" />
                            {errors.name && <p className="text-xs text-rose-500">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Professional Role</Label>
                            <Input {...register("role")} placeholder="Senior Frontend Dev" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Detailed Bio</Label>
                        <textarea
                            {...register("description")}
                            className="w-full bg-background border border-border rounded-xl p-3 text-sm min-h-[80px] focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                            placeholder="Briefly describe the expertise..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Primary Skills (Comma separated)</Label>
                        <Input
                            placeholder="React, Next.js, TypeScript"
                            onChange={(e) => setPrimarySkills(e.target.value.split(",").map(s => s.trim()))}
                            defaultValue={primarySkills.join(", ")}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Learning Pace</Label>
                            <select {...register("learningPace")} className="w-full bg-background border border-border rounded-xl p-3 text-sm outline-none">
                                <option value="Fast">Fast</option>
                                <option value="Moderate">Moderate</option>
                                <option value="Slow">Slow</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Career Goal</Label>
                            <Input {...register("goal")} placeholder="e.g. Cloud Certification" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-accent/30 rounded-2xl">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Productivity</Label>
                            <Input type="number" {...register("productivity", { valueAsNumber: true })} className="h-9 text-xs" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Morale</Label>
                            <Input type="number" {...register("morale", { valueAsNumber: true })} className="h-9 text-xs" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Satisfaction</Label>
                            <Input type="number" {...register("satisfaction", { valueAsNumber: true })} className="h-9 text-xs" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">Performance</Label>
                            <Input type="number" {...register("performance", { valueAsNumber: true })} className="h-9 text-xs" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-6 border-t border-border">
                    <Button type="button" variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
                    <Button type="submit" className="flex-1 gap-2"><Save className="w-4 h-4" /> {initialData ? "Update Profile" : "Add User"}</Button>
                </div>
            </form>
        </FormContainer>
    );
}

// --- Helper Layout ---
function FormContainer({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/90 backdrop-blur-md"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-xl bg-card border border-border rounded-[2rem] shadow-2xl p-8"
            >
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-full"><X className="w-5 h-5" /></button>
                </div>
                {children}
            </motion.div>
        </div>
    );
}
