'use client'
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { createContext, useContext, useEffect, useState } from "react";
import { setUserOnlineStatus } from "@/lib/actions/profile";


interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const supabase = createClient();

    useEffect(() => {
        async function checkUser() {
            try {

                const {
                    data: { session },
                } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
                if (session?.user) {
                    await setUserOnlineStatus(true);
                }

                const {
                    data: { subscription },
                } = supabase.auth.onAuthStateChange(async (event, session) => {
                    setUser(session?.user ?? null);
                    // Xử lý sự kiện đăng nhập/đăng xuất
                    if (event === 'SIGNED_IN' && session?.user) {
                        await setUserOnlineStatus(true);
                    } else if (event === 'SIGNED_OUT') {
                        // Lưu ý: Khi signed out, có thể cần gọi server action qua API route 
                        // hoặc chấp nhận user offline sau một khoảng thời gian (cron job)
                        // Vì khi logout mất token, khó update DB. 
                        // Cách tốt nhất: Set online = true. Client gửi "heartbeat" mỗi 5p.
                    }
                });

                return () => subscription.unsubscribe();
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }


        checkUser();
        return () => { setUserOnlineStatus(false); }
    }, []);
    async function signOut() {
        try {
            // Set Offline trước khi signout
            await setUserOnlineStatus(false);
            await supabase.auth.signOut();
            // router.push("/auth"); // Redirect về auth
        } catch (error) {
            console.log("Lỗi đăng xuất", error);
        }

    }

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </AuthContext.Provider>

    );
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context == undefined) {
        throw new Error("useAuth phải được sử dụng trong AuthProvider");
    }
    return context;
}