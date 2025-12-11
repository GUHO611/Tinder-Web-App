"use client"
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ro } from "@faker-js/faker";

// Icons SVG components
const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);
const LockIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

function AuthPage() {
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const supabase = createClient();
    const { user, loading: authLoading } = useAuth()
    const router = useRouter()

    // Animation refs
    const formRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user && !authLoading) {
            router.push("/")
        }
    }, [user, authLoading, router])

    // --- FIX ANIMATION ---
    useEffect(() => {
        // Context cho Form (Input + Button)
        const ctxForm = gsap.context(() => {
            // 1. Set trạng thái ban đầu (ẩn)
            gsap.set(".auth-input", { y: 20, opacity: 0 });

            // 2. Animate hiện lên
            gsap.to(".auth-input", {
                y: 0,
                opacity: 1,
                stagger: 0.1,
                duration: 0.8,
                ease: "power2.out",
                clearProps: "all"
            });
        }, formRef); // Scope vào formRef

        // Context cho Ảnh
        const ctxImage = gsap.context(() => {
            gsap.from(".auth-image", {
                x: -50,
                opacity: 0,
                duration: 1,
                ease: "power3.out"
            });
        }, imageRef); // Scope vào imageRef

        return () => {
            ctxForm.revert();
            ctxImage.revert();
        };
    }, [isSignUp]);

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
                });

                if (error) throw error;
                if (data.user && !data.session) {
                    setError("Vui lòng kiểm tra email của bạn để xác nhận tài khoản");
                    return;
                }

            } else {
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

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FFC5D3] p-4 font-sans">
            {/* Main Card Container */}
            <div className="bg-white/90 dark:bg-gray-900 rounded-[30px] shadow-2xl overflow-hidden flex max-w-5xl w-full min-h-[600px] relative">

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-pink-400/20 rounded-br-full z-0 pointer-events-none blur-xl"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-400/20 rounded-tl-full z-0 pointer-events-none blur-xl"></div>

                {/* Left Side - Image/Illustration Area */}
                <div
                    ref={imageRef}
                    className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#ff9a9e] to-[#fecfef] relative flex-col justify-between p-8 text-white auth-image"
                >
                    <div className="text-3xl font-serif font-bold tracking-wide">
                        Stream Match
                    </div>

                    <div className="flex-1 flex items-center justify-center relative">
                        <div className="relative w-full h-64">
                            <img
                                src="rom.svg" // Đảm bảo file này tồn tại trong thư mục public
                                alt="Romantic Couple"
                                className="w-full object-cover mix-blend-multiply opacity-80 rounded-xl"
                                onError={(e) => {
                                    // Fallback nếu ảnh lỗi
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-lg font-medium opacity-90">Kết nối yêu thương, xây dựng hạnh phúc.</p>
                    </div>
                </div>

                {/* Right Side - Form Area */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative z-10 bg-white dark:bg-gray-800">
                    <div ref={formRef} className="max-w-sm mx-auto w-full">

                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-bold text-[#E94086] dark:text-pink-400 mb-2">
                                Welcome
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                {isSignUp ? "Please create your account below" : "Please enter your login details below"}
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleAuth}>
                            {/* Email Input */}
                            <div className="auth-input relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MailIcon />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E94086] focus:border-transparent sm:text-sm transition-all shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="your-email@mail.com"
                                    autoComplete="email"
                                />
                            </div>

                            {/* Password Input */}
                            <div className="auth-input relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockIcon />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E94086] focus:border-transparent sm:text-sm transition-all shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="••••••••••••"
                                    autoComplete="current-password"
                                />
                            </div>

                            {/* Confirm Password (Only SignUp) */}
                            {isSignUp && (
                                <div className="auth-input relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockIcon />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E94086] focus:border-transparent sm:text-sm transition-all shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Confirm password"
                                    />
                                </div>
                            )}

                            {/* Forgot Password Link */}
                            {!isSignUp && (
                                <div className="flex justify-end auth-input">
                                    <button type="button" className="text-xs text-gray-500 hover:text-[#E94086] transition-colors">
                                        Forgot your password?
                                    </button>
                                </div>
                            )}

                            {error && (
                                <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-100">
                                    {error}
                                </div>
                            )}

                            {/* Submit Button - Đã được fix animation */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="auth-input w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-[#E94086] hover:bg-[#d63376] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E94086] disabled:opacity-50 transition-all transform hover:scale-[1.02]"
                            >
                                {loading ? "Đang xử lý..." : isSignUp ? "Đăng KÝ" : "Đăng Nhập"}
                            </button>
                        </form>

                        {/* Footer Toggle */}
                        <div className="mt-8 text-center auth-input">
                            <button
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-gray-600 dark:text-gray-300 hover:text-[#E94086] text-sm font-medium transition-colors"
                            >
                                {isSignUp ? "Bạn chưa có tài khoản? " : "Bạn đã có tài khoản? "}
                                <span className="text-[#E94086] font-bold">
                                    {isSignUp ? "Đăng Ký" : "Đăng nhập"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default AuthPage;

export function LoadingSpinner() {
    const spinnerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (spinnerRef.current) {
            gsap.to(spinnerRef.current, {
                rotation: 360,
                repeat: -1,
                ease: "linear",
                duration: 1,
            });
        }
    }, []);

    return (
        <div className="flex items-center justify-center h-screen bg-[#FFC5D3]">
            <div
                ref={spinnerRef}
                className="w-12 h-12 border-4 border-white border-t-[#E94086] rounded-full"
            ></div>
        </div>
    );
};