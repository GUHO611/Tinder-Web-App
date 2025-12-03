"use server";

import { createClient } from "../supabase/sever";

// --- 1. DEFINITIONS & INTERFACES ---

export interface Hobby {
    id: string; // UUID trong Supabase là string
    name: string;
    icon: string;
    category: string;
}

// Kiểu dữ liệu trả về từ bảng user_hobbies khi join
interface UserHobbyJoin {
    hobbies: Hobby | null; // Join có thể null nếu dữ liệu rác, nên để null cho an toàn
}

export interface UserProfile {
    id?: string;
    full_name?: string;
    username?: string;
    bio?: string;
    gender?: string;
    birthdate?: string;
    avatar_url?: string;
    display_address?: string;
    preferences?: Record<string, unknown>; // JSONB chuẩn
    is_profile_completed?: boolean;
    latitude?: number | null;
    longitude?: number | null;
    hobbiesIds?: string[]; // Danh sách ID để Frontend dùng cho Form
    hobbies?: Hobby[];     // Danh sách Object đầy đủ để hiển thị (nếu cần)
}

// Payload để update bảng users (không bao gồm hobbies)
interface UserTableUpdate {
    full_name?: string;
    username?: string;
    bio?: string;
    gender?: string;
    birthdate?: string;
    avatar_url?: string;
    display_address?: string;
    preferences?: Record<string, unknown>;
    is_profile_completed?: boolean;
    updated_at?: string;
    location?: string; // PostGIS string
}

// --- 2. SERVER ACTIONS ---

// LẤY DANH SÁCH TẤT CẢ SỞ THÍCH (Master Data)
export async function getAllHobbies(): Promise<Hobby[]> {
    const supabase = await createClient();
    // console.log("---- Đang lấy danh sách hobbies... ----");
    const { data, error } = await supabase
        .from("hobbies")
        .select("*")
        .order("name");

    if (error) {
        //console.error("Error fetching hobbies:", error);
        console.error("❌ Lỗi lấy hobbies:", error.message, error.details);
        return [];
    }
    //console.log(`✅ Lấy thành công ${data.length} sở thích.`);
    // Ép kiểu an toàn về Hobby[]
    return data as Hobby[];
}

// LẤY PROFILE NGƯỜI DÙNG HIỆN TẠI
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Truy vấn dữ liệu: Users + UserHobbies + Hobbies
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

    if (error || !data) {
        console.error("Error fetching profile:", error);
        return null;
    }

    // --- XỬ LÝ HOBBIES (Type Safe) ---
    // Ép kiểu data.user_hobbies về mảng UserHobbyJoin để TS hiểu cấu trúc
    const rawUserHobbies = (data.user_hobbies || []) as unknown as UserHobbyJoin[];

    // Lọc lấy các hobby hợp lệ (không null)
    const validHobbies = rawUserHobbies
        .map((item) => item.hobbies)
        .filter((h): h is Hobby => h !== null);

    const hobbiesIds = validHobbies.map((h) => h.id);

    // --- XỬ LÝ VỊ TRÍ (PostGIS Parsing) ---
    let latitude: number | null = null;
    let longitude: number | null = null;

    if (data.location && typeof data.location === "string") {
        // Regex lấy số từ chuỗi "POINT(105.8 21.0)"
        const matches = data.location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
        if (matches && matches.length === 3) {
            longitude = parseFloat(matches[1]);
            latitude = parseFloat(matches[2]);
        }
    }

    // --- RETURN ---
    // Loại bỏ các trường thừa không cần thiết
    const { user_hobbies, location, ...profileFields } = data;

    return {
        ...profileFields,
        preferences: profileFields.preferences as Record<string, unknown>, // Ép kiểu JSONB
        latitude,
        longitude,
        hobbiesIds,
        hobbies: validHobbies,
    };
}

// CẬP NHẬT PROFILE (Transaction logic: Update User -> Update Hobbies)
export async function updateUserProfile(profileData: Partial<UserProfile>) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "User not authenticated" };
    }

    // 1. CHUẨN BỊ DỮ LIỆU UPDATE BẢNG USERS
    const userUpdates: UserTableUpdate = {
        full_name: profileData.full_name,
        username: profileData.username,
        // Dùng undefined thay vì null để Supabase bỏ qua không update nếu không có giá trị
        bio: profileData.bio || undefined,
        gender: profileData.gender,
        birthdate: profileData.birthdate,
        avatar_url: profileData.avatar_url || undefined,
        display_address: profileData.display_address || undefined,
        preferences: profileData.preferences,
        is_profile_completed: profileData.is_profile_completed,
        updated_at: new Date().toISOString(),
    };

    // Logic PostGIS: POINT(Long Lat)
    if (
        typeof profileData.latitude === "number" &&
        typeof profileData.longitude === "number"
    ) {
        userUpdates.location = `POINT(${profileData.longitude} ${profileData.latitude})`;
    }

    // 2. THỰC HIỆN UPDATE BẢNG USERS
    const { error: userError } = await supabase
        .from("users")
        .update(userUpdates)
        .eq("id", user.id);

    if (userError) {
        console.error("User Update Error:", userError);
        return { success: false, error: userError.message };
    }

    // 3. XỬ LÝ CẬP NHẬT SỞ THÍCH (Nếu có gửi lên)
    if (profileData.hobbiesIds) {
        // Bước A: Xóa toàn bộ sở thích cũ của user này
        const { error: deleteError } = await supabase
            .from("user_hobbies")
            .delete()
            .eq("user_id", user.id);

        if (deleteError) {
            console.error("Delete Hobbies Error:", deleteError);
            return { success: false, error: "Failed to update hobbies" };
        }

        // Bước B: Thêm sở thích mới (nếu mảng không rỗng)
        if (profileData.hobbiesIds.length > 0) {
            const inserts = profileData.hobbiesIds.map((hobbyId) => ({
                user_id: user.id,
                hobby_id: hobbyId,
            }));

            const { error: insertError } = await supabase
                .from("user_hobbies")
                .insert(inserts);

            if (insertError) {
                console.error("Insert Hobbies Error:", insertError);
                return { success: false, error: "Failed to save new hobbies" };
            }
        }
    }

    return { success: true };
}

// 4. UPLOAD ẢNH
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