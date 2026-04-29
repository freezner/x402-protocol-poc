import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export interface RuntimeSettings {
  agentPrivateKey?: string;
  serverWalletAddress?: string;
}

// dist/config/settings.js → ../../.settings.json (project root)
const SETTINGS_PATH = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../.settings.json"
);

class SettingsStore {
  private data: RuntimeSettings = {};

  load(): void {
    try {
      if (fs.existsSync(SETTINGS_PATH)) {
        this.data = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8")) as RuntimeSettings;
        console.log("[settings] .settings.json 로드됨");
      }
    } catch (err) {
      console.warn("[settings] 로드 실패:", (err as Error).message);
      this.data = {};
    }
  }

  update(patch: Partial<RuntimeSettings>): void {
    if (patch.agentPrivateKey !== undefined) {
      this.data.agentPrivateKey = patch.agentPrivateKey || undefined;
    }
    if (patch.serverWalletAddress !== undefined) {
      this.data.serverWalletAddress = patch.serverWalletAddress || undefined;
    }
    if (!this.data.agentPrivateKey) delete this.data.agentPrivateKey;
    if (!this.data.serverWalletAddress) delete this.data.serverWalletAddress;
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(this.data, null, 2), "utf-8");
  }

  getAgentPrivateKey(): string | undefined {
    return this.data.agentPrivateKey;
  }

  getServerWalletAddress(): string | undefined {
    return this.data.serverWalletAddress;
  }

  getAll(): RuntimeSettings {
    return { ...this.data };
  }
}

export const settingsStore = new SettingsStore();
