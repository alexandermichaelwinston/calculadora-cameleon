const allowedOrigins = new Set([
  "https://calculadora-network.netlify.app",
  "https://real-deals.app",
  "https://www.real-deals.app",
  "https://realdeals-crm.netlify.app",
  "https://real-deals-feature-preview.roomstay.chatgpt.site",
]);

export default async (request: Request) => {
  const key = Netlify.env.get("GOOGLE_MAPS_BROWSER_KEY");
  const mapId = Netlify.env.get("GOOGLE_MAPS_MAP_ID");
  const origin = request.headers.get("origin");
  const headers: Record<string, string> = {
    "Cache-Control": "no-store",
    "Vary": "Origin",
  };

  if (origin && allowedOrigins.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }

  return Response.json({ key: key || null, mapId: mapId || null }, { headers });
};
export const config = { path: "/api/maps-config" };
