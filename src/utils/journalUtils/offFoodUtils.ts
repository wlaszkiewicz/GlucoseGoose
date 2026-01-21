const OFF_BASE_URL = "https://world.openfoodfacts.org";

const DEFAULT_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
  "User-Agent": "GlucoseGoose/1.0 (expo)",
};

export async function getFoodProduct(ean: string) {
  const url = `${OFF_BASE_URL}/api/v0/product/${ean}.json`;

  const res = await fetch(url, { headers: DEFAULT_HEADERS });
  const json = await res.json();

  if (json.status === 0) return null;
  return json.product;
}
