import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const amount = Math.max(1, Math.floor(Number(body.amount || 1)));
  if (amount > 100) return NextResponse.json({ error: "Invalid credit amount" }, { status: 400 });

  const { data, error } = await supabase.rpc("consume_createx_credit", { p_user_id: user.id, p_amount: amount });
  if (error) return NextResponse.json({ error: error.message }, { status: 402 });
  return NextResponse.json({ credits: data });
}
