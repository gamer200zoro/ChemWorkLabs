import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Zap, Plus } from "lucide-react";
import { loadAtoms, loadCompounds } from "@/lib/dataLoader";
import { ReactionEngine } from "@/lib/reactionEngine";
import { deviceHistoryManager } from "@/lib/deviceHistory";

export default function ReactionLab() {
  const [reactant1, setReactant1] = useState("");
  const [reactant2, setReactant2] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!reactant1 || !reactant2) return;
    setLoading(true);
    const atoms = await loadAtoms();
    const compounds = await loadCompounds();
    const engine = new ReactionEngine(atoms, compounds);
    const prediction = engine.predictReaction(reactant1, reactant2);
    setResult(prediction);
    deviceHistoryManager.addReactionHistory(
      [reactant1, reactant2],
      prediction.primary.products,
      prediction.primary.reactionType,
      prediction.primary.stability
    );
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">⚗️ Reaction Lab</h1>
        <p className="text-muted-foreground">Predict chemical reactions and explore reaction pathways</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Reactant 1</label>
              <Input
                placeholder="e.g., Na or sodium"
                value={reactant1}
                onChange={(e) => setReactant1(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Reactant 2</label>
              <Input
                placeholder="e.g., Cl or chlorine"
                value={reactant2}
                onChange={(e) => setReactant2(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handlePredict} disabled={loading} className="w-full">
            <Zap className="w-4 h-4 mr-2" />
            {loading ? "Predicting..." : "Predict Reaction"}
          </Button>
        </div>
      </Card>

      {result && (
        <div className="space-y-4">
          <Card className="p-6 border-accent/30 bg-accent/5">
            <h2 className="text-xl font-bold mb-4">Primary Product</h2>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Reaction Type: {result.primary.reactionType}</p>
              <p className="text-2xl font-mono font-bold text-primary">
                {result.primary.products.join(" + ")}
              </p>
              <div className="flex gap-4 mt-4">
                <div>
                  <p className="text-xs text-muted-foreground">Stability</p>
                  <p className="text-lg font-bold">{result.primary.stability}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-lg font-bold">{result.primary.confidence}%</p>
                </div>
              </div>
            </div>
          </Card>

          {result.alternatives.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Alternative Products</h3>
              <div className="space-y-2">
                {result.alternatives.map((alt: any, idx: number) => (
                  <Card key={idx} className="p-4">
                    <p className="font-mono text-sm">{alt.products.join(" + ")}</p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span>Stability: {alt.stability}%</span>
                      <span>Confidence: {alt.confidence}%</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
