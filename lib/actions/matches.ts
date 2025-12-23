"use server";

import { Hobby, UserProfile } from "@/lib/actions/profile";
import { createClient } from "../supabase/sever";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
interface RawUserHobby {
  hobbies: Hobby | null;
}

// Định nghĩa kiểu dữ liệu thô trả về từ RPC + Select
// Nó bao gồm các trường của UserProfile + mảng user_hobbies từ phép join
interface RawPotentialMatch extends Omit<UserProfile, 'hobbies' | 'latitude' | 'longitude'> {
  user_hobbies: RawUserHobby[] | null;
  location: string; // PostGIS trả về chuỗi POINT(x y)
}

export async function getPotentialMatches(): Promise<UserProfile[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated.");

  // 1. Lấy Preferences và Danh sách đã Like
  const [prefsResponse, likesResponse] = await Promise.all([
    supabase.from("users").select("preferences").eq("id", user.id).single(),
    supabase.from("likes").select("to_user_id").eq("from_user_id", user.id),
  ]);

  const userPrefs = (prefsResponse.data?.preferences || {}) as UserPreferences;
  const likedUserIds = (likesResponse.data || []).map((l) => l.to_user_id);

  // Chuẩn bị tham số cho RPC
  const minAge = userPrefs.age_range?.min || 18;
  const maxAge = userPrefs.age_range?.max || 50;
  const distanceMeters = (userPrefs.distance || 50) * 1000;
  const genderPref = userPrefs.gender_preference || [];

  // 2. GỌI RPC
  const { data, error } = await supabase
    .rpc("find_potential_matches", {
      min_age: minAge,
      max_age: maxAge,
      gender_pref: genderPref,
      dist_meters: distanceMeters,
      excluded_ids: likedUserIds,
    })
    .select(`
      *,
      user_hobbies (
        hobbies ( * )
      )
    `);

  if (error) {
    console.error("Error fetching matches via RPC:", error);
    throw new Error("Failed to fetch matches");
  }

  // ÉP KIỂU AN TOÀN TẠI ĐÂY
  // Supabase trả về data dạng mảng object, ta ép nó về đúng cấu trúc RawPotentialMatch
  const rawMatches = data as unknown as RawPotentialMatch[];

  // 3. Map dữ liệu
  return rawMatches.map((match) => {
    // Bây giờ 'match' đã có kiểu dữ liệu rõ ràng, TypeScript sẽ gợi ý code
    const { latitude, longitude } = parsePostGISLocation(match.location);

    return {
      ...match, // Spread các trường cơ bản (id, full_name...)
      latitude,
      longitude,
      hobbies: formatHobbies(match.user_hobbies), // Hàm này đã nhận đúng kiểu RawUserHobby[]
      preferences: match.preferences as Record<string, unknown>, // Đảm bảo đúng kiểu cho JSONB
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
export async function unmatchUser(targetUserId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  try {
    const { error } = await supabase
      .from('matches')
      .update({ is_active: false }) // Đánh dấu là không còn active nữa
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${targetUserId}),and(user1_id.eq.${targetUserId},user2_id.eq.${user.id})`);

    if (error) throw error;

    // Refresh lại cache
    revalidatePath('/matches');
    revalidatePath('/chat');

    return { success: true };
  } catch (error) {
    console.error("Error unmatching:", error);
    return { success: false, error: "Không thể bỏ ghép đôi. Vui lòng thử lại." };
  }
}

// Kiểu dữ liệu thô trả về từ query Supabase
interface RawLeaderboardEntry {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  // Supabase trả về alias count dưới dạng mảng object
  like_count: { count: number }[] | null;
}

// Kiểu dữ liệu trả về cho UI
export interface LeaderboardUser {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  like_count: number;
}

// 4. LẤY BẢNG XẾP HẠNG
export async function getLeaderboard(): Promise<LeaderboardUser[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select(`
      id,
      full_name,
      avatar_url,
      like_count: likes!to_user_id(count)
    `);

  if (error) {
    console.error("Leaderboard error:", error);
    return [];
  }

  // Ép kiểu data thô sang Interface đã định nghĩa
  const rawData = data as unknown as RawLeaderboardEntry[];

  // Chuyển đổi dữ liệu về dạng phẳng và Sort
  const sortedLeaderboard = rawData
    .map((u) => ({
      id: u.id,
      full_name: u.full_name,
      avatar_url: u.avatar_url,
      // Truy cập an toàn vào mảng count
      like_count: u.like_count?.[0]?.count || 0,
    }))
    // Sắp xếp: Ai có like_count lớn nhất đứng đầu
    .sort((a, b) => b.like_count - a.like_count)
    .slice(0, 10);

  return sortedLeaderboard;
}