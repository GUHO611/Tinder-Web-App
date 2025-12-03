"use client";

import PhotoUpload from "@/componemts/PhotoUpload";
import {
    getCurrentUserProfile,
    updateUserProfile,
    getAllHobbies,
} from "@/lib/actions/profile";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


interface Hobby {
    id: string;
    name: string;
    icon: string;
}
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
    hobbiesIds: string[]; // Mảng chứa ID các sở thích đã chọn
}

export default function EditProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false); // Loading cho nút lấy vị trí
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // State cho danh sách sở thích
    const [availableHobbies, setAvailableHobbies] = useState<Hobby[]>([]);

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
        hobbiesIds: [],
    });

    useEffect(() => {
        async function loadProfile() {
            try {
                console.log("🚀 Bắt đầu tải dữ liệu...");

                // Tách ra chạy riêng để dễ debug từng cái
                const hobbiesData = await getAllHobbies();
                console.log("📦 Dữ liệu Hobbies nhận được ở Client:", hobbiesData);

                const profileData = await getCurrentUserProfile();
                console.log("👤 Dữ liệu Profile nhận được ở Client:", profileData);
                console.log("📍 CLIENT - Tọa độ nhận được:", {
                    lat: profileData?.latitude,
                    lng: profileData?.longitude,
                    full_profile: profileData // Log cả cục để xem chi tiết
                });

                // Cập nhật State
                if (hobbiesData && hobbiesData.length > 0) {
                    setAvailableHobbies(hobbiesData);
                } else {
                    console.warn("⚠️ Danh sách sở thích rỗng!");
                }
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
                        hobbiesIds: profileData.hobbiesIds || [],
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
    // --- XỬ LÝ SỞ THÍCH ---
    const toggleHobby = (hobbyId: string) => {
        setFormData((prev) => {
            const exists = prev.hobbiesIds.includes(hobbyId);
            let newHobbies;
            if (exists) {
                newHobbies = prev.hobbiesIds.filter((id) => id !== hobbyId);
            } else {
                if (prev.hobbiesIds.length >= 5) {
                    alert("Bạn chỉ được chọn tối đa 5 sở thích!");
                    return prev;
                }
                newHobbies = [...prev.hobbiesIds, hobbyId];
            }
            return { ...prev, hobbiesIds: newHobbies };
        });
    };

    // Hàm lấy vị trí từ trình duyệt
    // --- LOGIC 2 & 3: XỬ LÝ VỊ TRÍ & REVERSE GEOCODING ---
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setError("Trình duyệt không hỗ trợ định vị.");
            return;
        }

        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                let addressName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

                // GỌI API REVERSE GEOCODING (MIỄN PHÍ TỪ OPENSTREETMAP)
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
                    );
                    const data = await res.json();

                    if (data && data.address) {
                        // Ưu tiên lấy Thành phố -> Thị xã -> Quận/Huyện
                        const city = data.address.city || data.address.town || data.address.county || data.address.state;
                        const country = data.address.country;
                        addressName = `${city}, ${country}`;
                    }
                } catch (err) {
                    console.error("Lỗi lấy tên địa điểm:", err);
                    // Nếu lỗi API thì vẫn giữ tọa độ số
                }

                setFormData((prev) => ({
                    ...prev,
                    latitude,
                    longitude,
                    display_address: addressName, // Tự động điền tên thành phố
                }));
                setLocationLoading(false);
            },
            (err) => {
                setError("Vui lòng cấp quyền truy cập vị trí.");
                setLocationLoading(false);
            }
        );
    };

    async function handleFormSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        // Kiểm tra logic vị trí
        if (!formData.latitude || !formData.longitude) {
            setError("Vui lòng nhấn 'Cập nhật vị trí' để chúng tôi tìm người phù hợp quanh bạn.");
            setSaving(false);
            return;
        }

        try {
            const result = await updateUserProfile(formData);
            if (result.success) {
                router.push("/profile");
            } else {
                setError(result.error || "Lỗi cập nhật hồ sơ.");
            }
        } catch (err) {
            setError("Lỗi hệ thống.");
        } finally {
            setSaving(false);
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">
                        Đang tải hồ sơ...
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
                        Chỉnh sửa hồ sơ
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Cập nhật thông tin cá nhân của bạn.
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
                                Ảnh Đại Diện
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
                                        Tải lên ảnh đại diện mới
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500">
                                        JPG, PNG or GIF. Tối đa 5MB.
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
                                    Tên đầy đủ *
                                </label>
                                <input
                                    type="text"
                                    id="full_name"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Nhập tên đầy đủ của bạn"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Tên người dùng *
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                    placeholder="Chọn tên người dùng"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label
                                    htmlFor="gender"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Giới Tính *
                                </label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>

                            <div>
                                <label
                                    htmlFor="birthdate"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Sinh nhật *
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

                        {/* --- LOCATION SECTION (Đã tối ưu) --- */}
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg border border-blue-100 dark:border-gray-600">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                                📍 Vị trí của bạn (Bắt buộc để Matching)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={formData.display_address}
                                    readOnly // QUAN TRỌNG: Không cho sửa tay để đảm bảo match đúng
                                    placeholder="Chưa có vị trí"
                                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg cursor-not-allowed text-gray-500 dark:text-gray-300"
                                />
                                <button
                                    type="button"
                                    onClick={handleGetLocation}
                                    disabled={locationLoading}
                                    className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shadow-md"
                                >
                                    {locationLoading ? "Đang tìm..." : "Cập nhật vị trí"}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                * Hệ thống sử dụng GPS để tìm người ở gần bạn. Vui lòng nhấn nút Cập nhật.
                            </p>
                        </div>

                        {/* --- SỞ THÍCH (HOBBIES) --- */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex justify-between">
                                <span>Sở thích</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${formData.hobbiesIds.length === 5 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    Đã chọn: {formData.hobbiesIds.length}/5
                                </span>
                            </label>

                            {availableHobbies.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {availableHobbies.map((hobby) => {
                                        const isSelected = formData.hobbiesIds.includes(hobby.id);
                                        return (
                                            <button
                                                key={hobby.id}
                                                type="button"
                                                onClick={() => toggleHobby(hobby.id)}
                                                className={`
                                  group relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border select-none
                                  ${isSelected
                                                        ? "bg-pink-500 text-white border-pink-500 shadow-md ring-2 ring-pink-200"
                                                        : "bg-white text-gray-600 border-gray-200 hover:border-pink-300 hover:bg-pink-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                                                    }
                              `}
                                            >
                                                <span className="mr-1.5">{hobby.icon}</span>
                                                {hobby.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                // Nếu tải xong mà vẫn không có dữ liệu -> Hiện thông báo khác, không hiện "Đang tải" nữa
                                <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center">
                                    <p className="text-sm text-gray-500 mb-2">
                                        {loading ? "Đang tải danh sách..." : "Không tìm thấy danh sách sở thích."}
                                    </p>
                                    {!loading && (
                                        <button
                                            type="button"
                                            onClick={() => window.location.reload()}
                                            className="text-xs text-pink-500 underline"
                                        >
                                            Tải lại trang
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Bio Section */}
                        <div className="mb-8">
                            <label
                                htmlFor="bio"
                                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                            >
                                Giới thiệu về tôi *
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
                                placeholder="Hãy kể cho người khác nghe về bạn..."
                            />
                            <div className="flex justify-between mt-1">
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formData.bio.length}/500 từ
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
                                Quay lại
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                {saving ? "Đang lưu..." : "Lưu thay đổi"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}