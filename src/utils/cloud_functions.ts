import {
  NightscoutBundleResponse,
  NightscoutTreatment,
} from "../types/nightscout";

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
  cloudHost: string,
  nsUrl: string,
  secret: string = "",
  minutes: number = 1440, // default 24h,
  token: string
): Promise<NightscoutBundleResponse> {
  const query = `https://${cloudHost}/getNightscoutBundle?url=${nsUrl}&secret=${secret}&minutes=${minutes}`;

  const res = await fetch(query, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Error fetching bundle: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data as NightscoutBundleResponse;
}

export async function addTreatment(
  cloudHost: string,
  nsUrl: string,
  secret: string = "",
  treatment: NightscoutTreatment,
  token: string
) {
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
}

export async function updateTreatment(
  cloudHost: string,
  nsUrl: string,
  secret: string = "",
  treatment: NightscoutTreatment,
  token: string
) {
  treatment.enteredBy = "GlucoseGoose App";
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
}

export async function deleteTreatment(
  cloudHost: string,
  nsUrl: string,
  secret: string = "",
  treatment_id: string,
  token: string
) {
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
