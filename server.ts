import express from "express";
import type { Request, Response } from "express";

import fetch from "node-fetch";
import cors from "cors";

const app = express();

const PORT = 3001;

function getHeaders(secret?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (secret) headers["api-secret"] = secret;
  return headers;
}

app.use(cors());
app.use(express.json());

app.get("/bundle", async (req: Request, res: Response) => {
  try {
    const minutes = Number(req.query.minutes ?? 1440);
    const sinceISO = new Date(Date.now() - minutes * 60 * 1000).toISOString();
    const count = Math.floor(minutes / 5);

    const url = req.query.url as string;
    const secret = req.query.secret as string;

    if (!url) return res.status(400).json({ error: "Missing Nightscout URL" });

    const headers = getHeaders(secret);

    const entriesRes = await fetch(
      `${url}/api/v1/entries.json?count=${count}`,
      { headers }
    );
    const entries = await entriesRes.json();

    const treatmentsRes = await fetch(
      `${url}/api/v1/treatments?find[created_at][$gte]=${sinceISO}`,
      { headers }
    );
    const treatments = await treatmentsRes.json();

    if (!Array.isArray(treatments)) {
      return res
        .status(500)
        .json({ error: "Nightscout returned non-array", raw: treatments });
    }

    const meals = treatments.filter((t: any) =>
      t.eventType?.toLowerCase().includes("meal")
    );
    const activities = treatments.filter((t: any) =>
      t.eventType?.toLowerCase().includes("activity")
    );
    const otherTreatments = treatments.filter(
      (t: any) =>
        !t.eventType?.toLowerCase().includes("meal") &&
        !t.eventType?.toLowerCase().includes("activity")
    );

    res.json({
      timestamp: Date.now(),
      entries,
      meals,
      activities,
      otherTreatments,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch Nightscout bundle" });
  }
});

app.post("/addTreatment", async (req: Request, res: Response) => {
  try {
    const treatment = req.body;
    if (!treatment)
      return res.status(400).json({ error: "Missing treatment body" });

    const url = req.query.url as string;
    const secret = req.query.secret as string;

    if (!url) return res.status(400).json({ error: "Missing Nightscout URL" });

    const headers = getHeaders(secret);
    const r = await fetch(`${url}/api/v1/treatments`, {
      method: "POST",
      headers,
      body: JSON.stringify(treatment),
    });

    if (!r.ok) return res.status(r.status).json({ error: await r.text() });
    res.json(await r.json());
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/updateTreatment", async (req: Request, res: Response) => {
  try {
    const treatment = req.body;
    if (!treatment || !treatment._id)
      return res.status(400).json({ error: "Missing treatment or _id" });

    const url = req.query.url as string;
    const secret = req.query.secret as string;

    if (!url) return res.status(400).json({ error: "Missing Nightscout URL" });

    const headers = getHeaders(secret);
    const r = await fetch(`${url}/api/v1/treatments`, {
      method: "PUT",
      headers,
      body: JSON.stringify(treatment),
    });

    if (!r.ok) return res.status(r.status).json({ error: await r.text() });
    res.json(await r.json());
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.delete("/deleteTreatment", async (req: Request, res: Response) => {
  try {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: "Missing id" });

    const url = req.query.url as string;
    const secret = req.query.secret as string;

    if (!url) return res.status(400).json({ error: "Missing Nightscout URL" });

    const headers = getHeaders(secret);
    const r = await fetch(`${url}/api/v1/treatments/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!r.ok) return res.status(r.status).json({ error: await r.text() });
    res.json({ success: true, id });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/treatmentsByDate", async (req: Request, res: Response) => {
  try {
    const dateStr = req.query.date as string;
    if (!dateStr)
      return res.status(400).json({ error: "Missing date query parameter" });

    const date = new Date(dateStr);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const url = req.query.url as string;
    const secret = req.query.secret as string;

    if (!url) return res.status(400).json({ error: "Missing Nightscout URL" });

    const headers = getHeaders(secret);

    const treatmentsRes = await fetch(
      `${url}/api/v1/treatments?find[created_at][$gte]=${startOfDay.toISOString()}&find[created_at][$lte]=${endOfDay.toISOString()}`,
      { headers }
    );
    const treatments = await treatmentsRes.json();

    if (!Array.isArray(treatments)) {
      return res
        .status(500)
        .json({ error: "Nightscout returned non-array", raw: treatments });
    }

    res.json(treatments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch treatments by date" });
  }
});

app.listen(PORT, () => {
  console.log(`Local Nightscout proxy running at http://localhost:${PORT}`);
});
