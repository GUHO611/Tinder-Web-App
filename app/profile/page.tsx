"use client";

import { getCurrentUserProfile } from "@/lib/actions/profile";
import { useEffect, useState } from "react";
import Link from "next/link";
import { calculateAge } from "@/lib/helpers/calculate-age";

// 1. Cập nhật Interface khớp với Database mới
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
    gender_preference: string[]; // Supabase trả về string array
}

export interface UserProfile {
    id: string;
    full_name: string;
    username: string;
    email: string;
    gender: string; // 'male' | 'female' | 'other' | 'unknown'
    birthdate: string;
    bio: string | null;
    avatar_url: string | null;

    // Thông tin mới từ Schema V2
    display_address: string | null; // Thay thế cho location_lat/lng
    is_profile_completed: boolean;

    preferences: UserPreferences;
    hobbies?: Hobby[]; // Mảng sở thích (được join từ bảng user_hobbies)

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
                console.log("Hồ sơ đã tải:", profileData);

                if (profileData) {
                    // Ép kiểu hoặc validate dữ liệu trả về từ Server Action
                    setProfile(profileData as unknown as UserProfile);
                } else {
                    setError("Không tải được hồ sơ");
                }
            } catch (err) {
                console.error("Không tải được hồ sơ: ", err);
                setError("Không tải được hồ sơ");
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải hồ sơ của bạn...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <span className="text-4xl">❌</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Không tìm thấy hồ sơ</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{error || "Unable to load your profile."}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold py-3 px-6 rounded-full hover:from-pink-600 hover:to-red-600 transition-all duration-200"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Hồ Sơ của Bạn</h1>
                    <p className="text-gray-600 dark:text-gray-400">Quản lý hồ sơ và sở thích của bạn</p>
                </header>

                <div className="max-w-4xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Column */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Profile Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-pink-100 dark:border-gray-700">
                                            <img
                                                src={profile.avatar_url || "/default-avatar.png"}
                                                alt={profile.full_name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {profile.is_verified && (
                                            <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full border-2 border-white dark:border-gray-800" title="Verified User">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 text-center sm:text-left">
                                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                                            {profile.full_name}, {profile.birthdate ? calculateAge(profile.birthdate) : "?"} tuổi
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-400 mb-1">@{profile.username}</p>

                                        {/* Hiển thị Địa chỉ */}
                                        {profile.display_address && (
                                            <div className="flex items-center justify-center sm:justify-start text-sm text-gray-500 dark:text-gray-400 mb-2">
                                                <span className="mr-1">📍</span>
                                                {profile.display_address}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-center sm:justify-start space-x-2">
                                            {!profile.is_profile_completed && (
                                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Hồ sơ chưa hoàn chỉnh</span>
                                            )}
                                            <span className="text-xs text-gray-400">
                                                Đã tham gia {new Date(profile.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Bio Section */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Giới thiệu về tôi</h3>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed italic">
                                            {profile.bio || "No bio added yet."}
                                        </p>
                                    </div>

                                    {/* Hobbies Section - MỚI */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Niềm đam mê & sở thích</h3>
                                        {profile.hobbies && profile.hobbies.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {profile.hobbies.map((hobby) => (
                                                    <span
                                                        key={hobby.id}
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-pink-50 text-pink-700 dark:bg-gray-700 dark:text-pink-300 border border-pink-100 dark:border-gray-600"
                                                    >
                                                        <span className="mr-2">{hobby.icon}</span>
                                                        {hobby.name}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic text-sm">Chưa chọn sở thích nào.</p>
                                        )}
                                    </div>

                                    {/* Basic Info */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Thông tin cơ bản</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giới Tính</label>
                                                <p className="text-gray-900 dark:text-white capitalize">
                                                    {profile.gender === "male"
                                                        ? "Nam"
                                                        : profile.gender === "female"
                                                            ? "Nữ"
                                                            : "Khác"}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sinh Nhật</label>
                                                <p className="text-gray-900 dark:text-white">
                                                    {profile.birthdate ? new Date(profile.birthdate).toLocaleDateString() : "Not set"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* --- THƯ VIỆN ẢNH (CAROUSEL CUỘN NGANG) --- */}
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                📸 Thư viện ảnh
                                                <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                                    {profile.photos?.length || 0}/5
                                                </span>
                                            </h3>
                                            {(!profile.photos || profile.photos.length === 0) && (
                                                <Link href="/profile/edit" className="text-sm text-pink-500 hover:underline">
                                                    + Thêm ảnh
                                                </Link>
                                            )}
                                        </div>

                                        {profile.photos && profile.photos.length > 0 ? (
                                            // Container cuộn ngang
                                            <div
                                                className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth"
                                                style={{ scrollbarWidth: 'thin', scrollbarColor: '#CBD5E1 transparent' }} // Style scrollbar cho Firefox
                                            >
                                                {profile.photos.map((photo, index) => (
                                                    <div
                                                        key={index}
                                                        // w-[30%] để hiện khoảng 3 ảnh, flex-none để không bị co lại
                                                        className="flex-none w-[30%] min-w-[120px] aspect-[2/3] rounded-xl overflow-hidden shadow-md snap-center border border-gray-100 dark:border-gray-700 relative group"
                                                    >
                                                        <img
                                                            src={photo}
                                                            alt={`Gallery ${index}`}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                        />
                                                        {/* Gradient mờ bên dưới để ảnh đẹp hơn */}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    </div>
                                                ))}

                                                {/* Nút giả cuối cùng để gợi ý bấm vào Edit nếu muốn thêm */}
                                                {profile.photos.length < 5 && (
                                                    <Link
                                                        href="/profile/edit"
                                                        className="flex-none w-[30%] min-w-[120px] aspect-[2/3] rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center text-gray-400 hover:text-pink-500 hover:border-pink-300 hover:bg-pink-50 dark:hover:bg-gray-700 transition-all snap-center"
                                                    >
                                                        <span className="text-2xl mb-1">+</span>
                                                        <span className="text-xs font-medium">Thêm</span>
                                                    </Link>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                                <p className="text-gray-500 text-sm mb-3">Bạn chưa có ảnh nào trong thư viện.</p>
                                                <Link
                                                    href="/profile/edit"
                                                    className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm shadow-sm hover:shadow-md transition-all"
                                                >
                                                    Tải ảnh lên ngay
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    {/* Preferences */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Sở thích hẹn hò</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Độ tuổi</label>
                                                <p className="text-gray-900 dark:text-white">
                                                    {profile.preferences?.age_range?.min} - {profile.preferences?.age_range?.max} tuổi
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Khoảng cách</label>
                                                <p className="text-gray-900 dark:text-white">lên đến  {profile.preferences?.distance} km</p>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quan tâm đến</label>
                                                <p className="text-gray-900 dark:text-white capitalize">

                                                    {/* Kiểm tra và ép kiểu ngay tại chỗ */}
                                                    {(profile.preferences as { gender_preference?: string[] })?.gender_preference?.length
                                                        ? (profile.preferences as { gender_preference: string[] }).gender_preference
                                                            .map((g) => GENDER_MAP[g] || g)
                                                            .join(", ")
                                                        : "Mọi người"}                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Actions */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <Link
                                        href="/profile/edit"
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                            </div>
                                            <span className="text-gray-900 dark:text-white">Chỉnh sửa hồ sơ</span>
                                        </div>
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>

                                    {/* Button bổ sung thông tin nếu chưa hoàn thiện */}
                                    {!profile.is_profile_completed && (
                                        <Link
                                            href="/onboarding"
                                            className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 transition-colors duration-200"
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white">⚠️</span>
                                                </div>
                                                <span className="text-gray-900 dark:text-white font-medium">Hoàn Thành Hồ Sơ</span>
                                            </div>
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tài Khoản</h3>
                                <div className="space-y-3">
                                    <div className="flex flex-col items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                                        <span className="text-gray-900 dark:text-white">Tên người dùng</span>
                                        <span className="text-gray-500 dark:text-gray-400">@{profile.username}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                                        <span className="text-gray-900 dark:text-white">Trạng thái</span>
                                        <span className={`text-sm ${profile.is_online ? 'text-green-500' : 'text-gray-500'}`}>
                                            {profile.is_online ? 'Online' : 'Offline'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}