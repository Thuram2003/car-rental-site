import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Public routes that don't require authentication
const publicRoutes = [
  "/",
  "/cars",
  "/about",
  "/contact",
  "/login",
  "/register",
  "/verify-email",
  "/auth/callback",
];

// Customer routes that require authentication
const customerRoutes = [
  "/bookings",
  "/profile",
  "/book",
];

// Admin routes that require authentication and admin role
const adminRoutes = [
  "/admin",
];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { pathname } = request.nextUrl;

  // Allow public routes
  const isPublicRoute = publicRoutes.some((route) => 
    pathname === route || pathname.startsWith(route + "/")
  );

  // Check if it's a customer route
  const isCustomerRoute = customerRoutes.some((route) => 
    pathname.startsWith(route)
  );

  // Check if it's an admin route
  const isAdminRoute = adminRoutes.some((route) => 
    pathname.startsWith(route)
  );

  // Get user session
  let user = null;
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    user = authUser;
  } catch (error) {
    console.error("Error getting user in proxy:", error);
    // Continue without user
  }

  // If accessing customer routes without auth, redirect to login
  if (isCustomerRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // If accessing admin routes without auth, redirect to login
  if (isAdminRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // If logged in and trying to access login/register, redirect to cars
  if (user && (pathname === "/login" || pathname === "/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/cars";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
