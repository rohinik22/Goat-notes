import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const isAuthRoute =
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/sign-up';

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If user is already logged in, redirect away from /login or /sign-up
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_BASE_URL));
  }

  const { searchParams, pathname } = new URL(request.url);

  if (!searchParams.get('noteId') && pathname === '/' && user) {
    // Try fetching the user's most recent note
    const { data: newestNote } = await supabase
      .from('notes')
      .select('id')
      .eq('authorId', user.id)
      .order('updatedAt', { ascending: false })
      .limit(1)
      .single();

    let noteIdToUse = newestNote?.id;

    // If no note exists, create a new one
    if (!noteIdToUse) {
      const { data: newNote, error } = await supabase
        .from('notes')
        .insert({ authorId: user.id, text: '' })
        .select('id')
        .single();

      if (newNote) {
        noteIdToUse = newNote.id;
      }
    }

    // Redirect to homepage with ?noteId=...
    if (noteIdToUse) {
      const url = request.nextUrl.clone();
      url.searchParams.set('noteId', noteIdToUse);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
