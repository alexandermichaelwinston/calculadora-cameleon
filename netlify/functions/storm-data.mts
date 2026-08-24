export default async (req: Request) => {
  const url = new URL(req.url);
  const lat = Number(url.searchParams.get('lat'));
  const lon = Number(url.searchParams.get('lon'));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return Response.json({error:'Valid lat/lon required'}, {status:400});

  const headers = { 'User-Agent': 'Calculadora Storm Mode (public utility; contact via site)' };
  let alerts:any[] = [], shelters:any[] = [];
  try {
    const r = await fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`, {headers});
    if (r.ok) {
      const d:any = await r.json();
      alerts = (d.features || []).slice(0,20).map((f:any)=>({
        event:f.properties?.event, severity:f.properties?.severity, urgency:f.properties?.urgency,
        headline:f.properties?.headline, description:f.properties?.description,
        instruction:f.properties?.instruction, areaDesc:f.properties?.areaDesc,
        onset:f.properties?.onset, ends:f.properties?.ends, web:f.id
      }));
    }
  } catch {}

  try {
    const q = new URL('https://gis.fema.gov/arcgis/rest/services/NSS/FEMA_NSS/FeatureServer/0/query');
    q.searchParams.set('where','1=1');
    q.searchParams.set('geometry',`${lon},${lat}`);
    q.searchParams.set('geometryType','esriGeometryPoint');
    q.searchParams.set('inSR','4326');
    q.searchParams.set('spatialRel','esriSpatialRelIntersects');
    q.searchParams.set('distance','150');
    q.searchParams.set('units','esriSRUnit_StatuteMile');
    q.searchParams.set('outFields','*');
    q.searchParams.set('returnGeometry','true');
    q.searchParams.set('outSR','4326');
    q.searchParams.set('f','json');
    const r = await fetch(q);
    if (r.ok) {
      const d:any = await r.json();
      shelters = (d.features || []).slice(0,30).map((f:any)=>({attributes:f.attributes||{},geometry:f.geometry||{}}));
    }
  } catch {}

  return Response.json({
    generatedAt:new Date().toISOString(), location:{lat,lon}, alerts, shelters,
    sources:{weather:'National Weather Service', shelters:'FEMA ESF#6 Shelter System', water:'USGS Water Data for the Nation'}
  }, {headers:{'Cache-Control':'public, max-age=60'}});
};
export const config = { path: '/api/storm-data' };
