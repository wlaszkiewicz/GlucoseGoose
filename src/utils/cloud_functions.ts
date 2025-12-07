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
  const res = await fetch(`https://${cloudHost}/analyzeMeal`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageBase64 }),
  });

  if (!res.ok) throw new Error("Failed to analyze meal: " + res.statusText);
  return res.json();
}
