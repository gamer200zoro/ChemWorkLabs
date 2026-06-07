import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { studyGroupsManager } from "@/lib/studyGroups";
import { deviceHistoryManager } from "@/lib/deviceHistory";

export default function Settings() {
  const [userName, setUserName] = useState(
    localStorage.getItem("dcl_user_name") || "Anonymous"
  );
  const [autoSave, setAutoSave] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleSaveUserName = () => {
    studyGroupsManager.setUserName(userName);
    localStorage.setItem("dcl_user_name", userName);
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear all history?")) {
      deviceHistoryManager.clearHistory();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">⚙️ Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and account</p>
      </div>

      {/* Profile Settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Display Name</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your name"
              />
              <Button onClick={handleSaveUserName}>Save</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="autosave">Auto-save reactions</Label>
            <Switch
              id="autosave"
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Enable notifications</Label>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Data Management</h2>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            All your data is stored locally on this device. You can export or clear it anytime.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              Export All Data
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearHistory}
              className="flex-1"
            >
              Clear History
            </Button>
          </div>
        </div>
      </Card>

      {/* About Device */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">About This Device</h2>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-semibold">Device ID:</span>{" "}
            <code className="bg-muted px-2 py-1 rounded text-xs">
              {deviceHistoryManager.getDeviceId()}
            </code>
          </p>
          <p>
            <span className="font-semibold">App Version:</span> 1.0.0
          </p>
          <p>
            <span className="font-semibold">Storage:</span> Local (Browser Storage)
          </p>
        </div>
      </Card>
    </div>
  );
}
