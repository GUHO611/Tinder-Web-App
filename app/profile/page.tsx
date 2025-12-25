"use client";

import { getCurrentUserProfile } from "@/lib/actions/profile";
import { useEffect, useState } from "react";
import Link from "next/link";
import { calculateAge } from "@/lib/helpers/calculate-age";

// --- INTERFACES ---
export interface Hobby {
    id: string;
    name: string;
    icon: string;
    category: string;
}

export interface UserPreferences {
    age_range: {
        min: number;
        max: number;
    };
    distance: number;
    gender_preference: string[];
}

export interface UserProfile {
    id: string;
    full_name: string;
    username: string;
    email: string;
    gender: string;
    birthdate: string;
    bio: string | null;
    avatar_url: string | null;
    display_address: string | null;
    is_profile_completed: boolean;
    preferences: UserPreferences;
    hobbies?: Hobby[];
    last_active: string;
    is_verified: boolean;
    is_online: boolean;
    created_at: string;
    photos: string[];
}

const GENDER_MAP: Record<string, string> = {
    male: "Nam",
    female: "Nữ",
    other: "Khác",
};

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadProfile() {
            try {
                const profileData = await getCurrentUserProfile();
                if (profileData) {
                    setProfile(profileData as unknown as UserProfile);
                } else {
                    setError("Không tải được hồ sơ");
                }
            } catch (err) {
                console.error("Lỗi:", err);
                setError("Không tải được hồ sơ");
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, []);

    // --- LOADING STATE ---
    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)" }}
            >
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
            </div>
        );
    }

    // --- ERROR STATE ---
    if (error || !profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Có lỗi xảy ra</h2>
                    <button onClick={() => window.location.reload()} className="px-6 py-2 bg-pink-500 text-white rounded-full">
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    // --- MAIN UI ---
    return (
        <div
            className="min-h-screen pb-20"
            // 1. BACKGROUND THỐNG NHẤT
            style={{ background: "linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)" }}
        >
            <style jsx global>{`
        /* Ẩn thanh cuộn cho gallery nhưng vẫn scroll được */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

            <div className="container mx-auto px-4 py-8">

                {/* Header - Màu chữ tối vì nền sáng */}
                <header className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-800 drop-shadow-sm">Hồ Sơ Của Tôi</h1>
                        <p className="text-slate-600 text-sm font-medium">Hiển thị cách người khác nhìn thấy bạn</p>
                    </div>
                    {/* 2. ĐÃ BỎ NÚT CÀI ĐẶT Ở ĐÂY */}
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* --- CỘT TRÁI (MAIN INFO) - Chiếm 8/12 --- */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* Card Hồ sơ chính */}
                        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-[2rem] shadow-xl border border-white/50 p-6 sm:p-8 relative overflow-hidden group">

                            {/* Decoration background light */}
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-pink-400/20 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
                                {/* Avatar Container */}
                                <div className="relative">
                                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-pink-400 to-rose-400 shadow-lg">
                                        <img
                                            src={profile.avatar_url || "/default-avatar.png"}
                                            alt={profile.full_name}
                                            className="w-full h-full rounded-full object-cover border-4 border-white dark:border-gray-800"
                                        />
                                    </div>
                                    {profile.is_verified && (
                                        <div className="absolute bottom-1 right-1 bg-blue-500 text-white p-1.5 rounded-full border-2 border-white shadow-sm" title="Đã xác minh">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    )}
                                    {/* 3. ĐÃ BỎ ONLINE STATUS DOT MÀU XANH Ở ĐÂY */}
                                </div>

                                {/* Info */}
                                <div className="flex-1 text-center sm:text-left">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                        <div>
                                            <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">
                                                {profile.full_name}, <span className="font-light">{profile.birthdate ? calculateAge(profile.birthdate) : "??"} tuổi</span>
                                            </h2>
                                            <p className="text-pink-600 dark:text-pink-400 font-bold">@{profile.username}</p>
                                        </div>

                                        <Link href="/profile/edit" className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-slate-800 text-white hover:bg-slate-900 hover:text-white dark:bg-white dark:text-slate-900 transition shadow-lg hover:-translate-y-0.5 transform font-medium whitespace-nowrap">
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                            Chỉnh sửa
                                        </Link>
                                    </div>

                                    {profile.display_address && (
                                        <div className="mt-3 flex items-center justify-center sm:justify-start text-slate-600 dark:text-gray-300 font-medium">
                                            <span className="mr-1 text-red-500">📍</span> {profile.display_address}
                                        </div>
                                    )}

                                    <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                                        {!profile.is_profile_completed ? (
                                            <span className="px-3 py-1 rounded-lg bg-yellow-100 text-yellow-700 text-xs font-bold border border-yellow-200 shadow-sm">
                                                ⚠️ Hồ sơ chưa hoàn tất
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-lg bg-green-100 text-green-700 text-xs font-bold border border-green-200 shadow-sm">
                                                ✅ Hồ sơ hoàn chỉnh
                                            </span>
                                        )}
                                        <span className="px-3 py-1 rounded-lg bg-white/60 dark:bg-gray-700/50 text-white text-xs font-semibold shadow-sm">
                                            Tham gia: {new Date(profile.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PHOTOS GALLERY */}
                        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-[2rem] shadow-lg border border-white/50 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    📸 Thư viện ảnh
                                </h3>
                                <Link href="/profile/edit" className="text-sm font-bold text-pink-400 hover:text-pink-700 transition">
                                    Quản lý
                                </Link>
                            </div>

                            {profile.photos && profile.photos.length > 0 ? (
                                <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory">
                                    {profile.photos.map((photo, index) => (
                                        <div key={index} className="flex-none w-40 aspect-[3/4] rounded-2xl overflow-hidden shadow-md snap-start border-[3px] border-white dark:border-gray-700 relative group cursor-pointer">
                                            <img src={photo} alt={`Photo ${index}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        </div>
                                    ))}
                                    {profile.photos.length < 5 && (
                                        <Link href="/profile/edit" className="flex-none w-40 aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-300/60 flex flex-col items-center justify-center text-slate-500 hover:bg-white/40 transition snap-start group">
                                            <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center group-hover:bg-pink-100 group-hover:text-pink-600 transition shadow-sm">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            </div>
                                            <span className="text-xs font-bold mt-2">Thêm ảnh</span>
                                        </Link>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-white/30 rounded-2xl border border-dashed border-slate-300">
                                    <p className="text-slate-500 font-medium">Chưa có ảnh nào.</p>
                                    <Link href="/profile/edit" className="text-pink-600 font-bold hover:underline">Tải lên ngay</Link>
                                </div>
                            )}
                        </div>

                        {/* BIO & HOBBIES GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Bio */}
                            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-[2rem] shadow-lg border border-white/50 p-6">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">📝 Giới thiệu</h3>
                                <p className="text-slate-600 dark:text-gray-300 leading-relaxed italic font-medium">
                                    {profile.bio || "Người dùng này khá kín tiếng, chưa viết gì cả..."}
                                </p>
                            </div>

                            {/* Hobbies */}
                            <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-[2rem] shadow-lg border border-white/50 p-6">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-3">🎵 Sở thích</h3>
                                {profile.hobbies && profile.hobbies.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {profile.hobbies.map((hobby) => (
                                            <span key={hobby.id} className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-white/70 text-pink-700 dark:text-pink-400 border border-pink-100 font-semibold shadow-sm">
                                                <span className="mr-1.5">{hobby.icon}</span> {hobby.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-sm font-medium">Chưa chọn sở thích.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* --- CỘT PHẢI (SIDEBAR) - Chiếm 4/12 --- */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* Preferences Card */}
                        <div className="bg-white/70 dark:bg-gray-800/80 backdrop-blur-xl rounded-[2rem] shadow-lg border border-white/50 p-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                                <span className="bg-orange-100 text-orange-600 p-1.5 rounded-lg mr-2 shadow-sm">🎯</span>
                                Gu hẹn hò
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-gray-700">
                                    <span className="text-slate-400 text-sm font-medium">Độ tuổi</span>
                                    <span className="font-bold text-slate-800 dark:text-white">
                                        {profile.preferences?.age_range?.min} - {profile.preferences?.age_range?.max}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-gray-700">
                                    <span className="text-slate-400 text-sm font-medium">Khoảng cách</span>
                                    <span className="font-bold text-slate-800 dark:text-white">
                                        {profile.preferences?.distance} km
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-400 text-sm font-medium">Giới tính</span>
                                    <span className="font-bold text-slate-800 dark:text-white capitalize text-right">
                                        {(profile.preferences as { gender_preference?: string[] })?.gender_preference?.length
                                            ? (profile.preferences as { gender_preference: string[] }).gender_preference.map((g) => GENDER_MAP[g] || g).join(", ")
                                            : "Mọi người"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Basic Info Card */}
                        <div className="bg-white/70 dark:bg-gray-800/80 backdrop-blur-xl rounded-[2rem] shadow-lg border border-white/50 p-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center">
                                <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg mr-2 shadow-sm">ℹ️</span>
                                Thông tin cơ bản
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-400 text-sm font-medium">Giới tính</span>
                                    <span className="font-bold text-slate-800 dark:text-white">{GENDER_MAP[profile.gender] || profile.gender}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400 text-sm font-medium">Sinh nhật</span>
                                    <span className="font-bold text-slate-800 dark:text-white">{profile.birthdate ? new Date(profile.birthdate).toLocaleDateString('vi-VN') : "Chưa cập nhật"}</span>
                                </div>
                                {/* 4. THAY CUNG HOÀNG ĐẠO BẰNG EMAIL */}
                                <div className="flex justify-between">
                                    <span className="text-slate-400 text-sm font-medium">Email</span>
                                    <span className="font-bold text-slate-800 dark:text-white truncate max-w-[150px]" title={profile.email}>{profile.email}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Box */}
                        {!profile.is_profile_completed && (
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-[2rem] shadow-lg p-6 text-white text-center">
                                <h3 className="font-bold text-lg mb-2">Hoàn thiện hồ sơ ngay!</h3>
                                <p className="text-white/90 text-sm mb-4 font-medium">Hồ sơ đầy đủ giúp bạn tăng 70% cơ hội tương hợp.</p>
                                <Link href="/onboarding" className="inline-block w-full py-2.5 bg-white text-orange-600 font-bold rounded-xl shadow hover:bg-gray-50 transition">
                                    Cập nhật ngay
                                </Link>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}