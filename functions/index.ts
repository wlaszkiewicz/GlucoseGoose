const functions = require("firebase-functions");
const fetch = require("node-fetch");
import type { Request, Response } from "express";
const cors = require("cors")({ origin: true });

interface NightscoutQuery {
  url?: string;
  secret?: string;
  since?: string;
}

interface NightscoutEntry {
  [key: string]: unknown;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

type ApiHeaders = { [key: string]: string };

exports.getLast24h = functions.https.onRequest(
  async (req: Request & { query: NightscoutQuery }, res: Response) => {
    const url = req.query.url as string | undefined;
    const secret = req.query.secret as string | undefined;

    if (req.method === "OPTIONS") {
      res.set(corsHeaders);
      return res.status(204).send("");
    }

    res.set(corsHeaders);

    if (!url) return res.status(400).json({ error: "Missing Nightscout URL" });

    const headers: ApiHeaders = secret ? { "api-secret": secret } : {};

    const response = await fetch(`${url}/api/v1/entries.json?count=288`, {
      headers,
    });

    const data: NightscoutEntry[] = await response.json();
    res.json(data);
  }
);

exports.getSince = functions.https.onRequest(
  async (req: Request & { query: NightscoutQuery }, res: Response) => {
    const url = req.query.url as string | undefined;
    const since = req.query.since as string | undefined;
    const secret = req.query.secret as string | undefined;

    if (req.method === "OPTIONS") {
      res.set(corsHeaders);
      return res.status(204).send("");
    }

    res.set(corsHeaders);

    if (!url || !since)
      return res.status(400).json({ error: "Missing params" });

    const headers: ApiHeaders = secret ? { "api-secret": secret } : {};

    const response = await fetch(
      `${url}/api/v1/entries.json?find[date][$gt]=${since}`,
      { headers }
    );

    const data: NightscoutEntry[] = await response.json();
    res.json(data);
  }
);
