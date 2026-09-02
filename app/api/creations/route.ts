import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const BUCKET = "createx-generations";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("createx_generations")
    .select("id,type,prompt,result_url,result_path,status,settings,created_at,updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const items = await Promise.all((data || []).map(async (item) => {
    if (!item.result_path) return item;
    const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(item.result_path, 3600);
    return { ...item, result_url: signed?.signedUrl || null };
  }));

  return NextResponse.json({ creations: items });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Creation id is required" }, { status: 400 });

  const { data: item, error: findError } = await supabase
    .from("createx_generations")
    .select("id,result_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (findError || !item) return NextResponse.json({ error: "Creation not found" }, { status: 404 });

  if (item.result_path) {
    const { error: storageError } = await supabase.storage.from(BUCKET).remove([item.result_path]);
    if (storageError) return NextResponse.json({ error: storageError.message }, { status: 500 });
  }

  const { error } = await supabase.from("createx_generations").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
