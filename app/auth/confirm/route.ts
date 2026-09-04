import { type EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.clone();
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = url.searchParams.get("next") || "/dashboard";
  const destination = next.startsWith("/") ? next : "/dashboard";
  const supabase = await createClient();
  let error: unknown = null;

  if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code);
    error = result.error;
  } else if (tokenHash && type) {
    const result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    error = result.error;
  } else {
    error = new Error("Missing verification token");
  }

  url.pathname = error ? "/auth" : destination;
  url.search = "";
  if (error) {
    url.searchParams.set("mode", "signin");
    url.searchParams.set("error", "verification_failed");
  }
  return NextResponse.redirect(url);
}
