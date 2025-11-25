export const fetchLast24h = async (url: string, secret?: string) => {
  try {
    const query = `${url}&secret=${secret || ""}`;
    const res = await fetch(query);

    if (!res.ok) {
      throw new Error(
        `Error fetching last 24h: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();
    if (!Array.isArray(data))
      throw new Error("Invalid data format from server");
    return data;
  } catch (err: any) {
    console.error("fetchLast24h failed", err);
    throw err;
  }
};

export const fetchSince = async (
  url: string,
  since: number,
  secret?: string
) => {
  try {
    const query = `${url}&since=${since}&secret=${secret || ""}`;
    const res = await fetch(query);

    if (!res.ok) {
      throw new Error(
        `Error fetching updates: ${res.status} ${res.statusText}`
      );
    }

    const data = await res.json();
    if (!Array.isArray(data))
      throw new Error("Invalid data format from server");
    return data;
  } catch (err: any) {
    console.error("fetchSince failed", err);
    throw err;
  }
};
