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

// --- INTERFACES ---
interface Hobby {
    id: string;
    name: string;
    icon: string;
}

export interface UserPreferences {
    age_range: {
        min: number;
        max: number;
    };
    distance: number;
    gender_preference: string[];
}

interface ProfileFormData {
    full_name: string;
    username: string;
    bio: string;
    gender: "male" | "female" | "other";
    birthdate: string;
    avatar_url: string;
    photos: string[];
    display_address: string;
    latitude: number | null;
    longitude: number | null;
    hobbiesIds: string[];
    preferences: UserPreferences;
}

export default function EditProfilePage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ProfileFormData, boolean>>>({});
    const [ageError, setAgeError] = useState<string | null>(null);

    const router = useRouter();
    const [availableHobbies, setAvailableHobbies] = useState<Hobby[]>([]);

    const [formData, setFormData] = useState<ProfileFormData>({
        full_name: "",
        username: "",
        bio: "",
        gender: "male",
        birthdate: "",
        avatar_url: "",
        photos: [],
        display_address: "",
        latitude: null,
        longitude: null,
        hobbiesIds: [],
        preferences: {
            age_range: { min: 18, max: 50 },
            distance: 25,
            gender_preference: []
        }
    });

    useEffect(() => {
        async function loadData() {
            try {
                const [hobbiesData, profileData] = await Promise.all([
                    getAllHobbies(),
                    getCurrentUserProfile()
                ]);

                if (hobbiesData && hobbiesData.length > 0) {
                    setAvailableHobbies(hobbiesData);
                }

                if (profileData) {
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
                setError("Không thể tải thông tin hồ sơ.");
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    // --- HANDLERS ---
    const updatePreference = <K extends keyof UserPreferences>(field: K, value: UserPreferences[K]) => {
        setFormData(prev => ({ ...prev, preferences: { ...prev.preferences, [field]: value } }));
    };
    // 1. Hàm xử lý khi đang nhập liệu (Cho phép gõ tự do)
    const updateAgeRange = (type: 'min' | 'max', value: number) => {
        // Chỉ chặn nếu lớn hơn 50 ngay lập tức (Hard limit)
        if (value > 50) value = 50;

        // Xóa logic chặn < 18 ở đây để người dùng có thể gõ số (ví dụ gõ 2 để ra 25)

        // Validation Logic (Kiểm tra chéo Min/Max để hiện lỗi)
        let newError = null;
        // Lưu ý: Lấy giá trị đối chiếu từ state hiện tại
        const otherValue = type === 'min'
            ? formData.preferences.age_range.max
            : formData.preferences.age_range.min;

        if (type === 'min') {
            if (value > otherValue) {
                newError = "Độ tuổi tối thiểu không được lớn hơn độ tuổi tối đa.";
            }
        } else {
            if (value < otherValue) {
                newError = "Độ tuổi tối đa không được nhỏ hơn độ tuổi tối thiểu.";
            }
        }

        // Nếu nhỏ hơn 18 thì báo lỗi nhẹ hoặc để onBlur xử lý, ở đây ta tạm clear lỗi nếu hợp lệ chéo
        if (value >= 18 && !newError) setAgeError(null);
        else if (newError) setAgeError(newError);

        setFormData(prev => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                age_range: { ...prev.preferences.age_range, [type]: value }
            }
        }));
    };

    // 2. Hàm xử lý khi người dùng nhập xong (Click ra ngoài ô input)
    const handleAgeBlur = (type: 'min' | 'max') => {
        let value = formData.preferences.age_range[type];

        // Nếu nhập NaN (xóa trắng) hoặc nhỏ hơn 18 -> Tự động sửa về 18
        if (isNaN(value) || value < 18) {
            value = 18;
            // Cập nhật lại state với giá trị hợp lệ
            updateAgeRange(type, value);
        }
    };
    const toggleGenderPref = (gender: string) => {
        setFormData(prev => {
            const current = prev.preferences.gender_preference || [];
            const updated = current.includes(gender) ? current.filter(g => g !== gender) : [...current, gender];
            return { ...prev, preferences: { ...prev.preferences, gender_preference: updated } };
        });
    };
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
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                        { headers: { 'User-Agent': 'TinderCloneApp/1.0' } }
                    );
                    const data = await res.json();
                    if (data && data.address) {
                        const city = data.address.city || data.address.town || data.address.state || "";
                        const country = data.address.country || "";
                        addressName = [city, country].filter(Boolean).join(", ");
                    }
                } catch (err) { console.warn(err); }
                setFormData((prev) => ({ ...prev, latitude, longitude, display_address: addressName }));
                setFieldErrors(prev => ({ ...prev, display_address: false }));
                setLocationLoading(false);
            },
            () => { setError("Vui lòng cấp quyền truy cập vị trí."); setLocationLoading(false); },
            { timeout: 10000, enableHighAccuracy: true }
        );
    };
    const handleAddPhoto = (url: string) => { if (formData.photos.length >= 5) return; setFormData(prev => ({ ...prev, photos: [...prev.photos, url] })); };
    const handleRemovePhoto = (indexToRemove: number) => { setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, index) => index !== indexToRemove) })); };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (fieldErrors[name as keyof ProfileFormData]) { setFieldErrors(prev => ({ ...prev, [name]: false })); }
    };

    async function handleFormSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setFieldErrors({});

        if (ageError) {
            setError("Vui lòng sửa lỗi độ tuổi trước khi lưu.");
            setSaving(false);
            window.scrollTo({ top: 0, behavior: "smooth" }); // Cuộn lên để thấy lỗi
            return;
        }

        const newErrors: Partial<Record<keyof ProfileFormData, boolean>> = {};
        let hasError = false;
        if (!formData.avatar_url) { newErrors.avatar_url = true; hasError = true; }
        if (!formData.full_name.trim()) { newErrors.full_name = true; hasError = true; }
        if (!formData.username.trim()) { newErrors.username = true; hasError = true; }
        if (!formData.gender) { newErrors.gender = true; hasError = true; }
        if (!formData.birthdate) { newErrors.birthdate = true; hasError = true; }
        if (!formData.latitude || !formData.longitude) { newErrors.display_address = true; hasError = true; }
        if (!formData.bio.trim()) { newErrors.bio = true; hasError = true; }

        if (hasError) {
            setFieldErrors(newErrors);
            setError("Chưa hoàn thành hồ sơ. Vui lòng điền các mục được đánh dấu đỏ.");
            setSaving(false);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }


        try {
            const result = await updateUserProfile(formData as unknown as Partial<UserProfile>);
            if (result.success) {
                router.push("/profile");
            } else {
                setError(result.error || "Lỗi cập nhật hồ sơ.");
                setSaving(false);
            }
        } catch (err) {
            setError("Lỗi hệ thống. Vui lòng thử lại sau.");
            setSaving(false);
        }
    }

    const getInputClass = (fieldName: keyof ProfileFormData) => {
        const baseClass = "w-full px-4 py-2 border rounded-lg focus:ring-2 dark:bg-gray-700 dark:text-white transition-all";
        const errorClass = "border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10";
        const normalClass = "border-gray-300 focus:ring-pink-500 dark:border-gray-600";
        return `${baseClass} ${fieldErrors[fieldName] ? errorClass : normalClass}`;
    };


    if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div></div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-red-50 dark:from-gray-900 dark:to-gray-800 relative">

            {saving && (
                <div className="fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-center backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center animate-bounce-in">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-pink-500 mb-4"></div>
                        <p className="text-gray-800 dark:text-white font-semibold text-lg">Đang lưu thay đổi...</p>
                        <p className="text-gray-500 text-sm">Vui lòng đợi trong giây lát</p>
                    </div>
                </div>
            )}

            <div className="container mx-auto px-4 py-8">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Chỉnh sửa hồ sơ</h1>
                    <p className="text-gray-600 dark:text-gray-400">Hoàn thiện thông tin để bắt đầu kết nối.</p>
                </header>

                {/* THAY ĐỔI: max-w-6xl để rộng hơn cho giao diện 2 cột */}
                <div className="max-w-6xl mx-auto">
                    <form className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8" onSubmit={handleFormSubmit}>

                        {/* Error Notification */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-3 animate-pulse">
                                <span className="text-xl">⚠️</span>
                                <span className="font-medium">{error}</span>
                            </div>
                        )}

                        {/* LAYOUT GRID: Mobile 1 cột, Desktop (lg) 2 cột */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                            {/* --- CỘT TRÁI: THÔNG TIN CÁ NHÂN --- */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b pb-2 mb-4">Thông tin cá nhân</h3>

                                {/* Avatar */}
                                <div className={`p-4 rounded-xl border ${fieldErrors.avatar_url ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-100 dark:border-gray-700'}`}>
                                    <label className={`block text-sm font-medium mb-4 ${fieldErrors.avatar_url ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>Ảnh Đại Diện {fieldErrors.avatar_url && "* (Bắt buộc)"}</label>
                                    <div className="flex items-center space-x-6">
                                        <div className="relative">
                                            <div className={`w-24 h-24 rounded-full overflow-hidden border-4 shadow-sm ${fieldErrors.avatar_url ? 'border-red-500' : 'border-white dark:border-gray-700'}`}>
                                                <img src={formData.avatar_url || "/default-avatar.png"} alt="Profile" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="mt-2"><PhotoUpload onPhotoUploaded={(url) => { setFormData((prev) => ({ ...prev, avatar_url: url })); setFieldErrors(prev => ({ ...prev, avatar_url: false })); }} /></div>
                                        </div>
                                        <div><p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tải lên ảnh đẹp nhất của bạn</p><p className="text-xs text-gray-500">JPG, PNG. Tối đa 5MB.</p></div>
                                    </div>
                                </div>

                                {/* Inputs */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên đầy đủ <span className="text-red-500">*</span></label><input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className={getInputClass('full_name')} placeholder="Tên hiển thị" /></div>
                                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username <span className="text-red-500">*</span></label><input type="text" name="username" value={formData.username} onChange={handleInputChange} className={getInputClass('username')} placeholder="@username" /></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giới Tính <span className="text-red-500">*</span></label><select name="gender" value={formData.gender} onChange={handleInputChange} className={getInputClass('gender')}><option value="male">Nam</option><option value="female">Nữ</option><option value="other">Khác</option></select></div>
                                    <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sinh nhật <span className="text-red-500">*</span></label><input type="date" name="birthdate" value={formData.birthdate} onChange={handleInputChange} className={getInputClass('birthdate')} /></div>
                                </div>

                                {/* Location */}
                                <div className={`p-4 rounded-lg border transition-colors ${fieldErrors.display_address ? 'bg-red-50 border-red-500 dark:bg-red-900/10' : 'bg-blue-50 border-blue-100 dark:bg-gray-700 dark:border-gray-600'}`}>
                                    <label className={`block text-sm font-semibold mb-2 ${fieldErrors.display_address ? 'text-red-600' : 'text-gray-700 dark:text-gray-200'}`}>📍 Vị trí <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2">
                                        <input type="text" value={formData.display_address} readOnly placeholder={fieldErrors.display_address ? "Vui lòng nhấn cập nhật!" : "Chưa cập nhật vị trí"} className={`flex-1 px-4 py-2 rounded-lg cursor-not-allowed ${fieldErrors.display_address ? 'bg-white border border-red-300 text-red-500 placeholder-red-400' : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300'}`} />
                                        <button type="button" onClick={handleGetLocation} disabled={locationLoading} className={`px-4 py-2 text-white rounded-lg transition-colors whitespace-nowrap shadow-md ${fieldErrors.display_address ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-pink-500 hover:bg-pink-600'}`}>{locationLoading ? "..." : "Cập nhật"}</button>
                                    </div>
                                    {fieldErrors.display_address && <p className="text-xs text-red-500 mt-1">Bắt buộc phải có vị trí.</p>}
                                </div>

                                {/* Bio */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giới thiệu bản thân <span className="text-red-500">*</span></label>
                                    <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows={4} maxLength={500} className={getInputClass('bio')} placeholder="Viết gì đó về bạn..." />
                                    <p className="text-xs text-right text-gray-500 mt-1">{formData.bio.length}/500</p>
                                </div>

                                {/* Hobbies */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex justify-between"><span>Sở thích</span><span className={`text-xs px-2 py-0.5 rounded-full ${formData.hobbiesIds.length === 5 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{formData.hobbiesIds.length}/5</span></label>
                                    {availableHobbies.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {availableHobbies.map((hobby) => {
                                                const isSelected = formData.hobbiesIds.includes(hobby.id);
                                                return (<button key={hobby.id} type="button" onClick={() => toggleHobby(hobby.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${isSelected ? "bg-pink-500 text-white border-pink-500 shadow-md" : "bg-white text-gray-600 border-gray-200 hover:bg-pink-50 dark:bg-gray-700 dark:text-gray-300"}`}>{hobby.icon} {hobby.name}</button>);
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* --- CỘT PHẢI: GALLERY & PREFERENCES --- */}
                            <div className="space-y-8">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white border-b pb-2 mb-4">Hình ảnh & Cài đặt</h3>

                                {/* Gallery */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                                        Thư viện ảnh ({formData.photos.length}/5)
                                    </label>

                                    {/* THAY ĐỔI: Dùng Flex + Overflow thay vì Grid */}
                                    <div className="flex gap-3 overflow-x-auto pb-4 snap-x scroll-smooth">

                                        {/* Render các ảnh đã có */}
                                        {formData.photos.map((photoUrl, index) => (
                                            <div
                                                key={index}
                                                className="relative flex-none w-1/3 min-w-[120px] aspect-[2/3] rounded-lg overflow-hidden border dark:border-gray-600 group snap-start"
                                            >
                                                <img
                                                    src={photoUrl}
                                                    alt={`Photo ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePhoto(index)}
                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                        ))}

                                        {/* Nút Thêm ảnh (Luôn hiện nếu chưa đủ 5 ảnh) */}
                                        {formData.photos.length < 5 && (
                                            <div className="flex-none w-1/3 min-w-[120px] aspect-[2/3] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 transition-colors snap-start relative group cursor-pointer">
                                                {/* Truyền variant="gallery" để hiện dấu + */}
                                                <div className="mb-2 transform group-hover:scale-110 transition-transform">
                                                    <PhotoUpload
                                                        variant="gallery"
                                                        onPhotoUploaded={(url) => handleAddPhoto(url)}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-500 font-medium">Thêm ảnh</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Preferences */}
                                <div className="p-6 bg-purple-50 dark:bg-gray-700/50 rounded-xl border border-purple-100 dark:border-gray-600">
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Cài đặt Tìm kiếm</h4>

                                    {/* Distance */}
                                    <div className="mb-6">
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Khoảng cách tối đa</label>
                                            <span className="text-sm font-bold text-pink-600">{formData.preferences.distance} km</span>
                                        </div>
                                        <input type="range" min="1" max="100" value={formData.preferences.distance} onChange={(e) => updatePreference('distance', parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500" />
                                    </div>

                                    {/* Age Range */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Độ tuổi mong muốn</label>
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <span className="text-xs text-gray-500">Từ</span>
                                                <input
                                                    type="number"
                                                    min="18"
                                                    max="50"
                                                    value={formData.preferences.age_range.min || ''} // Handle NaN/Empty visual
                                                    onChange={(e) => updateAgeRange('min', parseInt(e.target.value) || 0)}
                                                    onBlur={() => handleAgeBlur('min')} // <--- THÊM SỰ KIỆN NÀY
                                                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-600 dark:text-white"
                                                />
                                            </div>
                                            <span className="text-gray-400">-</span>
                                            <div className="flex-1">
                                                <span className="text-xs text-gray-500">Đến</span>
                                                <input
                                                    type="number"
                                                    min="18"
                                                    max="50"
                                                    value={formData.preferences.age_range.max || ''}
                                                    onChange={(e) => updateAgeRange('max', parseInt(e.target.value) || 0)}
                                                    onBlur={() => handleAgeBlur('max')} // <--- THÊM SỰ KIỆN NÀY
                                                    className="w-full mt-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-600 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                        {/* HIỂN THỊ LỖI ĐỘ TUỔI */}
                                        {ageError && <p className="text-xs text-red-500 mt-2 font-medium">{ageError}</p>}
                                    </div>

                                    {/* Gender Pref */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tôi muốn xem</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {['male', 'female', 'other'].map(gender => (
                                                <button key={gender} type="button" onClick={() => toggleGenderPref(gender)} className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${formData.preferences.gender_preference.includes(gender) ? "bg-pink-500 text-white border-pink-500" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-300 dark:border-gray-500"}`}>
                                                    {gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Khác'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Buttons Bottom */}
                        <div className="flex items-center justify-between pt-8 mt-8 border-t border-gray-200 dark:border-gray-700">
                            <button type="button" onClick={() => router.back()} className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:underline">Hủy</button>
                            <button type="submit" disabled={saving} className="px-8 py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold text-lg rounded-xl hover:from-pink-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed">
                                {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}