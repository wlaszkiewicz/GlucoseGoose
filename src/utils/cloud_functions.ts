import {
  NightscoutBundleResponse,
  NightscoutTreatment,
} from "../types/nightscout";

import { GoogleGenAI } from "@google/genai";

export async function fetchBundle(
  cloudHost: string,
  nsUrl: string,
  secret?: string,
  minutes: number = 1440 // default 24h
): Promise<NightscoutBundleResponse> {
  const query = `https://${cloudHost}/getNightscoutBundle?url=${nsUrl}&secret=${
    secret || ""
  }&minutes=${minutes}`;

  const res = await fetch(query);

  if (!res.ok) {
    throw new Error(`Error fetching bundle: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data as NightscoutBundleResponse;
}

export async function addTreatment(
  cloudHost: string,
  nsUrl: string,
  secret: string,
  treatment: NightscoutTreatment
) {
  treatment.enteredBy = "GlucoseGoose App";
  const res = await fetch(
    `https://${cloudHost}/addTreatment?url=${nsUrl}&secret=${secret}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(treatment),
    }
  );

  if (!res.ok) throw new Error("Failed to add treatment");
  return res.json();
}

export async function updateTreatment(
  cloudHost: string,
  nsUrl: string,
  secret: string,
  treatment: NightscoutTreatment
) {
  treatment.enteredBy = "GlucoseGoose App";
  const res = await fetch(
    `https://${cloudHost}/updateTreatment?url=${nsUrl}&secret=${secret}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(treatment),
    }
  );

  if (!res.ok) throw new Error("Failed to update treatment");
  return res.json();
}

export async function deleteTreatment(
  cloudHost: string,
  nsUrl: string,
  secret: string,
  treatment_id: string
) {
  const res = await fetch(
    `https://${cloudHost}/deleteTreatment?url=${nsUrl}&secret=${secret}&id=${treatment_id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) throw new Error("Failed to update treatment");
  return res.json();
}

export async function analyzeMeal(imageBase64: string, apiKey: string) {
  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });
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

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      prompt,
      { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
    ],
  });

  if (!response.text) {
    throw new Error("AI analysis failed: no text returned");
  }

  let output = response.text;

  output = output
    .replace(/^```json/, "")
    .replace(/```$/, "")
    .trim();

  let parsed;

  try {
    return JSON.parse(output);
  } catch {
    return { error: "AI returned invalid JSON", raw: output };
  }
}
