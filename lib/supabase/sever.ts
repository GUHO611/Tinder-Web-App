import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
    const cookieStore = await cookies();
    // console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    // console.log("KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // Phương thức `setAll` được gọi từ một Thành phần Máy chủ.
                        // Có thể bỏ qua phương thức này nếu bạn đang làm mới phần mềm trung gian
                        // phiên làm việc của người dùng.
                    }
                }
            },
        },
    );
}