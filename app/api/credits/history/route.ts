import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: credit }, { data: transactions, error }] = await Promise.all([
    supabase.from("user_credits").select("credits,updated_at").eq("user_id", user.id).maybeSingle(),
    supabase.from("createx_credit_transactions").select("id,amount,balance_after,type,generation_id,note,created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ credits: credit?.credits ?? 0, updated_at: credit?.updated_at ?? null, transactions: transactions ?? [] });
}
