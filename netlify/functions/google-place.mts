export default async (req: Request) => {
  const url = new URL(req.url);
  const query = (url.searchParams.get("query") || "").trim();
  if (!query) return Response.json({ error: "Missing query" }, { status: 400 });
  const key = Netlify.env.get("GOOGLE_PLACES_API_KEY");
  if (!key) return Response.json({ configured: false, place: null });
  const search = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.photos,places.googleMapsUri,places.googleMapsLinks"
    },
    body: JSON.stringify({ textQuery: query, maxResultCount: 1, locationBias: { circle: { center: { latitude: 29.7604, longitude: -95.3698 }, radius: 80000 } } })
  });
  if (!search.ok) return Response.json({ error: "Google Places request failed", status: search.status }, { status: 502 });
  const data = await search.json();
  const p = data.places?.[0];
  if (!p) return Response.json({ configured: true, place: null });
  let photoUri = null;
  const photoAttribution = p.photos?.[0]?.authorAttributions || [];
  if (p.photos?.[0]?.name) {
    const media = await fetch(`https://places.googleapis.com/v1/${p.photos[0].name}/media?maxWidthPx=900&skipHttpRedirect=true`, {
      headers: { "X-Goog-Api-Key": key }
    });
    if (media.ok) {
      const m = await media.json();
      photoUri = m.photoUri || null;
    }
  }
  return Response.json({ configured: true, place: {
    id: p.id,
    displayName: p.displayName?.text,
    formattedAddress: p.formattedAddress,
    latitude: p.location?.latitude,
    longitude: p.location?.longitude,
    rating: p.rating,
    userRatingCount: p.userRatingCount,
    googleMapsUri: p.googleMapsUri,
    writeAReviewUri: p.googleMapsLinks?.writeAReviewUri,
    reviewsUri: p.googleMapsLinks?.reviewsUri,
    photosUri: p.googleMapsLinks?.photosUri,
    photoUri,
    photoAttribution
  }});
};
export const config = { path: "/api/google-place" };
