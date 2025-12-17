"use client";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUserProfile, markUserAsVerified } from "@/lib/actions/profile";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

// --- Icons ---
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
const KeyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
);

function AuthPage() {
    // Quản lý 3 trạng thái view thay vì boolean isSignUp
    const [view, setView] = useState<'login' | 'signup' | 'verify_signup'>('login');

    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [otp, setOtp] = useState<string>("");
    const [rememberMe, setRememberMe] = useState<boolean>(true);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [message, setMessage] = useState<string>("");

    const supabase = createClient();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const formRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    // Redirect nếu đã đăng nhập thành công
    useEffect(() => {
        if (user && !authLoading) {
            router.push("/");
            // router.refresh();
        }
    }, [user, authLoading, router]);

    // Reset input khi chuyển view (QUAN TRỌNG: KHÔNG ĐƯỢC RESET EMAIL)
    useEffect(() => {
        setError("");
        setMessage("");
        setPassword("");
        setConfirmPassword("");
        setOtp("");
        // Lưu ý: Không reset Email để tiện cho UX khi người dùng chuyển qua lại
    }, [view]);

    // Animation chuyển view (GSAP)
    useEffect(() => {
        const ctx = gsap.context(() => {
            // Input animation
            gsap.fromTo(".auth-input",
                { y: 20, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: "power2.out", clearProps: "all" }
            );
        }, formRef);
        return () => ctx.revert();
    }, [view]);

    // Animation ảnh bên trái
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".auth-image", { x: -50, opacity: 0, duration: 1, ease: "power3.out" });
        }, imageRef);
        return () => ctx.revert();
    }, []);

    // Hàm chuyển view thủ công
    const switchView = (newView: 'login' | 'signup') => {
        setView(newView);
    };

    // Gửi lại mã OTP
    const handleResendOtp = async () => {
        if (!email) return setError("Vui lòng nhập email trước");
        setLoading(true);
        setMessage("");
        setError("");
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email,
            });
            if (error) throw error;
            setMessage("Đã gửi lại mã xác minh mới. Vui lòng kiểm tra email.");
        } catch (err: unknown) {
            let errorMessage = "Không thể gửi lại mã";
            if (err instanceof Error) errorMessage = err.message;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Xử lý Auth Chính
    async function handleAuth(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            // --- 1. ĐĂNG KÝ ---
            if (view === 'signup') {
                if (password !== confirmPassword) throw new Error("Mật khẩu xác nhận không khớp");

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    // Supabase sẽ tự gửi OTP nếu bạn đã config Email Template dùng {{ .Token }}
                });

                if (error) throw error;

                // TRƯỜNG HỢP: Cần xác minh Email (User tạo nhưng chưa có session)
                if (data.user && !data.session) {
                    setMessage(`Mã xác minh đã được gửi đến ${email}`);
                    setView('verify_signup'); // Chuyển sang màn hình nhập OTP
                }
                // TRƯỜNG HỢP: Supabase tự đăng nhập luôn (Nếu config tắt Confirm Email)
                else if (data.session) {
                    router.push("/");
                }
            }

            // --- 2. XÁC MINH OTP ---
            else if (view === 'verify_signup') {
                if (!email) throw new Error("Email bị trống. Vui lòng nhập lại email.");

                const { data, error } = await supabase.auth.verifyOtp({
                    email,
                    token: otp,
                    type: 'signup'
                });

                if (error) throw error;
                await markUserAsVerified(); // 1. Đánh dấu đã xác minh

                // 2. Kiểm tra Profile để điều hướng (Yêu cầu 1)
                const profile = await getCurrentUserProfile();
                if (profile && !profile.is_profile_completed) {
                    setMessage("Xác minh thành công! Vui lòng hoàn thiện hồ sơ.");
                    router.push("/profile/edit"); // Chuyển sang trang Edit
                } else {
                    setMessage("Xác minh thành công! Đang vào ứng dụng...");
                    router.push("/");
                }
                router.refresh();
                // // Xác minh thành công -> Session được lưu -> useEffect ở trên sẽ tự redirect
                // setMessage("Xác minh thành công! Đang vào ứng dụng...");
                // router.push("/profile/edit");
            }

            // --- 3. ĐĂNG NHẬP ---
            else if (view === 'login') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) {
                    // FIX LỖI: Nếu đăng nhập mà tài khoản chưa xác thực
                    if (error.message.includes("Email not confirmed")) {
                        setMessage("Tài khoản chưa được xác thực. Vui lòng nhập mã OTP đã gửi về email.");
                        setView('verify_signup');
                        // Tự động gửi lại mã mới cho tiện người dùng
                        await supabase.auth.resend({ type: 'signup', email });
                        return;
                    }
                    // Kiểm tra Profile sau khi login
                    const profile = await getCurrentUserProfile();
                    if (profile && !profile.is_profile_completed) {
                        router.push("/profile/edit");
                    } else {
                        router.push("/");
                    }
                    router.refresh();
                }
            }

        } catch (err: unknown) {
            let errorMessage = "Đã xảy ra lỗi";
            if (err instanceof Error) errorMessage = err.message;
            else if (typeof err === "string") errorMessage = err;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    // Xử lý Quên mật khẩu
    const handleForgotPassword = async () => {
        if (!email) {
            setError("Vui lòng nhập email vào ô bên trên để lấy lại mật khẩu.");
            return;
        }
        setLoading(true);
        setError("");
        try {
            // Gửi OTP để reset pass
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { shouldCreateUser: false }
            });
            if (error) throw error;

            // Chuyển hướng sang trang Reset Password (bạn cần tạo file này như hướng dẫn trước)
            router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
        } catch (err: unknown) {
            let errorMessage = "Lỗi gửi yêu cầu";
            if (err instanceof Error) errorMessage = err.message;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) return <LoadingSpinner />;

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#FFC5D3] p-4 font-sans">
            <div className="bg-white/90 dark:bg-gray-900 rounded-[30px] shadow-2xl overflow-hidden flex max-w-5xl w-full min-h-[600px] relative">
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-32 h-32 bg-pink-400/20 rounded-br-full z-0 pointer-events-none blur-xl"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-400/20 rounded-tl-full z-0 pointer-events-none blur-xl"></div>

                {/* Left Side (Image) */}
                <div ref={imageRef} className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#ff9a9e] to-[#fecfef] relative flex-col justify-between p-8 text-white auth-image">
                    <div className="text-3xl font-serif font-bold tracking-wide">Stream Match</div>
                    <div className="flex-1 flex items-center justify-center relative">
                        <div className="relative w-full h-64">
                            <img
                                src="/rom.svg"
                                alt="Couple"
                                className="w-full object-cover mix-blend-multiply opacity-80 rounded-xl"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                            />
                        </div>
                    </div>
                    <div className="text-center"><p className="text-lg font-medium opacity-90">Kết nối yêu thương, xây dựng hạnh phúc.</p></div>
                </div>

                {/* Right Side (Form) */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative z-10 bg-white dark:bg-gray-800">
                    <div ref={formRef} className="max-w-sm mx-auto w-full">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-[#E94086] dark:text-pink-400 mb-2">
                                {view === 'login' ? 'Đăng Nhập' : view === 'signup' ? 'Đăng Ký' : 'Xác Minh OTP'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                {view === 'verify_signup'
                                    ? `Nhập mã xác nhận vừa gửi tới email`
                                    : 'Chào mừng bạn đến với StreamMatch'}
                            </p>
                        </div>

                        <form className="space-y-5" onSubmit={handleAuth}>
                            {/* Luôn hiện Email để tránh mất state, disable khi đang verify */}
                            <div className="auth-input relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><MailIcon /></div>
                                <input
                                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                    disabled={view === 'verify_signup'}
                                    className={`block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#E94086] focus:outline-none dark:bg-gray-700 dark:text-white ${view === 'verify_signup' ? 'opacity-70 bg-gray-100' : ''}`}
                                    placeholder="Email của bạn"
                                />
                            </div>

                            {/* Password (Hiện khi Login & Signup) */}
                            {view !== 'verify_signup' && (
                                <div className="auth-input relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LockIcon /></div>
                                    <input
                                        type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#E94086] focus:outline-none dark:bg-gray-700 dark:text-white"
                                        placeholder="Mật khẩu"
                                    />
                                </div>
                            )}

                            {/* Confirm Password (Chỉ hiện khi Signup) */}
                            {view === 'signup' && (
                                <div className="auth-input relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LockIcon /></div>
                                    <input
                                        type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#E94086] focus:outline-none dark:bg-gray-700 dark:text-white"
                                        placeholder="Xác nhận mật khẩu"
                                    />
                                </div>
                            )}

                            {/* OTP Input (Chỉ hiện khi Verify Signup) */}
                            {view === 'verify_signup' && (
                                <div className="auth-input relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyIcon /></div>
                                    <input
                                        type="text" required maxLength={8} value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#E94086] focus:outline-none dark:bg-gray-700 dark:text-white tracking-widest text-lg font-bold text-center"
                                        placeholder="Nhập mã xác nhận"
                                        autoFocus
                                    />
                                </div>
                            )}

                            {/* Remember & Forgot Pass (Chỉ hiện khi Login) */}
                            {view === 'login' && (
                                <div className="flex items-center justify-between auth-input text-sm">
                                    <label className="flex items-center text-gray-600 dark:text-gray-300 cursor-pointer">
                                        <input
                                            type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                                            className="mr-2 rounded text-[#E94086] focus:ring-[#E94086]"
                                        />
                                        Ghi nhớ đăng nhập
                                    </label>
                                    <button type="button" onClick={handleForgotPassword} className="text-[#E94086] hover:underline font-medium">
                                        Quên mật khẩu?
                                    </button>
                                </div>
                            )}

                            {/* Verify Actions */}
                            {view === 'verify_signup' && (
                                <div className="flex justify-between items-center auth-input mt-4">
                                    <button
                                        type="button"
                                        onClick={() => switchView('signup')}
                                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        ← Đổi Email khác
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        disabled={loading}
                                        className="text-sm font-bold text-[#E94086] hover:text-[#d63376] hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        {loading ? "Đang gửi..." : "Gửi lại mã"}
                                    </button>
                                </div>
                            )}

                            {/* Notifications */}
                            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-100 animate-pulse">{error}</div>}
                            {message && <div className="text-green-600 text-sm text-center bg-green-50 p-2 rounded-lg border border-green-100">{message}</div>}

                            {/* Submit Button */}
                            <button
                                type="submit" disabled={loading}
                                className="auth-input w-full py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-[#E94086] hover:bg-[#d63376] transition-all transform hover:scale-[1.02] disabled:opacity-50"
                            >
                                {loading
                                    ? "ĐANG XỬ LÝ..."
                                    : view === 'login' ? "ĐĂNG NHẬP"
                                        : view === 'signup' ? "ĐĂNG KÝ"
                                            : "XÁC NHẬN"}
                            </button>
                        </form>

                        <div className="relative my-6 auth-input">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
                            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Hoặc</span></div>
                        </div>

                        {/* Toggle View */}
                        {view !== 'verify_signup' && (
                            <div className="text-center auth-input">
                                {view === 'login' ? (
                                    <button onClick={() => switchView('signup')} className="text-gray-600 dark:text-gray-300 text-sm">
                                        Chưa có tài khoản? <span className="text-[#E94086] font-bold">Đăng ký ngay</span>
                                    </button>
                                ) : (
                                    <button onClick={() => switchView('login')} className="text-gray-600 dark:text-gray-300 text-sm">
                                        Đã có tài khoản? <span className="text-[#E94086] font-bold">Đăng nhập</span>
                                    </button>
                                )}
                            </div>
                        )}
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
            gsap.to(spinnerRef.current, { rotation: 360, repeat: -1, ease: "linear", duration: 1 });
        }
    }, []);
    return (
        <div className="flex items-center justify-center h-screen bg-[#FFC5D3]">
            <div ref={spinnerRef} className="w-12 h-12 border-4 border-white border-t-[#E94086] rounded-full"></div>
        </div>
    );
};