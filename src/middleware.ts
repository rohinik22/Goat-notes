import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const isAuthRoute =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/sign-up";

  if (isAuthRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      return NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_BASE_URL));
    }
  }

  const { searchParams, pathname } = new URL(request.url)

  if (!searchParams.get("noteId") && pathname === "/") {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      // Get newest note directly from Supabase
      const { data: newestNote } = await supabase
        .from("notes")
        .select("id")
        .eq("authorId", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const newestNoteId = newestNote?.id;

      if (newestNoteId) {
        const url = request.nextUrl.clone()
        url.searchParams.set("noteId", newestNoteId)
        return NextResponse.redirect(url);
      } else {
        // Create a new note directly
        const { data: newNote } = await supabase
          .from("notes")
          .insert([{ authorId: user.id, content: "" }])
          .select("id")
          .single();

        const noteId = newNote?.id;

        const url = request.nextUrl.clone();
        url.searchParams.set("noteId", noteId);
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
