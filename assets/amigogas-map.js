(()=>{
  const live=document.getElementById('live'); if(!live)return;
  const section=document.createElement('section');section.className='agMapSection';section.id='gas-map';
  section.innerHTML=`<div class="wrap"><div class="agMapHead"><div><h2>Find the best gas near you.</h2><p>AmigoGas now auto-locates nearby stations, ranks the five lowest known community prices by proximity, and puts price badges directly on the map. Move the map or change the radius to refresh.</p></div><div class="agMapTools"><button class="btn flame" id="agNearMe" type="button">📍 Use my location</button><a class="btn" target="_blank" rel="noopener nofollow" href="https://www.gasbuddy.com/home?search=Houston%2C%20TX">Compare on GasBuddy →</a></div></div><div class="agFinder"><div class="agControlCard"><div class="agControlRow"><div class="agField"><label>Search area</label><input id="agSearchLabel" value="Near my current location" readonly></div><div class="agField"><label>Fuel</label><select id="agGrade"><option value="regular">Regular</option><option value="midgrade">Midgrade</option><option value="premium">Premium</option><option value="diesel">Diesel</option></select></div><div class="agField"><label>Radius</label><select id="agRadius"><option value="5">5 miles</option><option value="10" selected>10 miles</option><option value="20">20 miles</option><option value="30">30 miles</option></select></div><button class="btn flame agLocate" id="agRefresh" type="button">Refresh prices</button></div><div class="agStats"><div class="agStat"><small>Lowest known</small><b id="agLow">—</b></div><div class="agStat"><small>Average known</small><b id="agAvg">—</b></div><div class="agStat"><small>Stations found</small><b id="agCount">—</b></div></div></div><div class="agBestCard"><div class="agBestHead"><b>🔥 Best 5 nearby</b><span id="agBestSub">Waiting for location…</span></div><div class="agBestList" id="agBestList"><div class="agBestItem"><div class="agNoPrice">Locating nearby stations…</div></div></div></div></div><div class="agMapShell"><div class="agMapStatus"><b>AmigoGas live station map</b><span id="agMapStatus">Loading nearby stations…</span></div><div id="amigoGasMap"></div></div><div class="notice"><strong>Price source:</strong> Prices shown inside AmigoGas are community-reported and may be stale or differ by payment method. Yelp is used only for nearby station discovery. GasBuddy and Google Maps remain independent external services. Always confirm the pump price before buying.</div></div>`;
  live.before(section);

  const savings=document.createElement('section');savings.className='agSavings';
  savings.innerHTML=`<div class="wrap"><div class="agMapHead"><div><h2>Save at the pump—and beyond.</h2><p>Compare fuel-reward cards, insurance options and operating costs through the Calculadora ecosystem. Partner links are labeled when an approved relationship exists.</p></div></div><div class="agOfferGrid"><a class="agOffer heroOffer" href="/creditcompare.html"><img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=82" alt="Credit card payment"><small>FUEL REWARDS · CREDIT CARD GUIDE</small><b>Turn everyday fill-ups into smarter rewards.</b><span>Compare reward structures, fees and redemption—not just the headline rate.</span><em>Explore CardCompare →</em></a><a class="agOffer" href="/insurequotes.html"><img src="https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=900&q=82" alt="Car on the road"><small>AUTO · HOME · LIFE · BUSINESS</small><b>Compare insurance with Tuff™.</b><span>Understand coverage categories and continue to licensed carriers or partners.</span><em>Open InsureCompare →</em></a><a class="agOffer" target="_blank" rel="noopener nofollow" href="https://www.gasbuddy.com/home?search=Houston%2C%20TX"><img src="https://images.unsplash.com/photo-1545262810-77515befe149?auto=format&fit=crop&w=900&q=82" alt="Fuel station"><small>LIVE EXTERNAL PRICE DISCOVERY</small><b>Cross-check GasBuddy before you drive.</b><span>Compare current third-party reports, then confirm the price at the pump.</span><em>Open GasBuddy →</em></a><a class="agOffer" href="/?utm_source=amigogas&utm_medium=ecosystem&utm_campaign=auto-cost"><img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=82" alt="Calculator and finance"><small>CALCULADORA ECOSYSTEM</small><b>Calculate the real cost of the car.</b><span>Payment, insurance, fuel and ownership costs belong in one decision.</span><em>Open Calculadora →</em></a></div><p class="agDisclosure"><b>Affiliate disclosure:</b> Some future outbound links may earn compensation after formal approval. Current editorial and internal comparison links are not represented as commissionable unless clearly labeled beside the link. Credit products require issuer approval; insurance is offered only through appropriately licensed providers.</p></div>`;
  section.after(savings);

  const leafletCss=document.createElement('link');leafletCss.rel='stylesheet';leafletCss.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';document.head.appendChild(leafletCss);
  const loadScript=()=>new Promise((ok,no)=>{if(window.L)return ok();const s=document.createElement('script');s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)});
  const norm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const miles=(a,b)=>{const R=3958.8,rad=x=>x*Math.PI/180,dLat=rad(b.lat-a.lat),dLon=rad(b.lng-a.lng),la1=rad(a.lat),la2=rad(b.lat);const h=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(h))};
  const age=iso=>{const m=Math.max(0,Math.floor((Date.now()-new Date(iso).getTime())/60000));if(m<60)return `${m}m ago`;const h=Math.floor(m/60);return h<24?`${h}h ago`:`${Math.floor(h/24)}d ago`};

  loadScript().then(()=>{
    const map=L.map('amigoGasMap').setView([29.7604,-95.3698],11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    const layer=L.layerGroup().addTo(map),status=document.getElementById('agMapStatus'),bestList=document.getElementById('agBestList'),gradeEl=document.getElementById('agGrade'),radiusEl=document.getElementById('agRadius');
    let timer,userPoint=null,stations=[],reports=[];

    async function loadReports(){try{const r=await fetch('/api/amigogas/reports',{cache:'no-store'}),d=await r.json();reports=Array.isArray(d.reports)?d.reports:[]}catch{reports=[]}}
    function bestReportFor(b){
      const bn=norm(b.name),ba=norm(b.address),grade=gradeEl.value;
      const candidates=reports.filter(r=>r.grade===grade&&(norm(r.station)===bn||bn.includes(norm(r.station))||norm(r.station).includes(bn)||(ba&&norm(r.address)&&ba.includes(norm(r.address)))));
      return candidates.sort((a,b)=>new Date(b.reportedAt)-new Date(a.reportedAt))[0]||null;
    }
    function renderBest(center){
      const radius=Number(radiusEl.value),known=[];
      stations.forEach(b=>{if(!b.latitude||!b.longitude)return;const distance=miles(center,{lat:b.latitude,lng:b.longitude});if(distance>radius)return;const report=bestReportFor(b);known.push({...b,distance,report})});
      known.sort((a,b)=>{const ap=a.report?Number(a.report.price):999,bp=b.report?Number(b.report.price):999;if(ap!==bp)return ap-bp;return a.distance-b.distance});
      const top=known.slice(0,5),priced=known.filter(x=>x.report);
      document.getElementById('agCount').textContent=known.length||'0';
      document.getElementById('agLow').textContent=priced.length?`$${Math.min(...priced.map(x=>Number(x.report.price))).toFixed(2)}`:'—';
      document.getElementById('agAvg').textContent=priced.length?`$${(priced.reduce((s,x)=>s+Number(x.report.price),0)/priced.length).toFixed(2)}`:'—';
      document.getElementById('agBestSub').textContent=priced.length?`${priced.length} known ${gradeEl.value} prices`:'No matched prices yet';
      if(!top.length){bestList.innerHTML='<div class="agBestItem"><div class="agNoPrice">No stations found inside this radius.</div></div>';return}
      bestList.innerHTML=top.map((x,i)=>{const q=encodeURIComponent(`${x.name} ${x.address||x.city||''}`);return `<a class="agBestItem" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${q}"><div class="agRank">${i+1}</div><div><div class="agStationName">${esc(x.name)}</div><div class="agStationMeta">${x.distance.toFixed(1)} mi · ${esc(x.address||x.city||'nearby')}</div></div><div class="agPrice">${x.report?'$'+Number(x.report.price).toFixed(2):'—'}<small>${x.report?age(x.report.reportedAt):'tap to check'}</small></div></a>`}).join('');
    }
    function draw(center){
      layer.clearLayers();
      stations.forEach(b=>{if(!b.latitude||!b.longitude)return;const report=bestReportFor(b),q=encodeURIComponent(`${b.name} ${b.address||b.city||'Houston TX'}`),photo=b.imageUrl||'https://images.unsplash.com/photo-1545262810-77515befe149?auto=format&fit=crop&w=600&q=78';
        const card=`<div class="agGasPreview"><img src="${photo}" alt="${esc(b.name)}"><b>${esc(b.name)}</b><br>${report?`<span class="agPriceBadge">$${Number(report.price).toFixed(2)} ${esc(report.grade)}</span><br>`:''}<strong>${b.rating||'—'}★ Yelp</strong> · ${b.reviewCount||0} reviews<br>${esc(b.address||'')}<div class="agMapLinks"><a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${q}">Directions →</a><a class="gasbuddy" target="_blank" rel="noopener nofollow" href="https://www.gasbuddy.com/home?search=${q}">Compare price →</a></div><div class="agSourceLine">${report?`AmigoGas community report · ${age(report.reportedAt)}`:'No matched AmigoGas price report yet'}</div></div>`;
        if(report){L.marker([b.latitude,b.longitude],{icon:L.divIcon({className:'agMarkerPrice',html:`<div>$${Number(report.price).toFixed(2)}</div>`,iconSize:[58,28],iconAnchor:[29,14]})}).addTo(layer).bindTooltip(card,{direction:'top',sticky:true,opacity:1}).bindPopup(card)}
        else L.circleMarker([b.latitude,b.longitude],{radius:7,color:'#fff',weight:2,fillColor:'#ff6b35',fillOpacity:.95}).addTo(layer).bindTooltip(card,{direction:'top',sticky:true,opacity:1}).bindPopup(card)
      });
      renderBest(center);
    }
    async function load(){
      const c=map.getCenter(),radiusMiles=Number(radiusEl.value),radiusMeters=Math.min(40000,Math.max(1600,Math.round(radiusMiles*1609.344)));status.textContent='Finding nearby stations and matching recent prices…';
      try{await loadReports();const r=await fetch(`/api/yelp-place?query=gas%20stations&latitude=${c.lat.toFixed(6)}&longitude=${c.lng.toFixed(6)}&radius=${radiusMeters}&limit=20&sort_by=distance`),d=await r.json();if(!d.configured)throw 0;stations=d.businesses||[];draw(userPoint||c);status.textContent=`${stations.length} nearby stations · ranked using known AmigoGas prices + distance`}
      catch{stations=[];renderBest(userPoint||c);status.textContent='Station data temporarily unavailable · external comparison links remain active'}
    }
    function locate(auto=false){
      if(!navigator.geolocation){status.textContent='Location is not supported in this browser.';return}
      status.textContent=auto?'Requesting your location for nearby prices…':'Locating you…';
      navigator.geolocation.getCurrentPosition(p=>{userPoint={lat:p.coords.latitude,lng:p.coords.longitude};map.setView([userPoint.lat,userPoint.lng],13);document.getElementById('agSearchLabel').value='Current location';load()},()=>{status.textContent='Location unavailable · showing Houston. Tap “Use my location” to retry.';load()},{enableHighAccuracy:false,timeout:8000,maximumAge:300000});
    }
    map.on('moveend',()=>{clearTimeout(timer);timer=setTimeout(load,500)});
    document.getElementById('agNearMe').addEventListener('click',()=>locate(false));
    document.getElementById('agRefresh').addEventListener('click',load);
    gradeEl.addEventListener('change',()=>{draw(userPoint||map.getCenter())});
    radiusEl.addEventListener('change',load);
    locate(true);
  }).catch(()=>{document.getElementById('agMapStatus').textContent='Map tiles could not load. Google and GasBuddy links remain active.'});
})();
