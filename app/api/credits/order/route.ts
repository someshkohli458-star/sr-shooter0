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

  const { data, error } = await supabase
    .from("createx_credit_orders")
    .insert({
      user_id: user.id,
      pack_code: packCode,
      credits: pack.credits,
      amount_paise: pack.amountPaise,
      currency: "INR",
      status: "pending",
    })
    .select("id, pack_code, credits, amount_paise, currency, status, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ order: data });
}
