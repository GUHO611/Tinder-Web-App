'use client'
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { createContext, useContext, useEffect, useState } from "react";


interface AuthContextType {
    user: User | null;
    loading: boolean;
    singOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const supabase = createClient();

    useEffect(() => {
        async function checkUser() {
            try {

                const {
                    data: { session },
                } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
                console.log(session?.user);

                const {
                    data: { subscription },
                } = supabase.auth.onAuthStateChange(async (event, session) => {
                    setUser(session?.user ?? null)
                });
                return () => subscription.unsubscribe();
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }


        checkUser();
    }, []);
    async function singOut() {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.log("Lỗi đăng xuất", error);
        }

    }

    return (
        <AuthContext.Provider value={{ user, loading, singOut }}>
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