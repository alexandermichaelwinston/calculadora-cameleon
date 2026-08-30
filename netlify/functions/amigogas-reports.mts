import { getDeployStore, getStore } from "@netlify/blobs";

function reportsStore() {
  const netlifyGlobal = (globalThis as any).Netlify;
  const isProduction = netlifyGlobal?.context?.deploy?.context === "production";
  return isProduction
    ? getStore("amigogas-reports", { consistency: "strong" })
    : getDeployStore("amigogas-reports", { consistency: "strong" });
}

function clean(value: unknown, max = 120) {
  return String(value ?? "").replace(/[<>]/g, "").trim().slice(0, max);
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export default async (req: Request) => {
  const store = reportsStore();

  if (req.method === "GET") {
    const { blobs } = await store.list({ prefix: "report/" });
    const recentKeys = blobs
      .sort((a, b) => b.key.localeCompare(a.key))
      .slice(0, 100)
      .map((item) => item.key);

    const reports = (await Promise.all(
      recentKeys.map((key) => store.get(key, { type: "json" }))
    )).filter(Boolean);

    const statusKeys = (await store.list({ prefix: "status/" })).blobs
      .sort((a, b) => b.key.localeCompare(a.key)).slice(0, 100).map((item) => item.key);
    const statuses = (await Promise.all(statusKeys.map((key) => store.get(key, { type: "json" })))).filter(Boolean);
    return json({ reports, statuses });
  }

  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (body.website) return json({ ok: true });

  const action = clean(body.action, 20).toLowerCase() || "report";
  if (action === "confirm") {
    const reportId = clean(body.reportId, 80);
    if (!reportId) return json({ error: "A report is required." }, 400);
    const key = `report/${reportId}`;
    const existing: any = await store.get(key, { type: "json" });
    if (!existing) return json({ error: "Report not found." }, 404);
    existing.confirmations = Math.min(999, Number(existing.confirmations || 0) + 1);
    existing.lastConfirmedAt = new Date().toISOString();
    await store.setJSON(key, existing);
    return json({ ok: true, report: existing });
  }
  if (action === "status") {
    const stationId = clean(body.stationId, 120), station = clean(body.station, 80);
    const status = clean(body.status, 30).toLowerCase(), note = clean(body.note, 160);
    if ((!stationId && !station) || !["open", "fuel-limited", "out-of-fuel", "closed", "pumps-down"].includes(status)) return json({ error: "Choose a valid station status." }, 400);
    const now = new Date();
    const item = { id: `${now.getTime()}-${crypto.randomUUID().slice(0, 8)}`, stationId, station, status, note, reportedAt: now.toISOString(), source: "community", verified: false };
    await store.setJSON(`status/${item.id}`, item);
    return json({ ok: true, status: item }, 201);
  }

  const station = clean(body.station, 80);
  const address = clean(body.address, 120);
  const city = clean(body.city, 60);
  const grade = clean(body.grade, 20).toLowerCase();
  const note = clean(body.note, 160);
  const payment = clean(body.payment, 20).toLowerCase() || "credit";
  const stationId = clean(body.stationId, 120);
  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);
  const price = Number(body.price);

  const allowedGrades = new Set(["regular", "midgrade", "premium", "diesel"]);
  const allowedPayments = new Set(["cash", "credit", "member"]);
  if (!station || !city || !allowedGrades.has(grade) || !allowedPayments.has(payment) || !Number.isFinite(price) || price < 0.5 || price > 15) {
    return json({ error: "Please provide a station, city, fuel grade, and a realistic price." }, 400);
  }

  const now = new Date();
  const report = {
    id: `${now.getTime()}-${crypto.randomUUID().slice(0, 8)}`,
    station,
    address,
    city,
    grade,
    price: Math.round(price * 1000) / 1000,
    note,
    payment,
    stationId,
    latitude: Number.isFinite(latitude) && latitude >= -90 && latitude <= 90 ? latitude : null,
    longitude: Number.isFinite(longitude) && longitude >= -180 && longitude <= 180 ? longitude : null,
    reportedAt: now.toISOString(),
    source: "community",
    verified: false,
    confirmations: 0,
  };

  await store.setJSON(`report/${report.id}`, report);
  return json({ ok: true, report }, 201);
};

export const config = { path: "/api/amigogas/reports" };
