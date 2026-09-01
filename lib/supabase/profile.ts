import { createClient } from "@/lib/supabase/client";

export async function ensureProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, username, full_name, bio, avatar_url, website, is_private, is_verified")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return existing;

  const base = (user.email?.split("@")[0] || "aura_user")
    .replace(/[^A-Za-z0-9_.]/g, "")
    .slice(0, 24) || "aura_user";
  const username = `${base}_${user.id.slice(0, 6)}`.slice(0, 30);

  const { data, error } = await supabase
    .from("profiles")
    .insert({ id: user.id, username, full_name: user.user_metadata?.full_name || "" })
    .select()
    .single();

  if (error) throw error;
  return data;
}
