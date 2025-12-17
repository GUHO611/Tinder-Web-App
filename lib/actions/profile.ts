"use server";

import { createClient } from "../supabase/sever";
import { revalidatePath } from "next/cache";

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
    email?: string;
    bio?: string;
    gender?: string;
    birthdate?: string;
    avatar_url?: string;
    photos: string[];
    display_address?: string;
    preferences?: Record<string, unknown>;
    is_profile_completed?: boolean;
    latitude?: number | null;
    longitude?: number | null;
    hobbiesIds?: string[];
    hobbies?: Hobby[];
    is_online?: boolean;
    last_active?: string;
    is_verified?: boolean;
    created_at: string;
}

// FIX: Mở rộng interface này để bao gồm TẤT CẢ các trường có thể update
// Điều này giúp bạn không cần dùng 'as any' ở các hàm khác
interface UserTableUpdate {
    full_name?: string;
    username?: string;
    bio?: string | null; // Cho phép null
    gender?: string;
    birthdate?: string;
    avatar_url?: string | null;
    photos?: string[];
    display_address?: string | null;
    preferences?: Record<string, unknown>;
    is_profile_completed?: boolean;
    updated_at?: string;
    location?: string;
    is_online?: boolean;
    last_active?: string;
    is_verified?: boolean;
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
        return null;
    }

    const rawUserHobbies = (data.user_hobbies || []) as unknown as UserHobbyJoin[];
    const validHobbies = rawUserHobbies.map((item) => item.hobbies).filter((h): h is Hobby => h !== null);
    const hobbiesIds = validHobbies.map((h) => h.id);

    let latitude: number | null = null;
    let longitude: number | null = null;
    if (data.location && typeof data.location === "string") {
        const matches = data.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
        if (matches && matches.length === 3) {
            longitude = parseFloat(matches[1]);
            latitude = parseFloat(matches[2]);
        }
    }

    const photos = Array.isArray(data.photos) ? data.photos : [];
    const { user_hobbies, location, ...profileFields } = data;

    return {
        ...profileFields,
        email: user.email,
        preferences: profileFields.preferences as Record<string, unknown>,
        latitude,
        longitude,
        hobbiesIds,
        hobbies: validHobbies,
        photos,
    };
}

// --- HÀM SET ONLINE (KHÔNG DÙNG ANY) ---
export async function setUserOnlineStatus(isOnline: boolean) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Sử dụng interface UserTableUpdate để đảm bảo type safety
    const updates: UserTableUpdate = {
        is_online: isOnline,
        last_active: new Date().toISOString()
    };

    await supabase.from("users").update(updates).eq("id", user.id);
}

// --- HÀM VERIFY (KHÔNG DÙNG ANY) ---
export async function markUserAsVerified() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const updates: UserTableUpdate = {
        is_verified: true,
        updated_at: new Date().toISOString()
    };

    await supabase.from("users").update(updates).eq("id", user.id);
}


// --- THÊM HÀM NÀY VÀO CUỐI FILE HOẶC DƯỚI getCurrentUserProfile ---

export async function getUserProfileById(userId: string): Promise<UserProfile | null> {
    const supabase = await createClient();

    // 1. Lấy thông tin user cụ thể
    const { data, error } = await supabase
        .from("users")
        .select(`*, user_hobbies ( hobbies ( * ) )`)
        .eq("id", userId)
        .single();

    if (error || !data) {
        console.error("Error fetching user profile:", error);
        return null;
    }

    // 2. Xử lý Hobbies
    const rawUserHobbies = (data.user_hobbies || []) as unknown as UserHobbyJoin[];
    const validHobbies = rawUserHobbies.map((item) => item.hobbies).filter((h): h is Hobby => h !== null);
    const hobbiesIds = validHobbies.map((h) => h.id);

    // 3. Xử lý Location
    let latitude: number | null = null;
    let longitude: number | null = null;
    if (data.location && typeof data.location === "string") {
        const matches = data.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
        if (matches && matches.length === 3) {
            longitude = parseFloat(matches[1]);
            latitude = parseFloat(matches[2]);
        }
    }

    const photos = Array.isArray(data.photos) ? data.photos : [];
    const { user_hobbies, location, ...profileFields } = data;

    return {
        ...profileFields,
        preferences: profileFields.preferences as Record<string, unknown>,
        latitude,
        longitude,
        hobbiesIds,
        hobbies: validHobbies,
        photos,
    };
}

// --- HÀM UPDATE PROFILE CHÍNH (ĐÃ SỬA LỖI LOGIC) ---
export async function updateUserProfile(profileData: Partial<UserProfile>) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "User not authenticated" };

    // 1. TÍNH TOÁN TRẠNG THÁI HOÀN THÀNH
    const hasBasicInfo = !!profileData.full_name && !!profileData.username && !!profileData.birthdate && !!profileData.gender;
    const hasLocation = (!!profileData.latitude && !!profileData.longitude) || !!profileData.display_address;
    const hasBio = !!profileData.bio;

    // FIX LOGIC ẢNH: Chỉ cần có Avatar HOẶC có ảnh trong thư viện là tính đã có ảnh
    // Code cũ bắt buộc phải có ảnh thư viện profileData.photos
    const hasPhoto = !!profileData.avatar_url || (profileData.photos && profileData.photos.length > 0);

    // Điều kiện hoàn thành:
    const isCompleted = hasBasicInfo && hasPhoto && hasLocation && hasBio;

    // 2. CHUẨN BỊ DATA UPDATE
    const userUpdates: UserTableUpdate = {
        full_name: profileData.full_name,
        username: profileData.username,
        bio: profileData.bio || null, // Chuyển undefined thành null cho Supabase
        gender: profileData.gender,
        birthdate: profileData.birthdate,
        avatar_url: profileData.avatar_url || null,
        display_address: profileData.display_address || null,
        preferences: profileData.preferences,
        is_profile_completed: isCompleted,
        photos: profileData.photos,
        updated_at: new Date().toISOString(),
    };

    if (typeof profileData.latitude === "number" && typeof profileData.longitude === "number") {
        userUpdates.location = `POINT(${profileData.longitude} ${profileData.latitude})`;
    }

    // 3. THỰC HIỆN UPDATE
    const { error: userError } = await supabase
        .from("users")
        .update(userUpdates)
        .eq("id", user.id);

    if (userError) {
        console.error("User Update Error:", userError);
        return { success: false, error: userError.message };
    }

    // 4. UPDATE HOBBIES
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
    revalidatePath('/', 'layout');
    return { success: true };
}

// 4. UPLOAD ẢNH
export async function uploadProfilePhoto(file: File, bucketName: "avatars" | "profile-photos" = "avatars") {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { success: false, error: "User not authenticated" };

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: true,
        });

    if (error) {
        return { success: false, error: error.message };
    }

    const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(fileName);

    return { success: true, url: publicUrl };
}