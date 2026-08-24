import { getStore, getDeployStore } from '@netlify/blobs';

function stores(){
  const production = Netlify.context?.deploy?.context === 'production';
  return {
    usage: production ? getStore('signstac-usage',{consistency:'strong'}) : getDeployStore('signstac-usage'),
    records: production ? getStore('signstac-records',{consistency:'strong'}) : getDeployStore('signstac-records')
  };
}
async function sha256(input: string | ArrayBuffer){
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function weekKey(d=new Date()){
  const oneJan = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  const days = Math.floor((d.getTime()-oneJan.getTime())/86400000);
  const week = Math.ceil((days + oneJan.getUTCDay()+1)/7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2,'0')}`;
}
export default async (req: Request) => {
  if(req.method!=='POST') return new Response('Method not allowed',{status:405});
  const body:any = await req.json().catch(()=>null);
  const senderEmail = String(body?.senderEmail||'').trim().toLowerCase().slice(0,180);
  const signerName = String(body?.signerName||'').trim().slice(0,120);
  const signerEmail = String(body?.signerEmail||'').trim().toLowerCase().slice(0,180);
  const documentUrl = String(body?.documentUrl||'').trim().slice(0,800);
  const projectName = String(body?.projectName||'').trim().slice(0,180);
  const signature = String(body?.signature||'').trim().slice(0,240);
  const accepted = body?.accepted === true;
  if(!senderEmail || !signerName || !signerEmail || !documentUrl || !signature || !accepted){
    return Response.json({error:'Sender email, signer identity, document, signature and consent are required.'},{status:400});
  }
  let url:URL; try{ url=new URL(documentUrl); if(!['http:','https:'].includes(url.protocol)) throw 0; }catch{return Response.json({error:'Document URL must be a valid http(s) URL.'},{status:400})}
  const {usage,records}=stores();
  const senderHash = await sha256(senderEmail);
  const wk = weekKey();
  const usageKey=`${senderHash}-${wk}`;
  const prior:any = await usage.get(usageKey,{type:'json'});
  if(prior?.completed>=1){
    return Response.json({error:'Free weekly signing already used.',upgradeRequired:true,week:wk},{status:402});
  }
  let documentHash:string|null=null, documentBytes=0;
  try{
    const r=await fetch(documentUrl,{redirect:'follow'});
    if(r.ok){ const ab=await r.arrayBuffer(); documentBytes=ab.byteLength; documentHash=await sha256(ab); }
  }catch{}
  const now=new Date().toISOString();
  const id=crypto.randomUUID();
  const forwarded=req.headers.get('x-forwarded-for')||'';
  const record={id,projectName,senderEmail,signerName,signerEmail,documentUrl,documentHash,documentBytes,signature,acceptedAt:now,ipHint:forwarded.split(',')[0]?.trim()||null,userAgent:req.headers.get('user-agent')||null,consentText:'I agree to use an electronic signature and intend this signature to apply to the referenced document.',source:'Sign Stac'};
  await records.setJSON(`record-${now}-${id}`,record);
  await usage.setJSON(usageKey,{completed:(prior?.completed||0)+1,lastCompletedAt:now,week:wk});
  return Response.json({ok:true,record:{id,projectName,signerName,signerEmail,documentUrl,documentHash,acceptedAt:now},freeUsesRemaining:0,week:wk},{status:201});
};
export const config={path:'/api/signstac-sign'};
