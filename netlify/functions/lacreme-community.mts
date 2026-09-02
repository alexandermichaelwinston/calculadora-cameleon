import { getStore } from "@netlify/blobs";

// Keep the legacy store name so every existing community pin survives the public rename.
function store() {
  return getStore("lacrema-community", { consistency: "strong" });
}

function normalizeItem(value: any) {
  if (!value || typeof value !== "object") return value;
  return { ...value, source: "La Creme community" };
}

export default async (req: Request) => {
  if (req.method === "GET") {
    const s = store();
    const { blobs } = await s.list({ prefix: "pin-" });
    const items = [];
    for (const blob of blobs.slice(-150).reverse()) {
      const value = await s.get(blob.key, { type: "json" });
      if (value) items.push(normalizeItem(value));
    }
    return Response.json({ items });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await req.json().catch(() => null);
  const name = String(body?.name || "").trim().slice(0, 120);
  const address = String(body?.address || "").trim().slice(0, 180);
  const note = String(body?.note || "").trim().slice(0, 700);
  const displayName = String(body?.displayName || "").trim().slice(0, 80);
  const category = String(body?.category || "").trim().slice(0, 80);
  const allowedKinds = ["food", "date", "nightlife", "art", "music", "market", "outdoors", "experience"];
  const kind = allowedKinds.includes(String(body?.kind)) ? String(body.kind) : "food";
  const chiles = Math.max(1, Math.min(5, Number(body?.chiles || 5)));

  if (!name || !address) {
    return Response.json({ error: "Name and address are required." }, { status: 400 });
  }

  let latitude = null;
  let longitude = null;
  let googleMapsUri = null;
  const key = Netlify.env.get("GOOGLE_PLACES_API_KEY");

  if (key) {
    try {
      const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": key,
          "X-Goog-FieldMask": "places.location,places.googleMapsUri"
        },
        body: JSON.stringify({
          textQuery: `${name}, ${address}`,
          maxResultCount: 1,
          locationBias: {
            circle: {
              center: { latitude: 29.7604, longitude: -95.3698 },
              radius: 120000
            }
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const place = data.places?.[0];
        latitude = place?.location?.latitude ?? null;
        longitude = place?.location?.longitude ?? null;
        googleMapsUri = place?.googleMapsUri ?? null;
      }
    } catch {
      // Community submission remains usable when Google geocoding is unavailable.
    }
  }

  const createdAt = new Date().toISOString();
  const item = {
    id: `community-${Date.now()}-${crypto.randomUUID()}`,
    name,
    address,
    note,
    displayName,
    category,
    kind,
    chiles,
    latitude,
    longitude,
    googleMapsUri,
    createdAt,
    source: "La Creme community"
  };

  await store().setJSON(`pin-${Date.now()}-${crypto.randomUUID()}`, item);
  return Response.json({ ok: true, item }, { status: 201 });
};

export const config = { path: "/api/lacreme-community" };
