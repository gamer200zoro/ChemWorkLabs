import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { loadCompounds, Compound } from "@/lib/dataLoader";

export default function CompoundExplorer() {
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [filtered, setFiltered] = useState<Compound[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompounds().then((data) => {
      setCompounds(data);
      setFiltered(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const lowerSearch = search.toLowerCase();
    const results = compounds.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerSearch) ||
        c.formula.toLowerCase().includes(lowerSearch) ||
        c.commonNames.some((cn) => cn.toLowerCase().includes(lowerSearch))
    );
    setFiltered(results);
  }, [search, compounds]);

  if (loading) return <div className="text-center py-8">Loading compounds...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">🔬 Compound Explorer</h1>
        <p className="text-muted-foreground">Search and explore chemical compounds</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, formula, or element..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((compound) => (
          <Card key={compound.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <div>
                <h3 className="font-bold text-lg">{compound.name}</h3>
                <p className="font-mono text-sm text-primary">{compound.formula}</p>
              </div>
              <p className="text-xs text-muted-foreground">{compound.description}</p>
              <div className="flex gap-2 flex-wrap pt-2">
                <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                  Stability: {compound.stability}%
                </span>
                <span className="text-xs bg-secondary/20 px-2 py-1 rounded">
                  {compound.bondType}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No compounds found</p>
        </Card>
      )}
    </div>
  );
}
