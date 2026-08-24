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
<style id="photo-enrichment-v2">
.eco-art{background-size:cover!important;background-position:center!important;isolation:isolate;min-height:140px}
.eco-art:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,18,36,.03),rgba(5,18,36,.24));z-index:1;pointer-events:none}
.eco-art svg{position:relative;z-index:2;opacity:.05;mix-blend-mode:screen}
.eco-grid .eco:nth-child(1) .eco-art{background-image:url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=900&h=520&q=82')!important}
.eco-grid .eco:nth-child(2) .eco-art{background-image:url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&h=520&q=82')!important}
.eco-grid .eco:nth-child(3) .eco-art{background-image:url('https://images.unsplash.com/photo-1591696205602-2f950c417cb9?auto=format&fit=crop&w=900&h=520&q=82')!important}
.eco-grid .eco:nth-child(4) .eco-art{background-image:url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&h=520&q=82')!important}
.eco-grid .eco:nth-child(5) .eco-art{background-image:url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=900&h=520&q=82')!important}
.eco-grid .eco:nth-child(6) .eco-art{background-image:url('https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=900&h=520&q=82')!important}
.eco-grid .eco:nth-child(7) .eco-art{background-image:url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&h=520&q=82')!important}
.eco-grid .eco:nth-child(8) .eco-art{background-image:url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&h=520&q=82')!important}
.eco-grid .eco:nth-child(9) .eco-art{background-image:url('https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&h=520&q=82')!important}
.eco-grid .eco:nth-child(10) .eco-art{background-image:url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&h=520&q=82')!important}
.eco-grid .eco:nth-child(11) .eco-art{background-image:url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&h=520&q=82')!important}
.eco-grid .eco:nth-child(12) .eco-art{background:radial-gradient(circle at 72% 35%,#1db36f 0 6%,transparent 7%),linear-gradient(135deg,#071d18,#0d4b35)!important}
.eco-grid .eco:nth-child(12) .eco-art svg{opacity:1;filter:drop-shadow(0 0 9px rgba(255,108,44,.42))}
.eco{box-shadow:0 9px 25px rgba(13,31,53,.07)!important;transition:transform .22s ease,box-shadow .22s ease!important}
.eco:hover{transform:translateY(-4px)!important;box-shadow:0 18px 38px rgba(13,31,53,.18)!important}
.news .pic{font-size:0!important;background-size:cover!important;background-position:center!important;position:relative;min-height:190px}
.news .pic:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(7,20,38,.02),rgba(7,20,38,.22))}
.news-grid .news:nth-child(1) .pic{background-image:url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&h=620&q=84')!important}
.news-grid .news:nth-child(2) .pic{background-image:url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&h=620&q=84')!important}
.news-grid .news:nth-child(3) .pic{background-image:url('https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&h=620&q=84')!important}
.news{box-shadow:0 10px 28px rgba(13,31,53,.09)!important}
.news h4{letter-spacing:-.01em}
@media(max-width:620px){.eco-art{min-height:175px}.news .pic{min-height:235px}.eco-body{padding:19px!important}.eco h4{font-size:20px!important}.eco p{font-size:13px!important;line-height:1.55!important}}
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
