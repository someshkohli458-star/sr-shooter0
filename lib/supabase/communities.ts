import { createClient } from "@/lib/supabase/client";

export async function createCommunity(input: { name: string; slug: string; description?: string; is_private?: boolean }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in first.");
  const { data, error } = await supabase.from("communities").insert({ ...input, owner_id: user.id }).select().single();
  if (error) throw error;
  await supabase.from("community_members").insert({ community_id: data.id, user_id: user.id, role: "owner" });
  return data;
}

export async function joinCommunity(communityId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in first.");
  const { error } = await supabase.from("community_members").insert({ community_id: communityId, user_id: user.id, role: "member" });
  if (error) throw error;
}

export async function leaveCommunity(communityId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in first.");
  const { error } = await supabase.from("community_members").delete().eq("community_id", communityId).eq("user_id", user.id);
  if (error) throw error;
}
