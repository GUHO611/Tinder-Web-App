import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export default async function middleware(request: NextRequest) {
    // 1. Setup Response và Supabase Client (Giữ nguyên logic cookie của bạn)
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

    // Lấy thông tin user
    const { data: { user } } = await supabase.auth.getUser()
    const path = request.nextUrl.pathname

    // --- 2. LOGIC CHO NGƯỜI CHƯA ĐĂNG NHẬP (GUEST) ---
    if (!user) {
        // Cho phép truy cập nếu là trang Auth HOẶC là trang chủ (/)
        const isPublicRoute = path.startsWith('/auth') || path === '/';

        // Nếu KHÔNG PHẢI trang công khai (ví dụ cố vào /matches, /chat) -> Đá về Auth
        if (!isPublicRoute) {
            return NextResponse.redirect(new URL('/auth', request.url))
        }
    }

    // --- 3. LOGIC CHO NGƯỜI ĐÃ ĐĂNG NHẬP (USER) ---
    if (user) {
        // Nếu user đã login mà cố vào trang /auth -> Đá về trang chủ /
        if (path.startsWith('/auth')) {
            return NextResponse.redirect(new URL('/', request.url))
        }

        // Logic kiểm tra Profile Completed
        const { data: userProfile } = await supabase
            .from('users')
            .select('is_profile_completed')
            .eq('id', user.id)
            .single()

        const isCompleted = userProfile?.is_profile_completed
        const isEditingProfile = path === '/profile/edit'
        // Regex kiểm tra file tĩnh (để tránh redirect nhầm các file ảnh/css)
        const isStaticAsset = path.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js)$/)

        // Nếu chưa hoàn thiện hồ sơ & không phải đang ở trang edit & không phải file tĩnh
        // -> Bắt buộc về trang Edit Profile
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