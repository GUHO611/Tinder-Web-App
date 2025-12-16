import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // 1. Bảo vệ các Route cần đăng nhập
    if (!user && !request.nextUrl.pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/auth', request.url))
    }

    // 2. Logic Bắt buộc hoàn thiện Profile (Yêu cầu 1 & 2)
    if (user) {
        // Lấy thông tin is_profile_completed từ DB
        const { data: userProfile } = await supabase
            .from('users')
            .select('is_profile_completed')
            .eq('id', user.id)
            .single()

        const isCompleted = userProfile?.is_profile_completed
        const isEditingProfile = request.nextUrl.pathname === '/profile/edit'
        const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
        const isStaticAsset = request.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js)$/)

        // Nếu Profile chưa xong VÀ không phải đang ở trang Edit VÀ không phải trang Auth/Static
        // -> Bắt buộc quay về trang Edit
        if (!isCompleted && !isEditingProfile && !isAuthPage && !isStaticAsset) {
            return NextResponse.redirect(new URL('/profile/edit', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}