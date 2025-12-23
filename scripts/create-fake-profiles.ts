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
    // --- 1. ORIGINAL PROFILES (Updated with photos) ---
    {
        id: 1,
        full_name: "Nguyễn Thùy Chi",
        username: "thuychi_98",
        email: "thuychi.nguyen@example.com",
        gender: "female",
        birthdate: "1998-05-12",
        bio: "Thích cafe vỉa hè, chụp ảnh film và những ngày mưa. Tìm người cùng đi Đà Lạt cuối tuần! 📸☕️",
        avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop&crop=face",
        photos: [
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1524638431109-93d95c968f03?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?w=600&h=800&fit=crop"
        ],
        preferences: { age_range: { min: 25, max: 35 }, distance: 20, gender_preference: ["male"] },
        location_base: "HCMC"
    },
    {
        id: 2,
        full_name: "Trần Minh Nhật",
        username: "minhnhat_dev",
        email: "minhnhat.tran@example.com",
        gender: "male",
        birthdate: "1995-08-20",
        bio: "IT guy nhưng không khô khan. Thích chạy bộ, coding và mèo. Cần tìm bạn nữ cùng tần số để đi xem phim Marvel. 💻🐱",
        avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop&crop=face",
        photos: [
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=800&fit=crop"
        ],
        preferences: { age_range: { min: 22, max: 30 }, distance: 30, gender_preference: ["female"] },
        location_base: "HCMC"
    },
    {
        id: 3,
        full_name: "Lê Hoàng Bảo Trân",
        username: "baotran_le",
        email: "baotran.le@example.com",
        gender: "female",
        birthdate: "2000-01-15",
        bio: "Sinh viên năm cuối, yêu màu hồng và ghét sự giả dối. Thích trà sữa full topping và dạo phố đi bộ. 🧋✨",
        avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop&crop=face",
        photos: [
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1627590238197-757b6b95574d?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1625244724120-1fd1d34d00f6?w=600&h=800&fit=crop"
        ],
        preferences: { age_range: { min: 22, max: 28 }, distance: 15, gender_preference: ["male"] },
        location_base: "HCMC"
    },
    {
        id: 4,
        full_name: "Phạm Đức Thắng",
        username: "thang_gym",
        email: "thang.pham@example.com",
        gender: "male",
        birthdate: "1992-11-05",
        bio: "PT tự do. Sống healthy, thích leo núi và nấu ăn. Tìm bạn đồng hành cho những chuyến trekking sắp tới. 🏔️💪",
        avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop&crop=face",
        photos: [
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&h=800&fit=crop"
        ],
        preferences: { age_range: { min: 25, max: 35 }, distance: 50, gender_preference: ["female"] },
        location_base: "HCMC"
    },
    {
        id: 5,
        full_name: "Hoàng Mai Anh",
        username: "maianh_hanoi",
        email: "maianh.hoang@example.com",
        gender: "female",
        birthdate: "1996-03-30",
        bio: "Cô gái Hà Nội yêu mùa thu. Thích đọc sách, nghe nhạc Indie và những cuộc trò chuyện sâu sắc. 📚🍂",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop&crop=face",
        photos: [
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1470432581262-e7880e8fe79a?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&h=800&fit=crop"
        ],
        preferences: { age_range: { min: 26, max: 36 }, distance: 25, gender_preference: ["male"] },
        location_base: "Hanoi"
    },
    {
        id: 6,
        full_name: "Vũ Tuấn Kiệt",
        username: "kiet_startup",
        email: "tuankiet.vu@example.com",
        gender: "male",
        birthdate: "1990-07-12",
        bio: "Kinh doanh tự do. Bận rộn nhưng vẫn dành thời gian cho người quan trọng. Thích golf và rượu vang. 🍷⛳",
        avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=600&fit=crop&crop=face",
        photos: [
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=800&fit=crop"
        ],
        preferences: { age_range: { min: 25, max: 35 }, distance: 100, gender_preference: ["female"] },
        location_base: "Hanoi"
    },
    {
        id: 7,
        full_name: "Đặng Thu Thảo",
        username: "thuthao_dang",
        email: "thuthao.dang@example.com",
        gender: "female",
        birthdate: "1997-09-22",
        bio: "Giáo viên mầm non. Yêu trẻ con, thích nấu ăn và cắm hoa. Tìm một mối quan hệ nghiêm túc. 🌸🍳",
        avatar_url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=600&fit=crop&crop=face",
        photos: [
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=800&fit=crop"
        ],
        preferences: { age_range: { min: 27, max: 35 }, distance: 30, gender_preference: ["male"] },
        location_base: "HCMC"
    },
    {
        id: 8,
        full_name: "Ngô Văn Hùng",
        username: "hung_biker",
        email: "hung.ngo@example.com",
        gender: "male",
        birthdate: "1994-04-18",
        bio: "Đam mê Phượt và xe phân khối lớn. Thích khám phá những cung đường mới. 'Đi đâu cũng được, miễn là đi cùng nhau'. 🏍️🛣️",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=face",
        photos: [
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1558981806-ec527fa84f3d?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=800&fit=crop"
        ],
        preferences: { age_range: { min: 22, max: 30 }, distance: 60, gender_preference: ["female"] },
        location_base: "HCMC"
    },
    {
        id: 9,
        full_name: "Bùi Phương Linh",
        username: "linh_art",
        email: "linh.bui@example.com",
        gender: "female",
        birthdate: "1999-12-05",
        bio: "Freelance Designer. Thích vẽ vời, nghe podcast và nuôi mèo. Hơi hướng nội một xíu nha. 🎨🐈",
        avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=600&fit=crop&crop=face",
        photos: [
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1516108317508-6788f6a160ee?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1518904948222-6ab5452cb9eb?w=600&h=800&fit=crop"
        ],
        preferences: { age_range: { min: 24, max: 32 }, distance: 20, gender_preference: ["male"] },
        location_base: "Hanoi"
    },
    {
        id: 10,
        full_name: "Đỗ Quốc Bảo",
        username: "bao_chef",
        email: "bao.do@example.com",
        gender: "male",
        birthdate: "1993-02-14",
        bio: "Đầu bếp tại nhà hàng Âu. Muốn tìm người để nấu cho ăn mỗi ngày. Đường đến trái tim thông qua dạ dày! 🍝❤️",
        avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=600&fit=crop&crop=face",
        photos: [
            "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=600&h=800&fit=crop",
            "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&h=800&fit=crop"
        ],
        preferences: { age_range: { min: 25, max: 35 }, distance: 40, gender_preference: ["female"] },
        location_base: "HCMC"
    },

    // --- NEW MALE PROFILES (20) ---
    {
        id: 11,
        full_name: "Lý Hải Nam",
        username: "nam_guitar",
        email: "nam.ly@example.com",
        gender: "male",
        birthdate: "1996-06-10",
        bio: "Nhạc công tự do. Thích Acoustic và những buổi chiều hoàng hôn. Tìm nàng thơ cho bài hát mới. 🎸🎼",
        avatar_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&h=800", "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=600&h=800"],
        location_base: "HCMC",
        preferences: { age_range: { min: 20, max: 28 }, distance: 25, gender_preference: ["female"] }
    },
    {
        id: 12,
        full_name: "Trịnh Văn Toàn",
        username: "toan_archi",
        email: "toan.trinh@example.com",
        gender: "male",
        birthdate: "1991-09-05",
        bio: "Kiến trúc sư. Yêu cái đẹp, sự chỉn chu và cà phê đen không đường. 🏛️☕",
        avatar_url: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=600&h=800", "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&h=800"],
        location_base: "Hanoi",
        preferences: { age_range: { min: 25, max: 32 }, distance: 40, gender_preference: ["female"] }
    },
    {
        id: 13,
        full_name: "Phan Thanh Tùng",
        username: "tung_sneaker",
        email: "tung.phan@example.com",
        gender: "male",
        birthdate: "1998-03-22",
        bio: "Nghiện giày và Streetwear. Thích chụp ảnh dạo phố. Tìm bạn nữ cá tính. 👟🧢",
        avatar_url: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?w=600&h=800", "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=600&h=800"],
        location_base: "HCMC",
        preferences: { age_range: { min: 20, max: 26 }, distance: 15, gender_preference: ["female"] }
    },
    {
        id: 14,
        full_name: "Võ Minh Đức",
        username: "duc_travel",
        email: "duc.vo@example.com",
        gender: "male",
        birthdate: "1989-12-11",
        bio: "Travel Blogger. Đã đi qua 20 quốc gia. Tìm người nắm tay đi khắp thế gian. ✈️🌍",
        avatar_url: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1463453091185-61582044d556?w=600&h=800", "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=800"],
        location_base: "Da Nang",
        preferences: { age_range: { min: 25, max: 35 }, distance: 100, gender_preference: ["female"] }
    },
    {
        id: 15,
        full_name: "Dương Tuấn Anh",
        username: "tuananh_bank",
        email: "anh.duong@example.com",
        gender: "male",
        birthdate: "1993-07-30",
        bio: "Nhân viên ngân hàng. Nghiêm túc trong công việc, ấm áp trong tình yêu. Cuối tuần thích đi xem phim. 💼🎬",
        avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=800", "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=800"],
        location_base: "Hanoi",
        preferences: { age_range: { min: 24, max: 30 }, distance: 20, gender_preference: ["female"] }
    },
    {
        id: 16,
        full_name: "Hồ Quang Hiếu",
        username: "hieu_gamer",
        email: "hieu.ho@example.com",
        gender: "male",
        birthdate: "2001-02-14",
        bio: "Sinh viên IT. Thích Game và Anime. Tìm bạn nữ cùng sở thích để leo rank. 🎮👾",
        avatar_url: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=600&h=800", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=800"],
        location_base: "HCMC",
        preferences: { age_range: { min: 18, max: 24 }, distance: 10, gender_preference: ["female"] }
    },
    {
        id: 17,
        full_name: "Đinh Văn Long",
        username: "long_barista",
        email: "long.dinh@example.com",
        gender: "male",
        birthdate: "1997-11-20",
        bio: "Barista. Biết vẽ Latte Art hình trái tim. Cần tìm người thưởng thức. ☕❤️",
        avatar_url: "https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=600&h=800", "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=800"],
        location_base: "Da Lat",
        preferences: { age_range: { min: 22, max: 29 }, distance: 50, gender_preference: ["female"] }
    },
    {
        id: 18,
        full_name: "Mai Chí Thanh",
        username: "thanh_doc",
        email: "thanh.mai@example.com",
        gender: "male",
        birthdate: "1990-05-05",
        bio: "Bác sĩ thú y. Yêu động vật hơn cả bản thân. Tìm bạn nữ nhân hậu. 🐶🐱",
        avatar_url: "https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=600&h=800", "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600&h=800"],
        location_base: "HCMC",
        preferences: { age_range: { min: 25, max: 32 }, distance: 30, gender_preference: ["female"] }
    },
    {
        id: 19,
        full_name: "Cao Tiến Dũng",
        username: "dung_moto",
        email: "dung.cao@example.com",
        gender: "male",
        birthdate: "1994-08-15",
        bio: "Thợ máy. Thích sửa chữa mọi thứ. Nếu tim em hỏng, anh sửa luôn. 🛠️🔧",
        avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=800", "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=800"],
        location_base: "Hai Phong",
        preferences: { age_range: { min: 22, max: 30 }, distance: 40, gender_preference: ["female"] }
    },
    {
        id: 20,
        full_name: "Trương Thế Vinh",
        username: "vinh_ceo",
        email: "vinh.truong@example.com",
        gender: "male",
        birthdate: "1988-01-20",
        bio: "CEO Startup. Work hard, play hard. Thích tennis và rượu vang. 🍷🎾",
        avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1556157382-97eda2d62296?w=600&h=800", "https://images.unsplash.com/photo-1480099225005-2513f8949366?w=600&h=800"],
        location_base: "HCMC",
        preferences: { age_range: { min: 25, max: 35 }, distance: 50, gender_preference: ["female"] }
    },
    // (Adding 10 more males to reach ~25 males total)
    {
        id: 21,
        full_name: "Lê Văn Hậu",
        username: "hau_photo",
        email: "hau.le@example.com",
        gender: "male",
        birthdate: "1995-04-12",
        bio: "Thợ chụp ảnh cưới. Đã chụp cho bao cặp đôi, giờ tìm người chụp chung. 📸💍",
        avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800", "https://images.unsplash.com/photo-1520854222988-2d8093775f56?w=600&h=800"],
        location_base: "Da Lat",
        preferences: { age_range: { min: 20, max: 28 }, distance: 100, gender_preference: ["female"] }
    },
    {
        id: 22,
        full_name: "Nguyễn Thành Đạt",
        username: "dat_chef",
        email: "dat.nguyen@example.com",
        gender: "male",
        birthdate: "1992-10-10",
        bio: "Đầu bếp món Nhật. Thích sự tinh tế. Tìm bạn nữ tâm lý. 🍣🍱",
        avatar_url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=800", "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&h=800"],
        location_base: "HCMC",
        preferences: { age_range: { min: 24, max: 30 }, distance: 20, gender_preference: ["female"] }
    },
    {
        id: 23,
        full_name: "Phạm Anh Tuấn",
        username: "tuan_bds",
        email: "tuan.pham@example.com",
        gender: "male",
        birthdate: "1990-09-09",
        bio: "Sale Bất Động Sản. Nhiệt huyết, năng động. Thích cafe sáng. 🏘️☕",
        avatar_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=800", "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=800"],
        location_base: "Hanoi",
        preferences: { age_range: { min: 25, max: 32 }, distance: 30, gender_preference: ["female"] }
    },
    {
        id: 24,
        full_name: "Vũ Văn Thanh",
        username: "thanh_football",
        email: "thanh.vu@example.com",
        gender: "male",
        birthdate: "1999-06-06",
        bio: "Cầu thủ phủi. Đam mê trái bóng tròn. Tìm bạn nữ cổ vũ mỗi trận đấu. ⚽🏃",
        avatar_url: "https://images.unsplash.com/photo-1543132220-3ec99c6094dc?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1543132220-3ec99c6094dc?w=600&h=800", "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600&h=800"],
        location_base: "Nghe An",
        preferences: { age_range: { min: 18, max: 25 }, distance: 50, gender_preference: ["female"] }
    },
    {
        id: 25,
        full_name: "Đặng Hoàng Sơn",
        username: "son_artist",
        email: "son.dang@example.com",
        gender: "male",
        birthdate: "1993-03-03",
        bio: "Họa sĩ tự do. Thích vẽ chân dung. Muốn vẽ em trong mọi khoảnh khắc. 🎨🖌️",
        avatar_url: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=600&h=800", "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=800"],
        location_base: "Hanoi",
        preferences: { age_range: { min: 22, max: 30 }, distance: 20, gender_preference: ["female"] }
    },

    // --- NEW FEMALE PROFILES (25) ---
    {
        id: 26,
        full_name: "Nguyễn Ngọc Lan",
        username: "lan_marketing",
        email: "lan.nguyen@example.com",
        gender: "female",
        birthdate: "1997-02-20",
        bio: "Marketing Executive. Sáng tạo, năng động. Thích yoga và brunch cuối tuần. 🧘‍♀️🥑",
        avatar_url: "https://images.unsplash.com/photo-1531123414780-f74242c2b052?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1531123414780-f74242c2b052?w=600&h=800", "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=600&h=800"],
        location_base: "HCMC",
        preferences: { age_range: { min: 25, max: 32 }, distance: 15, gender_preference: ["male"] }
    },
    {
        id: 27,
        full_name: "Trần Thị Thu Hà",
        username: "ha_books",
        email: "ha.tran@example.com",
        gender: "female",
        birthdate: "1999-08-10",
        bio: "Mọt sách chính hiệu. Thích mùi sách cũ và trà hoa cúc. Hướng nội part-time. 📖🌼",
        avatar_url: "https://images.unsplash.com/photo-1485290334039-481ae464b569?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1485290334039-481ae464b569?w=600&h=800", "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=800"],
        location_base: "Hanoi",
        preferences: { age_range: { min: 22, max: 30 }, distance: 25, gender_preference: ["male"] }
    },
    {
        id: 28,
        full_name: "Lê Minh Thư",
        username: "thu_dancer",
        email: "thu.le@example.com",
        gender: "female",
        birthdate: "2000-11-11",
        bio: "Vũ công. Yêu sự chuyển động. Thích nhạc Hip-hop và trà sữa. 💃🎵",
        avatar_url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800", "https://images.unsplash.com/photo-1545912452-8ea132594b0c?w=600&h=800"],
        location_base: "HCMC",
        preferences: { age_range: { min: 20, max: 26 }, distance: 20, gender_preference: ["male"] }
    },
    {
        id: 29,
        full_name: "Phạm Thanh Hằng",
        username: "hang_fashion",
        email: "hang.pham@example.com",
        gender: "female",
        birthdate: "1996-05-15",
        bio: "Kinh doanh thời trang. Yêu cái đẹp, thích phối đồ. Tìm người chụp ảnh có tâm. 👗👠",
        avatar_url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&h=800", "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&h=800"],
        location_base: "HCMC",
        preferences: { age_range: { min: 25, max: 35 }, distance: 30, gender_preference: ["male"] }
    },
    {
        id: 30,
        full_name: "Hoàng Yến Nhi",
        username: "nhi_nurse",
        email: "nhi.hoang@example.com",
        gender: "female",
        birthdate: "1995-12-25",
        bio: "Y tá. Chăm sóc người khác là niềm vui. Cần người chăm sóc lại mình. 🏥💉",
        avatar_url: "https://images.unsplash.com/photo-1554151228-14d9def656ec?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1554151228-14d9def656ec?w=600&h=800", "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=800"],
        location_base: "Hanoi",
        preferences: { age_range: { min: 26, max: 34 }, distance: 40, gender_preference: ["male"] }
    },
    {
        id: 31,
        full_name: "Vũ Khánh Linh",
        username: "linh_travel",
        email: "linh.vu@example.com",
        gender: "female",
        birthdate: "1998-04-04",
        bio: "Thích xê dịch. Biển là tình yêu lớn nhất. Tìm người cùng đi biển. 🌊🏖️",
        avatar_url: "https://images.unsplash.com/photo-1523902574421-3642c1300958?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1523902574421-3642c1300958?w=600&h=800", "https://images.unsplash.com/photo-1510525009512-ad7fc13eefab?w=600&h=800"],
        location_base: "Da Nang",
        preferences: { age_range: { min: 24, max: 30 }, distance: 100, gender_preference: ["male"] }
    },
    {
        id: 32,
        full_name: "Đặng Thị Mai",
        username: "mai_teacher",
        email: "mai.dang@example.com",
        gender: "female",
        birthdate: "1994-09-02",
        bio: "Giáo viên tiếng Anh. Thích sự cầu tiến và hài hước. No bad vibes. 📚🇬🇧",
        avatar_url: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1548142813-c348350df52b?w=600&h=800", "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=800"],
        location_base: "HCMC",
        preferences: { age_range: { min: 25, max: 35 }, distance: 20, gender_preference: ["male"] }
    },
    {
        id: 33,
        full_name: "Ngô Thanh Vân",
        username: "van_flower",
        email: "van.ngo@example.com",
        gender: "female",
        birthdate: "1993-01-01",
        bio: "Chủ tiệm hoa. Yêu thiên nhiên, sống chậm. Tìm người đàn ông trưởng thành. 🌸🌿",
        avatar_url: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?w=600&h=800", "https://images.unsplash.com/photo-1490750967868-58cb75069ed6?w=600&h=800"],
        location_base: "Da Lat",
        preferences: { age_range: { min: 28, max: 38 }, distance: 50, gender_preference: ["male"] }
    },
    {
        id: 34,
        full_name: "Bùi Bích Phương",
        username: "phuong_sing",
        email: "phuong.bui@example.com",
        gender: "female",
        birthdate: "2000-07-07",
        bio: "Sinh viên thanh nhạc. Hát hay, hay cười. Tìm chàng trai biết đàn. 🎤🎹",
        avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800", "https://images.unsplash.com/photo-1516575334481-f85287c2c81d?w=600&h=800"],
        location_base: "Hanoi",
        preferences: { age_range: { min: 20, max: 26 }, distance: 15, gender_preference: ["male"] }
    },
    {
        id: 35,
        full_name: "Đỗ Thị Kim Anh",
        username: "kimanh_gym",
        email: "kimanh.do@example.com",
        gender: "female",
        birthdate: "1997-10-30",
        bio: "Gymer. Yêu thể thao, ghét bụng bự. Cùng nhau đi tập nhé? 🏋️‍♀️🥗",
        avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800", "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&h=800"],
        location_base: "HCMC",
        preferences: { age_range: { min: 24, max: 32 }, distance: 20, gender_preference: ["male"] }
    },
    // (Adding 10 more females to reach ~25 females total)
    {
        id: 36,
        full_name: "Trương Mỹ Lan",
        username: "lan_baker",
        email: "lan.truong@example.com",
        gender: "female",
        birthdate: "1996-06-16",
        bio: "Thợ làm bánh ngọt. Cuộc sống cần chút đường. 🍰🍪",
        avatar_url: "https://images.unsplash.com/photo-1525134479668-1bee4c7c6a3d?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1525134479668-1bee4c7c6a3d?w=600&h=800", "https://images.unsplash.com/photo-1556910103-1c02745a30bf?w=600&h=800"],
        location_base: "Hanoi",
        preferences: { age_range: { min: 25, max: 35 }, distance: 25, gender_preference: ["male"] }
    },
    {
        id: 37,
        full_name: "Phan Diệu Nhi",
        username: "nhi_act",
        email: "nhi.phan@example.com",
        gender: "female",
        birthdate: "1999-03-12",
        bio: "Diễn viên tự do. Thích diễn xuất nhưng không thích diễn trong tình yêu. 🎭🎬",
        avatar_url: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=800", "https://images.unsplash.com/photo-1496440738361-1e9a6e248384?w=600&h=800"],
        location_base: "HCMC",
        preferences: { age_range: { min: 22, max: 30 }, distance: 40, gender_preference: ["male"] }
    },
    {
        id: 38,
        full_name: "Dương Tú Vi",
        username: "vi_cat",
        email: "vi.duong@example.com",
        gender: "female",
        birthdate: "2001-08-08",
        bio: "Sen của 3 boss mèo. Yêu động vật là điểm cộng lớn. 🐈🐱",
        avatar_url: "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1517365830460-955ce3ccd263?w=600&h=800", "https://images.unsplash.com/photo-1532592333382-4c2c58c0c4f8?w=600&h=800"],
        location_base: "HCMC",
        preferences: { age_range: { min: 20, max: 26 }, distance: 15, gender_preference: ["male"] }
    },
    {
        id: 39,
        full_name: "Hồ Ngọc Hà",
        username: "ha_model",
        email: "ha.ho@example.com",
        gender: "female",
        birthdate: "1995-11-25",
        bio: "Người mẫu ảnh. Cao 1m70. Thích thời trang và sự sang trọng. 👠💄",
        avatar_url: "https://images.unsplash.com/photo-1485960994840-902a67e187c8?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1485960994840-902a67e187c8?w=600&h=800", "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=800"],
        location_base: "Hanoi",
        preferences: { age_range: { min: 25, max: 35 }, distance: 50, gender_preference: ["male"] }
    },
    {
        id: 40,
        full_name: "Lý Nhã Kỳ",
        username: "ky_gem",
        email: "ky.ly@example.com",
        gender: "female",
        birthdate: "1992-07-07",
        bio: "Kinh doanh đá quý. Độc lập tài chính. Tìm người chân thành. 💎💍",
        avatar_url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&h=800", "https://images.unsplash.com/photo-1566616213894-2dcdcf8af6bc?w=600&h=800"],
        location_base: "HCMC",
        preferences: { age_range: { min: 30, max: 40 }, distance: 100, gender_preference: ["male"] }
    },
    {
        id: 41,
        full_name: "Đinh Hương Giang",
        username: "giang_beauty",
        email: "giang.dinh@example.com",
        gender: "female",
        birthdate: "1998-02-14",
        bio: "Beauty Blogger. Thích makeup và skincare. Tìm bạn trai biết chụp ảnh. 💄🤳",
        avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800", "https://images.unsplash.com/photo-1512207848435-472041c5c23d?w=600&h=800"],
        location_base: "Hanoi",
        preferences: { age_range: { min: 24, max: 30 }, distance: 20, gender_preference: ["male"] }
    },
    {
        id: 42,
        full_name: "Mai Phương Thúy",
        username: "thuy_tall",
        email: "thuy.mai@example.com",
        gender: "female",
        birthdate: "1994-05-10",
        bio: "Nhân viên văn phòng. Cao ráo, dễ gần. Thích ăn vặt. 🍕🍟",
        avatar_url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=800", "https://images.unsplash.com/photo-1517677130602-2350c1de7214?w=600&h=800"],
        location_base: "HCMC",
        preferences: { age_range: { min: 25, max: 35 }, distance: 25, gender_preference: ["male"] }
    },
    {
        id: 43,
        full_name: "Cao Thùy Dương",
        username: "duong_pianist",
        email: "duong.cao@example.com",
        gender: "female",
        birthdate: "1997-12-12",
        bio: "Giáo viên Piano. Nhẹ nhàng, tình cảm. Thích nhạc cổ điển. 🎹🎼",
        avatar_url: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?w=600&h=800", "https://images.unsplash.com/photo-1526323602167-270e53dbf153?w=600&h=800"],
        location_base: "Da Nang",
        preferences: { age_range: { min: 25, max: 32 }, distance: 50, gender_preference: ["male"] }
    },
    {
        id: 44,
        full_name: "Võ Hoàng Yến",
        username: "yen_dj",
        email: "yen.vo@example.com",
        gender: "female",
        birthdate: "1995-10-05",
        bio: "DJ. Sống về đêm. Cá tính mạnh. Ai đủ bản lĩnh thì bơi vào. 🎧🔥",
        avatar_url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800", "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=800"],
        location_base: "HCMC",
        preferences: { age_range: { min: 25, max: 35 }, distance: 30, gender_preference: ["male"] }
    },
    {
        id: 45,
        full_name: "Nguyễn Thị Huyền",
        username: "huyen_spa",
        email: "huyen.nguyen@example.com",
        gender: "female",
        birthdate: "1993-04-20",
        bio: "Quản lý Spa. Thích làm đẹp cho đời. Tìm người đàn ông tinh tế. 🧖‍♀️💆‍♀️",
        avatar_url: "https://images.unsplash.com/photo-1514315384763-ba401779410f?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1514315384763-ba401779410f?w=600&h=800", "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&h=800"],
        location_base: "Hai Phong",
        preferences: { age_range: { min: 28, max: 38 }, distance: 40, gender_preference: ["male"] }
    },
    // --- ADDITIONAL FILLERS TO REACH 50 (5 more random mix) ---
    {
        id: 46,
        full_name: "Trần Văn Bình",
        username: "binh_it",
        email: "binh.tran@example.com",
        gender: "male",
        birthdate: "1998-01-01",
        bio: "Coder full-stack. Thích fix bug và uống monster. Tìm bạn nữ không biết code để anh dạy. 💻",
        avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=800"],
        location_base: "HCMC",
        preferences: { age_range: { min: 20, max: 28 }, distance: 20, gender_preference: ["female"] }
    },
    {
        id: 47,
        full_name: "Lê Thị Hồng",
        username: "hong_rose",
        email: "hong.le@example.com",
        gender: "female",
        birthdate: "1996-02-14",
        bio: "Yêu màu hồng, ghét sự giả dối. Thích đi dạo công viên. 🌹",
        avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800"],
        location_base: "Hanoi",
        preferences: { age_range: { min: 25, max: 35 }, distance: 20, gender_preference: ["male"] }
    },
    {
        id: 48,
        full_name: "Phạm Văn Khoa",
        username: "khoa_science",
        email: "khoa.pham@example.com",
        gender: "male",
        birthdate: "1995-05-05",
        bio: "Nghiên cứu sinh. Hơi khô khan nhưng rất chân thành. 🧪",
        avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800"],
        location_base: "HCMC",
        preferences: { age_range: { min: 24, max: 30 }, distance: 25, gender_preference: ["female"] }
    },
    {
        id: 49,
        full_name: "Hoàng Thị Mơ",
        username: "mo_dream",
        email: "mo.hoang@example.com",
        gender: "female",
        birthdate: "2000-10-10",
        bio: "Mộng mơ. Thích làm thơ và ngắm trăng. 🌙",
        avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800"],
        location_base: "Can Tho",
        preferences: { age_range: { min: 22, max: 30 }, distance: 30, gender_preference: ["male"] }
    },
    {
        id: 50,
        full_name: "Ngô Quốc Việt",
        username: "viet_army",
        email: "viet.ngo@example.com",
        gender: "male",
        birthdate: "1993-12-22",
        bio: "Bộ đội. Kỷ luật thép. Yêu tổ quốc, yêu đồng bào và yêu em. 🇻🇳",
        avatar_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=600&fit=crop&crop=face",
        photos: ["https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=800"],
        location_base: "Hanoi",
        preferences: { age_range: { min: 20, max: 30 }, distance: 50, gender_preference: ["female"] }
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
                    photos: profile.photos,
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