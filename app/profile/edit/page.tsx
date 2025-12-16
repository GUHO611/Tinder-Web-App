"use client";

import PhotoUpload from "@/components/PhotoUpload";
import {
    getCurrentUserProfile,
    updateUserProfile,
    getAllHobbies,
    UserProfile
} from "@/lib/actions/profile";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export interface UserPreferences {
    age_range: {
        min: number;
        max: number;
    };
    distance: number;
    gender_preference: string[];
}
interface Hobby {
    id: string;
    name: string;
    icon: string;
}

// Định nghĩa kiểu dữ liệu cho Form
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
    hobbiesIds: string[];
    photos: string[];
    preferences: UserPreferences;
}

export default function EditProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const [availableHobbies, setAvailableHobbies] = useState<Hobby[]>([]);

    const [formData, setFormData] = useState<ProfileFormData>({
        full_name: "",
        username: "",
        bio: "",
        gender: "male", // Mặc định là male nếu chưa chọn
        birthdate: "",
        avatar_url: "",
        display_address: "",
        latitude: null,
        longitude: null,
        hobbiesIds: [],
        photos: [],
        preferences: {
            age_range: { min: 18, max: 50 },
            distance: 25,
            gender_preference: []
        }
    });

    useEffect(() => {
        async function loadData() {
            try {
                // Chạy song song cả 2 request để tiết kiệm thời gian
                const [hobbiesData, profileData] = await Promise.all([
                    getAllHobbies(),
                    getCurrentUserProfile()
                ]);

                // 1. Set Hobbies
                if (hobbiesData && hobbiesData.length > 0) {
                    setAvailableHobbies(hobbiesData);
                }

                // 2. Set Profile Data (Nếu có)
                if (profileData) {
                    // Xử lý Gender an toàn: Nếu DB trả về giá trị lạ hoặc null -> về "male" hoặc giá trị mặc định
                    const safeGender = ["male", "female", "other"].includes(profileData.gender || "other")
                        ? (profileData.gender as "male" | "female" | "other")
                        : "male";

                    setFormData({
                        full_name: profileData.full_name || "",
                        username: profileData.username || "",
                        bio: profileData.bio || "",
                        gender: safeGender,
                        birthdate: profileData.birthdate || "",
                        avatar_url: profileData.avatar_url || "",
                        display_address: profileData.display_address || "",
                        latitude: profileData.latitude || null,
                        longitude: profileData.longitude || null,
                        // Quan trọng: Kiểm tra mảng hobbiesIds có tồn tại không
                        hobbiesIds: Array.isArray(profileData.hobbiesIds) ? profileData.hobbiesIds : [],
                        photos: profileData.photos || [],
                        preferences: (profileData.preferences as unknown as UserPreferences) || {
                            age_range: { min: 18, max: 50 },
                            distance: 25,
                            gender_preference: []
                        }
                    });
                }
            } catch {
                setError("Không thể tải thông tin hồ sơ. Vui lòng thử lại.");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);
    // Helper update Preferences
    const updatePreference = <K extends keyof UserPreferences>(field: K, value: UserPreferences[K]) => {
        setFormData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [field]: value
            }
        }));
    };

    // Helper update Age Range
    const updateAgeRange = (type: 'min' | 'max', value: number) => {
        setFormData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                age_range: {
                    ...prev.preferences.age_range,
                    [type]: value
                }
            }
        }));
    };

    // Helper Toggle Gender Preference
    const toggleGenderPref = (gender: string) => {
        setFormData(prev => {
            const current = prev.preferences.gender_preference || [];
            const updated = current.includes(gender)
                ? current.filter(g => g !== gender)
                : [...current, gender];
            return {
                ...prev,
                preferences: { ...prev.preferences, gender_preference: updated }
            };
        });
    };

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

    // --- XỬ LÝ VỊ TRÍ (Reverse Geocoding) ---
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

                try {
                    // Gọi API OpenStreetMap (Miễn phí, không cần key)
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                        { headers: { 'User-Agent': 'TinderCloneApp/1.0' } } // Thêm User-Agent để tránh bị block
                    );
                    const data = await res.json();

                    if (data && data.address) {
                        const city = data.address.city || data.address.town || data.address.county || data.address.state || "";
                        const country = data.address.country || "";
                        // Ghép chuỗi địa chỉ gọn gàng
                        addressName = [city, country].filter(Boolean).join(", ");
                    }
                } catch (err) {
                    console.warn("Lỗi lấy tên địa điểm (dùng tọa độ thay thế):", err);
                }

                setFormData((prev) => ({
                    ...prev,
                    latitude,
                    longitude,
                    display_address: addressName,
                }));
                setLocationLoading(false);
                setError(null); // Xóa lỗi cũ nếu có
            },
            () => {
                setError("Vui lòng cấp quyền truy cập vị trí trên trình duyệt.");
                setLocationLoading(false);
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    };

    async function handleFormSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        // Validation cơ bản
        if (!formData.latitude || !formData.longitude) {
            setError("Vui lòng nhấn 'Cập nhật vị trí' để hoàn tất hồ sơ.");
            setSaving(false);
            return;
        }
        if (!formData.full_name.trim() || !formData.username.trim()) {
            setError("Tên và Tên người dùng không được để trống.");
            setSaving(false);
            return;
        }

        try {
            const result = await updateUserProfile(formData as unknown as Partial<UserProfile>);
            if (result.success) {
                // Thành công -> Chuyển về trang Profile xem kết quả
                router.push("/profile");
                router.refresh(); // Refresh để đảm bảo data mới nhất hiển thị
            } else {
                setError(result.error || "Lỗi cập nhật hồ sơ.");
            }
        } catch (err) {
            setError("Lỗi hệ thống. Vui lòng thử lại sau.");
        } finally {
            setSaving(false);
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    // --- HÀM XỬ LÝ ẢNH ---

    // Thêm ảnh mới vào mảng
    const handleAddPhoto = (url: string) => {
        if (formData.photos.length >= 5) return;
        setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, url]
        }));
    };

    // Xóa ảnh khỏi mảng
    const handleRemovePhoto = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            photos: prev.photos.filter((_, index) => index !== indexToRemove)
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải hồ sơ...</p>
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
                        Cập nhật thông tin để thu hút nhiều lượt tương tác hơn.
                    </p>
                </header>

                <div className="max-w-2xl mx-auto">
                    <form className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8" onSubmit={handleFormSubmit}>

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
                                                setFormData((prev) => ({ ...prev, avatar_url: url }));
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tải lên ảnh đẹp nhất của bạn</p>
                                    <p className="text-xs text-gray-500">JPG, PNG. Tối đa 5MB.</p>
                                </div>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tên đầy đủ *</label>
                                <input
                                    type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Tên hiển thị"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Username *</label>
                                <input
                                    type="text" name="username" value={formData.username} onChange={handleInputChange} required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="@username"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giới Tính *</label>
                                <select
                                    name="gender" value={formData.gender} onChange={handleInputChange} required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                                >
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sinh nhật *</label>
                                <input
                                    type="date" name="birthdate" value={formData.birthdate} onChange={handleInputChange} required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-gray-700 rounded-lg border border-blue-100 dark:border-gray-600">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">📍 Vị trí (Bắt buộc)</label>
                            <div className="flex gap-2">
                                <input
                                    type="text" value={formData.display_address} readOnly
                                    placeholder="Chưa cập nhật vị trí"
                                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg cursor-not-allowed text-gray-500 dark:text-gray-300"
                                />
                                <button
                                    type="button" onClick={handleGetLocation} disabled={locationLoading}
                                    className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg transition-colors whitespace-nowrap shadow-md"
                                >
                                    {locationLoading ? "Đang tìm..." : "Cập nhật"}
                                </button>
                            </div>
                        </div>

                        {/* Hobbies */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex justify-between">
                                <span>Sở thích</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${formData.hobbiesIds.length === 5 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {formData.hobbiesIds.length}/5
                                </span>
                            </label>
                            {availableHobbies.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {availableHobbies.map((hobby) => {
                                        const isSelected = formData.hobbiesIds.includes(hobby.id);
                                        return (
                                            <button
                                                key={hobby.id} type="button" onClick={() => toggleHobby(hobby.id)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${isSelected ? "bg-pink-500 text-white border-pink-500 shadow-md" : "bg-white text-gray-600 border-gray-200 hover:bg-pink-50 dark:bg-gray-700 dark:text-gray-300"}`}
                                            >
                                                {hobby.icon} {hobby.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Đang tải danh sách sở thích...</p>
                            )}
                        </div>

                        {/* Bio */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giới thiệu bản thân</label>
                            <textarea
                                name="bio" value={formData.bio} onChange={handleInputChange} rows={4} maxLength={500}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 dark:bg-gray-700 dark:text-white resize-none"
                                placeholder="Viết gì đó về bạn..."
                            />
                            <p className="text-xs text-right text-gray-500 mt-1">{formData.bio.length}/500</p>
                        </div>
                        {/* --- PHẦN THƯ VIỆN ẢNH --- */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                Thư viện ảnh ({formData.photos.length}/5)
                            </label>

                            <div className="grid grid-cols-3 gap-4">
                                {/* 1. Render các ảnh đã có */}
                                {formData.photos.map((photoUrl, index) => (
                                    <div key={index} className="relative aspect-[2/3] rounded-lg overflow-hidden border dark:border-gray-600 group">
                                        <img
                                            src={photoUrl}
                                            alt={`Photo ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Nút xóa ảnh */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePhoto(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </div>
                                ))}

                                {/* 2. Render nút Upload nếu chưa đủ 5 ảnh */}
                                {formData.photos.length < 5 && (
                                    <div className="aspect-[2/3] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 transition-colors">
                                        {/* Sử dụng component PhotoUpload bạn đã có */}
                                        {/* Lưu ý: Bạn cần chỉnh PhotoUpload để nó KHÔNG hiện ảnh preview to đùng mà chỉ trả về URL, 
                           hoặc tạo một component Upload nhỏ gọn hơn cho ô này. 
                           Dưới đây là cách dùng nếu PhotoUpload hỗ trợ custom style hoặc bạn bọc nó lại */}
                                        <div className="scale-75">
                                            <PhotoUpload
                                                onPhotoUploaded={(url) => handleAddPhoto(url)}
                                            // Gợi ý: Truyền thêm prop bucket="profile-photos" vào PhotoUpload nếu bạn muốn dùng bucket riêng
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 mt-2">Thêm ảnh</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* --- CÀI ĐẶT TÌM KIẾM (PREFERENCES) - Yêu cầu 4 --- */}
                        <div className="mb-8 p-6 bg-purple-50 dark:bg-gray-700/50 rounded-xl border border-purple-100 dark:border-gray-600">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Cài đặt Tìm kiếm</h3>

                            {/* 1. Khoảng cách */}
                            <div className="mb-6">
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Khoảng cách tối đa</label>
                                    <span className="text-sm font-bold text-pink-600">{formData.preferences.distance} km</span>
                                </div>
                                <input
                                    type="range"
                                    min="1" max="100"
                                    value={formData.preferences.distance}
                                    onChange={(e) => updatePreference('distance', parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                                />
                            </div>

                            {/* 2. Độ tuổi */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Độ tuổi mong muốn</label>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <span className="text-xs text-gray-500">Từ</span>
                                        <input
                                            type="number" min="18" max="100"
                                            value={formData.preferences.age_range.min}
                                            onChange={(e) => updateAgeRange('min', parseInt(e.target.value))}
                                            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-600 dark:text-white"
                                        />
                                    </div>
                                    <span className="text-gray-400">-</span>
                                    <div className="flex-1">
                                        <span className="text-xs text-gray-500">Đến</span>
                                        <input
                                            type="number" min="18" max="100"
                                            value={formData.preferences.age_range.max}
                                            onChange={(e) => updateAgeRange('max', parseInt(e.target.value))}
                                            className="w-full mt-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-600 dark:text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 3. Giới tính quan tâm */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tôi muốn xem</label>
                                <div className="flex gap-3">
                                    {['male', 'female', 'other'].map(gender => (
                                        <button
                                            key={gender}
                                            type="button"
                                            onClick={() => toggleGenderPref(gender)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${formData.preferences.gender_preference.includes(gender)
                                                ? "bg-pink-500 text-white border-pink-500"
                                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500"
                                                }`}
                                        >
                                            {gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác'}
                                        </button>
                                    ))}
                                </div>
                                {formData.preferences.gender_preference.length === 0 && (
                                    <p className="text-xs text-gray-500 mt-1 italic">Mặc định sẽ hiển thị tất cả</p>
                                )}
                            </div>
                        </div>


                        {/* Errors & Buttons */}
                        {error && <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>}

                        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                            <button type="button" onClick={() => router.back()} className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:underline">Hủy</button>
                            <button type="submit" disabled={saving} className="px-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-red-600 transition-all shadow-md disabled:opacity-50">
                                {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}