import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith('/api/');

  // Public pages (the API is never treated as a public page)
  const publicPaths = ['/', '/login', '/register'];
  if (!isApi && (publicPaths.includes(pathname) || pathname.startsWith('/auth/'))) {
    return supabaseResponse;
  }

  // Not authenticated → 401 for API, redirect for pages
  if (!user) {
    if (isApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role from user metadata
  const role = user.user_metadata?.role ?? 'employee';

  // Authenticated API requests
  if (isApi) {
    // Org-wide knowledge graph is HR-only
    if (pathname.startsWith('/api/graph') && role !== 'hr') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return supabaseResponse;
  }

  // HR pages protection
  if (pathname.startsWith('/hr') && role !== 'hr') {
    return NextResponse.redirect(new URL('/employee', request.url));
  }

  // Employee pages protection
  if (pathname.startsWith('/employee') && role === 'hr') {
    return NextResponse.redirect(new URL('/hr', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
