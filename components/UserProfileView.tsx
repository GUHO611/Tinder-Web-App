"use client";

import { UserProfile } from "@/lib/actions/profile";
import { calculateAge } from "@/lib/helpers/calculate-age";
import Link from "next/link";

interface UserProfileViewProps {
    profile: UserProfile;
}

const GENDER_MAP: Record<string, string> = {
    male: "Nam",
    female: "Nữ",
    other: "Khác",
};

export default function UserProfileView({ profile }: UserProfileViewProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">

                {/* Header điều hướng nhỏ phía trên */}
                <div className="mb-6">
                    <Link
                        href="/chat"
                        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-pink-500 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Quay lại tin nhắn
                    </Link>
                </div>

                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* --- CỘT CHÍNH (THÔNG TIN PROFILE) --- */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Profile Card Chính */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
                                {/* Avatar & Tên */}
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
                                            <div className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full border-2 border-white dark:border-gray-800" title="Đã xác minh">
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 text-center sm:text-left">
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                                            {profile.full_name}, {profile.birthdate ? calculateAge(profile.birthdate) : "?"}
                                        </h1>
                                        <p className="text-gray-500 dark:text-gray-400 mb-2">@{profile.username}</p>

                                        {profile.display_address && (
                                            <div className="flex items-center justify-center sm:justify-start text-sm text-gray-500 dark:text-gray-400">
                                                <span className="mr-1">📍</span>
                                                {profile.display_address}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Bio */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Giới thiệu</h3>
                                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed italic">
                                            {profile.bio || "Người dùng này chưa viết giới thiệu."}
                                        </p>
                                    </div>

                                    {/* Hobbies */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Sở thích</h3>
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
                                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Giới Tính</label>
                                                <p className="text-gray-900 dark:text-white font-medium capitalize">
                                                    {GENDER_MAP[profile.gender || "other"] || profile.gender}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Cung Hoàng Đạo</label>
                                                <p className="text-gray-900 dark:text-white font-medium">
                                                    {/* Nếu muốn tính cung hoàng đạo thì cần thêm hàm helper, tạm thời để birthday */}
                                                    {profile.birthdate ? new Date(profile.birthdate).toLocaleDateString("vi-VN") : "Bí mật"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Thư viện ảnh (Carousel) */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    📸 Thư viện ảnh
                                    <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                                        {profile.photos?.length || 0}
                                    </span>
                                </h3>

                                {profile.photos && profile.photos.length > 0 ? (
                                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth" style={{ scrollbarWidth: 'thin' }}>
                                        {profile.photos.map((photo, index) => (
                                            <div key={index} className="flex-none w-[40%] sm:w-[30%] aspect-[2/3] rounded-xl overflow-hidden shadow-md snap-center border border-gray-100 dark:border-gray-700 relative group">
                                                <img
                                                    src={photo}
                                                    alt={`Gallery ${index}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic text-sm text-center py-4">Người dùng chưa có ảnh nào khác.</p>
                                )}
                            </div>
                        </div>

                        {/* --- CỘT PHẢI (SIDEBAR ACTION) --- */}
                        <div className="space-y-6">

                            {/* Status Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trạng thái</h3>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700 mb-4">
                                    <span className="text-gray-700 dark:text-gray-300">Hiện đang</span>
                                    <span className={`flex items-center gap-2 font-medium ${profile.is_online ? 'text-green-500' : 'text-gray-500'}`}>
                                        <span className={`w-2 h-2 rounded-full ${profile.is_online ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                                        {profile.is_online ? 'Online' : 'Offline'}
                                    </span>
                                </div>

                                {/* Nút hành động chính */}
                                <Link
                                    href={`/chat/${profile.id}`} // Nếu có logic match_id thì tốt, không thì quay về chat list
                                    className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                                >
                                    Nhắn tin ngay 💬
                                </Link>
                            </div>

                            {/* Thông tin thêm (Placeholder) */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tham gia từ</h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {new Date(profile.created_at).toLocaleDateString("vi-VN", { month: 'long', year: 'numeric' })}
                                </p>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}