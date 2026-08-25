const FALLBACKS: Record<string,string> = {
  winecom: "https://www.wine.com/content/business-dev/affiliate-program",
  samsclub: "https://creator.samsclub.com/inspiration/applynow",
  amazon: "https://affiliate-program.amazon.com/",
  costco: "https://www.costco.com/f/-/join-costco",
  totalwine: "https://www.totalwine.com/and-more-rewards/texas"
};

export default async () => {
  const links = {
    winecom: Netlify.env.get("WINECOM_AFFILIATE_URL") || FALLBACKS.winecom,
    samsclub: Netlify.env.get("SAMSCLUB_AFFILIATE_URL") || FALLBACKS.samsclub,
    amazon: Netlify.env.get("AMAZON_ASSOCIATES_URL") || FALLBACKS.amazon,
    costco: Netlify.env.get("COSTCO_PARTNER_URL") || FALLBACKS.costco,
    totalwine: Netlify.env.get("TOTALWINE_PARTNER_URL") || FALLBACKS.totalwine
  };
  const monetized = {
    winecom: Boolean(Netlify.env.get("WINECOM_AFFILIATE_URL")),
    samsclub: Boolean(Netlify.env.get("SAMSCLUB_AFFILIATE_URL")),
    amazon: Boolean(Netlify.env.get("AMAZON_ASSOCIATES_URL")),
    costco: Boolean(Netlify.env.get("COSTCO_PARTNER_URL")),
    totalwine: Boolean(Netlify.env.get("TOTALWINE_PARTNER_URL"))
  };
  return Response.json({ links, monetized }, { headers: { "Cache-Control": "public, max-age=300" } });
};

export const config = { path: "/api/lacrema-affiliates" };
