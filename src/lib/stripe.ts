import Stripe from "stripe";

let stripeClient: Stripe | undefined;

// Lazy singleton: constructing Stripe eagerly throws when the key is unset,
// which breaks `next build` when it collects route metadata without env vars.
export function getStripe(): Stripe {
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
  }
  return stripeClient;
}
