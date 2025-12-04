import * as functions from "firebase-functions";
import fetch from "node-fetch";
import type { Request, Response } from "express";
import { onSchedule } from "firebase-functions/scheduler";
import { defineSecret } from "firebase-functions/params";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, applicationDefault } from "firebase-admin/app";

initializeApp({
  credential: applicationDefault(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS, POST, PUT, DELETE",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

export const getNightscoutBundle = functions.https.onRequest(
  async (req: Request, res: Response) => {
    if (req.method === "OPTIONS") {
      res.set(corsHeaders);
      res.status(204).send("");
      return;
    }

    res.set(corsHeaders);

    const user = await verifyUser(req, res);
    if (!user) return;

    const url = req.query.url as string;
    const secret = req.query.secret as string;
    const minutes = parseInt((req.query.minutes as string) || "1440");

    if (!url) {
      res.status(400).json({ error: "Missing Nightscout URL" });
      return;
    }

    const sinceTimestamp = Date.now() - minutes * 60 * 1000;
    const sinceISO = new Date(sinceTimestamp).toISOString();
    const baseUrl = url.replace(/\/$/, "");

    const count = minutes / 5;

    const headers: Record<string, string> = secret
      ? { "api-secret": secret }
      : {};

    try {
      const entriesRes = await fetch(
        `${baseUrl}/api/v1/entries.json?count=${count}`,
        { headers }
      );
      const entries = await entriesRes.json();

      const treatmentsRes = await fetch(
        `${baseUrl}/api/v1/treatments?find[created_at][$gte]=${sinceISO}`,
        { headers }
      );
      const treatments = await treatmentsRes.json();

      const meals = treatments.filter(
        (t: any) =>
          typeof t.eventType === "string" &&
          t.eventType.toLowerCase().includes("meal")
      );

      const activities = treatments.filter(
        (t: any) =>
          typeof t.eventType === "string" &&
          t.eventType.toLowerCase().includes("activity")
      );

      res.json({
        timestamp: Date.now(),
        entries,
        treatments,
        meals,
        activities,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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

    const user = await verifyUser(req, res);
    if (!user) return;

    const url = req.query.url as string;
    const secret = req.query.secret as string;
    const treatment = req.body;

    if (!url || !treatment) {
      res.status(400).json({ error: "Missing url or treatment" });
      return;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (secret) headers["api-secret"] = secret;

    try {
      const r = await fetch(`${url}/api/v1/treatments`, {
        method: "POST",
        headers,
        body: JSON.stringify(treatment),
      });

      if (!r.ok) {
        res.status(r.status).json({ error: await r.text() });
        return;
      }

      res.json(await r.json());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
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

    const user = await verifyUser(req, res);
    if (!user) return;

    const url = req.query.url as string;
    const secret = req.query.secret as string;
    const treatment = req.body;

    if (!url || !treatment) {
      res.status(400).json({ error: "Missing url or treatment" });
      return;
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (secret) headers["api-secret"] = secret;

    try {
      const r = await fetch(`${url}/api/v1/treatments`, {
        method: "PUT",
        headers,
        body: JSON.stringify(treatment),
      });

      if (!r.ok) {
        res.status(r.status).json({ error: await r.text() });
        return;
      }

      res.json(await r.json());
    } catch (err: any) {
      res.status(500).json({ error: err.message });
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

    const user = await verifyUser(req, res);
    if (!user) return;

    const url = req.query.url as string;
    const secret = req.query.secret as string;
    const id = req.query.id as string;

    if (!url || !id) {
      res.status(400).json({ error: "Missing url or id" });
      return;
    }

    const headers: Record<string, string> = {};
    if (secret) headers["api-secret"] = secret;

    try {
      const r = await fetch(`${url}/api/v1/treatments/${id}`, {
        method: "DELETE",
        headers,
      });

      if (!r.ok) {
        res.status(r.status).json({ error: await r.text() });
        return;
      }

      res.json({ success: true, id });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

const nightscoutSecret = defineSecret("NIGHTSCOUT_API_SECRET");
const nightscoutUrl = defineSecret("NIGHTSCOUT_URL");

let lastBG = 110;

function simulateBG(t: number) {
  return Math.round(
    110 +
      Math.sin(((t % (86400 * 1000)) / (86400 * 1000)) * 2 * Math.PI) * 20 +
      (Math.random() - 0.5) * 10
  );
}

export const simulateGlucose = onSchedule(
  { secrets: [nightscoutSecret, nightscoutUrl], schedule: "every 5 minutes" },
  async () => {
    const url = nightscoutUrl.value();
    const secret = nightscoutSecret.value();
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
  }
);
