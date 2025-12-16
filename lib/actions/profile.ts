"use server";

import { createClient } from "../supabase/sever";
// import { UserProfile, UserTableUpdate } from "./profile";

// --- 1. DEFINITIONS & INTERFACES ---

export interface Hobby {
    id: string;
    name: string;
    icon: string;
    category: string;
}

interface UserHobbyJoin {
    hobbies: Hobby | null;
}

export interface UserProfile {
    id: string;
    full_name?: string;
    username?: string;
    bio?: string;
    gender?: string;
    birthdate?: string;
    avatar_url?: string;
    photos: string[]; // Mảng ảnh (Bắt buộc trong Profile hoàn chỉnh)
    display_address?: string;
    preferences?: Record<string, unknown>;
    is_profile_completed?: boolean;
    latitude?: number | null;
    longitude?: number | null;
    hobbiesIds?: string[];
    hobbies?: Hobby[];
}

// Payload để update bảng users
interface UserTableUpdate {
    full_name?: string;
    username?: string;
    bio?: string;
    gender?: string;
    birthdate?: string;
    avatar_url?: string;
    photos?: string[]; // <--- FIX LỖI Ở ĐÂY: Thêm dấu ? để cho phép undefined
    display_address?: string;
    preferences?: Record<string, unknown>;
    is_profile_completed?: boolean;
    updated_at?: string;
    location?: string;
}

// --- 2. SERVER ACTIONS ---

export async function getAllHobbies(): Promise<Hobby[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("hobbies").select("*").order("name");
    if (error) {
        console.error("❌ Lỗi lấy hobbies:", error.message);
        return [];
    }
    return data as Hobby[];
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data, error } = await supabase
        .from("users")
        .select(`*, user_hobbies ( hobbies ( * ) )`)
        .eq("id", user.id)
        .single();

    if (error || !data) {
        console.error("Error fetching profile:", error);
        return null;
    }

    // Xử lý Hobbies
    const rawUserHobbies = (data.user_hobbies || []) as unknown as UserHobbyJoin[];
    const validHobbies = rawUserHobbies.map((item) => item.hobbies).filter((h): h is Hobby => h !== null);
    const hobbiesIds = validHobbies.map((h) => h.id);

    // Xử lý Location
    let latitude: number | null = null;
    let longitude: number | null = null;
    if (data.location && typeof data.location === "string") {
        const matches = data.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
        if (matches && matches.length === 3) {
            longitude = parseFloat(matches[1]);
            latitude = parseFloat(matches[2]);
        }
    }

    // Xử lý Photos: Đảm bảo luôn là mảng (nếu DB null thì trả về [])
    const photos = Array.isArray(data.photos) ? data.photos : [];

    const { user_hobbies, location, ...profileFields } = data;

    return {
        ...profileFields,
        preferences: profileFields.preferences as Record<string, unknown>,
        latitude,
        longitude,
        hobbiesIds,
        hobbies: validHobbies,
        photos, // Trả về mảng ảnh
    };
}
export async function setUserOnlineStatus(isOnline: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("users").update({
        is_online: isOnline,
        last_active: new Date().toISOString()
    }).eq("id", user.id);
}
// --- HÀM MỚI: XÁC MINH TÀI KHOẢN (GỌI SAU KHI OTP THÀNH CÔNG) ---
export async function markUserAsVerified() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("users").update({
        is_verified: true,
        updated_at: new Date().toISOString()
    }).eq("id", user.id);
}
export async function updateUserProfile(profileData: Partial<UserProfile>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "User not authenticated" };

    // Kiểm tra xem các trường quan trọng có dữ liệu chưa
    const hasBasicInfo = !!profileData.full_name && !!profileData.username && !!profileData.birthdate && !!profileData.gender;
    const hasPhoto = profileData.photos && profileData.photos.length > 0;
    const hasLocation = !!profileData.latitude && !!profileData.longitude; // Hoặc check display_address
    const hasBio = !!profileData.bio;
    // const hasHobbies = profileData.hobbiesIds && profileData.hobbiesIds.length > 0; // Tùy chọn

    // Nếu đủ thông tin -> set true, ngược lại false
    const isCompleted = hasBasicInfo && hasPhoto && hasLocation && hasBio;

    // 1. Chuẩn bị dữ liệu Update
    const userUpdates: UserTableUpdate = {
        full_name: profileData.full_name,
        username: profileData.username,
        bio: profileData.bio || undefined,
        gender: profileData.gender,
        birthdate: profileData.birthdate,
        avatar_url: profileData.avatar_url || undefined,
        display_address: profileData.display_address || undefined,
        preferences: profileData.preferences,
        is_profile_completed: profileData.is_profile_completed,
        photos: profileData.photos, // Giờ đã OK vì interface UserTableUpdate cho phép optional
        updated_at: new Date().toISOString(),
    };

    if (typeof profileData.latitude === "number" && typeof profileData.longitude === "number") {
        userUpdates.location = `POINT(${profileData.longitude} ${profileData.latitude})`;
    }

    // 2. Update Users Table
    const { error: userError } = await supabase
        .from("users")
        .update(userUpdates)
        .eq("id", user.id);

    if (userError) {
        console.error("User Update Error:", userError);
        return { success: false, error: userError.message };
    }

    // 3. Update Hobbies (Logic cũ giữ nguyên)
    if (profileData.hobbiesIds) {
        const { error: deleteError } = await supabase.from("user_hobbies").delete().eq("user_id", user.id);
        if (deleteError) return { success: false, error: "Failed to update hobbies" };

        if (profileData.hobbiesIds.length > 0) {
            const inserts = profileData.hobbiesIds.map((hobbyId) => ({
                user_id: user.id,
                hobby_id: hobbyId,
            }));
            const { error: insertError } = await supabase.from("user_hobbies").insert(inserts);
            if (insertError) return { success: false, error: "Failed to save new hobbies" };
        }
    }

    return { success: true };
}

// 4. UPLOAD ẢNH (Đã nâng cấp để hỗ trợ cả Avatar và Gallery)
export async function uploadProfilePhoto(file: File, bucketName: "avatars" | "profile-photos" = "avatars") {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "User not authenticated" };

    const fileExt = file.name.split(".").pop();
    // Tạo tên file unique: user_id/timestamp.ext
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: true, // Cho phép ghi đè nếu trùng tên (dù có timestamp nên khó trùng)
        });

    if (error) {
        return { success: false, error: error.message };
    }

    const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(fileName);

    return { success: true, url: publicUrl };
}
