"use client";

import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";

// MUI Components & Icons
import { Button, CircularProgress, Container, Typography, Box } from "@mui/material";
import ExploreIcon from "@mui/icons-material/Explore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonIcon from "@mui/icons-material/Person";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VideocamIcon from '@mui/icons-material/Videocam'; // Thay icon livestream bằng icon video/cam nhẹ nhàng hơn

export default function Home() {
  const { user, loading } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-content > *", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
      });
    }, containerRef);
    return () => ctx.revert();
  }, [loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <CircularProgress sx={{ color: '#ec4899' }} size={40} />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#ffffff] dark:bg-[#070b14] overflow-hidden relative"
      style={{ fontFamily: '"Be Vietnam Pro", sans-serif' }}
    >
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-rose-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full" />
      </div>

      <Container maxWidth="lg" className="relative z-10 px-4 py-32 text-center">
        <Box className="hero-content max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Badge mới: Ngắn gọn, không dùng từ livestream */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-12 shadow-sm">
            <VideocamIcon className="text-rose-500" sx={{ fontSize: 16 }} />
            <Typography className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-600 dark:text-slate-300">
              Vượt xa những cú quẹt • Chạm thực tế
            </Typography>
          </div>

          {/* Header: Đã giảm size (từ 8xl xuống 6xl) và tinh chỉnh khoảng cách */}
          <Typography
            variant="h1"
            className="text-4xl md:text-5xl lg:text-6xl font-[900] text-slate-900 dark:text-white mb-10 tracking-tight"
            style={{ lineHeight: 1.2 }}
          >
            Đập tan rào cản <br />
            <span className="bg-gradient-to-r from-rose-500 to-indigo-600 bg-clip-text text-transparent">
              Kết nối trực tiếp
            </span>
          </Typography>

          <Typography
            variant="h5"
            className="text-slate-500 dark:text-slate-400 mb-16 max-w-xl mx-auto text-base md:text-lg font-medium leading-relaxed"
          >
            Tạm biệt những tấm ảnh tĩnh vô hồn. <br />
            Nơi bạn gặp gỡ và trò chuyện qua những khoảnh khắc chân thực nhất của đối phương.
          </Typography>

          {/* Buttons Area: Giữ nguyên 2 nút của bạn nhưng tăng Margin Top (mt-10) */}
          <Box className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full mt-10">
            {user ? (
              <>
                <Link href="/matches" passHref className="w-full sm:w-auto">
                  <Button
                    variant="contained" size="large" fullWidth endIcon={<FavoriteIcon />}
                    sx={{
                      background: "linear-gradient(45deg, #ec4899 30%, #9333ea 90%)",
                      borderRadius: "50px",
                      padding: "16px 40px",
                      fontSize: "1rem",
                      fontWeight: "bold",
                      textTransform: "none",
                      boxShadow: "0 10px 20px -10px rgba(236, 72, 153, 0.5)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #db2777 30%, #7e22ce 90%)",
                        transform: "translateY(-3px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Bắt Đầu Khám Phá
                  </Button>
                </Link>

                <Link href="/profile" passHref className="w-full sm:w-auto">
                  <Button
                    variant="outlined" size="large" fullWidth startIcon={<PersonIcon />}
                    sx={{
                      borderRadius: "50px",
                      padding: "16px 40px",
                      fontSize: "1rem",
                      fontWeight: "bold",
                      textTransform: "none",
                      borderColor: "#ec4899",
                      color: "#ec4899",
                      borderWidth: "2px",
                      "&:hover": {
                        borderColor: "#db2777",
                        backgroundColor: "rgba(236, 72, 153, 0.05)",
                        borderWidth: "2px",
                        transform: "translateY(-3px)",
                      },
                      transition: "all 0.3s ease",
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
                    variant="contained" size="large" fullWidth startIcon={<PlayArrowIcon />}
                    sx={{
                      background: "linear-gradient(45deg, #ec4899 30%, #9333ea 90%)",
                      borderRadius: "50px",
                      padding: "16px 40px",
                      fontSize: "1rem",
                      fontWeight: "bold",
                      textTransform: "none",
                      boxShadow: "0 10px 20px -10px rgba(236, 72, 153, 0.5)",
                      "&:hover": {
                        background: "linear-gradient(45deg, #db2777 30%, #7e22ce 90%)",
                        transform: "translateY(-3px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Bắt Đầu Ngay
                  </Button>
                </Link>

                <Link href="#tinh-nang" passHref className="w-full sm:w-auto">
                  <Button
                    variant="outlined" size="large" fullWidth startIcon={<ExploreIcon />}
                    sx={{
                      borderRadius: "50px",
                      padding: "16px 40px",
                      fontSize: "1rem",
                      fontWeight: "bold",
                      textTransform: "none",
                      borderColor: "#ec4899",
                      color: "#ec4899",
                      borderWidth: "2px",
                      "&:hover": {
                        borderColor: "#db2777",
                        backgroundColor: "rgba(236, 72, 153, 0.05)",
                        borderWidth: "2px",
                        transform: "translateY(-3px)",
                      },
                      transition: "all 0.3s ease",
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

      {/* Feature Section */}
      <Box className="py-24">
        <Container id="tinh-nang" maxWidth="lg">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              emoji="✨" 
              title="Hiện diện thực" 
              desc="Không còn lo ngại về hồ sơ giả mạo. Mọi cuộc gặp gỡ đều diễn ra qua video trực tiếp." 
            />
            <FeatureCard 
              emoji="🎯" 
              title="Đúng tần số" 
              desc="Hệ thống ghép đôi thông minh đưa bạn đến với những người có cùng phong cách sống." 
            />
            <FeatureCard 
              emoji="🔒" 
              title="An toàn tuyệt đối" 
              desc="Công nghệ bảo mật giúp trải nghiệm kết nối của bạn luôn riêng tư và lành mạnh." 
            />
          </div>
        </Container>
      </Box>
    </div>
  );
}

function FeatureCard({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="p-8 bg-slate-50/50 dark:bg-slate-900/30 rounded-[24px] border border-slate-100 dark:border-white/5 hover:border-rose-500/20 transition-all duration-300">
      <div className="text-3xl mb-5">{emoji}</div>
      <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}