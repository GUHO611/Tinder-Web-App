"use client";

import { getPotentialMatches, likeUser } from "@/lib/actions/matches";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
// Import Component UI đã tách
import MatchCard from "@/components/MatchCard";
import MatchButtons from "@/components/MatchButtons";

import { UserProfile } from "@/lib/actions/profile";
import { useRouter } from "next/navigation";
import MatchNotification from "@/components/MatchNotification";

// --- MUI Imports ---
import {
  Box,
  Typography,
  Skeleton,
  useTheme,
  useMediaQuery,
  Button,
  Card,
  Stack,
} from "@mui/material";

// --- GSAP Imports ---
import gsap from "gsap";
import { Draggable } from "gsap/dist/Draggable";
import Leaderboard from "@/components/Leaderboard";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable);
}

export default function MatchesPage() {
  const [potentialMatches, setPotentialMatches] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);

  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Refs cho GSAP
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const likeOverlayRef = useRef<HTMLDivElement>(null);
  const nopeOverlayRef = useRef<HTMLDivElement>(null);

  // --- Logic gốc (Load Users) ---
  useEffect(() => {
    async function loadUsers() {
      try {
        const potentialMatchesData = await getPotentialMatches();
        setPotentialMatches(potentialMatchesData);
      } catch (error) {
        console.error("Error loading matches:", error);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  // --- GSAP Draggable Setup (Logic giữ nguyên) ---
  useLayoutEffect(() => {
    if (loading || currentIndex >= potentialMatches.length || !cardRef.current)
      return;

    const card = cardRef.current;
    const likeOverlay = likeOverlayRef.current;
    const nopeOverlay = nopeOverlayRef.current;

    // Animation xuất hiện
    gsap.fromTo(
      card,
      { scale: 0.95, y: 20, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.2)" }
    );

    // Tạo Draggable
    const draggable = Draggable.create(card, {
      type: "x,y",
      edgeResistance: 0.65,
      bounds: containerRef.current,
      inertia: true,
      onDrag: function () {
        const x = this.x;
        const rotation = x * 0.05;
        gsap.set(card, { rotation: rotation });

        if (x > 0) {
          const opacity = Math.min(x / 100, 1);
          gsap.set(likeOverlay, { opacity: opacity });
          gsap.set(nopeOverlay, { opacity: 0 });
        } else {
          const opacity = Math.min(Math.abs(x) / 100, 1);
          gsap.set(nopeOverlay, { opacity: opacity });
          gsap.set(likeOverlay, { opacity: 0 });
        }
      },
      onDragEnd: function () {
        const x = this.x;
        const threshold = 100;
        if (x > threshold) {
          animateSwipe("right");
        } else if (x < -threshold) {
          animateSwipe("left");
        } else {
          gsap.to(card, {
            x: 0,
            y: 0,
            rotation: 0,
            duration: 0.3,
            ease: "elastic.out(1, 0.5)",
          });
          gsap.to([likeOverlay, nopeOverlay], { opacity: 0, duration: 0.2 });
        }
      },
    })[0];

    return () => {
      if (draggable) draggable.kill();
    };
  }, [loading, currentIndex, potentialMatches.length]);

  // --- Animation Helper ---
  const animateSwipe = (direction: "left" | "right") => {
    if (!cardRef.current) return;
    const xDest =
      direction === "right" ? window.innerWidth : -window.innerWidth;
    const rotateDest = direction === "right" ? 30 : -30;

    gsap.to(cardRef.current, {
      x: xDest,
      y: 50,
      rotation: rotateDest,
      opacity: 0,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => {
        if (direction === "right") handleLike();
        else handlePass();

        // Reset vị trí ngay lập tức
        gsap.set(cardRef.current, { x: 0, y: 0, rotation: 0, opacity: 1 });
        gsap.set([likeOverlayRef.current, nopeOverlayRef.current], {
          opacity: 0,
        });
      },
    });
  };

  // --- Logic Handlers (Giữ nguyên) ---
  async function handleLike() {
    if (currentIndex < potentialMatches.length) {
      const likedUser = potentialMatches[currentIndex];
      try {
        const result = await likeUser(likedUser.id);
        if (result.isMatch && result.matchedUser) {
          setMatchedUser(result.matchedUser as UserProfile);
          setShowMatchNotification(true);
        }
        setCurrentIndex((prev) => prev + 1);
      } catch (err) {
        console.error(err);
      }
    }
  }

  function handlePass() {
    if (currentIndex < potentialMatches.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  const onLikeClick = () => animateSwipe("right");
  const onPassClick = () => animateSwipe("left");

  function handleCloseMatchNotification() {
    setShowMatchNotification(false);
    setMatchedUser(null);
  }

  function handleStartChat() {
    if (matchedUser) {
      setShowMatchNotification(false);
      router.push(`/chat/${matchedUser.id}`);
    }
  }

  // --- UI Render ---
  const currentPotentialMatch = potentialMatches[currentIndex];

  // 1. Loading State
  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #f0f0f0 0%, #ffffff 100%)",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Skeleton
            variant="rectangular"
            width={isMobile ? "90vw" : 400}
            height={isMobile ? "60vh" : 500}
            sx={{ borderRadius: 4 }}
          />
          <Stack direction="row" spacing={3}>
            <Skeleton variant="circular" width={60} height={60} />
            <Skeleton variant="circular" width={60} height={60} />
          </Stack>
        </Stack>
      </Box>
    );
  }

  // 2. Empty State
  if (currentIndex >= potentialMatches.length) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)",
        }}
      >
        <Card
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            maxWidth: 400,
          }}
        >
          <Box sx={{ fontSize: 60, mb: 2 }}>💕</Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Hết hồ sơ để hiển thị
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Hãy quay lại sau hoặc điều chỉnh bộ lọc.
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
            sx={{
              borderRadius: 20,
              background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Làm mới danh sách
          </Button>
        </Card>
        {showMatchNotification && matchedUser && (
          <MatchNotification
            match={matchedUser}
            onClose={handleCloseMatchNotification}
            onStartChat={handleStartChat}
          />
        )}
      </Box>
    );
  }

  // 3. Main UI
  return (
    <Box
      ref={containerRef}
      sx={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "row", // Xếp hàng ngang
        justifyContent: "center", // Căn giữa toàn bộ cụm
        alignItems: "flex-start",
        pt: { lg: "calc((100vh - 650px) / 2)" },
        gap: { lg: 8, xl: 12 },
        overflow: "hidden",
        position: "relative",
        background: "linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)",
        px: 4,
      }}
    >
      {/* --- KHỐI TRÁI: SWIPING CARD --- */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        {/* Card Wrapper & Stack */}
        <Box
          sx={{
            position: "relative", width: 380, height: 550
          }}
        >
          <Box
            ref={cardRef}
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              cursor: "grab",
              touchAction: "none",
              "&:active": { cursor: "grabbing" },
            }}
          >
            <MatchCard user={currentPotentialMatch} />

            {/* Overlays (Like/Nope) */}
            <Box
              ref={likeOverlayRef}
              sx={{
                position: "absolute",
                top: 40,
                left: 40,
                border: "4px solid #4CAF50",
                borderRadius: 2,
                padding: "4px 12px",
                transform: "rotate(-15deg)",
                opacity: 0,
                pointerEvents: "none",
                zIndex: 20,
              }}
            >
              <Typography variant="h4" fontWeight={900} color="#4CAF50">
                LIKE
              </Typography>
            </Box>

            <Box
              ref={nopeOverlayRef}
              sx={{
                position: "absolute",
                top: 40,
                right: 40,
                border: "4px solid #F44336",
                borderRadius: 2,
                padding: "4px 12px",
                transform: "rotate(15deg)",
                opacity: 0,
                pointerEvents: "none",
                zIndex: 20,
              }}
            >
              <Typography variant="h4" fontWeight={900} color="#F44336">
                NOPE
              </Typography>
            </Box>
          </Box>

          {/* Card ảo phía sau (Stack Effect) */}
          {currentIndex + 1 < potentialMatches.length && (
            <Box
              sx={{
                position: "absolute",
                width: "100%",
                height: "100%",
                borderRadius: "24px",
                zIndex: -1,
                transform: "scale(0.95) translateY(10px)",
                opacity: 0.8,
                bgcolor: "grey.300",
                pointerEvents: "none",
              }}
            />
          )}
        </Box>

        {/* Footer Controls */}
        <Box sx={{ mt: 5 }}>
          <MatchButtons
            onLike={onLikeClick}
            onPass={onPassClick}
            disabled={loading}
          />
        </Box>
      </Box>

      {/* --- KHỐI PHẢI: LEADERBOARD (Chỉ hiện trên màn hình lớn) --- */}
      <Box
        sx={{
          display: { xs: "none", lg: "block" },
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            width: 500, // Điều chỉnh lại chiều rộng cho cân đối
            height: 550, // Cao hơn card một chút để nhìn thanh thoát
            bgcolor: "rgba(255, 255, 255, 0.4)",
            backdropFilter: "blur(20px)",
            borderRadius: "28px",
            border: "1px solid rgba(255, 255, 255, 0.6)",
            boxShadow: "0 15px 35px rgba(0,0,0,0.05)",
            display: "flex",
            flexDirection: "column" ,
            overflow: "hidden", // Để Leaderboard không tràn ra ngoài border-radius
            p: 1,
          }}
        >
          <Leaderboard />
        </Box>
      </Box>

      {/* Match Popup */}
      {showMatchNotification && matchedUser && (
        <MatchNotification
          match={matchedUser}
          onClose={handleCloseMatchNotification}
          onStartChat={handleStartChat}
        />
      )}
    </Box>
  );
}
