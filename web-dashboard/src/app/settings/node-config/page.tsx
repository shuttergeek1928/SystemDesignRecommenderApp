"use client";

import React, { useEffect, useState } from "react";
import { useSystemDesignStore } from "@/store/useSystemDesignStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useTeamStore } from "@/store/useTeamStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Button,
  Textarea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Label,
  Badge,
} from "@/components/ui/base";
import {
  Settings,
  Plus,
  Trash2,
  Save,
  Info,
  Users,
  User,
  ShieldCheck,
} from "lucide-react";

export default function NodeConfigPage() {
  const {
    nodeDefinitions,
    nodeSettings,
    fetchNodeDefinitions,
    saveNodeDefinition,
    deleteNodeDefinition,
    fetchNodeSettings,
    saveNodeSettings,
  } = useSystemDesignStore();

  const { user } = useAuthStore();
  const { teams } = useTeamStore();

  const [newDefKey, setNewDefKey] = useState("");
  const [newDefName, setNewDefName] = useState("");
  const [activeTab, setActiveTab] = useState("personal");
  const [localSettings, setLocalSettings] = useState<any[]>([]);

  const userTeam = teams.find((t) => t.id === user?.teamId);
  const isOwner = userTeam?.managerId === user?.id;

  useEffect(() => {
    fetchNodeDefinitions();
  }, []);

  useEffect(() => {
    if (activeTab === "personal") {
      fetchNodeSettings(user?.teamId, user?.id);
    } else {
      fetchNodeSettings(user?.teamId);
    }
  }, [activeTab, user]);

  useEffect(() => {
    setLocalSettings(nodeSettings);
  }, [nodeSettings]);

  const handleAddDefinition = async () => {
    if (!newDefKey || !newDefName) return;
    await saveNodeDefinition({ key: newDefKey, displayName: newDefName });
    setNewDefKey("");
    setNewDefName("");
  };

  const handleUpdateLocalSetting = (
    nodeKey: string,
    field: "choice" | "justification",
    value: string,
  ) => {
    setLocalSettings((prev) =>
      prev.map((s) => (s.nodeKey === nodeKey ? { ...s, [field]: value } : s)),
    );
  };

  const handleSaveSettings = async () => {
    if (activeTab === "personal") {
      await saveNodeSettings(localSettings, user?.teamId, user?.id);
    } else {
      await saveNodeSettings(localSettings, user?.teamId);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Node Configuration
          </h1>
          <p className="text-muted-foreground mt-2">
            Customize the architecture nodes and constraints for your designs.
          </p>
        </div>
        <Settings className="w-12 h-12 text-blue-500/20" />
      </div>

      <Tabs
        defaultValue="personal"
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-900/50 backdrop-blur-xl border border-white/10">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="w-4 h-4" /> Personal Overrides
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="w-4 h-4" /> Team Defaults
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card className="bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-400" />
                Your Architecture Overrides
              </CardTitle>
              <CardDescription>
                Override the default technology choices for your specific design
                runs.
                <span className="text-blue-400 block mt-1">
                  Note: Justification is always inherited from team defaults.
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {localSettings.length === 0 && (
                <div className="text-center py-10 text-muted-foreground">
                  No nodes defined yet. Ask the team owner to add some!
                </div>
              )}
              {localSettings.map((setting) => (
                <div
                  key={setting.nodeKey}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-blue-300 font-semibold">
                        {setting.nodeKey.toUpperCase()}
                      </Label>
                      {setting.isOverride && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                        >
                          Overridden
                        </Badge>
                      )}
                    </div>
                    <Input
                      placeholder="e.g. PostgreSQL, Redis, Kafka"
                      value={setting.choice}
                      onChange={(e) =>
                        handleUpdateLocalSetting(
                          setting.nodeKey,
                          "choice",
                          e.target.value,
                        )
                      }
                      className="bg-slate-950/50 border-white/10 focus:border-blue-500/50"
                    />
                  </div>
                  <div className="space-y-2 opacity-60">
                    <Label className="text-slate-400 italic">
                      Justification (Inherited from Team)
                    </Label>
                    <Textarea
                      disabled
                      value={setting.justification}
                      className="bg-slate-950/20 border-white/5 resize-none h-20"
                    />
                  </div>
                </div>
              ))}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSaveSettings}
                  className="bg-blue-600 hover:bg-blue-500 text-white gap-2 px-8"
                >
                  <Save className="w-4 h-4" /> Save Overrides
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6">
          <Card className="bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-400">
                <Users className="w-5 h-5" />
                Team Architectural Standards
              </CardTitle>
              <CardDescription>
                Define the default technology stack and justifications for the
                entire team.
                {!isOwner && (
                  <span className="text-red-400 block mt-1">
                    Read-only: You must be the team owner to edit these.
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {localSettings.map((setting) => (
                <div
                  key={setting.nodeKey}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/5 transition-all"
                >
                  <div className="space-y-2">
                    <Label className="text-purple-300 font-semibold">
                      {setting.nodeKey.toUpperCase()}
                    </Label>
                    <Input
                      disabled={!isOwner}
                      placeholder="Choice (e.g. AWS S3)"
                      value={setting.choice}
                      onChange={(e) =>
                        handleUpdateLocalSetting(
                          setting.nodeKey,
                          "choice",
                          e.target.value,
                        )
                      }
                      className="bg-slate-950/50 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-purple-300 font-semibold">
                      Justification
                    </Label>
                    <Textarea
                      disabled={!isOwner}
                      placeholder="Why this choice?"
                      value={setting.justification}
                      onChange={(e) =>
                        handleUpdateLocalSetting(
                          setting.nodeKey,
                          "justification",
                          e.target.value,
                        )
                      }
                      className="bg-slate-950/50 border-white/10 resize-none h-20"
                    />
                  </div>
                </div>
              ))}

              {isOwner && (
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSaveSettings}
                    className="bg-purple-600 hover:bg-purple-500 text-white gap-2 px-8"
                  >
                    <Save className="w-4 h-4" /> Save Team Defaults
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {isOwner && (
            <Card className="bg-slate-900/40 backdrop-blur-md border-white/5 shadow-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-400">
                  <Plus className="w-5 h-5" />
                  Manage Node Definitions
                </CardTitle>
                <CardDescription>
                  Add or remove architecture-level nodes that the LLM should
                  generate for your team.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="space-y-2">
                    <Label>Node Key (unique)</Label>
                    <Input
                      placeholder="e.g. database"
                      value={newDefKey}
                      onChange={(e) => setNewDefKey(e.target.value)}
                      className="bg-slate-950/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input
                      placeholder="e.g. Primary Database"
                      value={newDefName}
                      onChange={(e) => setNewDefName(e.target.value)}
                      className="bg-slate-950/50"
                    />
                  </div>
                  <Button
                    onClick={handleAddDefinition}
                    className="bg-orange-600 hover:bg-orange-500 text-white gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add Node
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-400">Active Nodes</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {nodeDefinitions.map((def) => (
                      <div
                        key={def.key}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 group"
                      >
                        <span className="font-medium">{def.displayName}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteNodeDefinition(def.key)}
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex gap-4">
        <Info className="w-6 h-6 text-blue-400 shrink-0" />
        <div className="text-sm text-blue-200/80">
          <p className="font-semibold text-blue-300 mb-1">How it works:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <strong>Team Defaults</strong> set the baseline for everyone in
              your team.
            </li>
            <li>
              <strong>Personal Overrides</strong> let you specify a specific
              technology for a node.
            </li>
            <li>
              The LLM will prioritize your overrides but keep the team's
              justification unless specified otherwise.
            </li>
            <li>
              Adding more nodes will automatically adjust the AI's output
              structure.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
