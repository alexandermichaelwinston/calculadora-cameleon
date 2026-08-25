export default async (req: Request) => {
  const url = new URL(req.url);
  const term = (url.searchParams.get("query") || "restaurants").trim();
  const location = (url.searchParams.get("location") || "Houston, TX").trim();
  const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || 12), 1), 20);
  const latitude = url.searchParams.get("latitude");
  const longitude = url.searchParams.get("longitude");
  const radius = Math.min(Math.max(Number(url.searchParams.get("radius") || 16000), 1000), 40000);
  const sortBy = ["best_match","rating","review_count","distance"].includes(url.searchParams.get("sort_by") || "") ? url.searchParams.get("sort_by")! : "best_match";
  const key = Netlify.env.get("YELP_API_KEY");

  if (!key) return Response.json({ configured: false, business: null, businesses: [] });

  const params = new URLSearchParams({ term, limit: String(limit), sort_by: sortBy });
  if (latitude && longitude) {
    params.set("latitude", latitude);
    params.set("longitude", longitude);
    params.set("radius", String(radius));
  } else {
    params.set("location", location);
  }

  const r = await fetch(`https://api.yelp.com/v3/businesses/search?${params.toString()}`, {
    headers: { Authorization: `Bearer ${key}` }
  });
  if (!r.ok) return Response.json({ error: "Yelp request failed", status: r.status }, { status: 502 });
  const d = await r.json();

  const businesses = (d.businesses || []).map((b: any) => ({
    id: b.id,
    name: b.name,
    rating: b.rating,
    reviewCount: b.review_count,
    url: b.url,
    imageUrl: b.image_url,
    price: b.price,
    phone: b.display_phone || b.phone || null,
    latitude: b.coordinates?.latitude ?? null,
    longitude: b.coordinates?.longitude ?? null,
    address: b.location?.display_address?.join(", ") || null,
    city: b.location?.city || null,
    zip: b.location?.zip_code || null,
    categories: (b.categories || []).map((c: any) => ({ alias: c.alias, title: c.title })),
    distanceMeters: b.distance ?? null,
    isClosed: Boolean(b.is_closed)
  }));

  return Response.json({
    configured: true,
    business: businesses[0] || null,
    businesses,
    total: d.total || businesses.length,
    region: d.region || null,
    query: { term, location, limit, sortBy }
  }, { headers: { "Cache-Control": "public, max-age=300" } });
};

export const config = { path: "/api/yelp-place" };
