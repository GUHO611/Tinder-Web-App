import { UserProfile } from "@/lib/actions/profile"; // Đảm bảo import đúng nơi chứa UserProfile chuẩn
import { calculateAge } from "@/lib/helpers/calculate-age";
import Image from "next/image";

export default function MatchCard({ user }: { user: UserProfile }) {
    // Logic kiểm tra ảnh an toàn: Nếu null, undefined hoặc rỗng thì dùng ảnh mặc định
    const avatarSrc =
        user.avatar_url && user.avatar_url.trim().length > 0
            ? user.avatar_url
            : "/default-avatar.png"; // Đảm bảo bạn có file này trong thư mục public/

    return (
        <div className="relative w-full max-w-sm mx-auto shadow-2xl rounded-3xl overflow-hidden bg-white dark:bg-gray-800 h-[600px] sm:h-[650px]">
            <div className="card-swipe w-full h-full relative group">
                {/* Ảnh đại diện */}
                <Image
                    src={avatarSrc}
                    alt={user.full_name || "User"}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                    priority
                />

                {/* Gradient nền đen mờ để chữ dễ đọc */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Nội dung thông tin */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-10">
                    <div className="flex flex-col gap-1 animate-fadeIn">
                        {/* Tên và Tuổi */}
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-3xl font-bold tracking-tight shadow-black drop-shadow-md">
                                {user.full_name}
                            </h2>

                        </div>
                        <div>
                            <span className="text-2xl font-medium opacity-90">
                                {user.birthdate ? calculateAge(user.birthdate) : ""} tuổi
                            </span>
                        </div>

                        {/* Vị trí (nếu có) */}
                        {user.display_address && (
                            <div className="flex items-center text-sm font-medium opacity-90 mb-2 text-gray-200">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="w-4 h-4 mr-1"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.62.829.799 1.654 1.38 2.274 1.766a11.25 11.25 0 001.04.573c.005.002.01.004.015.006l.004.002zm-1.018-8.604a2.25 2.25 0 113.182-1.272 2.25 2.25 0 01-3.182 1.272z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {user.display_address}
                            </div>
                        )}

                        {/* Bio */}
                        <p className="text-sm opacity-85 mb-4 line-clamp-2 leading-relaxed">
                            {user.bio || "Người dùng này bí ẩn chưa viết gì..."}
                        </p>

                        {/* Danh sách Sở thích (Hobbies) */}
                        {user.hobbies && user.hobbies.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                {user.hobbies.slice(0, 4).map((hobby, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs font-semibold px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/40 shadow-sm hover:bg-white/30 transition-colors cursor-default"
                                    >
                                        {hobby.icon} {hobby.name}
                                    </span>
                                ))}
                                {user.hobbies.length > 4 && (
                                    <span className="text-xs font-semibold px-2 py-1 bg-white/10 rounded-full">
                                        +{user.hobbies.length - 4}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}