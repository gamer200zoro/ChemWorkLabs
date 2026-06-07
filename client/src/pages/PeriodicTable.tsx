import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { loadAtoms, Atom } from "@/lib/dataLoader";

export default function PeriodicTable() {
  const [atoms, setAtoms] = useState<Atom[]>([]);
  const [selected, setSelected] = useState<Atom | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAtoms().then((data) => {
      setAtoms(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-8">Loading periodic table...</div>;

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      metal: "bg-blue-100 dark:bg-blue-900",
      nonmetal: "bg-green-100 dark:bg-green-900",
      halogen: "bg-yellow-100 dark:bg-yellow-900",
      noble_gas: "bg-purple-100 dark:bg-purple-900",
      transition_metal: "bg-orange-100 dark:bg-orange-900",
    };
    return colors[category] || "bg-gray-100 dark:bg-gray-900";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">📊 Periodic Table</h1>
        <p className="text-muted-foreground">Interactive periodic table of elements</p>
      </div>

      <div className="grid grid-cols-8 gap-2 mb-8">
        {atoms.map((atom) => (
          <button
            key={atom.id}
            onClick={() => setSelected(atom)}
            className={`p-2 rounded text-center cursor-pointer transition-all hover:shadow-md ${getCategoryColor(
              atom.category
            )}`}
          >
            <div className="text-xs font-bold">{atom.atomicNumber}</div>
            <div className="text-sm font-bold">{atom.symbol}</div>
            <div className="text-xs">{atom.atomicMass.toFixed(2)}</div>
          </button>
        ))}
      </div>

      {selected && (
        <Card className="p-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{selected.name}</h2>
              <p className="text-muted-foreground">{selected.description}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Atomic Number</p>
                <p className="text-lg font-bold">{selected.atomicNumber}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Atomic Mass</p>
                <p className="text-lg font-bold">{selected.atomicMass.toFixed(3)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Electronegativity</p>
                <p className="text-lg font-bold">{selected.electronegativity}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Valency</p>
                <p className="text-lg font-bold">{selected.valency.join(", ")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Group</p>
                <p className="text-lg font-bold">{selected.group}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Period</p>
                <p className="text-lg font-bold">{selected.period}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Category</p>
                <p className="text-lg font-bold capitalize">{selected.category.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Radius</p>
                <p className="text-lg font-bold">{selected.radius} pm</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Electron Configuration</p>
              <p className="font-mono text-sm bg-muted p-2 rounded">{selected.electronConfiguration}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
