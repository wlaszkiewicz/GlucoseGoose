import {
  NightscoutBundleResponse,
  NightscoutTreatment,
} from "../types/nightscout";

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
