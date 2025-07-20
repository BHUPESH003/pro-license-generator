import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY as string;

if (!STRIPE_SECRET_KEY) {
  throw new Error("Please define the STRIPE_SECRET_KEY environment variable");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

export default stripe;
