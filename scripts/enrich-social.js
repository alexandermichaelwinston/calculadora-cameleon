import fs from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";

const root = process.cwd();

function materialize() {
  const pageSource = path.join(root, "src", "lacreme.html.gz.b64");
  if (fs.existsSync(pageSource)) {
    const encoded = fs.readFileSync(pageSource, "utf8").trim();
    fs.writeFileSync(path.join(root, "lacreme.html"), gunzipSync(Buffer.from(encoded, "base64")));
    fs.unlinkSync(pageSource);
  }

  const imageSource = path.join(root, "assets", "la-creme-houston-social.png.b64");
  if (fs.existsSync(imageSource)) {
    const encoded = fs.readFileSync(imageSource, "utf8").trim();
    fs.writeFileSync(path.join(root, "assets", "la-creme-houston-social.png"), Buffer.from(encoded, "base64"));
    fs.unlinkSync(imageSource);
  }
}

function renamePublicBrand(text) {
  return text
    .replaceAll("/lacrema-v2.html", "/lacreme.html")
    .replaceAll("/lacrema-deals.html", "/lacreme-deals.html")
    .replaceAll("/lacrema-deals", "/lacreme-deals")
    .replaceAll("/lacrema-partners.html", "/lacreme-partners.html")
    .replaceAll("/lacrema-partners", "/lacreme-partners")
    .replaceAll("/lacrema.html", "/lacreme.html")
    .replaceAll("/api/lacrema-community", "/api/lacreme-community")
    .replaceAll("/api/lacrema-affiliates", "/api/lacreme-affiliates")
    .replaceAll("/assets/la-crema-taco-social-final.jpg", "/assets/la-creme-houston-social.png")
    .replaceAll("/assets/la-crema-taco-social.jpg", "/assets/la-creme-houston-social.png")
    .replaceAll("/assets/el-cameleon-card-la-crema.svg", "/assets/el-cameleon-card-la-creme.svg")
    .replaceAll("LA CREMA", "LA CREME")
    .replaceAll("La Crema", "La Creme")
    .replaceAll("la crema", "la creme");
}

materialize();

// Preserve the existing Calculadora homepage social artwork behavior.
const homeFile = path.join(root, "index.html");
if (fs.existsSync(homeFile)) {
  let home = fs.readFileSync(homeFile, "utf8");
  const image = "https://calculadora-network.netlify.app/assets/el-cameleon-social.jpg";
  home = home.replace(/<meta\s+property=["']og:image(?::[^"']*)?["'][^>]*>\s*/gi, "");
  home = home.replace(/<meta\s+name=["']twitter:image["'][^>]*>\s*/gi, "");
  home = home.replace("</head>", `
<meta property="og:url" content="https://calculadora-network.netlify.app/">
<meta property="og:image" content="${image}">
<meta property="og:image:secure_url" content="${image}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="600">
<meta property="og:image:height" content="400">
<meta property="og:image:alt" content="Calculadora and El Camaleón financial intelligence split-screen artwork">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${image}">
<style>.eco-art.camelon{background-image:url('/assets/el-cameleon-social.jpg')!important;background-size:cover!important;background-position:center!important;background-repeat:no-repeat!important}.eco-art.camelon svg{display:none!important}</style>
</head>`);
  fs.writeFileSync(homeFile, home);
}

// Normalize all root HTML so portfolio cards and navigation use the new public brand.
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
  const file = path.join(root, entry.name);
  fs.writeFileSync(file, renamePublicBrand(fs.readFileSync(file, "utf8")));
}

// Generate canonical companion pages from the retained legacy source pages.
for (const [legacy, canonical] of [
  ["lacrema-deals.html", "lacreme-deals.html"],
  ["lacrema-partners.html", "lacreme-partners.html"]
]) {
  const source = path.join(root, legacy);
  if (fs.existsSync(source)) {
    fs.writeFileSync(path.join(root, canonical), renamePublicBrand(fs.readFileSync(source, "utf8")));
  }
}

// Keep an updated canonical ecosystem tile while retaining the old source filename for compatibility.
const legacyTile = path.join(root, "assets", "el-cameleon-card-la-crema.svg");
if (fs.existsSync(legacyTile)) {
  fs.writeFileSync(
    path.join(root, "assets", "el-cameleon-card-la-creme.svg"),
    renamePublicBrand(fs.readFileSync(legacyTile, "utf8"))
  );
}

console.log("La Creme canonical pages, artwork and compatibility routes prepared.");
