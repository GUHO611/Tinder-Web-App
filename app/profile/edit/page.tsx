"use client";

import PhotoUpload from "@/componemts/PhotoUpload";
import {
    getCurrentUserProfile,
    updateUserProfile,
} from "@/lib/actions/profile";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Định nghĩa kiểu dữ liệu cho Form để typescript không báo lỗi
interface ProfileFormData {
    full_name: string;
    username: string;
    bio: string;
    gender: "male" | "female" | "other";
    birthdate: string;
    avatar_url: string;
    display_address: string;
    latitude: number | null;
    longitude: number | null;
}

export default function EditProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false); // Loading cho nút lấy vị trí
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const [formData, setFormData] = useState<ProfileFormData>({
        full_name: "",
        username: "",
        bio: "",
        gender: "male" as "male" | "female" | "other",
        birthdate: "",
        avatar_url: "",
        display_address: "", // Thêm trường địa chỉ hiển thị
        latitude: null,      // Thêm tọa độ để lưu vào PostGIS
        longitude: null,
    });

    useEffect(() => {
        async function loadProfile() {
            try {
                const profileData = await getCurrentUserProfile();
                if (profileData) {
                    setFormData({
                        full_name: profileData.full_name || "",
                        username: profileData.username || "",
                        bio: profileData.bio || "",
                        gender: (profileData.gender as "male" | "female" | "other") || "male",
                        birthdate: profileData.birthdate || "",
                        avatar_url: profileData.avatar_url || "",
                        display_address: profileData.display_address || "",
                        // Lưu ý: Backend cần trả về lat/long từ cột location (PostGIS)
                        latitude: profileData.latitude || null,
                        longitude: profileData.longitude || null,
                    });
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, []);

    // Hàm lấy vị trí từ trình duyệt
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                // Cập nhật tọa độ vào state
                setFormData((prev) => ({
                    ...prev,
                    latitude,
                    longitude,
                    // Tạm thời hiển thị tọa độ nếu chưa có API Geocoding
                    // Trong thực tế, bạn nên gọi API (Google Maps/Mapbox) để đổi tọa độ thành tên đường
                    display_address: prev.display_address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                }));

                setLocationLoading(false);
            },
            (error) => {
                setError("Unable to retrieve your location. Please allow location access.");
                setLocationLoading(false);
            }
        );
    };

    async function handleFormSubmit(e: React.FormEvent) {
        e.preventDefault();

        setSaving(true);
        setError(null);

        try {
            // Gửi dữ liệu đi. 
            // Server Action (updateUserProfile) cần xử lý latitude/longitude 
            // để chuyển thành cú pháp PostGIS: ST_SetSRID(ST_MakePoint(long, lat), 4326)
            const result = await updateUserProfile(formData);
            if (result.success) {
                router.push("/profile");
            } else {
                setError(result.error || "Failed to update profile.");
            }
        } catch (err) {
            setError("Failed to update profile.");
        } finally {
            setSaving(false);
        }
    }

    function handleInputChange(
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Loading profile...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
            <div className="container mx-auto px-4 py-8">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Edit Profile
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Update your profile information
                    </p>
                </header>

                <div className="max-w-2xl mx-auto">
                    <form
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8"
                        onSubmit={handleFormSubmit}
                    >
                        {/* Avatar Section */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                Profile Picture
                            </label>
                            <div className="flex items-center space-x-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-sm">
                                        <img
                                            src={formData.avatar_url || "/default-avatar.png"}
                                            alt="Profile"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="mt-2">
                                        <PhotoUpload
                                            onPhotoUploaded={(url) => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    avatar_url: url,
                                                }));
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        Upload a new profile picture
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                        JPG, PNG or GIF. Max 5MB.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Basic Info Group */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label
                                    htmlFor="full_name"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    id="full_name"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Username *
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Choose a username"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label
                                    htmlFor="gender"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Gender *
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="birthdate"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Birthday *
                                </label>
                                <input
                                    type="date"
                                    id="birthdate"
                                    name="birthdate"
                                    value={formData.birthdate}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* LOCATION SECTION (New for PostGIS Schema) */}
                        <div className="mb-6">
                            <label
                                htmlFor="display_address"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Location (City, Country)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    id="display_address"
                                    name="display_address"
                                    value={formData.display_address}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Hanoi, Vietnam"
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                />
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    disabled={locationLoading}
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2 whitespace-nowrap"
                                >
                                    {locationLoading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                    Get Current Location
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Nhấp vào {"Lấy vị trí hiện tại"} để cập nhật vị trí chính xác của bạn để khớp hơn.
                            </p>
                        </div>

                        {/* Bio Section */}
                        <div className="mb-8">
                            <label
                                htmlFor="bio"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                About Me *
                            </label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                required
                                rows={4}
                                maxLength={500}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                                placeholder="Tell others about yourself..."
                            />
                            <div className="flex justify-between mt-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formData.bio.length}/500 characters
                                </p>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}