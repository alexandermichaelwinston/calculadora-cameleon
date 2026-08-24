const fs = require('fs');
const path = require('path');

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
console.log('Calculadora social artwork and El Camaleón navigation enriched.');
