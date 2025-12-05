import * as functions from "firebase-functions";
import fetch from "node-fetch";
import type { Request, Response } from "express";
import { onSchedule } from "firebase-functions/scheduler";
import { defineSecret } from "firebase-functions/params";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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
      console.error("Error fetching email from username:", err);
    }
  }
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

    const { imageBase64 } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: "Missing 'imageBase64' in body" });
      return;
    }
    const prompt = `
You are an expert nutrition AI. A user will send a photograph of a meal.
You MUST estimate the nutritional composition based on what you visually see.

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
  "confidence": ""
}

RULES:
- "confidence" should be: low, medium, or high.
- If unsure, be conservative and use "low".
- Weight must be numeric.
- If food is unclear, still name something reasonable.
- DO NOT include text outside of the JSON.
`;

    const body = {
      content: [
        {
          type: "text",
          text: prompt,
        },
        {
          type: "image",
          image: {
            mime_type: "image/jpeg",
            data: imageBase64,
          },
        },
      ],
    };

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
        }
      );

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`AI API failed: ${response.status} ${errText}`);
      }

      const data = await response.json();
      const outputText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      console.log("AI Output Text:", outputText);
      console.log("Full AI Response:", JSON.stringify(data, null, 2));

      if (!outputText) {
        throw new Error("AI returned empty response");
      }

      let parsed;
      try {
        parsed = JSON.parse(
          outputText
            .replace(/^```json/, "")
            .replace(/```$/, "")
            .trim()
        );
      } catch {
        parsed = { error: "AI returned invalid JSON", raw: outputText };
      }

      res.json(parsed);
    } catch (err: any) {
      console.error("Error in analyzeMeal:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

const nightscoutSecret = defineSecret("NIGHTSCOUT_API_SECRET");
const nightscoutUrl = defineSecret("NIGHTSCOUT_URL");

let lastBG = 110;

function simulateBG(t: number) {
  const amplitude = 62.5;
  const center = 127.5;
  const frequency = 5; // cycles per day

  return Math.round(
    center +
      Math.sin(
        ((t % (86400 * 1000)) / (86400 * 1000)) * 2 * Math.PI * frequency
      ) *
        amplitude +
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
