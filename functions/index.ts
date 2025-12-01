import * as functions from "firebase-functions";
import fetch from "node-fetch";
import type { Request, Response } from "express";
import { onSchedule } from "firebase-functions/scheduler";
import type {
  NightscoutEntry,
  NightscoutTreatment,
  NightscoutBundleResponse,
  QueryParams,
} from "../src/types/nightscout";
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS, POST, PUT, DELETE",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const getNightscoutBundle = functions.https.onRequest(
  async (req: Request & { query: QueryParams }, res: Response) => {
    if (req.method === "OPTIONS") {
      res.set(corsHeaders);
      res.status(204).send("");
      return;
    }

    res.set(corsHeaders);

    const url = req.query.url;
    const secret = req.query.secret;
    const minutes = parseInt(req.query.minutes || "1440");

    if (!url) {
      res.status(400).json({ error: "Missing Nightscout URL" });
      return;
    }

    const sinceTimestamp = Date.now() - minutes * 60 * 1000;
    const sinceISO = new Date(sinceTimestamp).toISOString();
    const baseUrl = url.replace(/\/$/, "");

    const headers: Record<string, string> = secret
      ? { "api-secret": secret }
      : {};

    try {
      // Fetch Entries

      const entriesRes = await fetch(
        `${baseUrl}/api/v1/entries.json?find[date][$gte]=${sinceTimestamp}`,
        { headers }
      );
      const entries: NightscoutEntry[] = await entriesRes.json();

      // Fetch Treatments

      const treatmentsRes = await fetch(
        `${baseUrl}/api/v1/treatments?find[created_at][$gte]=${sinceISO}`,
        { headers }
      );
      const treatments: NightscoutTreatment[] = await treatmentsRes.json();

      //  Extract Meals

      const meals = treatments.filter(
        (t) =>
          typeof t.eventType === "string" &&
          t.eventType.toLowerCase().includes("meal")
      );

      // Extract Activities

      const activities = treatments.filter(
        (t) =>
          typeof t.eventType === "string" &&
          t.eventType.toLowerCase().includes("activity")
      );

      const response: NightscoutBundleResponse = {
        timestamp: Date.now(),
        entries,
        treatments, // all treatments
        meals,
        activities,
      };

      res.json(response);
      return;
    } catch (error: any) {
      console.error("Nightscout fetch error:", error);
      res.status(500).json({
        error: error.message || "Unexpected error",
      });
      return;
    }
  }
);

export const addTreatment = functions.https.onRequest(
  async (req: Request, res: Response) => {
    if (req.method === "OPTIONS") {
      res.set(corsHeaders);
      res.status(204).send("");
      return;
    }

    res.set(corsHeaders);

    const { url, secret } = req.query;
    const treatment: NightscoutTreatment = req.body;

    if (!url || !treatment) {
      res.status(400).json({ error: "Missing url or treatment" });
      return;
    }

    const baseUrl = (url as string).replace(/\/$/, "");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (secret) {
      headers["api-secret"] = secret as string;
    }

    try {
      const r = await fetch(`${baseUrl}/api/v1/treatments`, {
        method: "POST",
        headers,
        body: JSON.stringify(treatment),
      });

      if (!r.ok) {
        const text = await r.text();
        res.status(r.status).json({ error: text });
        return;
      }

      const respJson = await r.json();
      res.json(respJson);
    } catch (err: any) {
      res.status(500).json({
        error: err.message || "Failed to post treatment",
      });
    }
  }
);

export const updateTreatment = functions.https.onRequest(
  async (req: Request, res: Response) => {
    if (req.method === "OPTIONS") {
      res.set(corsHeaders);
      res.status(204).send("");
      return;
    }

    res.set(corsHeaders);

    const { url, secret } = req.query;
    const treatment: NightscoutTreatment = req.body;

    if (!url || !treatment) {
      res.status(400).json({ error: "Missing url or treatment" });
      return;
    }

    const baseUrl = (url as string).replace(/\/$/, "");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (secret) {
      headers["api-secret"] = secret as string;
    }

    try {
      const r = await fetch(`${baseUrl}/api/v1/treatments/`, {
        method: "PUT",
        headers,
        body: JSON.stringify(treatment),
      });

      if (!r.ok) {
        const text = await r.text();
        res.status(r.status).json({ error: text });
        return;
      }

      const respJson = await r.json();
      res.json(respJson);
    } catch (err: any) {
      res.status(500).json({
        error: err.message || "Failed to update treatment",
      });
    }
  }
);

export const deleteTreatment = functions.https.onRequest(
  async (req: Request, res: Response) => {
    if (req.method === "OPTIONS") {
      res.set(corsHeaders);
      res.status(204).send("");
      return;
    }

    res.set(corsHeaders);

    const { url, secret, id } = req.query;

    if (!url || !id) {
      res.status(400).json({ error: "Missing url or treatment id" });
      return;
    }

    const baseUrl = (url as string).replace(/\/$/, "");

    const headers: Record<string, string> = {};
    if (secret) {
      headers["api-secret"] = secret as string;
    }

    try {
      const r = await fetch(`${baseUrl}/api/v1/treatments/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!r.ok) {
        const text = await r.text();
        res.status(r.status).json({ error: text });
        return;
      }

      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({
        error: err.message || "Failed to delete treatment",
      });
    }
  }
);

export const nightscoutSecret = defineSecret("NIGHTSCOUT_API_SECRET");
const nightscoutUrl = defineSecret("NIGHTSCOUT_URL");
let lastBG = 110;
function simulateBG(timestamp: number) {
  const base = 110;
  const variation = 20;

  const period = 24 * 60 * 60 * 1000;
  const timeFraction = (timestamp % period) / period;

  const sineValue = Math.sin(timeFraction * 2 * Math.PI);
  const randomNoise = (Math.random() - 0.5) * 10;

  return Math.round(base + sineValue * variation + randomNoise);
}

function getDirection(current: number, previous: number) {
  const delta = current - previous;
  if (delta > 5) return "FortyFiveUp";
  if (delta < -5) return "FortyFiveDown";
  return "Flat";
}

export const simulateGlucose = onSchedule(
  { secrets: [nightscoutSecret, nightscoutUrl], schedule: "every 5 minutes" },
  async (event) => {
    const url = nightscoutUrl.value();
    const secret = nightscoutSecret.value();

    const baseUrl = url.replace(/\/$/, "");

    const now = new Date();
    const bg = simulateBG(now.getTime());

    const timezoneOffsetMinutes = parseInt(
      process.env.TIMEZONE_OFFSET || "60",
      10
    );

    const adjusted = new Date(
      now.getTime() + timezoneOffsetMinutes * 60 * 1000
    );

    const entry = {
      date: adjusted.getTime(),
      dateString: adjusted.toISOString(),
      sysTime: adjusted.toISOString(),
      device: "xDrip-DexcomG5",
      sgv: bg,
      direction: getDirection(bg, lastBG),
      delta: bg - lastBG,
      noise: 1,
      rssi: 100,
      filtered: 0,
      unfiltered: 0,
      utcOffset: timezoneOffsetMinutes,
    };

    lastBG = bg;

    const r = await fetch(`${baseUrl}/api/v1/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-secret": secret,
      },
      body: JSON.stringify([entry]),
    });

    if (!r.ok) {
      console.error("Failed to post fake entry:", await r.text());
      return;
    }

    console.log("Simulated glucose entry posted:", bg);
  }
);
