"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import Link from "next/link";

// --- Icons ---
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

export default function ResetPasswordPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    // Step 1: Nhập Pass mới, Step 2: Nhập OTP
    const [step, setStep] = useState<1 | 2>(1);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const supabase = createClient();
    const router = useRouter();
    const containerRef = useRef<HTMLDivElement>(null);

    // Animation khi load trang
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".reset-card", {
                y: 30, opacity: 0, duration: 0.8, ease: "power3.out"
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    // Chuyển từ bước nhập Pass sang nhập OTP
    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword.length < 6) {
            setError("Mật khẩu phải có ít nhất 6 ký tự");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }

        // Chuyển sang bước 2 (Nhập OTP)
        setStep(2);
        // Animation nhẹ chuyển step
        gsap.fromTo(".step-content", { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4 });
    };

    // Xử lý xác thực OTP và Đổi mật khẩu
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // 1. Xác thực mã OTP (để đăng nhập user vào phiên tạm)
            const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'email',
            });

            if (verifyError) throw verifyError;

            // 2. Sau khi verify thành công, user đã được login => Tiến hành đổi mật khẩu
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (updateError) throw updateError;

            setSuccess(true);
            setTimeout(() => {
                router.push("/auth"); // Chuyển về trang login hoặc trang chủ
            }, 2000);

        } catch (err: unknown) {
            let errorMessage = "Mã xác minh không đúng hoặc đã hết hạn";

            if (err instanceof Error) {
                errorMessage = err.message;
            }

            else if (typeof err === "string") {
                errorMessage = err;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div ref={containerRef} className="min-h-screen w-full flex items-center justify-center bg-[#FFC5D3] p-4 font-sans">
            <div className="reset-card bg-white/90 dark:bg-gray-900 rounded-[30px] shadow-2xl p-8 md:p-12 w-full max-w-md relative overflow-hidden">

                {/* Decorative BG */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-400/10 rounded-bl-full pointer-events-none"></div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#E94086] dark:text-pink-400 mb-2">
                        {step === 1 ? "Đặt lại mật khẩu" : "Xác minh danh tính"}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {step === 1
                            ? "Tạo mật khẩu mới cho tài khoản của bạn"
                            : `Nhập mã 6 số đã được gửi đến ${email}`
                        }
                    </p>
                </div>

                {!success ? (
                    <form onSubmit={step === 1 ? handleNextStep : handleSubmit} className="space-y-6 step-content">

                        {/* STEP 1: NHẬP PASSWORD MỚI */}
                        {step === 1 && (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LockIcon /></div>
                                    <input
                                        type="password"
                                        required
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#E94086] focus:outline-none dark:bg-gray-700 dark:text-white"
                                        placeholder="Mật khẩu mới"
                                    />
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><LockIcon /></div>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#E94086] focus:outline-none dark:bg-gray-700 dark:text-white"
                                        placeholder="Xác nhận mật khẩu mới"
                                    />
                                </div>
                            </>
                        )}

                        {/* STEP 2: NHẬP OTP */}
                        {step === 2 && (
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><KeyIcon /></div>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Chỉ cho nhập số
                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-[#E94086] focus:outline-none dark:bg-gray-700 dark:text-white tracking-widest text-lg font-bold text-center"
                                    placeholder="000000"
                                />
                            </div>
                        )}

                        {error && (
                            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg border border-red-100 animate-pulse">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            {step === 2 && (
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-4 py-3 rounded-xl border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                                >
                                    Quay lại
                                </button>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-[#E94086] hover:bg-[#d63376] transition-all transform hover:scale-[1.02] disabled:opacity-50"
                            >
                                {loading
                                    ? "ĐANG XỬ LÝ..."
                                    : step === 1 ? "TIẾP TỤC" : "XÁC NHẬN & ĐỔI MẬT KHẨU"
                                }
                            </button>
                        </div>
                    </form>
                ) : (
                    // Màn hình thành công
                    <div className="text-center py-8 animate-fadeIn">
                        <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                            ✓
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Thành công!</h3>
                        <p className="text-gray-500">Mật khẩu của bạn đã được cập nhật.</p>
                        <p className="text-gray-400 text-sm mt-4">Đang chuyển hướng...</p>
                    </div>
                )}

                {/* Footer link */}
                {!success && (
                    <div className="mt-8 text-center">
                        <Link href="/auth" className="text-sm text-gray-500 hover:text-[#E94086]">
                            Quay về trang đăng nhập
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}