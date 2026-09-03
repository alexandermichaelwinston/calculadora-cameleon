import Stripe from "stripe";
import type { Config } from "@netlify/functions";
function json(body: unknown, status = 200) { return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } }); }
export default async (req: Request) => {
  if (req.method !== "GET") return json({ error: "Method not allowed" }, 405);
  const sessionId = new URL(req.url).searchParams.get("session_id");
  if (!sessionId || !sessionId.startsWith("cs_")) return json({ verified: false, error: "Missing checkout session" }, 400);
  const apiKey = Netlify.env.get("STRIPE_RESTRICTED_KEY");
  if (!apiKey) return json({ verified: false, pending: true }, 503);
  const stripeClient = new Stripe(apiKey, { apiVersion: "2026-07-29.dahlia" });
  try {
    const session = await stripeClient.checkout.sessions.retrieve(sessionId, { expand: ["line_items", "subscription"] });
    const verified = session.status === "complete" && (session.payment_status === "paid" || session.mode === "subscription");
    return json({ verified, mode: session.mode, payment_status: session.payment_status, customer_email: session.customer_details?.email ?? null, subscription_status: typeof session.subscription === "object" ? session.subscription?.status ?? null : null });
  } catch { return json({ verified: false, error: "Unable to verify checkout" }, 400); }
};
export const config: Config = { path: "/api/checkout-status" };
