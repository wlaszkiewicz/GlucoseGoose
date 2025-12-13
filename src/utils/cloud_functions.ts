import {
  NightscoutBundleResponse,
  NightscoutTreatment,
} from "../types/nightscout";
import { Platform } from "react-native";
import { GoogleGenAI } from "@google/genai";

export async function getEmailFromUsername(
  cloudHost: string,
  username: string
) {
  const res = await fetch(
    `https://${cloudHost}/getEmailFromUsername?username=${username.toLowerCase()}`
  );

  if (!res.ok) throw new Error("Failed to get email from username");
  const data = await res.json();
  return data.email as string;
}

export async function fetchBundle(
  nsUrl: string,
  secret: string = "",
  minutes: number = 1440
): Promise<NightscoutBundleResponse> {
  const baseUrl = nsUrl.replace(/\/$/, "");
  const sinceTimestamp = Date.now() - minutes * 60 * 1000;
  const sinceISO = new Date(sinceTimestamp).toISOString();
  const count = Math.floor(minutes / 5);

  console.log("Fetching Nightscout bundle…" + minutes + " minutes");

  const headers: any = {};
  if (Platform.OS !== "web") {
    if (secret) headers["api-secret"] = secret; // only add secret on native to avoid CORS preflight on web
  }

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
    return {
      timestamp: Date.now(),
      entries,
      otherTreatments,
      meals,
      activities,
    };
  } catch (err) {
    if ((err as any).message.includes("CORS")) {
      console.error(
        "CORS error when fetching Nightscout bundle. Make sure your Nightscout site has CORS enabled and is set to 'readable'"
      );
    }
    console.error("Failed to fetch Nightscout bundle:", err);
    throw err;
  }
}

export async function fetchTreatmentsDate(
  nsUrl: string,
  secret: string = "",
  date: Date
): Promise<NightscoutTreatment[]> {
  const baseUrl = nsUrl.replace(/\/$/, "");

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const headers: any = {};
  if (Platform.OS !== "web") {
    if (secret) headers["api-secret"] = secret; // only add secret on native to avoid CORS preflight on web
  }

  console.log(`Fetching Nightscout treatments for ${date.toDateString()}`);

  const treatmentsRes = await fetch(
    `${baseUrl}/api/v1/treatments?find[created_at][$gte]=${startOfDay.toISOString()}&find[created_at][$lte]=${endOfDay.toISOString()}`,
    { headers }
  );

  const treatments = await treatmentsRes.json();
  return treatments;
}

export async function addTreatment(
  cloudHost: string,
  nsUrl: string,
  secret: string = "",
  treatment: NightscoutTreatment,
  token: string
) {
  treatment.enteredBy = "GlucoseGoose App";
  if (Platform.OS === "web") {
    const res = await fetch(
      `https://${cloudHost}/addTreatment?url=${nsUrl}&secret=${secret}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(treatment),
      }
    );

    if (!res.ok) throw new Error("Failed to add treatment");
    return res.json();
  } else {
    return await addTreatmentDirect(nsUrl, secret, treatment);
  }
}

export async function addTreatmentDirect(
  nsUrl: string,
  secret: string,
  treatment: NightscoutTreatment
) {
  const url = nsUrl.replace(/\/$/, "");

  const headers: any = { "Content-Type": "application/json" };
  if (secret) headers["api-secret"] = secret;

  const res = await fetch(`${url}/api/v1/treatments`, {
    method: "POST",
    headers,
    body: JSON.stringify(treatment),
  });

  if (!res.ok) throw new Error(await res.text());

  return res.json();
}

export async function updateTreatment(
  cloudHost: string,
  nsUrl: string,
  secret: string = "",
  treatment: NightscoutTreatment,
  token: string
) {
  treatment.enteredBy = "GlucoseGoose App";

  if (Platform.OS === "web") {
    const res = await fetch(
      `https://${cloudHost}/updateTreatment?url=${nsUrl}&secret=${secret}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(treatment),
      }
    );

    if (!res.ok) throw new Error("Failed to update treatment");
    return res.json();
  } else {
    return await updateTreatmentDirect(nsUrl, secret, treatment);
  }
}

export async function updateTreatmentDirect(
  nsUrl: string,
  secret: string,
  treatment: NightscoutTreatment
) {
  const url = nsUrl.replace(/\/$/, "");

  if (!treatment._id) throw new Error("Missing _id for update");

  const headers: any = { "Content-Type": "application/json" };
  if (secret) headers["api-secret"] = secret;

  const res = await fetch(`${url}/api/v1/treatments`, {
    method: "PUT",
    headers,
    body: JSON.stringify(treatment),
  });

  if (!res.ok) throw new Error(await res.text());

  return res.json();
}

export async function deleteTreatment(
  cloudHost: string,
  nsUrl: string,
  secret: string = "",
  treatment_id: string,
  token: string
) {
  if (Platform.OS === "web") {
    const res = await fetch(
      `https://${cloudHost}/deleteTreatment?url=${nsUrl}&secret=${secret}&id=${treatment_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) throw new Error("Failed to update treatment");
    return res.json();
  } else {
    return await deleteTreatmentDirect(nsUrl, secret, treatment_id);
  }
}

export async function deleteTreatmentDirect(
  nsUrl: string,
  secret: string,
  id: string
) {
  const url = nsUrl.replace(/\/$/, "");

  const headers: any = {};
  if (secret) headers["api-secret"] = secret;

  const res = await fetch(`${url}/api/v1/treatments/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) throw new Error(await res.text());

  return true;
}

export async function analyzeMeal(
  imageBase64: string,
  cloudHost: string,
  token: string,
  description?: string,
  apiKey?: string
) {
  if (apiKey?.trim()) {
    console.log("Using direct AI analysis with provided API key");
    return analyzeMealDirect(imageBase64, apiKey, description);
  } else {
    console.log("Using cloud AI analysis service");
    return analyzeMealCloud(imageBase64, cloudHost, token, description);
  }
}

export async function analyzeMealCloud(
  imageBase64: string,
  cloudHost: string,
  token: string,
  description?: string
) {
  const response = await fetch(`https://${cloudHost}/analyzeMeal`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageBase64, description }),
  });

  if (!response.ok) {
    const errText = await response.text();
    let userMessage = "AI analysis service is temporarily unavailable.";
    let errorDetails = {};

    try {
      const errJson = JSON.parse(errText);

      if (response.status === 429) {
        userMessage =
          errJson.error?.message ||
          "Daily analysis limit reached (20). Try again tomorrow.";
        errorDetails = {
          code: 429,
          retryDelay: errJson.error?.details?.[2]?.retryDelay,
          quotaMetric:
            errJson.error?.details?.[1]?.violations?.[0]?.quotaMetric,
        };
      } else if (response.status === 503) {
        userMessage = "AI service is busy. Please try again in a moment.";
        errorDetails = { code: 503 };
      }
    } catch (parseErr) {
      errorDetails = { rawError: errText };
    }

    const apiError = new Error(userMessage);
    (apiError as any).userMessage = userMessage;
    (apiError as any).details = errorDetails;
    throw apiError;
  }
  return response.json();
}

export async function analyzeMealDirect(
  imageBase64: string,
  apiKey: string,
  description?: string
) {
  const ai = new GoogleGenAI({
    apiKey: apiKey,
  });
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

  try {
    return JSON.parse(output);
  } catch {
    return { error: "AI returned invalid JSON", raw: output };
  }
}
