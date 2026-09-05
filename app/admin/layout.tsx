import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  const role = profile?.role ?? user.app_metadata?.role;
  const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const emailMatches = Boolean(configuredAdminEmail && user.email?.toLowerCase() === configuredAdminEmail);
  const isAdmin = role === "admin" || emailMatches;

  if (!isAdmin) redirect("/admin/login?error=not_admin&next=/admin");

  return <>{children}</>;
}
