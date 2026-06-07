// Device history management for tracking reactions and searches

export interface HistoryEntry {
  id: string;
  timestamp: number;
  type: "reaction" | "search" | "view" | "save";
  data: any;
  deviceId: string;
  isSaved: boolean;
}

export interface DeviceInfo {
  id: string;
  name: string;
  createdAt: number;
  lastUsed: number;
  userAgent: string;
}

const STORAGE_KEY = "dcl_device_history";
const DEVICE_KEY = "dcl_device_info";

export class DeviceHistoryManager {
  private deviceId: string;
  private deviceInfo: DeviceInfo;

  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
    this.deviceInfo = this.getOrCreateDeviceInfo();
  }

  private getOrCreateDeviceId(): string {
    let deviceId = localStorage.getItem("dcl_device_id");
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("dcl_device_id", deviceId);
    }
    return deviceId;
  }

  private getOrCreateDeviceInfo(): DeviceInfo {
    let info = localStorage.getItem(DEVICE_KEY);
    if (info) {
      const parsed = JSON.parse(info);
      parsed.lastUsed = Date.now();
      localStorage.setItem(DEVICE_KEY, JSON.stringify(parsed));
      return parsed;
    }

    const newInfo: DeviceInfo = {
      id: this.deviceId,
      name: this.generateDeviceName(),
      createdAt: Date.now(),
      lastUsed: Date.now(),
      userAgent: navigator.userAgent,
    };

    localStorage.setItem(DEVICE_KEY, JSON.stringify(newInfo));
    return newInfo;
  }

  private generateDeviceName(): string {
    const now = new Date();
    const dayName = now.toLocaleDateString("en-US", { weekday: "short" });
    const timeName = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `Device (${dayName} ${timeName})`;
  }

  addReactionHistory(
    reactants: string[],
    products: string[],
    reactionType: string,
    stability: number
  ): HistoryEntry {
    const entry: HistoryEntry = {
      id: `reaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: "reaction",
      data: {
        reactants,
        products,
        reactionType,
        stability,
      },
      deviceId: this.deviceId,
      isSaved: false,
    };

    this.saveEntry(entry);
    return entry;
  }

  addSearchHistory(query: string): HistoryEntry {
    const entry: HistoryEntry = {
      id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: "search",
      data: { query },
      deviceId: this.deviceId,
      isSaved: false,
    };

    this.saveEntry(entry);
    return entry;
  }

  addViewHistory(itemType: string, itemId: string, itemName: string): HistoryEntry {
    const entry: HistoryEntry = {
      id: `view_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type: "view",
      data: { itemType, itemId, itemName },
      deviceId: this.deviceId,
      isSaved: false,
    };

    this.saveEntry(entry);
    return entry;
  }

  saveEntry(entry: HistoryEntry): void {
    const history = this.getHistory();
    entry.isSaved = true;
    history.push(entry);

    // Keep only last 1000 entries
    if (history.length > 1000) {
      history.splice(0, history.length - 1000);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }

  getHistory(type?: string, limit?: number): HistoryEntry[] {
    const data = localStorage.getItem(STORAGE_KEY);
    let history: HistoryEntry[] = data ? JSON.parse(data) : [];

    if (type) {
      history = history.filter((h) => h.type === type);
    }

    // Sort by timestamp descending
    history.sort((a, b) => b.timestamp - a.timestamp);

    if (limit) {
      history = history.slice(0, limit);
    }

    return history;
  }

  getDeviceHistory(deviceId?: string): HistoryEntry[] {
    const targetDeviceId = deviceId || this.deviceId;
    const history = this.getHistory();
    return history.filter((h) => h.deviceId === targetDeviceId);
  }

  getRecentReactions(limit: number = 10): HistoryEntry[] {
    return this.getHistory("reaction", limit);
  }

  getRecentSearches(limit: number = 10): HistoryEntry[] {
    return this.getHistory("search", limit);
  }

  clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  exportHistory(): string {
    const history = this.getHistory();
    const deviceInfo = this.deviceInfo;
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        deviceInfo,
        history,
      },
      null,
      2
    );
  }

  importHistory(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (!data.history || !Array.isArray(data.history)) {
        return false;
      }

      const currentHistory = this.getHistory();
      const mergedHistory = [...currentHistory, ...data.history];

      // Remove duplicates
      const uniqueHistory = Array.from(
        new Map(mergedHistory.map((h) => [h.id, h])).values()
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(uniqueHistory));
      return true;
    } catch (error) {
      console.error("Failed to import history:", error);
      return false;
    }
  }

  getDeviceInfo(): DeviceInfo {
    return this.deviceInfo;
  }

  getDeviceId(): string {
    return this.deviceId;
  }
}

export const deviceHistoryManager = new DeviceHistoryManager();
