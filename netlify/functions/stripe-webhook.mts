import Stripe from "stripe";
import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
function response(body: string, status = 200) { return new Response(body, { status, headers: { "content-type": "text/plain; charset=utf-8" } }); }
async function recordEvent(event: Stripe.Event) {
  const store = getStore("stripe-test-events");
  const prior = await store.get(`events/${event.id}.json`, { type: "json" });
  if (prior) return false;
  await store.setJSON(`events/${event.id}.json`, { id: event.id, type: event.type, created: event.created, livemode: event.livemode });
  return true;
}
async function updateBillingState(event: Stripe.Event) {
  const store = getStore("stripe-test-events");
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      await store.setJSON(`checkout/${session.id}.json`, { status: session.status, payment_status: session.payment_status, customer: session.customer, subscription: session.subscription, metadata: session.metadata }); break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await store.setJSON(`subscriptions/${subscription.id}.json`, { status: subscription.status, customer: subscription.customer, cancel_at_period_end: subscription.cancel_at_period_end, metadata: subscription.metadata }); break;
    }
    case "invoice.payment_failed":
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      await store.setJSON(`invoices/${invoice.id}.json`, { status: invoice.status, customer: invoice.customer, subscription: invoice.parent?.subscription_details?.subscription ?? null }); break;
    }
    case "charge.refunded":
    case "charge.dispute.created":
    case "charge.dispute.closed":
      await store.setJSON(`risk/${event.id}.json`, { type: event.type, object_id: event.data.object.id }); break;
  }
}
export default async (req: Request) => {
  if (req.method !== "POST") return response("Method not allowed", 405);
  const apiKey = Netlify.env.get("STRIPE_RESTRICTED_KEY");
  const webhookSecret = Netlify.env.get("STRIPE_WEBHOOK_SECRET");
  const signature = req.headers.get("stripe-signature");
  if (!apiKey || !webhookSecret || !signature) return response("Webhook not configured", 503);
  const stripeClient = new Stripe(apiKey, { apiVersion: "2026-07-29.dahlia" });
  let event: Stripe.Event;
  try { event = stripeClient.webhooks.constructEvent(await req.text(), signature, webhookSecret); } catch { return response("Invalid signature", 400); }
  if (!(await recordEvent(event))) return response("Already processed");
  await updateBillingState(event);
  return response("Received");
};
export const config: Config = { path: "/api/stripe-webhook" };
