export default async (req: Request) => {
  const url = new URL(req.url);
  const term = (url.searchParams.get("query") || "").trim();
  const key = Netlify.env.get("YELP_API_KEY");
  if (!term) return Response.json({ error: "Missing query" }, { status: 400 });
  if (!key) return Response.json({ configured: false, business: null });
  const r = await fetch(`https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(term)}&location=${encodeURIComponent("Houston, TX")}&limit=1`, {
    headers: { Authorization: `Bearer ${key}` }
  });
  if (!r.ok) return Response.json({ error: "Yelp request failed", status: r.status }, { status: 502 });
  const d = await r.json(); const b = d.businesses?.[0];
  if (!b) return Response.json({ configured: true, business: null });
  return Response.json({ configured: true, business: { id:b.id,name:b.name,rating:b.rating,reviewCount:b.review_count,url:b.url,imageUrl:b.image_url,price:b.price }});
};
export const config = { path: "/api/yelp-place" };
