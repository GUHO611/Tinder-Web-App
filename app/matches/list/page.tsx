"use client";

import { UserProfile } from "@/lib/actions/profile";
import { getUserMatches } from "@/lib/actions/matches";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { calculateAge } from "@/lib/helpers/calculate-age";
import { useMessage } from "@/contexts/message-context";
import { useRouter } from "next/navigation";

// GSAP
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// MUI Icons
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
//import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import MessageIcon from '@mui/icons-material/Message';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import VolunteerActivismRoundedIcon from '@mui/icons-material/VolunteerActivismRounded';

export default function MatchesListPage() {
  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const { unreadByChannel } = useMessage();
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const heartsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadMatches() {
      try {
        const userMatches = await getUserMatches();
        setMatches(userMatches);
      } catch (error) {
        console.error(error);
        setError("Không thể tải danh sách ghép đôi.");
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, []);

  // --- GSAP ANIMATIONS ---
  useGSAP(() => {
    if (!loading && matches.length > 0) {
      // 1. SỬA LỖI ẨN: Dùng .from() thay vì .to()
      // GSAP sẽ lo việc ẩn (opacity: 0) lúc bắt đầu, và tự động hiện (opacity: 1) khi kết thúc.
      // Không cần class opacity-0 ở HTML nữa.
      gsap.from(".match-card", {
        y: 60,          // Trượt từ dưới lên 60px
        // opacity: 0,     // Bắt đầu từ trong suốt
        scale: 0.9,     // Hơi nhỏ lại xíu lúc đầu
        duration: 0.8,
        stagger: 0.1,   // Hiệu ứng xuất hiện lần lượt
        ease: "power3.out",
        clearProps: "transform" // Chỉ xóa transform để không ảnh hưởng hover, GIỮ NGUYÊN OPACITY
      });
    }

    // Hiệu ứng nền: Trái tim bay (MÀU HỒNG)
    if (heartsRef.current) {
      const hearts = gsap.utils.toArray<HTMLElement>('.floating-heart');
      hearts.forEach((heart) => {
        gsap.to(heart, {
          y: -1000,
          x: "random(-50, 50)",
          rotation: "random(-90, 90)",
          duration: "random(10, 20)",
          repeat: -1,
          ease: "none",
          delay: "random(0, 5)"
        });
      });
    }
  }, { dependencies: [loading, matches], scope: containerRef });

  const handleAvatarClick = (e: React.MouseEvent, userId: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/profile/${userId}`);
  };

  function formatTime(timestamp: string) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    const MINUTE = 60;
    const HOUR = 60 * MINUTE;
    const DAY = 24 * HOUR;
    const WEEK = 7 * DAY;
    const MONTH = 30 * DAY;
    const YEAR = 365 * DAY;

    if (diffInSeconds < 30) return "Vừa xong";
    else if (diffInSeconds < MINUTE) return `${diffInSeconds} giây trước`;
    else if (diffInSeconds < HOUR) return `${Math.floor(diffInSeconds / MINUTE)} phút trước`;
    else if (diffInSeconds < DAY) return `${Math.floor(diffInSeconds / HOUR)} giờ trước`;
    else if (diffInSeconds < WEEK) return `${Math.floor(diffInSeconds / DAY)} ngày trước`;
    else if (diffInSeconds < MONTH) return `${Math.floor(diffInSeconds / WEEK)} tuần trước`;
    else if (diffInSeconds < YEAR) return `${Math.floor(diffInSeconds / MONTH)} tháng trước`;
    else return `${Math.floor(diffInSeconds / YEAR)} năm trước`;
  }

  // Loading State
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)" }}
      >
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            {/* Spinner MÀU HỒNG */}
            <FavoriteRoundedIcon className="text-pink-400 animate-ping absolute inset-0 w-full h-full" />
            <FavoriteRoundedIcon className="text-white relative w-full h-full animate-bounce" />
          </div>
          <p className="mt-4 text-pink-600 font-bold animate-pulse">
            Đang tìm kiếm nhịp đập...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen pb-24 relative overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)" }}
    >
      {/* Background Hearts - MÀU HỒNG NHẠT */}
      <div ref={heartsRef} className="fixed inset-0 pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="floating-heart absolute text-pink-500/30" // Đổi sang màu hồng
            style={{
              left: `${Math.random() * 100}%`,
              bottom: '-60px',
              fontSize: `${Math.random() * 40 + 10}px`
            }}
          >
            <FavoriteRoundedIcon fontSize="inherit" />
          </div>
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <header className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2 drop-shadow-sm">
            Kết nối <span className="text-pink-500 drop-shadow-md">Trái Tim</span>
          </h1>
          <p className="text-slate-400 font-semibold">
            Bạn đang có <span className="text-pink-600 font-bold">{matches.length}</span> mối duyên lành
          </p>
        </header>

        {matches.length === 0 ? (
          <div className="text-center max-w-md mx-auto p-10 bg-white/60 backdrop-blur-md rounded-[2rem] shadow-xl border border-white/50">
            <div className="w-24 h-24 bg-gradient-to-tr from-pink-400 to-rose-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg ring-4 ring-white/60">
              <VolunteerActivismRoundedIcon className="text-white text-5xl" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Chưa có ghép đôi nào
            </h2>
            <p className="text-slate-600 mb-8 font-medium">
              Tình yêu đang chờ ở phía trước. Hãy bắt đầu quẹt phải để tìm {'"nửa kia"'} của bạn!
            </p>
            <Link
              href="/matches"
              className="inline-flex items-center bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3.5 px-8 rounded-full hover:from-pink-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-pink-300/50 hover:-translate-y-1 active:scale-95"
            >
              <FavoriteRoundedIcon className="mr-2 text-sm" />
              Bắt đầu khám phá
            </Link>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="grid gap-4 match-list pb-4">
              {matches.map((match) => (
                <Link
                  key={match.id}
                  href={`/chat/${match.id}`}
                  // SỬA LỖI 2: XÓA class "opacity-0" ở đây đi
                  // GSAP .from() sẽ tự động set opacity: 0 khi bắt đầu chạy
                  className="match-card group block bg-white/60 dark:bg-gray-800/80 backdrop-blur-md rounded-[2rem] p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-white/50 hover:border-pink-300 relative overflow-hidden"
                >
                  {/* Hover Overlay - Màu Hồng */}
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                  <div className="flex items-center space-x-4 relative z-10">
                    <div className="relative flex-shrink-0">
                      {/* Avatar */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-[3px] border-white shadow-md group-hover:border-pink-300 transition-colors duration-300">
                        <img
                          src={match.avatar_url || "/default-avatar.png"}
                          alt={match.full_name || "User"}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      {/* Online Status */}
                      {match.is_online ? (
                        <div className="absolute bottom-1 right-1 flex items-center justify-center z-20">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75 animate-ping"></span>
                          <div className="relative w-4 h-4 bg-green-500 rounded-full border-[2.5px] border-white shadow-sm"></div>
                        </div>
                      ) : (
                        match.last_active && (
                          <div className="absolute bottom-1 right-1 flex items-center justify-center z-20">
                            <div className="relative w-4 h-4 bg-gray-400 rounded-full border-[2.5px] border-white shadow-sm"></div>
                          </div>
                        )
                      )}

                      {/* Unread Badge - Màu Hồng */}
                      {unreadByChannel[match.id] > 0 && (
                        <div className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-md animate-bounce ring-2 ring-white">
                          {unreadByChannel[match.id] > 99 ? '99+' : unreadByChannel[match.id]}
                        </div>
                      )}
                    </div>

                    {/* Info Section */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3
                          className="text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-pink-600 transition-colors z-10 relative"
                          onClick={(e) => handleAvatarClick(e, match.id)}
                        >
                          {match.full_name},{" "}
                          {match.birthdate
                            ? calculateAge(match.birthdate)
                            : "??"}{" "}
                          tuổi
                        </h3>

                        {!match.is_online && match.last_active && (
                          <span className="text-[12px] text-slate-500 font-semibold bg-white/60 px-2 py-0.5 rounded-full">
                            {formatTime(match.last_active)}
                          </span>
                        )}
                      </div>

                      {match.display_address && (
                        <div className="flex items-center text-xs text-slate-600 dark:text-gray-300 mb-2 font-medium">
                          <PlaceRoundedIcon sx={{ fontSize: 14 }} className="mr-1 text-pink-400" />
                          {match.display_address}
                        </div>
                      )}

                      <p className="text-sm text-slate-600 dark:text-gray-300 line-clamp-1 mb-2 italic font-medium">
                        {match.bio || "Chưa có giới thiệu..."}
                      </p>

                      {match.hobbies && match.hobbies.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {match.hobbies.slice(0, 3).map((hobby, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 bg-white/70 text-pink-600 font-semibold rounded-full border border-pink-100 shadow-sm"
                            >
                              {hobby.icon} {hobby.name}
                            </span>
                          ))}
                          {match.hobbies.length > 3 && (
                            <span className="text-[10px] px-1.5 py-0.5 text-slate-400 font-medium">
                              +{match.hobbies.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Chat Icon - Màu hồng khi hover */}
                    <div className="flex-shrink-0 text-slate-300 group-hover:text-pink-500 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12">
                      <MessageIcon sx={{ fontSize: 28 }} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}