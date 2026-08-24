import { getStore, getDeployStore } from '@netlify/blobs';
function store(){
  const production = Netlify.context?.deploy?.context === 'production';
  return production ? getStore('storm-community', {consistency:'strong'}) : getDeployStore('storm-community');
}
export default async (req: Request) => {
  const s = store();
  if (req.method === 'GET') {
    const {blobs} = await s.list({prefix:'report-'});
    const items:any[] = [];
    for (const b of blobs.slice(-150).reverse()) {
      const v = await s.get(b.key, {type:'json'});
      if (v) items.push(v);
    }
    return Response.json({items});
  }
  if (req.method !== 'POST') return new Response('Method not allowed', {status:405});
  const body:any = await req.json().catch(()=>null);
  const type = String(body?.type||'').trim().slice(0,40);
  const place = String(body?.place||'').trim().slice(0,140);
  const address = String(body?.address||'').trim().slice(0,180);
  const status = String(body?.status||'').trim().slice(0,120);
  const note = String(body?.note||'').trim().slice(0,500);
  const displayName = String(body?.displayName||'').trim().slice(0,80);
  const lat = Number(body?.latitude), lon = Number(body?.longitude);
  if (!type || !place || !status) return Response.json({error:'Type, place, and current status are required.'},{status:400});
  const item = {type, place, address, status, note, displayName, latitude:Number.isFinite(lat)?lat:null, longitude:Number.isFinite(lon)?lon:null, createdAt:new Date().toISOString(), source:'Community report — unverified'};
  await s.setJSON(`report-${Date.now()}-${crypto.randomUUID()}`, item);
  return Response.json({ok:true,item},{status:201});
};
export const config = { path: '/api/storm-community' };
