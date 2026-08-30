const EIA_URL = "https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?f=W&n=PET&s=EMM_EPMR_PTE_R30_DPG";
const FALLBACK = { price: 3.638, date: "2026-08-24", source: "fallback" };

const monthNumber: Record<string, string> = {
  Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
  Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12",
};

export default async () => {
  let benchmark = FALLBACK;
  try {
    const response = await fetch(EIA_URL, {
      headers: { "user-agent": "AmigoGas/1.0 (public EIA benchmark reader)" },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new Error(`EIA ${response.status}`);
    const html = await response.text();
    const observations: Array<{ price: number; date: string }> = [];
    const rows = html.matchAll(/<tr>\s*<td class='B6'>&nbsp;&nbsp;(\d{4})-([A-Z][a-z]{2})<\/td>([\s\S]*?)<\/tr>/g);
    for (const row of rows) {
      const year = row[1], month = monthNumber[row[2]], cells = row[3];
      if (!month) continue;
      const pairs = cells.matchAll(/<td class='B5'>(\d{2})\/(\d{2})&nbsp;<\/td>\s*<td class='B3'>([0-9.]+)&nbsp;/g);
      for (const pair of pairs) {
        const price = Number(pair[3]);
        if (Number.isFinite(price)) observations.push({ price, date: `${year}-${month}-${pair[2]}` });
      }
    }
    observations.sort((a, b) => b.date.localeCompare(a.date));
    if (observations[0]) benchmark = { ...observations[0], source: "EIA" };
  } catch {
    // Preserve the last known official figure when EIA is temporarily unreachable.
  }
  return Response.json({
    ...benchmark,
    label: "EIA Gulf Coast regular weekly average",
    sourceUrl: EIA_URL,
    isStationPrice: false,
  }, { headers: { "Cache-Control": "public, max-age=21600, stale-while-revalidate=86400" } });
};

export const config = { path: "/api/amigogas/benchmark" };
