const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=300" },
});

export default async (req: Request) => {
  const url = new URL(req.url);
  const latitude = Number(url.searchParams.get("latitude"));
  const longitude = Number(url.searchParams.get("longitude"));
  const radius = Math.min(30000, Math.max(1000, Number(url.searchParams.get("radius") || 16000)));
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return json({ error: "Valid latitude and longitude are required." }, 400);
  }
  const query = `[out:json][timeout:15];(node["amenity"="fuel"](around:${Math.round(radius)},${latitude},${longitude});way["amenity"="fuel"](around:${Math.round(radius)},${latitude},${longitude}););out center tags 60;`;
  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded", "user-agent": "AmigoGas/1.0" },
      body: new URLSearchParams({ data: query }),
      signal: AbortSignal.timeout(18000),
    });
    if (!response.ok) throw new Error(`Overpass ${response.status}`);
    const data: any = await response.json();
    const stations = (data.elements || []).map((item: any) => {
      const tags = item.tags || {}, lat = item.lat ?? item.center?.lat, lng = item.lon ?? item.center?.lon;
      return {
        id: `osm-${item.type}-${item.id}`,
        name: tags.brand || tags.name || tags.operator || "Fuel station",
        brand: tags.brand || tags.operator || tags.name || "Independent",
        address: [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ") || tags["addr:full"] || "",
        city: tags["addr:city"] || tags["addr:place"] || "", zip: tags["addr:postcode"] || "",
        latitude: Number(lat), longitude: Number(lng), open24Hours: tags.opening_hours === "24/7",
        source: "OpenStreetMap contributors",
      };
    }).filter((station: any) => Number.isFinite(station.latitude) && Number.isFinite(station.longitude));
    return json({ configured: true, stations, source: "OpenStreetMap/Overpass", attribution: "© OpenStreetMap contributors" });
  } catch {
    return json({ configured: false, stations: [], error: "Public station directory is temporarily unavailable." }, 502);
  }
};

export const config = { path: "/api/amigogas/stations" };
