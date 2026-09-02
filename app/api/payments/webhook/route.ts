import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 });

  const signature = request.headers.get("x-razorpay-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  const rawBody = await request.text();
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(rawBody);
  const payment = event?.payload?.payment?.entity;
  const providerOrderId = payment?.order_id;
  const providerPaymentId = payment?.id;
  const eventName = String(event?.event || "");
  if (!providerOrderId || !providerPaymentId) return NextResponse.json({ received: true });

  if (!["payment.captured", "order.paid"].includes(eventName)) return NextResponse.json({ received: true });

  const supabase = createAdminClient();
  const { data: order, error } = await supabase.from("createx_credit_orders").select("id").eq("provider_order_id", providerOrderId).maybeSingle();
  if (error) return NextResponse.json({ error: "Order lookup failed" }, { status: 500 });
  if (!order) return NextResponse.json({ received: true });

  const { error: fulfillError } = await supabase.rpc("fulfill_createx_credit_order_webhook", {
    p_order_id: order.id,
    p_provider_payment_id: providerPaymentId,
  });
  if (fulfillError && !/Order is not payable/i.test(fulfillError.message)) return NextResponse.json({ error: "Fulfillment failed" }, { status: 500 });
  return NextResponse.json({ received: true });
}
