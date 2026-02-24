// @ts-ignore - ws module loaded at runtime
const crypto = require("crypto");
const fs = require("fs");
// @ts-ignore - ws module loaded at runtime
const WebSocket = require("ws");

const IDENTITY_DIR = "/root/.openclaw/identity";
const TIMEOUT_MS = 5000;

interface GatewaySession {
  id: string;
  agentId?: string;
  role?: string;
  startedAt?: number;
  lastActive?: number;
  [key: string]: unknown;
}

interface GatewayStatus {
  version?: string;
  uptime?: number;
  connectedAgents?: number;
  [key: string]: unknown;
}

interface GatewayCron {
  id?: string;
  name?: string;
  schedule?: string;
  lastRun?: number;
  nextRun?: number;
  enabled?: boolean;
  [key: string]: unknown;
}

function loadIdentity() {
  try {
    const device = JSON.parse(fs.readFileSync(`${IDENTITY_DIR}/device.json`, "utf8"));
    const deviceAuth = JSON.parse(fs.readFileSync(`${IDENTITY_DIR}/device-auth.json`, "utf8"));
    return {
      device,
      token: deviceAuth.tokens.operator.token,
      scopes: deviceAuth.tokens.operator.scopes,
    };
  } catch {
    return null;
  }
}

function makeRequest(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
  return new Promise((resolve) => {
    const identity = loadIdentity();
    if (!identity) {
      resolve(null);
      return;
    }

    const { device, token, scopes } = identity;
    const role = "operator";

    let ws: InstanceType<typeof WebSocket> | null = null;
    let resolved = false;
    let requestId = String(Math.floor(Math.random() * 10000));

    const timeout = setTimeout(() => {
      if (resolved) return;
      resolved = true;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
      resolve(null);
    }, TIMEOUT_MS);

    try {
      ws = new WebSocket("ws://127.0.0.1:18789", {
        headers: { Origin: "http://127.0.0.1:18789" }
      });

      ws.on("open", () => {});

      ws.on("message", (data: Buffer) => {
        if (resolved) return;
        try {
          const m = JSON.parse(data.toString());
          if (m.event === "connect.challenge") {
            const nonce = m.payload.nonce;
            const ts = Date.now();
            const signingStr = [
              "v2",
              device.deviceId,
              "openclaw-control-ui",
              "webchat",
              role,
              scopes.join(","),
              String(ts),
              token,
              nonce
            ].join("|");
            const privateKey = crypto.createPrivateKey(device.privateKeyPem);
            const signature = crypto.sign(null, Buffer.from(signingStr), privateKey).toString("base64");

            ws?.send(JSON.stringify({
              type: "req",
              id: requestId,
              method: "connect",
              params: {
                minProtocol: 3,
                maxProtocol: 3,
                client: {
                  id: "openclaw-control-ui",
                  version: "1.0.0",
                  platform: "web",
                  mode: "webchat",
                  instanceId: "mc-001"
                },
                role,
                scopes,
                device: {
                  id: device.deviceId,
                  publicKey: device.publicKeyPem,
                  signature,
                  signedAt: ts,
                  nonce
                },
                caps: [],
                auth: { token }
              }
            }));
          }
          if (m.type === "res" && m.id === requestId && m.ok === true && m.payload?.server) {
            ws?.send(JSON.stringify({ type: "req", id: String(Math.floor(Math.random() * 10000)), method, params }));
            requestId = String(Math.floor(Math.random() * 10000));
          }
          if (m.type === "res" && m.id === requestId && m.ok === true) {
            resolved = true;
            clearTimeout(timeout);
            ws?.close();
            resolve(m.payload);
          }
          if (m.type === "res" && m.id === requestId && m.ok === false) {
            resolved = true;
            clearTimeout(timeout);
            ws?.close();
            resolve(null);
          }
        } catch {
          resolve(null);
        }
      });

      ws.on("error", () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(null);
        }
      });

      ws.on("close", () => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeout);
          resolve(null);
        }
      });
    } catch {
      clearTimeout(timeout);
      resolve(null);
    }
  });
}

export async function getGatewaySessions(): Promise<GatewaySession[]> {
  try {
    const result = await makeRequest("sessions.list", {}) as { sessions?: GatewaySession[] } | null;
    if (result && Array.isArray(result.sessions)) {
      return result.sessions;
    }
    return [];
  } catch {
    return [];
  }
}

export async function getGatewayStatus(): Promise<GatewayStatus | null> {
  try {
    const result = await makeRequest("status", {}) as GatewayStatus | null;
    return result;
  } catch {
    return null;
  }
}

export async function getGatewayCrons(): Promise<GatewayCron[]> {
  try {
    const result = await makeRequest("crons.list", {}) as { crons?: GatewayCron[] } | null;
    if (result && Array.isArray(result.crons)) {
      return result.crons;
    }
    return [];
  } catch {
    return [];
  }
}
