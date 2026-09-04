import { type EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = url.searchParams.get("next") || "/dashboard";
  url.pathname = next.startsWith("/") ? next : "/dashboard";
  url.search = "";

  if (!tokenHash || !type) {
    url.pathname = "/auth";
    url.searchParams.set("mode", "signin");
    url.searchParams.set("error", "missing_verification_token");
    return NextResponse.redirect(url);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) {
    url.pathname = "/auth";
    url.searchParams.set("mode", "signin");
    url.searchParams.set("error", "verification_failed");
    return NextResponse.redirect(url);
  }
  return NextResponse.redirect(url);
}
