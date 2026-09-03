import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth?next=/admin");

  const role = user.app_metadata?.role;
  const configuredAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const emailMatches = Boolean(configuredAdminEmail && user.email?.toLowerCase() === configuredAdminEmail);

  if (role !== "admin" && !emailMatches) redirect("/dashboard");

  return <>{children}</>;
}
