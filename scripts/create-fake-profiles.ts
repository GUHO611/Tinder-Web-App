import { createClient } from "@supabase/supabase-js";
import { fakerVI as faker } from "@faker-js/faker"; // Dùng locale Việt Nam
import "dotenv/config";

// --- CẤU HÌNH ---
// Hãy thay thế bằng URL và KEY thực của bạn hoặc dùng biến môi trường
const SUPABASE_URL = "https://nnlzfhtbykgspfphdcfs.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ubHpmaHRieWtnc3BmcGhkY2ZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE0MDA2MCwiZXhwIjoyMDc5NzE2MDYwfQ.14zsmLYulCuo9ysrb8YZa7P1_fRzHe-OlI7i0Odq0IE";
const PASSWORD = "password123";

// Khởi tạo Supabase Admin Client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

// Danh sách dữ liệu mẫu đậm chất Việt Nam
const vnProfiles = [
    {
        full_name: "Nguyễn Thùy Chi",
        username: "thuychi_98",
        email: "thuychi.nguyen@example.com",
        gender: "female",
        birthdate: "1998-05-12",
        bio: "Thích cafe vỉa hè, chụp ảnh film và những ngày mưa. Tìm người cùng đi Đà Lạt cuối tuần! 📸☕️",
        avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face",
        preferences: { age_range: { min: 25, max: 35 }, distance: 20, gender_preference: ["male"] },
        location_base: "HCMC" // Hồ Chí Minh
    },
    {
        full_name: "Trần Minh Nhật",
        username: "minhnhat_dev",
        email: "minhnhat.tran@example.com",
        gender: "male",
        birthdate: "1995-08-20",
        bio: "IT guy nhưng không khô khan. Thích chạy bộ, coding và mèo. Cần tìm bạn nữ cùng tần số để đi xem phim Marvel. 💻🐱",
        avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face",
        preferences: { age_range: { min: 22, max: 30 }, distance: 30, gender_preference: ["female"] },
        location_base: "HCMC"
    },
    {
        full_name: "Lê Hoàng Bảo Trân",
        username: "baotran_le",
        email: "baotran.le@example.com",
        gender: "female",
        birthdate: "2000-01-15",
        bio: "Sinh viên năm cuối, yêu màu hồng và ghét sự giả dối. Thích trà sữa full topping và dạo phố đi bộ. 🧋✨",
        avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop&crop=face",
        preferences: { age_range: { min: 22, max: 28 }, distance: 15, gender_preference: ["male"] },
        location_base: "HCMC"
    },
    {
        full_name: "Phạm Đức Thắng",
        username: "thang_gym",
        email: "thang.pham@example.com",
        gender: "male",
        birthdate: "1992-11-05",
        bio: "PT tự do. Sống healthy, thích leo núi và nấu ăn. Tìm bạn đồng hành cho những chuyến trekking sắp tới. 🏔️💪",
        avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
        preferences: { age_range: { min: 25, max: 35 }, distance: 50, gender_preference: ["female"] },
        location_base: "HCMC"
    },
    {
        full_name: "Hoàng Mai Anh",
        username: "maianh_hanoi",
        email: "maianh.hoang@example.com",
        gender: "female",
        birthdate: "1996-03-30",
        bio: "Cô gái Hà Nội yêu mùa thu. Thích đọc sách, nghe nhạc Indie và những cuộc trò chuyện sâu sắc. 📚🍂",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face",
        preferences: { age_range: { min: 26, max: 36 }, distance: 25, gender_preference: ["male"] },
        location_base: "Hanoi" // Hà Nội
    },
    {
        full_name: "Vũ Tuấn Kiệt",
        username: "kiet_startup",
        email: "tuankiet.vu@example.com",
        gender: "male",
        birthdate: "1990-07-12",
        bio: "Kinh doanh tự do. Bận rộn nhưng vẫn dành thời gian cho người quan trọng. Thích golf và rượu vang. 🍷⛳",
        avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
        preferences: { age_range: { min: 25, max: 35 }, distance: 100, gender_preference: ["female"] },
        location_base: "Hanoi"
    },
    {
        full_name: "Đặng Thu Thảo",
        username: "thuthao_dang",
        email: "thuthao.dang@example.com",
        gender: "female",
        birthdate: "1997-09-22",
        bio: "Giáo viên mầm non. Yêu trẻ con, thích nấu ăn và cắm hoa. Tìm một mối quan hệ nghiêm túc. 🌸🍳",
        avatar_url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop&crop=face",
        preferences: { age_range: { min: 27, max: 35 }, distance: 30, gender_preference: ["male"] },
        location_base: "HCMC"
    },
    {
        full_name: "Ngô Văn Hùng",
        username: "hung_biker",
        email: "hung.ngo@example.com",
        gender: "male",
        birthdate: "1994-04-18",
        bio: "Đam mê Phượt và xe phân khối lớn. Thích khám phá những cung đường mới. 'Đi đâu cũng được, miễn là đi cùng nhau'. 🏍️🛣️",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
        preferences: { age_range: { min: 22, max: 30 }, distance: 60, gender_preference: ["female"] },
        location_base: "HCMC"
    },
    {
        full_name: "Bùi Phương Linh",
        username: "linh_art",
        email: "linh.bui@example.com",
        gender: "female",
        birthdate: "1999-12-05",
        bio: "Freelance Designer. Thích vẽ vời, nghe podcast và nuôi mèo. Hơi hướng nội một xíu nha. 🎨🐈",
        avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
        preferences: { age_range: { min: 24, max: 32 }, distance: 20, gender_preference: ["male"] },
        location_base: "Hanoi"
    },
    {
        full_name: "Đỗ Quốc Bảo",
        username: "bao_chef",
        email: "bao.do@example.com",
        gender: "male",
        birthdate: "1993-02-14",
        bio: "Đầu bếp tại nhà hàng Âu. Muốn tìm người để nấu cho ăn mỗi ngày. Đường đến trái tim thông qua dạ dày! 🍝❤️",
        avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=face",
        preferences: { age_range: { min: 25, max: 35 }, distance: 40, gender_preference: ["female"] },
        location_base: "HCMC"
    }
];

// Tọa độ trung tâm để random vị trí xung quanh
const LOCATIONS = {
    HCMC: { lat: 10.762622, lng: 106.660172, address: "TP. Hồ Chí Minh, Việt Nam" },
    Hanoi: { lat: 21.028511, lng: 105.854444, address: "Hà Nội, Việt Nam" }
};

async function createFakeProfiles() {
    console.log("🚀 Bắt đầu tạo dữ liệu mẫu người Việt...");

    // 1. Lấy danh sách Sở thích (Hobbies) từ DB để gán cho user
    const { data: hobbiesData, error: hobbiesError } = await supabase.from("hobbies").select("id");
    if (hobbiesError || !hobbiesData || hobbiesData.length === 0) {
        console.error("❌ Lỗi: Bạn cần chạy file SQL tạo Hobbies trước khi chạy script này!");
        return;
    }
    const allHobbyIds = hobbiesData.map(h => h.id);

    for (let i = 0; i < vnProfiles.length; i++) {
        const profile = vnProfiles[i];

        try {
            console.log(`\n📝 Đang xử lý profile ${i + 1}/${vnProfiles.length}: ${profile.full_name}`);

            // --- BƯỚC 1: TẠO AUTH USER ---
            // Kiểm tra user tồn tại chưa
            const { data: existingAuthUsers } = await supabase.auth.admin.listUsers();
            const existingAuthUser = existingAuthUsers.users.find(u => u.email === profile.email);

            let userId: string;

            if (existingAuthUser) {
                console.log(`   ⚠️ Auth user đã tồn tại, sẽ cập nhật profile...`);
                userId = existingAuthUser.id;
            } else {
                // Tạo mới
                const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                    email: profile.email,
                    password: PASSWORD,
                    email_confirm: true,
                    user_metadata: {
                        full_name: profile.full_name,
                        username: profile.username,
                        avatar_url: profile.avatar_url, // Metadata để trigger tự điền
                    },
                });

                if (authError) {
                    console.error(`   ❌ Lỗi tạo Auth User:`, authError.message);
                    continue;
                }
                userId = authData.user.id;
                console.log(`   ✅ Đã tạo Auth User ID: ${userId}`);
            }

            // --- BƯỚC 2: TẠO VỊ TRÍ NGẪU NHIÊN (POSTGIS) ---
            // Random vị trí trong bán kính 10km quanh trung tâm TP
            const baseLoc = profile.location_base === 'Hanoi' ? LOCATIONS.Hanoi : LOCATIONS.HCMC;
            const randomLat = faker.location.latitude({ min: baseLoc.lat - 0.05, max: baseLoc.lat + 0.05 });
            const randomLng = faker.location.longitude({ min: baseLoc.lng - 0.05, max: baseLoc.lng + 0.05 });

            // Định dạng WKT cho PostGIS: POINT(lng lat)
            const locationPoint = `POINT(${randomLng} ${randomLat})`;

            // --- BƯỚC 3: CẬP NHẬT PROFILE (BẢNG PUBLIC.USERS) ---
            // Trigger đã tạo dòng trong bảng users rồi, giờ ta chỉ cần update
            const { error: updateError } = await supabase
                .from("users")
                .update({
                    full_name: profile.full_name,
                    username: profile.username,
                    gender: profile.gender,
                    birthdate: profile.birthdate,
                    bio: profile.bio,
                    avatar_url: profile.avatar_url,
                    preferences: profile.preferences,
                    // Cập nhật các trường mới theo Schema V2
                    location: locationPoint,
                    display_address: baseLoc.address,
                    is_profile_completed: true, // Đánh dấu đã xong để hiện lên app
                    is_verified: true,
                    is_online: Math.random() > 0.5,
                })
                .eq("id", userId);

            if (updateError) {
                console.error(`   ❌ Lỗi update profile:`, updateError.message);
                continue;
            }

            // --- BƯỚC 4: GÁN SỞ THÍCH NGẪU NHIÊN ---
            // Xóa sở thích cũ (nếu chạy lại script)
            await supabase.from("user_hobbies").delete().eq("user_id", userId);

            // Random 3-5 sở thích
            const randomHobbies = faker.helpers.arrayElements(allHobbyIds, { min: 3, max: 5 });
            const hobbyInserts = randomHobbies.map(hobbyId => ({
                user_id: userId,
                hobby_id: hobbyId
            }));

            const { error: hobbyError } = await supabase.from("user_hobbies").insert(hobbyInserts);

            if (hobbyError) {
                console.error(`   ⚠️ Lỗi gán sở thích:`, hobbyError.message);
            } else {
                console.log(`   ✅ Đã gán ${randomHobbies.length} sở thích`);
            }

            console.log(`   ✨ Hoàn tất profile cho: ${profile.full_name}`);

        } catch (err) {
            console.error(`   ❌ Lỗi không mong muốn:`, err);
        }
    }

    console.log("\n🎉 Tạo dữ liệu mẫu thành công!");
    console.log(`👉 Mật khẩu chung cho tất cả tài khoản: "${PASSWORD}"`);
}

createFakeProfiles();