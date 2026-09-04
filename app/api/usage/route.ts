import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  const { data, error } = await supabase
    .from("createx_daily_usage")
    .select("image_count,video_count,usage_date")
    .eq("user_id", user.id)
    .eq("usage_date", today)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const imagesUsed = Number(data?.image_count || 0);
  const videosUsed = Number(data?.video_count || 0);
  return NextResponse.json({
    date: today,
    imagesUsed,
    imagesRemaining: Math.max(0, 10 - imagesUsed),
    videosUsed,
    videosRemaining: Math.max(0, 10 - videosUsed),
  });
}
