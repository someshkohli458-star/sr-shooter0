import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const path = String(body.path || "");
  if (!path || !path.startsWith(`${user.id}/`)) return NextResponse.json({ error: "Invalid media path" }, { status: 400 });
  const { data, error } = await supabase.storage.from("createx-generations").createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) return NextResponse.json({ error: error?.message || "Media unavailable" }, { status: 404 });
  return NextResponse.json({ url: data.signedUrl });
}
