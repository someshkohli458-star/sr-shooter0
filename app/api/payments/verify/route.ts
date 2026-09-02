import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return NextResponse.json({ error: "Payment gateway is not configured yet." }, { status: 503 });
  const body = await request.json().catch(() => ({}));
  const localOrderId = String(body.orderId || "");
  const paymentId = String(body.razorpay_payment_id || "");
  const providerOrderId = String(body.razorpay_order_id || "");
  const signature = String(body.razorpay_signature || "");
  if (!localOrderId || !paymentId || !providerOrderId || !signature) return NextResponse.json({ error: "Invalid payment response" }, { status: 400 });

  const { data: order, error } = await supabase.from("createx_credit_orders").select("id,provider_order_id,status").eq("id", localOrderId).eq("user_id", user.id).single();
  if (error || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.provider_order_id !== providerOrderId) return NextResponse.json({ error: "Payment order mismatch" }, { status: 400 });

  const expected = crypto.createHmac("sha256", secret).update(`${providerOrderId}|${paymentId}`).digest("hex");
  const valid = signature.length === expected.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  if (!valid) return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });

  const { data: credits, error: fulfillError } = await supabase.rpc("fulfill_createx_credit_order", { p_order_id: localOrderId, p_provider_payment_id: paymentId });
  if (fulfillError) return NextResponse.json({ error: fulfillError.message }, { status: 409 });
  return NextResponse.json({ success: true, credits });
}
