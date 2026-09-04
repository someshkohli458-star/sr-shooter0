import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const path = request.nextUrl.pathname;
  const protectedPath =
    path === "/dashboard" || path.startsWith("/dashboard/") ||
    path === "/chat" || path.startsWith("/chat/") ||
    path === "/create" || path.startsWith("/create/") ||
    path === "/code" || path.startsWith("/code/") ||
    path === "/creations" || path.startsWith("/creations/") ||
    path === "/admin" || path.startsWith("/admin/");

  if (!supabaseUrl || !supabaseKey) {
    if (protectedPath) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth";
      url.search = "";
      url.searchParams.set("mode", "signin");
      url.searchParams.set("next", path);
      url.searchParams.set("error", "auth_config");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  if (protectedPath && !data?.claims) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.search = "";
    url.searchParams.set("mode", "signin");
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/chat/:path*",
    "/create/:path*",
    "/code/:path*",
    "/creations/:path*",
    "/admin/:path*",
    "/auth/:path*",
  ],
};
