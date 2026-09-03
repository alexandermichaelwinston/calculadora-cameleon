import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

function response(body: string, status = 200) {
  return new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8" } });
}
function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}
async function verifySignature(payload: string, header: string, secret: string) {
  const parts = header.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
  const signatures = parts.filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  if (!timestamp || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`${timestamp}.${payload}`));
  const expected = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return signatures.some((signature) => constantTimeEqual(signature, expected));
}
async function recordEvent(event: any) {
  const store = getStore("stripe-test-events");
  const key = `events/${event.id}.json`;
  if (await store.get(key, { type: "json" })) return false;
  await store.setJSON(key, { id: event.id, type: event.type, created: event.created, livemode: event.livemode });
  return true;
}
async function updateBillingState(event: any) {
  const store = getStore("stripe-test-events");
  const object = event.data?.object ?? {};
  switch (event.type) {
    case "checkout.session.completed":
      await store.setJSON(`checkout/${object.id}.json`, { status: object.status, payment_status: object.payment_status, customer: object.customer, subscription: object.subscription, metadata: object.metadata }); break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await store.setJSON(`subscriptions/${object.id}.json`, { status: object.status, customer: object.customer, cancel_at_period_end: object.cancel_at_period_end, metadata: object.metadata }); break;
    case "invoice.payment_failed":
    case "invoice.paid":
      await store.setJSON(`invoices/${object.id}.json`, { status: object.status, customer: object.customer, subscription: object.parent?.subscription_details?.subscription ?? null }); break;
    case "charge.refunded":
    case "charge.dispute.created":
    case "charge.dispute.closed":
      await store.setJSON(`risk/${event.id}.json`, { type: event.type, object_id: object.id }); break;
  }
}
export default async (req: Request) => {
  if (req.method !== "POST") return response("Method not allowed", 405);
  const webhookSecret = Netlify.env.get("STRIPE_WEBHOOK_SECRET");
  const signature = req.headers.get("stripe-signature");
  if (!webhookSecret || !signature) return response("Webhook not configured", 503);
  const payload = await req.text();
  if (!(await verifySignature(payload, signature, webhookSecret))) return response("Invalid signature", 400);
  const event = JSON.parse(payload);
  if (event.livemode !== false) return response("Live events are disabled", 400);
  if (!(await recordEvent(event))) return response("Already processed");
  await updateBillingState(event);
  return response("Received");
};
export const config: Config = { path: "/api/stripe-webhook" };
