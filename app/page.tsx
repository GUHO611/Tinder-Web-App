"use client";

import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

// MUI Components & Icons
import { Button, CircularProgress, Container, Typography, Box } from "@mui/material";
import ExploreIcon from "@mui/icons-material/Explore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LoginIcon from "@mui/icons-material/Login"; // Giữ lại nếu cần dùng sau này
import PersonIcon from "@mui/icons-material/Person";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

export default function Home() {
  const { user, loading } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const heartsRef = useRef<HTMLDivElement>(null);

  // GSAP Animations
  // Thay thế đoạn useEffect cũ bằng đoạn này
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      // 1. Text Animation (Giữ nguyên hoặc chỉnh nhanh hơn)
      gsap.from(".hero-text", {
        y: 30, // Giảm khoảng cách trượt cho mượt
        opacity: 0,
        duration: 1,
        stagger: 0.1, // Nhanh hơn
        ease: "power3.out",
      });

      // 2. Button Animation (ĐÃ SỬA: An toàn hơn)
      // Dùng set ban đầu để đảm bảo trạng thái, sau đó dùng to
      gsap.set(".hero-btn", { opacity: 0, scale: 0.8 });

      gsap.to(".hero-btn", {
        scale: 1,
        opacity: 1,
        duration: 0.8,
        delay: 0.3, // Giảm delay từ 0.8 xuống 0.3 để nút hiện sớm hơn
        stagger: 0.1,
        ease: "elastic.out(1, 0.6)",
        clearProps: "opacity,scale" // Quan trọng: Xóa style sau khi xong để tránh lỗi CSS về sau
      });

      // 3. Hearts (Giữ nguyên logic cũ)
      const hearts = gsap.utils.toArray(".heart-bg") as HTMLElement[];
      hearts.forEach((heart) => {
        gsap.set(heart, {
          left: Math.random() * 100 + "%",
          fontSize: Math.random() * 30 + 20 + "px",
        });
        gsap.to(heart, {
          y: "random(-100, -200)",
          x: "random(-50, 50)",
          rotation: "random(-45, 45)",
          opacity: 0,
          duration: "random(3, 6)",
          repeat: -1,
          ease: "none",
          delay: "random(0, 2)",
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading]); // Lưu ý: Nếu user thay đổi mà không loading lại, animation có thể không chạy lại đúng nút.

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <CircularProgress color="secondary" size={60} thickness={4} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 items-center justify-center overflow-hidden relative"
    >
      {/* Background Hearts */}
      <div ref={heartsRef} className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="heart-bg absolute text-pink-200 dark:text-pink-900/20"
            style={{
              bottom: "-50px",
            }}
          >
            ❤️
          </div>
        ))}
      </div>

      {/* Hero Section */}
      <Container maxWidth="lg" className="relative z-10 px-4 md:px-6 py-20 text-center">
        <Box className="max-w-5xl mx-auto">
          {/* Headline */}
          <Typography
            variant="h1"
            component="h1"
            // Thay đổi ở đây: Giảm size mobile (text-4xl), thêm md:text-6xl cho mượt hơn
            className="hero-text text-4xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 dark:text-white mb-6"
            sx={{
              fontWeight: 800,
              lineHeight: 1.15,
              // Quan trọng: CSS hiện đại giúp cân bằng chữ tự động
              textWrap: "balance"
            }}
          >
            Tìm Kiếm Mảnh Ghép
            <span className="block mt-2 bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
              {/* Quan trọng: Dùng &nbsp; để chữ "Hoàn" và "Hảo" dính liền */}
              StreamMatch Hoàn&nbsp;Hảo
            </span>
          </Typography>

          {/* Subtitle */}
          <Typography
            variant="h5"
            className="hero-text text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto text-base md:text-xl"
            sx={{
              fontWeight: 400,
              // Giúp đoạn văn ngắn không bị ngắt dòng vô duyên (orphan words)
              textWrap: "pretty"
            }}
          >
            Kết nối với những người cùng tần số qua sở thích, những cuộc trò chuyện ý nghĩa và xây dựng những mối quan hệ chân thực.
          </Typography>

          {/* Buttons Area */}

          <Box className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full mt-5">
            {user ? (
              <>
                <Link href="/matches" passHref className="w-full sm:w-auto">
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth // Để full width trên mobile cho dễ bấm
                    endIcon={<FavoriteIcon />}
                    className="hero-btn"
                    sx={{
                      background: "linear-gradient(45deg, #ec4899 30%, #9333ea 90%)",
                      borderRadius: "50px",
                      padding: "14px 32px",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      textTransform: "none",
                      boxShadow: "0 10px 20px -10px rgba(236, 72, 153, 0.5)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #db2777 30%, #7e22ce 90%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 15px 25px -10px rgba(236, 72, 153, 0.6)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Bắt Đầu Khám Phá
                  </Button>
                </Link>

                <Link href="/profile" passHref className="w-full sm:w-auto">
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    startIcon={<PersonIcon />}
                    className="hero-btn"
                    sx={{
                      borderRadius: "50px",
                      padding: "14px 32px",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      textTransform: "none",
                      borderColor: "#ec4899",
                      color: "#ec4899",
                      borderWidth: "2px",
                      "&:hover": {
                        borderColor: "#db2777",
                        backgroundColor: "rgba(236, 72, 153, 0.05)",
                        borderWidth: "2px",
                      },
                    }}
                  >
                    Xem Hồ Sơ
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth" passHref className="w-full sm:w-auto">
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    startIcon={<PlayArrowIcon />}
                    className="hero-btn"
                    sx={{
                      background: "linear-gradient(45deg, #ec4899 30%, #9333ea 90%)",
                      borderRadius: "50px",
                      padding: "14px 32px",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      textTransform: "none",
                      boxShadow: "0 10px 20px -10px rgba(236, 72, 153, 0.5)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #db2777 30%, #7e22ce 90%)",
                        transform: "translateY(-2px)",
                        boxShadow: "0 15px 25px -10px rgba(236, 72, 153, 0.6)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Bắt Đầu Ngay
                  </Button>
                </Link>

                <Link href="#tinh-nang" passHref className="w-full sm:w-auto">
                  <Button
                    variant="outlined"
                    size="large"
                    fullWidth
                    startIcon={<ExploreIcon />}
                    className="hero-btn"
                    sx={{
                      borderRadius: "50px",
                      padding: "14px 32px",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      textTransform: "none",
                      borderColor: "#ec4899",
                      color: "#ec4899",
                      borderWidth: "2px",
                      "&:hover": {
                        borderColor: "#db2777",
                        backgroundColor: "rgba(236, 72, 153, 0.05)",
                        borderWidth: "2px",
                      },
                    }}
                  >
                    Tìm Hiểu Thêm
                  </Button>
                </Link>
              </>
            )}
          </Box>
        </Box>
      </Container>
      <Container
        id="tinh-nang"
        maxWidth="lg"
        className="py-20 relative z-10 scroll-mt-20" // scroll-mt giúp không bị header che mất
      >
        <Typography variant="h3" className="text-center font-bold mb-10 text-gray-800 dark:text-white">
          Tại sao chọn StreamMatch?
        </Typography>

        <div className="grid md:grid-cols-3 gap-8 mt-5">
          {/* Feature 1 */}
          <div className="p-6 bg-white/50 dark:bg-slate-800/50 rounded-2xl backdrop-blur-sm border border-pink-100 dark:border-slate-700 hover:shadow-xl transition-all">
            <div className="text-4xl mb-4">🎥</div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Livestream Real-time</h3>
            <p className="text-gray-600 dark:text-gray-300">Tương tác trực tiếp, thấy rõ cảm xúc đối phương thay vì chỉ nhắn tin.</p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 bg-white/50 dark:bg-slate-800/50 rounded-2xl backdrop-blur-sm border border-pink-100 dark:border-slate-700 hover:shadow-xl transition-all">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Hồ sơ xác thực</h3>
            <p className="text-gray-600 dark:text-gray-300">Nói không với nick ảo. Cộng đồng văn minh và an toàn.</p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 bg-white/50 dark:bg-slate-800/50 rounded-2xl backdrop-blur-sm border border-pink-100 dark:border-slate-700 hover:shadow-xl transition-all">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2 dark:text-white">Ghép đôi siêu tốc</h3>
            <p className="text-gray-600 dark:text-gray-300">Thuật toán AI tìm kiếm người phù hợp với tần số của bạn.</p>
          </div>
        </div>
      </Container>
    </div>
  );
}