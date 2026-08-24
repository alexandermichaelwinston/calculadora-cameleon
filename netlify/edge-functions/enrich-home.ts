import type { Context, Config } from "@netlify/edge-functions";

const shareImage = "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?auto=format&fit=crop&w=1200&h=630&q=82";

const injected = `
<link rel="canonical" href="https://calculadora-network.netlify.app/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Calculadora™ + El Camaleón™">
<meta property="og:title" content="Calculadora™ + El Camaleón™ | AI Financial Intelligence">
<meta property="og:description" content="Mortgage calculators, real-time market intelligence and practical tools designed to help you catch opportunity early.">
<meta property="og:url" content="https://calculadora-network.netlify.app/">
<meta property="og:image" content="${shareImage}">
<meta property="og:image:secure_url" content="${shareImage}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Calculadora and El Camaleón financial intelligence">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Calculadora™ + El Camaleón™">
<meta name="twitter:description" content="Calculate smarter. Adapt faster. Catch opportunity early.">
<meta name="twitter:image" content="${shareImage}">
<style id="photo-enrichment-v1">
.eco-art{background-size:cover!important;background-position:center!important;isolation:isolate}
.eco-art:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,18,36,.04),rgba(5,18,36,.18));z-index:1;pointer-events:none}
.eco-art svg{position:relative;z-index:2;opacity:.08;mix-blend-mode:screen}
.eco-grid .eco:nth-child(1) .eco-art{background-image:url('https://images.unsplash.com/photo-1591696205602-2f950c417cb9?auto=format&fit=crop&w=900&h=420&q=76')!important}
.eco-grid .eco:nth-child(2) .eco-art{background-image:url('https://images.unsplash.com/photo-1757361653037-dbf0d0a820ae?auto=format&fit=crop&w=900&h=420&q=76')!important}
.eco-grid .eco:nth-child(3) .eco-art{background-image:url('https://images.unsplash.com/photo-1591696205602-2f950c417cb9?auto=format&fit=crop&w=900&h=420&q=76')!important}
.eco-grid .eco:nth-child(4) .eco-art{background-image:url('https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=900&h=420&q=76')!important}
.eco-grid .eco:nth-child(6) .eco-art{background-image:url('https://images.unsplash.com/photo-1678903429948-0706fbbd5f6e?auto=format&fit=crop&w=900&h=420&q=76')!important}
.eco-grid .eco:nth-child(8) .eco-art{background-image:url('https://images.unsplash.com/photo-1750218193690-a7080620ba86?auto=format&fit=crop&w=900&h=420&q=76')!important}
.eco-grid .eco:nth-child(12) .eco-art{background:radial-gradient(circle at 72% 35%,#1db36f 0 6%,transparent 7%),linear-gradient(135deg,#071d18,#0d4b35)!important}
.eco-grid .eco:nth-child(12) .eco-art svg{opacity:1;filter:drop-shadow(0 0 9px rgba(255,108,44,.38))}
.eco{box-shadow:0 9px 25px rgba(13,31,53,.07)!important}
.eco:hover{box-shadow:0 18px 38px rgba(13,31,53,.18)!important}
</style>`;

export default async (_req: Request, context: Context) => {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.text();
  const cleaned = html
    .replace(/<meta property="og:image"[^>]*>/gi, "")
    .replace(/<meta property="og:image:secure_url"[^>]*>/gi, "")
    .replace(/<meta property="og:image:type"[^>]*>/gi, "")
    .replace(/<meta property="og:image:width"[^>]*>/gi, "")
    .replace(/<meta property="og:image:height"[^>]*>/gi, "")
    .replace(/<meta property="og:image:alt"[^>]*>/gi, "")
    .replace(/<meta name="twitter:image"[^>]*>/gi, "");

  const output = cleaned.replace("</head>", `${injected}\n</head>`);
  const headers = new Headers(response.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  return new Response(output, { status: response.status, headers });
};

export const config: Config = {
  path: ["/", "/index.html"]
};
