"use client"
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

function AuthPage() {
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    // const [name, setName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const supabase = createClient();
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    // đưa người dùng ra khỏi trang đăng nhập khi đã đã đang nhập thành công
    useEffect(() => {
        if (user && !authLoading) {
            router.push("/")
        }
    }, [user, authLoading, router])

    async function handleAuth(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");
        if (isSignUp && password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            setLoading(false);
            return;
        }
        try {
            if (isSignUp) {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    // options: {
                    //     data: {
                    //         name,
                    //     },
                    // },
                });
                if (error) throw error;
                //Khi đăng ký xong: User được tạo -> Nhưng Session (phiên đăng nhập) chưa có
                if (data.user && !data.session) {
                    setError("Vui lòng kiểm tra email của bạn để xác nhận tài khoản");
                    return;
                }

            } else {
                // Gửi email/pass -> Supabase trả về token -> Lưu vào Cookie (do createClient đã cấu hình)
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,

                });
                if (error) throw error;

            }

        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError(String(error));
            }
        } finally {
            setLoading(false);
        }

    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-red-100 dark:from-gray-900 dark:to-gray-800">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        StreamMatch
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {isSignUp ? "Tạo tài khoản mới" : "Đăng nhập vào tài khoản của bạn"}
                    </p>
                </div>
                <form className="space-y-6" onSubmit={handleAuth}>
                    {!isSignUp ? (
                        <>
                            {/* Form đăng nhập */}
                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white"
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white"
                                    placeholder="Enter your password"
                                    autoComplete="password"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Form đăng ký */}
                            {/* <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white"
                                    placeholder="Enter your name"
                                />
                            </div> */}

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white"
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white"
                                    placeholder="Enter your password"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="confirmPassword"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                                >
                                    Confirm Password
                                </label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white"
                                    placeholder="Confirm your password"
                                />
                            </div>
                        </>
                    )}
                    {error && (
                        <div className="text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
                    >
                        {loading ? "Loading..." : isSignUp ? "Đăng ký" : "Đăng nhập"}
                    </button>
                </form>

                <div className="text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-pink-600 dark:text-pink-400 hover:text-pink-500 dark:hover:text-pink-300 text-sm"
                    >
                        {isSignUp
                            ? "Bạn đã có tài khoản? Đăng nhập"
                            : "Bạn chưa có tài khoản? Đăng ký"}
                    </button>
                </div>

            </div>
        </div>
    )
};

export default AuthPage;