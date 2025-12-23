# 🔥 Tinder Web App (Next.js 16 + Supabase + Stream Chat)

Một ứng dụng hẹn hò hiện đại được xây dựng với **Next.js 16 (App Router)**, tích hợp định vị thời gian thực với **PostGIS**, nhắn tin và gọi video qua **GetStream**, và hiệu ứng vuốt mượt mà với **GSAP**.

## 🚀 Tính năng chính

-   **Authentication:** Đăng nhập, Đăng ký, Quên mật khẩu, Xác thực OTP qua Email (Supabase Auth).
-   **Discovery (Swipe):** Giao diện vuốt trái/phải mượt mà sử dụng GSAP Draggable.
-   **Matching thông minh:**
    -   Tìm người dùng xung quanh dựa trên vị trí địa lý (PostGIS).
    -   Bộ lọc theo độ tuổi, giới tính và khoảng cách.
-   **Real-time Chat:** Nhắn tin tức thời, gửi ảnh (Stream Chat).
-   **Video Call:** Gọi video trực tiếp giữa 2 người dùng đã match (Stream Video).
-   **Profile Management:**
    -   Cập nhật thông tin cá nhân, Bio.
    -   Upload nhiều ảnh (Supabase Storage).
    -   Chọn sở thích (Hobbies).
-   **Leaderboard:** Bảng xếp hạng những người dùng được yêu thích nhất.

## 🛠 Tech Stack

-   **Frontend:** Next.js 16, TypeScript, Tailwind CSS, Material UI (MUI).
-   **Backend / Database:** Supabase (PostgreSQL, Auth, Storage, Realtime).
-   **Location Service:** PostGIS (SQL Extension).
-   **Chat & Video:** Stream Chat & Video SDK.
-   **Animations:** GSAP (GreenSock Animation Platform).
-   **Forms & Validation:** React Hook Form.

---

## ⚙️ Cài đặt và Chạy dự án

### 1. Clone dự án

```bash
git clone [https://github.com/PQ-Thinh/Tinder-Web-App.git](https://github.com/PQ-Thinh/Tinder-Web-App.git)
cd Tinder-Web-App

## Cấu trúc dự án

```bash
.
├── app/                  # Next.js App Router
│   ├── auth/             # Các trang xác thực (Login, Register, Reset Pass)
│   ├── chat/             # Giao diện Chat & Video Call
│   ├── matches/          # Logic Swipe & Discovery
│   ├── profile/          # Quản lý hồ sơ cá nhân
│   └── layout.tsx        # Root Layout & Context Providers
├── components/           # UI Components (Reusable)
├── lib/
│   ├── actions/          # Server Actions (Xử lý logic backend)
│   ├── supabase/         # Config Supabase Client/Server
│   └── stream-chat-client.ts # Config Stream Chat
├── contexts/             # React Context (Auth, Message)
└── public/               # Static assets