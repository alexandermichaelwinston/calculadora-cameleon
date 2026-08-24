import { getStore } from "@netlify/blobs";
function store(){ return getStore("lacrema-community", { consistency: "strong" }); }
export default async (req: Request) => {
  if (req.method === "GET") {
    const s = store(); const { blobs } = await s.list({ prefix: "pin-" });
    const items = [];
    for (const b of blobs.slice(-150).reverse()) {
      const v = await s.get(b.key, { type: "json" });
      if (v) items.push(v);
    }
    return Response.json({ items });
  }
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const body = await req.json().catch(()=>null);
  const name = String(body?.name || "").trim().slice(0,120);
  const address = String(body?.address || "").trim().slice(0,180);
  const note = String(body?.note || "").trim().slice(0,700);
  const displayName = String(body?.displayName || "").trim().slice(0,80);
  const category = String(body?.category || "").trim().slice(0,80);
  const kind = ["food","date","nightlife","art","music","market","outdoors","experience"].includes(String(body?.kind)) ? String(body.kind) : "food";
  const chiles = Math.max(1, Math.min(5, Number(body?.chiles || 5)));
  if (!name || !address) return Response.json({ error: "Name and address are required." }, { status: 400 });
  let latitude = null, longitude = null, googleMapsUri = null;
  const key = Netlify.env.get("GOOGLE_PLACES_API_KEY");
  if (key) {
    try {
      const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": "places.location,places.googleMapsUri" },
        body: JSON.stringify({ textQuery: `${name}, ${address}`, maxResultCount: 1, locationBias: { circle: { center: { latitude: 29.7604, longitude: -95.3698 }, radius: 120000 } } })
      });
      if (r.ok) {
        const d = await r.json(); const p = d.places?.[0];
        latitude = p?.location?.latitude ?? null; longitude = p?.location?.longitude ?? null; googleMapsUri = p?.googleMapsUri ?? null;
      }
    } catch {}
  }
  const createdAt = new Date().toISOString();
  const item = { name, address, note, displayName, category, kind, chiles, latitude, longitude, googleMapsUri, createdAt, source: "La Crema community" };
  await store().setJSON(`pin-${Date.now()}-${crypto.randomUUID()}`, item);
  return Response.json({ ok: true, item }, { status: 201 });
};
export const config = { path: "/api/lacrema-community" };
