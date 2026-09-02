import fs from "node:fs";
import path from "node:path";

const file = path.join(process.cwd(), "lacreme.html");

function replaceRequired(text, before, after, label) {
  if (!text.includes(before)) throw new Error(`La Creme map patch missing: ${label}`);
  return text.replace(before, after);
}

if (!fs.existsSync(file)) throw new Error("La Creme canonical page was not generated.");
let page = fs.readFileSync(file, "utf8");

page = replaceRequired(
  page,
  '    activeProvider = "open";\n    elements.googleLayer.hidden = true;\n',
  '    activeProvider = "open";\n    elements.googleLayer.hidden = true;\n    elements.googleLayer.style.visibility = "";\n',
  "open-map visibility reset"
);

page = replaceRequired(
  page,
  '    elements.googleLayer.hidden = false;\n    google.maps.event.trigger(googleMap, "resize");\n',
  '    elements.googleLayer.hidden = false;\n    elements.googleLayer.style.visibility = "visible";\n    google.maps.event.trigger(googleMap, "resize");\n',
  "Google-map visibility promotion"
);

page = replaceRequired(
  page,
  '    elements.googleLayer.hidden = true;\n    showOpenMap();\n    setMapStatus("Open map active · Google key rejected", false);\n',
  '    elements.googleLayer.hidden = true;\n    elements.googleLayer.style.visibility = "";\n    showOpenMap();\n    setMapStatus("Open map active · Google key rejected", false);\n',
  "Google auth failure fallback"
);

page = replaceRequired(
  page,
  '    try {\n      googleMap = new google.maps.Map(elements.googleLayer, {\n',
  '    try {\n      // Build Google on a full-size but invisible layer while the open map stays usable.\n      elements.googleLayer.hidden = false;\n      elements.googleLayer.style.visibility = "hidden";\n      googleMap = new google.maps.Map(elements.googleLayer, {\n',
  "hidden Google canvas"
);

page = replaceRequired(
  page,
  '          elements.googleLayer.hidden = true;\n          setMapStatus("Open map active · Google timed out", false);\n',
  '          elements.googleLayer.hidden = true;\n          elements.googleLayer.style.visibility = "";\n          showOpenMap();\n          setMapStatus("Open map active · Google timed out", false);\n',
  "Google timeout fallback"
);

page = replaceRequired(
  page,
  '        googleAvailable = true;\n        elements.mapToggle.style.display = "inline-flex";\n        elements.mapToggle.textContent = "Use Google map";\n        setMapStatus("Open map active · Google ready", true);\n',
  '        googleAvailable = true;\n        showGoogleMap();\n',
  "verified Google promotion"
);

fs.writeFileSync(file, page);
console.log("La Creme map now promotes Google only after verified tiles load.");
