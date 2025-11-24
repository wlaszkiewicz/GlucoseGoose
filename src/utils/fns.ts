export const fetchLast24h = async (url: string, secret?: string) => {
  const query = `${url}&secret=${secret || ""}`;
  const res = await fetch(query);
  return res.json();
};

export const fetchSince = async (
  url: string,
  since: number,
  secret?: string
) => {
  const query = `${url}&since=${since}&secret=${secret || ""}`;
  const res = await fetch(query);
  return res.json();
};
