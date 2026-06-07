import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, TrendingUp, BookOpen, Users } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { loadCompounds, loadAtoms } from "@/lib/dataLoader";
import { deviceHistoryManager } from "@/lib/deviceHistory";
import { studyGroupsManager } from "@/lib/studyGroups";

export default function Home() {
  const { user, loading, error, isAuthenticated, logout } = useAuth();

  const [, navigate] = useLocation();
  const [recentReactions, setRecentReactions] = useState<any[]>([]);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [topCompounds, setTopCompounds] = useState<any[]>([]);
  const [reactant1, setReactant1] = useState("");
  const [reactant2, setReactant2] = useState("");

  useEffect(() => {
    const reactions = deviceHistoryManager.getRecentReactions(5);
    setRecentReactions(reactions);

    const groups = studyGroupsManager.getUserGroups();
    setUserGroups(groups);

    loadCompounds().then((compounds) => {
      const sorted = [...compounds].sort((a, b) => b.stability - a.stability);
      setTopCompounds(sorted.slice(0, 4));
    });
  }, []);

  const handleQuickReaction = () => {
    if (reactant1 && reactant2) {
      navigate("/reaction-lab");
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-accent/20">
        <h1 className="text-3xl font-bold mb-2">Welcome to Digital Chemistry Lab</h1>
        <p className="text-muted-foreground">
          Explore reactions, study compounds, and collaborate with peers in a modern chemistry platform.
        </p>
      </div>

      {/* Quick Reaction Input */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Reaction Predictor</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Reactant 1 (e.g., Na)"
              value={reactant1}
              onChange={(e) => setReactant1(e.target.value)}
            />
            <Input
              placeholder="Reactant 2 (e.g., Cl)"
              value={reactant2}
              onChange={(e) => setReactant2(e.target.value)}
            />
          </div>
          <Button onClick={handleQuickReaction} className="w-full" disabled={!reactant1 || !reactant2}>
            <Zap className="w-4 h-4 mr-2" />
            Predict Reaction
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Reactions */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Recent Reactions
          </h2>
          {recentReactions.length > 0 ? (
            <div className="space-y-2">
              {recentReactions.map((reaction, idx) => (
                <div key={idx} className="p-2 bg-muted rounded text-sm">
                  <p className="font-mono">{reaction.data.reactants.join(" + ")} → {reaction.data.products.join(" + ")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(reaction.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No reactions yet. Start exploring!</p>
          )}
        </Card>

        {/* Top Compounds */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Most Stable Compounds
          </h2>
          <div className="space-y-2">
            {topCompounds.map((compound) => (
              <div key={compound.id} className="p-2 bg-muted rounded">
                <p className="font-mono text-sm">{compound.formula}</p>
                <p className="text-xs text-muted-foreground">{compound.name}</p>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs">Stability: {compound.stability}%</span>
                  <span className="text-xs bg-accent/20 px-2 py-1 rounded">{compound.bondType}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Study Zone */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Study Zone
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Access study materials, quizzes, and learning resources.
          </p>
          <Button variant="outline" className="w-full" onClick={() => navigate("/study-zone")}>
            Open Study Zone
          </Button>
        </Card>

        {/* Study Groups */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Study Groups
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {userGroups.length > 0
              ? `You are in ${userGroups.length} group${userGroups.length > 1 ? "s" : ""}`
              : "Create or join a study group to collaborate"}
          </p>
          <Button variant="outline" className="w-full" onClick={() => navigate("/study-groups")}>
            Manage Groups
          </Button>
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Reaction Lab", path: "/reaction-lab" },
            { label: "Compound Explorer", path: "/compound-explorer" },
            { label: "Periodic Table", path: "/periodic-table" },
            { label: "Device History", path: "/device-history" },
          ].map((link) => (
            <Button
              key={link.path}
              variant="outline"
              className="w-full"
              onClick={() => navigate(link.path)}
            >
              {link.label}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
