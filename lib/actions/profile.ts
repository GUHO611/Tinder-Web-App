"use server";

import { createClient } from "../supabase/sever"; // Lưu ý đường dẫn đúng là 'server' chứ không phải 'sever'

export interface UserProfile {
    full_name?: string;
    username?: string;
    bio?: string;
    gender?: string;
    birthdate?: string;
    avatar_url?: string;
    display_address?: string;
    preferences?: Record<string, unknown>;
    is_profile_completed?: boolean;
    // THÊM 2 DÒNG NÀY ĐỂ HẾT LỖI:
    latitude?: number | null;
    longitude?: number | null;
}
// 1. LẤY PROFILE + SỞ THÍCH + VỊ TRÍ
export async function getCurrentUserProfile() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    // Truy vấn dữ liệu, bao gồm cả cột location
    const { data, error } = await supabase
        .from("users")
        .select(`
      *,
      user_hobbies (
        hobbies ( * )
      )
    `)
        .eq("id", user.id)
        .single();

    if (error) {
        console.error("Error fetching profile:", error);
        return null;
    }

    // TRANSFORM DỮ LIỆU:
    // Supabase trả về dạng lồng nhau: user_hobbies: [{ hobbies: { id: 1, name: "A" } }]
    // Chúng ta cần làm phẳng thành: hobbies: [{ id: 1, name: "A" }]
    // Kiểu dữ liệu thực tế của một hobby
    interface Hobby {
        id: number;
        name: string;
    }

    // Kiểu dữ liệu của phần tử trong mảng user_hobbies
    interface UserHobby {
        hobbies: Hobby;
    }

    // Làm phẳng dữ liệu
    const formattedHobbies: Hobby[] = Array.isArray(data.user_hobbies)
        ? data.user_hobbies.map((item: UserHobby) => item.hobbies)
        : [];

    // --- XỬ LÝ VỊ TRÍ (PostGIS Parsing) ---
    // PostGIS trả về location dưới dạng chuỗi WKT (VD: "POINT(105.85 21.02)") hoặc Hex.
    // Supabase JS client thường trả về string dạng "POINT(long lat)" cho cột Geography.
    let latitude = null;
    let longitude = null;

    if (data.location && typeof data.location === "string") {
        // Dùng Regex để tách số từ chuỗi "POINT(105.8 21.0)"
        const matches = data.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
        if (matches && matches.length === 3) {
            longitude = parseFloat(matches[1]); // Số đầu tiên là Kinh độ (Long)
            latitude = parseFloat(matches[2]);  // Số thứ hai là Vĩ độ (Lat)
        }
    }

    // Loại bỏ các trường thừa
    const { user_hobbies, location, ...profile } = data;

    return {
        ...profile,
        hobbies: formattedHobbies,
        latitude,  // Trả về riêng lẻ cho Frontend dễ dùng
        longitude,
    };
}
// Định nghĩa kiểu dữ liệu sẽ gửi xuống Database
interface ProfileUpdatePayload {
    full_name?: string;
    username?: string;
    bio?: string;
    gender?: string;
    birthdate?: string;
    avatar_url?: string;
    display_address?: string;
    preferences?: Record<string, unknown>; // JSONB: Dùng Record thay vì any
    is_profile_completed?: boolean;
    updated_at?: string;
    location?: string; // Đây là trường quan trọng (PostGIS string)
}
// 2. CẬP NHẬT PROFILE (Bao gồm PostGIS Location)
export async function updateUserProfile(profileData: Partial<UserProfile>) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "User not authenticated" };
    }

    // Chuẩn bị object update
    const updates: ProfileUpdatePayload = {
        full_name: profileData.full_name,
        username: profileData.username,
        bio: profileData.bio || undefined,
        gender: profileData.gender,
        birthdate: profileData.birthdate,
        avatar_url: profileData.avatar_url || undefined,
        display_address: profileData.display_address || undefined,
        preferences: profileData.preferences as Record<string, unknown> | undefined,
        is_profile_completed: profileData.is_profile_completed,
        updated_at: new Date().toISOString(),
    };

    // --- XỬ LÝ POSTGIS LOCATION ---
    // Kiểm tra kỹ type number cho lat/long
    if (
        typeof profileData.latitude === 'number' &&
        typeof profileData.longitude === 'number'
    ) {
        // Cú pháp PostGIS: POINT(Longitude Latitude)
        updates.location = `POINT(${profileData.longitude} ${profileData.latitude})`;
    }

    // Thực hiện update
    const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id);

    if (error) {
        console.log("Supabase Update Error:", error);
        return { success: false, error: error.message };
    }

    return { success: true };
}

// 3. UPLOAD ẢNH (Giữ nguyên)
export async function uploadProfilePhoto(file: File) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "User not authenticated" };
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const BUCKET_NAME = "avatars";

    const { error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file, {
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        return { success: false, error: error.message };
    }

    const {
        data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);

    return { success: true, url: publicUrl };
}