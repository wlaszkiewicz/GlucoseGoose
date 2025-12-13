import {
  NightscoutBundleResponse,
  NightscoutTreatment,
} from "../types/nightscout";
import { Platform } from "react-native";

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
export async function addTreatment(
  cloudHost: string,
  nsUrl: string,
  secret: string = "",
  treatment: NightscoutTreatment,
  token: string
) {
  if (Platform.OS === "web") {
    treatment.enteredBy = "GlucoseGoose App";
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

export async function analyzeMealCloud(
  imageBase64: string,
  cloudHost: string,
  token: string
) {
  const response = await fetch(`https://${cloudHost}/analyzeMeal`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageBase64 }),
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
