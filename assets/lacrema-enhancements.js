(() => {
  const tagline = "Houston's hottest trending foodie spots + date night guide";
  const topTagline = document.querySelector('.top .wrap span');
  if (topTagline) topTagline.textContent = `🔥 La Crema — ${tagline}`;
  const heroEyebrow = document.querySelector('.heroCopy .eyebrow');
  if (heroEyebrow) heroEyebrow.textContent = 'HOUSTON · TRENDING FOOD · DATE NIGHT';
  const links = [
    {k:'WINE + PAIRINGS',n:'Wine.com',d:'Shop bottles for date night and La Crema pairing guides.',u:'https://www.wine.com/',i:'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=900&q=80'},
    {k:'FUEL SAVINGS',n:'GasBuddy',d:'Compare nearby gas prices before crossing Houston for dinner.',u:'https://www.gasbuddy.com/',i:'https://images.unsplash.com/photo-1545262810-77515befe149?auto=format&fit=crop&w=900&q=80'},
    {k:'AUCTION TECH',n:'Bid Stac',d:'Smart bidding and project workflows from the Calculadora ecosystem.',u:'/?utm_source=lacrema&utm_medium=ecosystem&utm_campaign=bid-stac',i:'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=900&q=80'},
    {k:'INTELLIGENCE',n:'El Camaleón',d:'Business, markets and Houston intelligence for adaptable builders.',u:'/el-cameleon.html',i:'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80'},
    {k:'LOCAL MARKET',n:'La Pulga',d:'Buy, sell, trade and discover opportunities around town.',u:'/lapulga.html',i:'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80'},
    {k:'MONEY TOOLS',n:'Calculadora',d:'Plan the payment, compare costs and explore the full ecosystem.',u:'/',i:'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=80'}
  ];
  const channels = [
    {n:'ArnieTex',t:'Texas barbecue + grilling',u:'https://www.youtube.com/@ArnieTex',i:'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=900&q=80'},
    {n:'La Capital',t:'Cooking · tacos · comfort food',u:'https://www.youtube.com/results?search_query=La+Capital+cocina+Oscar+Meza',i:'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80'},
    {n:'Mark Wiens',t:'Food travel + street eats',u:'https://www.youtube.com/@MarkWiens',i:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80'},
    {n:"Grizzy's Hood News",t:'Houston local news + chisme',u:'https://www.youtube.com/results?search_query=Grizzy%27s+Hood+News',i:'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=900&q=80'}
  ];
  const root = document.querySelector('main');
  if (root && !document.querySelector('#lcPartners')) {
    const partner = document.createElement('section');
    partner.id='lcPartners'; partner.className='lcSection';
    partner.innerHTML=`<div class="wrap"><div class="lcHead"><div><span class="eyebrow">FEATURED LINKS · SAVINGS · DISCOVERY</span><h2>The La Crema ecosystem.</h2></div><p>Useful next stops for wine, fuel savings, local commerce, bidding tools and smarter money decisions. Sponsored and affiliate placements will always be labeled.</p></div><div class="lcGrid">${links.map(x=>`<a class="lcCard" href="${x.u}" ${x.u.startsWith('http')?'target="_blank" rel="noopener sponsored nofollow"':''}><img src="${x.i}" alt=""><div class="lcCardBody"><small>${x.k}</small><h3>${x.n}</h3><p>${x.d}</p><span class="lcAction">Explore →</span></div></a>`).join('')}</div><div class="lcAdRow"><div class="lcAd"><b>Google display placement ready</b><br>Activates only after AdSense approval and a valid publisher ID.</div><div class="lcAd"><b>Partner spotlight</b><br>Direct Houston sponsorship inventory.</div></div><p class="lcDisclosure"><b>Disclosure:</b> La Crema may earn compensation from clearly labeled affiliate or sponsored links. Ordinary editorial links are not represented as commissionable.</p></div>`;
    root.appendChild(partner);
    const watch = document.createElement('section');
    watch.className='lcSection alt';
    watch.innerHTML=`<div class="wrap"><div class="lcHead"><div><span class="eyebrow">WATCH · EAT · EXPLORE · CHISME</span><h2>La Crema channel shelf.</h2></div><p>Food technique, Texas fire, travel inspiration and Houston street-level conversation.</p></div><div class="lcChannels">${channels.map(x=>`<a class="lcChannel" href="${x.u}" target="_blank" rel="noopener"><img src="${x.i}" alt=""><div><b>${x.n}</b><span>▶ ${x.t}</span></div></a>`).join('')}</div></div>`;
    root.appendChild(watch);
  }
  const mapEl=document.getElementById('googleMap');
  if (!mapEl) return;
  setTimeout(async()=>{
    if (window.google?.maps || mapEl.querySelector('.gm-style')) return;
    const css=document.createElement('link'); css.rel='stylesheet'; css.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(css);
    await new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';s.onload=ok;s.onerror=no;document.head.appendChild(s)}).catch(()=>{});
    if (!window.L) return;
    mapEl.style.display='block';
    mapEl.style.position='relative';
    mapEl.style.padding='0';
    mapEl.innerHTML='<div id="lcFallbackMap" class="lcFallbackMap" style="width:100%"></div><div class="lcFallbackNote"><b>Interactive Houston map</b><br>OpenStreetMap is active now. Google layers activate when the restricted key is connected.</div>';
    const map=L.map('lcFallbackMap').setView([29.7604,-95.3698],11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    [{n:'Tatemó',p:[29.748,-95.412],e:'🔥'},{n:"Hugo's",p:[29.770,-95.397],e:'🌮'},{n:'JŪN',p:[29.803,-95.399],e:'🔥'},{n:'Downtown date night',p:[29.756,-95.363],e:'❤️'},{n:'Houston food halls',p:[29.744,-95.365],e:'📍'}].forEach(x=>L.marker(x.p).addTo(map).bindPopup(`<b>${x.e} ${x.n}</b><br><a target="_blank" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(x.n+' Houston Texas')}">Open directions →</a>`));
    const status=document.getElementById('mapStatus');
    let yelpLayer=L.layerGroup().addTo(map), yelpTimer;
    const fireScore=b=>{
      const quality=Math.max(0,Math.min(40,(Number(b.rating)||0)/5*40));
      const confidence=Math.min(25,Math.log10((Number(b.reviewCount)||0)+1)/4*25);
      const heat=Math.min(20,(Number(b.reviewCount)||0)/500*20);
      const discovery=(b.imageUrl?8:0)+(b.isClosed?0:7);
      const score=Math.round(quality+confidence+heat+discovery);
      return {score,chiles:Math.max(1,Math.min(5,Math.ceil(score/20)))};
    };
    const populateYelp=async()=>{
      if(map.getZoom()<10){yelpLayer.clearLayers();if(status)status.textContent='Zoom in to discover Yelp-powered FIRE ratings';return;}
      const c=map.getCenter(), edge=map.getBounds().getNorthEast();
      const radius=Math.round(Math.max(1000,Math.min(40000,map.distance(c,edge))));
      if(status)status.textContent='Finding FIRE-rated restaurants in this map area…';
      try{
        const r=await fetch(`/api/yelp-place?query=restaurants&latitude=${c.lat.toFixed(6)}&longitude=${c.lng.toFixed(6)}&radius=${radius}&limit=20&sort_by=rating`);
        const d=await r.json();
        if(!d.configured)throw new Error('Yelp connection pending');
        yelpLayer.clearLayers();
        (d.businesses||[]).forEach(b=>{
          if(!b.latitude||!b.longitude)return;
          const f=fireScore(b), icon=L.divIcon({className:'lcFirePin',html:`<span>${'🌶️'.repeat(f.chiles)}</span>`,iconSize:[50,28],iconAnchor:[25,14]});
          const categories=(b.categories||[]).map(x=>x.title).slice(0,2).join(' · ');
          L.marker([b.latitude,b.longitude],{icon}).addTo(yelpLayer).bindPopup(`<b>${b.name}</b><br><strong>La Crema FIRE ${f.score}/100 · ${'🌶️'.repeat(f.chiles)}</strong><br>Yelp ${b.rating||'—'}★ · ${b.reviewCount||0} reviews<br>${categories}<br><a href="${b.url}" target="_blank" rel="noopener nofollow">View on Yelp →</a><br><small>Yelp data · FIRE is La Crema's score</small>`);
        });
        if(status)status.textContent=`${(d.businesses||[]).length} Yelp-powered FIRE spots · move or zoom to refresh`;
      }catch(err){if(status)status.textContent='Curated map live · Yelp refresh temporarily unavailable';}
    };
    map.on('moveend',()=>{clearTimeout(yelpTimer);yelpTimer=setTimeout(populateYelp,500)});
    populateYelp();
  },2200);
})();
