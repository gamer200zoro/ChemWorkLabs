import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { deviceHistoryManager } from "@/lib/deviceHistory";

export default function DeviceHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    const hist = deviceHistoryManager.getHistory();
    setHistory(hist);
    setDeviceInfo(deviceHistoryManager.getDeviceInfo());
  }, []);

  const handleExport = () => {
    const data = deviceHistoryManager.exportHistory();
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(data));
    element.setAttribute("download", `chemistry-lab-history-${Date.now()}.json`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const success = deviceHistoryManager.importHistory(event.target.result);
        if (success) {
          setHistory(deviceHistoryManager.getHistory());
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">📱 Device History</h1>
        <p className="text-muted-foreground">View and manage your device-specific history</p>
      </div>

      {/* Device Info */}
      {deviceInfo && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">This Device</h2>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-semibold">Name:</span> {deviceInfo.name}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Device ID:</span> <code className="bg-muted px-2 py-1 rounded text-xs">{deviceInfo.id}</code>
            </p>
            <p className="text-sm">
              <span className="font-semibold">Created:</span> {new Date(deviceInfo.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Last Used:</span> {new Date(deviceInfo.lastUsed).toLocaleString()}
            </p>
          </div>
        </Card>
      )}

      {/* Export/Import */}
      <div className="grid grid-cols-2 gap-4">
        <Button onClick={handleExport} className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Export History
        </Button>
        <Button onClick={handleImport} variant="outline" className="w-full">
          <Upload className="w-4 h-4 mr-2" />
          Import History
        </Button>
      </div>

      {/* History List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        {history.length > 0 ? (
          <div className="space-y-2">
            {history.slice(0, 20).map((entry, idx) => (
              <Card key={idx} className="p-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold capitalize">{entry.type}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {entry.type === "reaction" && (
                    <p className="text-xs font-mono bg-muted px-2 py-1 rounded">
                      {entry.data.reactants.join(" + ")} → {entry.data.products.join(" + ")}
                    </p>
                  )}
                  {entry.type === "search" && (
                    <p className="text-xs bg-muted px-2 py-1 rounded">{entry.data.query}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No history yet. Start exploring!</p>
          </Card>
        )}
      </div>
    </div>
  );
}
