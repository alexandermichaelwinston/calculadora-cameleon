import { getStore, getDeployStore } from '@netlify/blobs';
function store(){const prod=Netlify.context?.deploy?.context==='production';return prod?getStore('realdeals-leads',{consistency:'strong'}):getDeployStore('realdeals-leads')}
export default async (req:Request)=>{
 const s=store();
 if(req.method==='GET'){
  const {blobs}=await s.list({prefix:'lead-'}); const items:any[]=[];
  for(const b of blobs.slice(-300).reverse()){const v=await s.get(b.key,{type:'json'});if(v)items.push(v)}
  return Response.json({items});
 }
 if(req.method!=='POST') return new Response('Method not allowed',{status:405});
 const b:any=await req.json().catch(()=>null);
 const address=String(b?.address||'').trim().slice(0,220), note=String(b?.note||'').trim().slice(0,1000), status=String(b?.status||'New lead').trim().slice(0,60), tags=String(b?.tags||'').trim().slice(0,240), source=String(b?.source||'Driving for dollars').trim().slice(0,80), contact=String(b?.contact||'').trim().slice(0,160);
 const lat=Number(b?.latitude),lon=Number(b?.longitude);
 if(!address)return Response.json({error:'Property address is required.'},{status:400});
 let latitude=Number.isFinite(lat)?lat:null,longitude=Number.isFinite(lon)?lon:null,googleMapsUri=null;
 const key=Netlify.env.get('GOOGLE_PLACES_API_KEY');
 if(key && (!latitude||!longitude)){
  try{const r=await fetch('https://places.googleapis.com/v1/places:searchText',{method:'POST',headers:{'Content-Type':'application/json','X-Goog-Api-Key':key,'X-Goog-FieldMask':'places.location,places.googleMapsUri'},body:JSON.stringify({textQuery:address,maxResultCount:1,locationBias:{circle:{center:{latitude:29.7604,longitude:-95.3698},radius:200000}}})});if(r.ok){const d:any=await r.json(),p=d.places?.[0];latitude=p?.location?.latitude??latitude;longitude=p?.location?.longitude??longitude;googleMapsUri=p?.googleMapsUri??null}}catch{}
 }
 const item={id:crypto.randomUUID(),address,note,status,tags:tags.split(',').map((x:string)=>x.trim()).filter(Boolean).slice(0,12),source,contact,latitude,longitude,googleMapsUri,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()};
 await s.setJSON(`lead-${Date.now()}-${item.id}`,item); return Response.json({ok:true,item},{status:201});
};
export const config={path:'/api/realdeals-leads'};
