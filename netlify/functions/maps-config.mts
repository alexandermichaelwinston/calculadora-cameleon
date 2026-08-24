export default async () => {
  const key = Netlify.env.get("GOOGLE_MAPS_BROWSER_KEY");
  const mapId = Netlify.env.get("GOOGLE_MAPS_MAP_ID");
  return Response.json({ key: key || null, mapId: mapId || null }, { headers: { "Cache-Control": "no-store" } });
};
export const config = { path: "/api/maps-config" };
