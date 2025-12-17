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

    // ⚠️ Quan trọng: getUser() sẽ validate session và refresh cookie nếu cần
    const { data: { user } } = await supabase.auth.getUser()

    // 1. CHẶN NGƯỜI DÙNG CHƯA ĐĂNG NHẬP
    // Nếu không có user và không ở trang auth -> Đẩy về /auth
    if (!user && !request.nextUrl.pathname.startsWith('/auth')) {
        return NextResponse.redirect(new URL('/auth', request.url))
    }

    // 2. LOGIC PROFILE (Chỉ chạy khi đã login)
    if (user) {
        // Nếu user đã login mà cố vào /auth -> Đẩy về trang chủ
        if (request.nextUrl.pathname.startsWith('/auth')) {
            return NextResponse.redirect(new URL('/', request.url))
        }

        // Kiểm tra hoàn thiện hồ sơ
        const { data: userProfile } = await supabase
            .from('users')
            .select('is_profile_completed')
            .eq('id', user.id)
            .single()

        const isCompleted = userProfile?.is_profile_completed
        const isEditingProfile = request.nextUrl.pathname === '/profile/edit'
        const isStaticAsset = request.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js)$/)

        // Nếu chưa xong hồ sơ -> Bắt buộc ở trang Edit
        if (!isCompleted && !isEditingProfile && !isStaticAsset) {
            return NextResponse.redirect(new URL('/profile/edit', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}