"use server";

import { Hobby, UserProfile } from "@/lib/actions/profile"; // Import type chuẩn từ file profile
import { createClient } from "../supabase/sever";

// Cấu trúc Preferences trong JSONB
interface UserPreferences {
  gender_preference?: string[];
  age_range?: { min: number; max: number };
  distance?: number;
  [key: string]: unknown; // Cho phép các key khác
}

// Cấu trúc dữ liệu thô của Hobbies khi join từ Supabase
// (Supabase trả về mảng các object, mỗi object chứa 1 property 'hobbies')
interface RawUserHobby {
  hobbies: Hobby | null;
}

// Cấu trúc dữ liệu thô của Match khi join từ Supabase
interface MatchResponse {
  id: string;
  created_at: string;

  // Gộp tất cả các thuộc tính mở rộng vào trong một dấu ngoặc {}
  user1: UserProfile & {
    user_hobbies: RawUserHobby[];
    location: string | null; // Thêm location vào đây
  };

  user2: UserProfile & {
    user_hobbies: RawUserHobby[];
    location: string | null; // Thêm location vào đây
  };

  user1_id: string;
  user2_id: string;
}

// Helper: Parse PostGIS string "POINT(105.8 21.0)" -> { lat, lng }
function parsePostGISLocation(locationString: string | null | undefined) {
  if (!locationString || typeof locationString !== "string") {
    return { latitude: null, longitude: null };
  }
  const matches = locationString.match(/POINT\(([^ ]+) ([^ ]+)\)/);
  if (matches && matches.length === 3) {
    return {
      longitude: parseFloat(matches[1]),
      latitude: parseFloat(matches[2]),
    };
  }
  return { latitude: null, longitude: null };
}

// Helper: Flatten hobbies data
function formatHobbies(
  userHobbies: RawUserHobby[] | null | undefined
): Hobby[] {
  if (!Array.isArray(userHobbies)) return [];
  // userHobbies có dạng: [{ hobbies: { id, name... } }, ...]
  // Cần map về: [{ id, name... }, ...]
  return userHobbies
    .map((item) => item.hobbies)
    .filter((h): h is Hobby => h !== null);
}

// 1. LẤY DANH SÁCH GỢI Ý (Discovery)
export async function getPotentialMatches(): Promise<UserProfile[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated.");

  // A. Lấy Preferences của mình & Danh sách những người mình ĐÃ LIKE
  const [prefsResponse, likesResponse] = await Promise.all([
    supabase.from("users").select("preferences").eq("id", user.id).single(),
    supabase.from("likes").select("to_user_id").eq("from_user_id", user.id),
  ]);

  const userPrefs = (prefsResponse.data?.preferences || {}) as UserPreferences;
  const likedUserIds = (likesResponse.data || []).map((l) => l.to_user_id);

  // Thêm chính mình vào danh sách loại trừ
  const excludeIds = [user.id, ...likedUserIds];

  // B. Query danh sách Users (Chưa Like + Không phải mình)
  // Lưu ý: Lấy kèm user_hobbies và hobbies
  let query = supabase
    .from("users")
    .select(
      `
      *,
      user_hobbies (
        hobbies ( * )
      )
    `
    )
    .not("id", "in", `(${excludeIds.join(",")})`) // Loại trừ ID đã like
    .limit(20);

  // C. Lọc theo giới tính (Nếu có setting)
  const genderPref = userPrefs?.gender_preference as string[] | undefined;
  if (genderPref && genderPref.length > 0) {
    query = query.in("gender", genderPref);
  }

  const { data: potentialMatches, error } = await query;

  if (error) {
    console.error("Error fetching potential matches:", error);
    throw new Error("Failed to fetch matches");
  }

  // D. Map dữ liệu về chuẩn UserProfile
  return potentialMatches.map((match) => {
    const { latitude, longitude } = parsePostGISLocation(match.location);

    return {
      ...match,
      latitude,
      longitude,
      hobbies: formatHobbies(match.user_hobbies), // Xử lý hobbies
      preferences: match.preferences, // JSONB
    };
  });
}

// 2. THỰC HIỆN LIKE USER
export async function likeUser(toUserId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated.");

  // A. Insert vào bảng Likes
  // Trigger trong DB sẽ tự động tạo row trong bảng 'matches' nếu match
  const { error: likeError } = await supabase.from("likes").insert({
    from_user_id: user.id,
    to_user_id: toUserId,
  });

  if (likeError) {
    // Check lỗi duplicate key (đã like rồi) để không crash app
    if (likeError.code === "23505") {
      return { success: true, isMatch: false, message: "Already liked" };
    }
    throw new Error("Failed to create like");
  }

  // B. Kiểm tra xem có Match không (Kiểm tra xem người kia đã like mình chưa)
  const { data: reverseLike } = await supabase
    .from("likes")
    .select("*")
    .eq("from_user_id", toUserId)
    .eq("to_user_id", user.id)
    .single();

  if (reverseLike) {
    // Nếu match -> Lấy thông tin người kia để hiện Popup "It's a Match!"
    const { data: matchedUser } = await supabase
      .from("users")
      .select("*, user_hobbies(hobbies(*))")
      .eq("id", toUserId)
      .single();

    if (matchedUser) {
      const { latitude, longitude } = parsePostGISLocation(
        matchedUser.location
      );
      const userProfile: UserProfile = {
        ...matchedUser,
        latitude,
        longitude,
        hobbies: formatHobbies(matchedUser.user_hobbies),
      };

      return {
        success: true,
        isMatch: true,
        matchedUser: userProfile,
      };
    }
  }

  return { success: true, isMatch: false };
}

// 3. LẤY DANH SÁCH ĐÃ MATCH (Chat List)
export async function getUserMatches(): Promise<UserProfile[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated.");

  // A. Query bảng Matches với Relation Joins (Tối ưu N+1 query)
  // Cần chỉ định rõ foreign key vì 1 bảng users join 2 lần
  const { data: matches, error } = await supabase
    .from("matches")
    .select(
      `
      id,
      created_at,
      user1:users!matches_user1_id_fkey (
        *,
        user_hobbies ( hobbies (*) )
      ),
      user2:users!matches_user2_id_fkey (
        *,
        user_hobbies ( hobbies (*) )
      )
    `
    )
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`) // Lấy match của mình
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching matches:", error);
    throw new Error("Failed to fetch matches");
  }

  if (!matches) return [];
  // Ép kiểu dữ liệu trả về từ Supabase sang Interface đã định nghĩa
  const typedMatches = matches as unknown as MatchResponse[];
  // B. Transform dữ liệu
  const matchedProfiles: UserProfile[] = typedMatches.map((match) => {
    // Xác định xem ai là "người kia" (Partner)
    const partner = match.user1.id === user.id ? match.user2 : match.user1;

    // Parse Location & Hobbies của Partner
    const { latitude, longitude } = parsePostGISLocation(partner.location);
    const hobbies = formatHobbies(partner.user_hobbies);

    return {
      ...partner, // Spread thông tin user (full_name, avatar_url...)
      id: partner.id, // Đảm bảo ID là của partner
      match_id: match.id, // (Optional) Lưu ID của cuộc match để dùng cho chat room
      latitude,
      longitude,
      hobbies,
      preferences: partner.preferences,
      // Ghi đè timestamp của user bằng timestamp của lúc match (để sort list chat)
      created_at: match.created_at,
    };
  });

  return matchedProfiles;
}

// 4. LẤY BẢNG XẾP HẠNG (Top những người được thích nhiều nhất toàn hệ thống)
export async function getLeaderboard() {
  const supabase = await createClient();

  // Giải thích logic query:
  // 1. users(*) : Lấy thông tin user
  // 2. like_count: likes!to_user_id(count) : Đếm số lần user này xuất hiện ở cột 'to_user_id' trong bảng likes
  // 3. order('like_count', { foreignTable: 'likes', ascending: false }) : Sắp xếp theo số lượng đếm được
  const { data, error } = await supabase
    .from("users")
    .select(`
      id,
      full_name,
      avatar_url,
      like_count: likes!to_user_id(count)
    `)
    // Mặc định Supabase không cho order trực tiếp trên kết quả count một cách đơn giản ở tầng select
    // Nên chúng ta vẫn sẽ lấy data và thực hiện sort để đảm bảo logic Ranking chính xác nhất.
  
  if (error) {
    console.error("Leaderboard error:", error);
    return [];
  }

  // Chuyển đổi dữ liệu về dạng phẳng và Sort
  const sortedLeaderboard = data
    .map((u: any) => ({
      id: u.id,
      full_name: u.full_name,
      avatar_url: u.avatar_url,
      // Supabase trả về mảng [{count: x}] cho alias này
      like_count: u.like_count?.[0]?.count || 0,
    }))
    // Sắp xếp: Ai có like_count lớn nhất đứng đầu (vị trí index 0)
    .sort((a, b) => b.like_count - a.like_count)
    .slice(0, 10); // Lấy Top 10 người đứng đầu

  return sortedLeaderboard;
}
