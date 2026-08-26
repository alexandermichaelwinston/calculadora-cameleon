import fs from 'node:fs';
import path from 'node:path';

const file = path.join(process.cwd(), 'index.html');
let html = fs.readFileSync(file, 'utf8');
const image = 'https://calculadora-network.netlify.app/assets/el-cameleon-social.jpg';

// Keep a single authoritative social image on the Calculadora homepage.
html = html.replace(/<meta\s+property=["']og:image(?::[^"']*)?["'][^>]*>\s*/gi, '');
html = html.replace(/<meta\s+name=["']twitter:image["'][^>]*>\s*/gi, '');

const socialMeta = `\n<meta property="og:url" content="https://calculadora-network.netlify.app/">\n<meta property="og:image" content="${image}">\n<meta property="og:image:secure_url" content="${image}">\n<meta property="og:image:type" content="image/jpeg">\n<meta property="og:image:width" content="600">\n<meta property="og:image:height" content="400">\n<meta property="og:image:alt" content="Calculadora and El Camaleón financial intelligence split-screen artwork">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="${image}">\n<style>\n/* Approved brand artwork: replace the old flat Camaleón tile without changing site structure. */\n.eco-art.camelon{background-image:url('/assets/el-cameleon-social.jpg')!important;background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important;}\n.eco-art.camelon svg{display:none!important;}\n</style>\n`;

html = html.replace('</head>', socialMeta + '</head>');

// Make the El Camaleón ecosystem CTA navigate to the dedicated Camaleón experience.
const navFix = `<script>(function(){document.querySelectorAll('a').forEach(function(a){var t=(a.textContent||'').trim();if(t.indexOf('Read El Camaleón')!==-1){a.href='/el-cameleon.html';}});})();<\/script>`;
html = html.replace('</body>', navFix + '</body>');

fs.writeFileSync(file, html);

// Extend La Crema without changing its established light-theme HTML design.
const laCremaFile = path.join(process.cwd(), 'lacrema-v2.html');
let laCrema = fs.readFileSync(laCremaFile, 'utf8');
const laCremaImage = 'https://calculadora-network.netlify.app/assets/la-crema-taco-social.jpg';
laCrema = laCrema.replace(/<meta\s+name=["']description["'][^>]*>/i, '<meta name="description" content="La Crema — Houston\'s hottest trending foodie spots + date night guide.">');
laCrema = laCrema.replace(/<meta\s+(?:property=["']og:[^"']+["']|name=["']twitter:[^"']+["'])[^>]*>\s*/gi, '');
laCrema = laCrema.replace('</head>', `
<meta property="og:title" content="La Crema — A Houston Original">
<meta property="og:description" content="Find the best taco in town—or nearest you—ASAP. GO! →">
<meta property="og:url" content="https://calculadora-network.netlify.app/lacrema.html">
<meta property="og:image" content="${laCremaImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="La Crema Houston taco guide artwork">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="La Crema — A Houston Original">
<meta name="twitter:description" content="Find the best taco in town—or nearest you—ASAP. GO! →">
<meta name="twitter:image" content="${laCremaImage}">
${laCrema.includes('/assets/lacrema-enhancements.css') ? '' : '<link rel="stylesheet" href="/assets/lacrema-enhancements.css">'}
${laCrema.includes('/assets/lacrema-business.css') ? '' : '<link rel="stylesheet" href="/assets/lacrema-business.css">'}
</head>`);
if (!laCrema.includes('/assets/lacrema-enhancements.js')) {
  laCrema = laCrema.replace('</body>', '<script src="/assets/lacrema-enhancements.js" defer><\/script></body>');
}
fs.writeFileSync(laCremaFile, laCrema);
console.log('Calculadora social artwork and El Camaleón navigation enriched.');
