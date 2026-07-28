// Server-side Stripe client. This file must ONLY ever be imported from API
// routes (server code) — never from a React component — because it uses the
// secret key. The secret key lives in the STRIPE_SECRET_KEY environment
// variable and is never sent to the browser.
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
