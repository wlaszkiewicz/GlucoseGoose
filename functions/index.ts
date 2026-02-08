import * as functions from "firebase-functions";
import fetch from "node-fetch";
import type { Request, Response } from "express";
import { onSchedule } from "firebase-functions/scheduler";
import { defineSecret } from "firebase-functions/params";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { getMessaging } from "firebase-admin/messaging";
import type { BatchResponse } from "firebase-admin/messaging";

initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();
const auth = getAuth();

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS, POST, PUT, DELETE",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const getEmailFromUsername = functions.https.onRequest(
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.set(corsHeaders);
      res.status(204).send("");
      return;
    }

    res.set(corsHeaders);

    const username = (req.query.username as string)?.trim()?.toLowerCase();
    if (!username) {
      res.status(400).json({ error: "Missing 'username'" });
      return;
    }

    try {
      const snap = await db
        .collection("public_users")
        .where("username_lower", "==", username)
        .limit(1)
        .get();

      if (snap.empty) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const uid = snap.docs[0].id;

      const userRecord = await auth.getUser(uid);

      res.json({ email: userRecord.email });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
      throw new Error("Error in getEmailFromUsername: " + err.message);
    }
  },
);

async function verifyUser(req: Request, res: Response) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    res.status(401).json({ error: "Missing auth token" });
    return null;
  }

  try {
    return await getAuth().verifyIdToken(token);
  } catch (err) {
    res.status(401).json({ error: "Invalid auth token" });
    return null;
  }
}

const geminiAPIKey = defineSecret("GEMINI_API_KEY");

export const analyzeMeal = functions.https.onRequest(
  async (req: Request, res: Response) => {
    if (req.method === "OPTIONS") {
      res.set(corsHeaders);
      res.status(204).send("");
      return;
    }

    res.set(corsHeaders);

    const user = await verifyUser(req, res);
    if (!user) return;

    const { imageBase64, description } = req.body;
    console.log(description);
    if (!imageBase64) {
      res.status(400).json({ error: "Missing 'imageBase64' in body" });
      throw new Error("Missing 'imageBase64' in body");
    }

    const prompt = `
You are an expert nutrition AI. A user will send a photograph of a meal.
The user may also provide additional description: "${description || ""}".
You MUST estimate the nutritional composition based on what you visually see AND include information from the user's description.
Also, add a concise, human-readable summary of the meal in the "description" field of the JSON, describing what the meal contains.

Return ONLY valid JSON. No extra text.

SCHEMA:
{
  "food_items": [
    {
      "name": "",
      "estimated_weight_grams": 0,
      "calories": 0,
      "protein_grams": 0,
      "carbs_grams": 0,
      "fat_grams": 0,
      "fiber_grams": 0
    }
  ],
  "totals": {
    "calories": 0,
    "protein_grams": 0,
    "carbs_grams": 0,
    "fat_grams": 0,
    "fiber_grams": 0
  },
  "confidence": "",
  "description": ""
}

RULES:
- "confidence" should be: low, medium, or high.
- If unsure, be conservative and use "low".
- Weight must be numeric.
- If food is unclear, still name something reasonable.
- "description" must summarize what the meal contains based on both the photo and user input.
- DO NOT include text outside of the JSON.
`;

    try {
      const body = {
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: imageBase64,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
      };

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiAPIKey.value(),
          },
          body: JSON.stringify(body),
        },
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`AI API failed: ${response.status} ${errText}`);
      }

      const data = await response.json();
      const outputText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!outputText) {
        throw new Error("AI returned empty response");
      }

      let parsed;
      try {
        parsed = JSON.parse(
          outputText
            .replace(/^```json/, "")
            .replace(/```$/, "")
            .trim(),
        );
      } catch {
        parsed = { error: "AI returned invalid JSON", raw: outputText };
      }

      res.json(parsed);
    } catch (err: any) {
      throw new Error("Error in analyzeMeal: " + err.message);
    }
  },
);

type UserDoc = {
  nightscoutUrl?: string;
  nightscoutSecret?: string; // for testing only !!!!!
  storeLocally?: boolean; // if true, backend can't access local URL

  notificationsEnabled?: boolean; // if either alert or liveStatus enabled

  alertsEnabled?: boolean; // LOW / HIGH / URGENT / STALE / FAST_DROP
  liveStatusEnabled?: boolean; // chart + current BG "widget"
  cooldownMinutes?: number; // default 20
  lowThreshold?: number; // mg/dL default 70
  highThreshold?: number; // mg/dL default 180
  urgentLowThreshold?: number; // mg/dL default 55
  staleMinutes?: number; // default 15
  trendAlertsEnabled?: boolean; // default true
  fastDropThreshold?: number; // mg/dL/min default -2
  backInRangeEnabled?: boolean; // default true

  worsenDelta?: number; // default 20 mg/dL

  soundMode?: "normal" | "goose"; // default "normal"

  lastEntryTime?: Timestamp;
  lastAlertAt?: Timestamp;
  lastAlertType?: string | null;
  activeState?: "IN_RANGE" | "LOW" | "HIGH" | "URGENT_LOW" | "STALE";
  lastAlertBg?: number | null;

  glucoseHistory?: { ts: number; bg: number }[];
};

type GlucoseMetrics = {
  deltaShort: number;
  rocShort: number;
  trendSmooth: number;
  suspicious: boolean;
  state: UserDoc["activeState"];
  isStale: boolean;
};

type NightscoutEntry = {
  date: number; // ms
  sgv?: number; // mg/dL
  direction?: string; // e.g., "Flat", "FortyFiveUp", etc.
};

function isMoreSevere(prev: string | null, next: string) {
  const rank: Record<string, number> = {
    STALE: 50,
    URGENT_LOW: 40,
    LOW: 30,
    HIGH: 20,
    FAST_DROP: 10,
    BACK_IN_RANGE: 5,
  };
  return (rank[next] ?? 0) > (rank[prev ?? ""] ?? 0);
}

function shouldBypassCooldownOnWorse(
  prevType: string | null,
  nextType: string,
  lastAlertBg: number | null | undefined,
  currentBg: number,
  worsenDelta: number,
) {
  // if escalating to URGENT_LOW
  if (nextType === "URGENT_LOW" && prevType !== "URGENT_LOW") return true;

  // if severity increases (e.g., FAST_DROP -> LOW, LOW -> URGENT_LOW)
  if (isMoreSevere(prevType, nextType)) return true;

  // if same category but clearly worse
  if (typeof lastAlertBg === "number") {
    if (nextType === "HIGH" && currentBg - lastAlertBg >= worsenDelta)
      return true;
    if (nextType === "LOW" && lastAlertBg - currentBg >= worsenDelta)
      return true;
    if (nextType === "URGENT_LOW" && lastAlertBg - currentBg >= worsenDelta)
      return true;
  }

  return false;
}

function computeMetrics(
  latest: { ts: number; bg: number },
  history: { ts: number; bg: number }[],
  now: number,
  cfg: {
    low: number;
    high: number;
    urgentLow: number;
    staleMin: number;
    smoothWindowMin: number;
  },
): GlucoseMetrics {
  const { ts, bg } = latest;

  const ageMin = minutes(now - ts);
  const isStale = ageMin > cfg.staleMin;

  const prev = history.at(-1) ?? null;

  const dtShort = prev ? Math.max(1, minutes(ts - prev.ts)) : 5;

  const deltaShort = prev ? bg - prev.bg : 0;
  const rocShort = deltaShort / dtShort;

  const smoothHistory = history.filter(
    (h) => ts - h.ts <= cfg.smoothWindowMin * 60_000,
  );

  const oldestSmooth = smoothHistory[0] ?? null;

  const dtSmooth = oldestSmooth
    ? Math.max(1, minutes(ts - oldestSmooth.ts))
    : 1;

  const trendSmooth = oldestSmooth ? (bg - oldestSmooth.bg) / dtSmooth : 0;

  const suspicious = computeSuspiciousFlag(bg, prev?.bg ?? null, dtShort);

  const state = isStale
    ? "STALE"
    : classify(bg, cfg.low, cfg.high, cfg.urgentLow);

  return {
    deltaShort,
    rocShort,
    trendSmooth,
    suspicious,
    state,
    isStale,
  };
}

function computeSuspiciousFlag(
  latestBg: number,
  prevBg: number | null,
  dtMin: number,
) {
  if (prevBg === null) return false;

  const delta = latestBg - prevBg;
  const roc = delta / Math.max(1, dtMin);

  const veryBigJump = Math.abs(delta) >= 80; // mg/dL in ~5 min
  const veryFastRoc = Math.abs(roc) >= 8; // mg/dL/min (~40 per 5 min)

  return veryBigJump || veryFastRoc;
}

function normalizeUrl(url: string) {
  return url.replace(/\/+$/, "");
}

function minutes(ms: number) {
  return ms / (1000 * 60);
}

function classify(bg: number, low: number, high: number, urgentLow: number) {
  if (bg <= urgentLow) return "URGENT_LOW";
  if (bg < low) return "LOW";
  if (bg > high) return "HIGH";
  return "IN_RANGE";
}

function decideAlertType(params: {
  state: UserDoc["activeState"];
  isStale: boolean;
  trendSmooth: number;
  fastDrop: number;
  trendEnabled: boolean;
  prevState: UserDoc["activeState"];
}) {
  const { state, isStale, trendSmooth, fastDrop, trendEnabled, prevState } =
    params;

  if (isStale) return "STALE";
  if (state === "URGENT_LOW") return "URGENT_LOW";
  if (state === "LOW") return "LOW";
  if (state === "HIGH") return "HIGH";

  if (trendEnabled && trendSmooth <= fastDrop && state === "IN_RANGE") {
    return "FAST_DROP";
  }

  if (prevState !== "IN_RANGE" && state === "IN_RANGE") {
    return "BACK_IN_RANGE";
  }

  return null;
}

async function fetchLatestEntries(
  url: string,
  secret?: string,
  count: number = 1,
): Promise<NightscoutEntry[]> {
  const endpoint = `${normalizeUrl(url)}/api/v1/entries.json?count=${count}`;

  const headers: Record<string, string> = { Accept: "application/json" };

  // For now only!!! testing
  if (secret && secret.trim().length > 0) {
    headers["api-secret"] = secret;
  }

  const res = await fetch(endpoint, {
    method: "GET",
    headers,
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) throw new Error(`Nightscout ${res.status} ${res.statusText}`);

  const data = (await res.json()) as NightscoutEntry[];
  return (data || []).filter(
    (e) => typeof e?.date === "number" && typeof e?.sgv === "number",
  );
}

async function getDeviceTokens(uid: string) {
  const snap = await db
    .collection("users")
    .doc(uid)
    .collection("devices")
    .get();

  return snap.docs
    .map((d) => d.get("token"))
    .filter((t) => typeof t === "string" && t.length > 0) as string[];
}

async function sendLiveGlucosePush(
  uid: string,
  title: string,
  body: string,
  chartUrl: string,
) {
  const tokens = await getDeviceTokens(uid);
  if (tokens.length === 0) return;

  const resp = await getMessaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
    android: {
      priority: "normal",
      notification: {
        channelId: "glucose_live",
        tag: "glucose_live",
        imageUrl: chartUrl,
      },
    },
    apns: {
      payload: {
        aps: {
          sound: undefined,
          "thread-id": "glucose_live",
        },
      },
      fcmOptions: {
        imageUrl: chartUrl,
      },
    },
  });

  if (resp.failureCount > 0) {
    await disableBadTokens(uid, tokens, resp);
  }
}

async function sendAlertPush(
  uid: string,
  title: string,
  body: string,
  soundMode: "normal" | "goose" | undefined,
  data?: Record<string, string>,
) {
  const tokens = await getDeviceTokens(uid);
  if (tokens.length === 0) return;

  const channelId = soundMode === "goose" ? "alerts_goose" : "alerts_normal";

  const iosSound = soundMode === "goose" ? "goose_soft.wav" : "default";

  const resp = await getMessaging().sendEachForMulticast({
    tokens,
    notification: { title, body },
    android: {
      priority: "high",
      notification: {
        channelId,
        tag: "glucose_alerts",
      },
    },
    apns: {
      payload: {
        aps: {
          sound: iosSound,
          "thread-id": "glucose_alerts",
        },
      },
    },
    data,
  });

  if (resp.failureCount > 0) {
    await disableBadTokens(uid, tokens, resp);
  }
}

async function disableBadTokens(
  uid: string,
  tokens: string[],
  resp: BatchResponse,
) {
  const badTokens: string[] = [];

  resp.responses.forEach((r, i) => {
    if (!r.success) {
      const code = r.error?.code;

      if (
        code === "messaging/registration-token-not-registered" ||
        code === "messaging/invalid-registration-token" ||
        code === "messaging/invalid-argument"
      ) {
        badTokens.push(tokens[i]);
      }
    }
  });

  if (badTokens.length === 0) return;

  const devicesSnap = await db
    .collection("users")
    .doc(uid)
    .collection("devices")
    .get();

  const batch = db.batch();

  devicesSnap.docs.forEach((doc) => {
    if (badTokens.includes(doc.get("token"))) {
      batch.update(doc.ref, {
        enabled: false,
        updatedAt: Timestamp.now(),
      });
    }
  });

  await batch.commit();
}
function createChart(
  history: { ts: number; bg: number }[],
  low: number,
  high: number,
  urgentLow: number,
) {
  const sorted = [...history].sort((a, b) => a.ts - b.ts);

  const labels = sorted.map((e) => {
    const date = new Date(e.ts);
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
  });

  const glucoseValues = sorted.map((e) => e.bg);

  const lowLine = Array(history.length).fill(low);
  const urgentLowLine = Array(history.length).fill(urgentLow);
  const highLine = Array(history.length).fill(high);

  const COLORS = {
    low: "#C76B6B",
    urgentLow: "#A14747",
    target: "#8FBF8F",
    high: "#EFD77A",
  };

  const getColor = (v: number) => {
    if (v <= urgentLow) return COLORS.urgentLow;
    if (v <= low) return COLORS.low;
    if (v >= high) return COLORS.high;
    return COLORS.target;
  };

  const glucoseDatasets = ["urgentLow", "low", "target", "high"].map((zone) => {
    const zoneColor = COLORS[zone as keyof typeof COLORS];

    const data = glucoseValues.map((v, i) => {
      const vColor = getColor(v);

      if (zoneColor === vColor) return v;

      const prev = glucoseValues[i - 1];
      const next = glucoseValues[i + 1];
      if (prev !== undefined && getColor(prev) === zoneColor) return v;
      if (next !== undefined && getColor(next) === zoneColor) return v;

      return null;
    });

    return {
      label: zone,
      data,
      borderColor: zoneColor,
      fill: false,
      pointBackgroundColor: zoneColor,
      pointRadius: 2,
      pointHoverRadius: 4,
      tension: 0.35,
    };
  });

  const chartJson = {
    type: "line",
    data: {
      labels,
      datasets: [
        ...glucoseDatasets,
        {
          data: lowLine,
          borderColor: COLORS.low,
          borderDash: [6, 6],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        },
        {
          data: urgentLowLine,
          borderColor: COLORS.urgentLow,
          borderDash: [3, 3],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        },
        {
          data: highLine,
          borderColor: COLORS.high,
          borderDash: [6, 6],
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      legend: { display: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          backgroundColor: "#111",
          titleColor: "#fff",
          bodyColor: "#ddd",
          borderColor: "#333",
          borderWidth: 1,
        },
      },
      scales: {
        x: { display: false, grid: { display: false } },
        y: {
          min: 40,
          max: 220,
          grid: { color: "#1f1f1f", drawBorder: false },
          ticks: { color: "#888", padding: 6 },
        },
      },
    },
    plugins: [
      {
        id: "customCanvasBackgroundColor",
        beforeDraw: (chart: any) => {
          const ctx = chart.ctx;
          ctx.save();
          ctx.globalCompositeOperation = "destination-over";
          ctx.clearRect(0, 0, chart.width, chart.height);
          ctx.restore();
        },
      },
    ],
  };

  const width = 500;
  const height = 200;

  return `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify(chartJson),
  )}&w=${width}&h=${height}`;
}

export const nightscoutAlertsEvery5Min = onSchedule(
  {
    schedule: "every 5 minutes",
    timeZone: "Europe/Warsaw",
    timeoutSeconds: 540,
    memory: "512MiB",
  },
  async () => {
    const usersSnap = await db
      .collection("users")
      .where("notificationsEnabled", "==", true)
      .get();
    logger.info(`Nightscout poll users: ${usersSnap.size}`);

    const now = Date.now();

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      const u = userDoc.data() as UserDoc;

      // we'll deal with this later
      if (u.storeLocally) continue;

      const url = u.nightscoutUrl?.trim();
      if (!url) continue;

      const low = u.lowThreshold ?? 70;
      const high = u.highThreshold ?? 180;
      const urgentLow = u.urgentLowThreshold ?? 55;
      const cooldownMin = u.cooldownMinutes ?? 20;
      const staleMin = u.staleMinutes ?? 15;
      const trendEnabled = u.trendAlertsEnabled ?? true;
      const fastDrop = u.fastDropThreshold ?? -2;
      const liveStatusEnabled = u.liveStatusEnabled ?? true;
      const alertsEnabled = u.alertsEnabled ?? true;
      const backInRangeEnabled = u.backInRangeEnabled ?? true;

      const history = u.glucoseHistory ?? [];

      try {
        const entries = await fetchLatestEntries(url, u.nightscoutSecret, 1);
        if (entries.length === 0) continue;

        const latest = entries[0];

        const latestBg = latest.sgv!;
        const latestTs = latest.date;

        // Dedupe
        const prevEntryMs = u.lastEntryTime?.toMillis?.();
        if (prevEntryMs && prevEntryMs === latestTs) continue;

        const prevHist =
          history.length > 0 ? history[history.length - 1] : null;

        const prevBg = prevHist?.bg ?? null;

        const age = minutes(now - latestTs);

        const trend = trendSymbol(latest.direction?.toLowerCase() ?? "flat");

        const lastAlertMs = u.lastAlertAt?.toMillis?.();
        const inCooldown = lastAlertMs
          ? minutes(now - lastAlertMs) < cooldownMin
          : false;

        const metrics = computeMetrics(
          { ts: latestTs, bg: latestBg },
          history,
          now,
          {
            low,
            high,
            urgentLow,
            staleMin,
            smoothWindowMin: 20,
          },
        );

        const {
          deltaShort,
          rocShort,
          trendSmooth,
          suspicious,
          state,
          isStale,
        } = metrics;

        const prevState = u.activeState ?? "IN_RANGE";
        const backInRange =
          !isStale && prevState !== "IN_RANGE" && state === "IN_RANGE";

        let alertType: string | null = null;

        alertType = decideAlertType({
          state,
          isStale,
          trendSmooth,
          fastDrop,
          trendEnabled,
          prevState,
        });

        const prevType = u.lastAlertType ?? null;
        const lastAlertBg = u.lastAlertBg ?? null;
        const worsenDelta = u.worsenDelta ?? 20;

        const bypass = alertType
          ? shouldBypassCooldownOnWorse(
              prevType,
              alertType,
              lastAlertBg,
              latestBg,
              worsenDelta,
            )
          : false;

        const shouldSend =
          alertsEnabled &&
          alertType !== null &&
          (!inCooldown || bypass) &&
          (prevType !== alertType || !inCooldown || bypass);

        const baseTitle =
          alertType === "URGENT_LOW"
            ? "Urgent low"
            : alertType === "LOW"
              ? "Low glucose"
              : alertType === "HIGH"
                ? "High glucose"
                : alertType === "FAST_DROP"
                  ? "Rapid drop"
                  : alertType === "BACK_IN_RANGE"
                    ? "Back in range!"
                    : "Nightscout data missing";

        const title =
          suspicious &&
          (alertType === "LOW" ||
            alertType === "URGENT_LOW" ||
            alertType === "FAST_DROP")
            ? `Possible sensor glitch — ${baseTitle}`
            : baseTitle;

        const deltaText =
          prevBg !== null
            ? `Δ ${deltaShort >= 0 ? "+" : ""}${deltaShort} mg/dL`
            : "Δ ?";

        const rateText =
          prevBg !== null
            ? `${rocShort.toFixed(1)} mg/dL/min`
            : `${trendSmooth.toFixed(1)} mg/dL/min`;

        const body =
          alertType === "STALE"
            ? `No new data for ~${Math.round(age)} min.`
            : `${latestBg} mg/dL ${trend} \n` + `• ${deltaText}  • ${rateText}`;

        if (liveStatusEnabled) {
          const chartUrl = createChart(history, low, high, urgentLow);

          const liveTitle = isStale
            ? `Data stale (${Math.round(age)} min)`
            : `${latestBg} mg/dL ${trend}`;

          const liveBody = isStale
            ? `Last reading at ${new Date(latestTs).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : `${deltaText} • ${rateText}`;

          await sendLiveGlucosePush(uid, liveTitle, liveBody, chartUrl);
        }

        if (alertType === "STALE" && prevType === "STALE") {
          // dont spam stale alerts
          alertType = null;
        }

        if (shouldSend && alertType) {
          if (alertType === "BACK_IN_RANGE" && !backInRangeEnabled) {
            continue;
          }
          await sendAlertPush(uid, title, body, u.soundMode, {
            alertType,
            bg: String(latestBg),
          });

          await userDoc.ref.set(
            {
              lastAlertAt: Timestamp.fromMillis(now),
              lastAlertType: alertType,
              lastAlertBg: latestBg,
            },
            { merge: true },
          );
        }

        history.push({ ts: latest.date, bg: latest.sgv! });

        const trimmed = [...history].sort((a, b) => a.ts - b.ts).slice(-20);

        await userDoc.ref.set(
          {
            glucoseHistory: trimmed,
            lastEntryTime: Timestamp.fromMillis(latest.date),
            activeState: state,
          },
          { merge: true },
        );
      } catch (e: any) {
        logger.error(`uid=${uid} nightscout poll failed: ${e?.message ?? e}`);
      }
    }
  },
);

function trendSymbol(trend: string) {
  switch (trend) {
    case "flat":
      return "→";
    case "fortyfiveup":
      return "↗";
    case "fortyfivedown":
      return "↘";
    case "singleup":
      return "↑";
    case "singledown":
      return "↓";
    case "doubleup":
      return "↑↑";
    case "doubledown":
      return "↓↓";
    default:
      return "";
  }
}

const nightscoutSecret = "508faef088174ebf9957f9b9da5d36dd7a67941c";
const nightscoutUrl = "https://glucose-goose.mooo.com/";

let lastBG = 120;

export function simulateBG(t: number) {
  const day = 86400 * 1000;
  const x = (t % day) / day;

  const w1 = Math.sin(x * 2 * Math.PI * 3) * 25;
  const w2 = Math.sin(x * 2 * Math.PI * 7) * 15;
  const w3 = Math.sin(x * 2 * Math.PI * 11 + 1) * 10;

  if (Math.random() < 0.02) {
    lastBG += (Math.random() - 0.5) * 50;
  }

  lastBG += (Math.random() - 0.5) * 3;

  const noise = (Math.random() - 0.5) * 12;

  const value = 120 + w1 + w2 + w3 + (lastBG - 120) * 0.2 + noise;

  return Math.round(value);
}

export const simulateGlucose = onSchedule(
  { schedule: "every 5 minutes" },
  async () => {
    const url = nightscoutUrl;
    const secret = nightscoutSecret;
    const baseUrl = url.replace(/\/$/, "");

    const now = new Date();
    const bg = simulateBG(now.getTime());

    const entry = {
      date: now.getTime(),
      dateString: now.toISOString(),
      sysTime: now.toISOString(),
      device: "xDrip-DexcomG5",
      sgv: bg,
      direction:
        bg - lastBG > 5
          ? "FortyFiveUp"
          : bg - lastBG < -5
            ? "FortyFiveDown"
            : "Flat",
      delta: bg - lastBG,
      noise: 1,
      rssi: 100,
      filtered: 0,
      unfiltered: 0,
      utcOffset: 60,
    };

    lastBG = bg;

    await fetch(`${baseUrl}/api/v1/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-secret": secret,
      },
      body: JSON.stringify([entry]),
    });
  },
);
