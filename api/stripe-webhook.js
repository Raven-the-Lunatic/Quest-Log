import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Raw body is required for Stripe's signature check — must disable Vercel's default
// JSON body parsing for this function.
export const config = {
  api: { bodyParser: false },
};

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    res.status(400).send(`Webhook signature verification failed: ${err.message}`);
    return;
  }

  // Service role key bypasses Row Level Security — this is the ONLY place in the whole
  // app that's allowed to write to premium_status. Never expose this key client-side.
  const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.client_reference_id;

      // Purchases made without being signed in (e.g. the free-tier PDF/sharing honor-system
      // flow) have no client_reference_id — nothing to link server-side, so just no-op.
      if (userId) {
        await supabaseAdmin.from("premium_status").upsert({
          user_id: userId,
          is_premium: true,
          stripe_customer_id: session.customer,
          plan: session.mode === "payment" ? "lifetime" : "subscription",
          updated_at: new Date().toISOString(),
        });
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      await supabaseAdmin
        .from("premium_status")
        .update({ is_premium: false, updated_at: new Date().toISOString() })
        .eq("stripe_customer_id", subscription.customer);
    }
  } catch (err) {
    // Stripe retries on non-2xx, which is what we want if our own write failed.
    res.status(500).json({ error: "Failed to update entitlement", detail: err.message });
    return;
  }

  res.status(200).json({ received: true });
}
