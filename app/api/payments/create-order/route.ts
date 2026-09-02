import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PACKS = {
  starter: { credits: 50, amountPaise: 9900 },
  creator: { credits: 150, amountPaise: 24900 },
  pro: { credits: 400, amountPaise: 59900 },
} as const;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const packCode = String(body.packCode || "") as keyof typeof PACKS;
  const pack = PACKS[packCode];
  if (!pack) return NextResponse.json({ error: "Invalid credit pack" }, { status: 400 });

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return NextResponse.json({ error: "Payment gateway is not configured yet." }, { status: 503 });

  const { data: order, error } = await supabase.from("createx_credit_orders").insert({ user_id: user.id, pack_code: packCode, credits: pack.credits, amount_paise: pack.amountPaise, currency: "INR", status: "pending", provider: "razorpay" }).select("id,pack_code,credits,amount_paise,currency,status").single();
  if (error || !order) return NextResponse.json({ error: error?.message || "Could not create order" }, { status: 500 });

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const razor = await fetch("https://api.razorpay.com/v1/orders", { method: "POST", headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" }, body: JSON.stringify({ amount: pack.amountPaise, currency: "INR", receipt: order.id, notes: { createx_order_id: order.id, user_id: user.id } }) });
  const payload = await razor.json().catch(() => ({}));
  if (!razor.ok || !payload.id) return NextResponse.json({ error: payload.error?.description || "Could not create payment order" }, { status: 502 });

  await supabase.from("createx_credit_orders").update({ provider_order_id: payload.id }).eq("id", order.id).eq("user_id", user.id);
  return NextResponse.json({ orderId: order.id, providerOrderId: payload.id, amount: pack.amountPaise, currency: "INR", keyId, pack: packCode, credits: pack.credits });
}
