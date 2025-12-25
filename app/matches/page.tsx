"use client";

import { getPotentialMatches, likeUser } from "@/lib/actions/matches";
// Thêm updateUserProfile và getCurrentUserProfile để lấy/lưu cài đặt
import {
  UserProfile,
  updateUserPreferences,
  getCurrentUserProfile,
} from "@/lib/actions/profile";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import MatchCard from "@/components/MatchCard";
import MatchButtons from "@/components/MatchButtons";
import { useRouter } from "next/navigation";
import MatchNotification from "@/components/MatchNotification";

import {
  Box,
  Typography,
  Skeleton,
  useTheme,
  useMediaQuery,
  Button,
  Card,
  // Thêm các component UI cho Modal cài đặt
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
  OutlinedInput,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select"; // Type cho Select

import gsap from "gsap";
import { Draggable } from "gsap/dist/Draggable";
import Leaderboard from "@/components/Leaderboard";

if (typeof window !== "undefined") {
  gsap.registerPlugin(Draggable);
}

// Định nghĩa kiểu dữ liệu cho Preferences
interface Preferences {
  distance: number;
  age_range: { min: number; max: number };
  gender_preference: string[];
}

export default function MatchesPage() {
  const [potentialMatches, setPotentialMatches] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [showMatchNotification, setShowMatchNotification] = useState(false);
  const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);

  // --- STATE CHO SETTINGS DIALOG ---
  const [showSettings, setShowSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>({
    distance: 50,
    age_range: { min: 18, max: 50 },
    gender_preference: [],
  });

  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Refs
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const likeOverlayRef = useRef<HTMLDivElement>(null);
  const nopeOverlayRef = useRef<HTMLDivElement>(null);

  const [swipeDirection, setSwipeDirection] = useState<string | null>(null);
  const NAVBAR_HEIGHT = 70;

  // --- Logic Load Data ---
  async function loadUsers() {
    setLoading(true); // Set loading lại để UI hiển thị Skeleton
    try {
      const potentialMatchesData = await getPotentialMatches();
      setPotentialMatches(potentialMatchesData);
      setCurrentIndex(0); // Reset index về 0 khi có list mới
    } catch (error) {
      console.error("Error loading matches:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // --- XỬ LÝ SETTINGS ---

  // 1. Mở Modal & Lấy setting hiện tại của User
  const handleOpenSettings = async () => {
    setShowSettings(true);
    try {
      const profile = await getCurrentUserProfile();
      if (profile && profile.preferences) {
        // Map dữ liệu từ DB vào State
        const prefs = profile.preferences as unknown as Preferences;
        setPreferences({
          distance: prefs.distance || 50,
          age_range: prefs.age_range || { min: 18, max: 50 },
          gender_preference: prefs.gender_preference || [],
        });
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  // 2. Lưu Setting & Reload lại list Match
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      // Gọi Server Action cập nhật profile
      await updateUserPreferences(preferences as unknown as Record<string, unknown>);

      setShowSettings(false);
      // Gọi lại hàm loadUsers để lấy danh sách mới theo filter mới
      await loadUsers();
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSavingSettings(false);
    }
  };

  // 3. Các hàm change handler cho UI Inputs
  const handleDistanceChange = (event: Event, newValue: number | number[]) => {
    setPreferences((prev) => ({ ...prev, distance: newValue as number }));
  };

  const handleAgeChange = (event: Event, newValue: number | number[]) => {
    const [min, max] = newValue as number[];
    setPreferences((prev) => ({ ...prev, age_range: { min, max } }));
  };

  const handleGenderChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    setPreferences((prev) => ({
      ...prev,
      gender_preference: typeof value === "string" ? value.split(",") : value,
    }));
  };

  // --- GSAP Draggable (GIỮ NGUYÊN) ---
  useLayoutEffect(() => {
    if (loading || currentIndex >= potentialMatches.length || !cardRef.current)
      return;

    const card = cardRef.current;
    const likeOverlay = likeOverlayRef.current;
    const nopeOverlay = nopeOverlayRef.current;

    gsap.set(card, { x: 0, y: 0, rotation: 0, opacity: 1, scale: 1 });

    gsap.from(card, {
      scale: 0.95,
      y: 20,
      opacity: 0,
      duration: 0.4,
      ease: "back.out(1.2)",
    });

    const draggable = Draggable.create(card, {
      type: "x,y",
      edgeResistance: 0.65,
      inertia: true,
      onDrag: function () {
        const x = this.x;
        const rotation = x * 0.05;
        gsap.set(card, { rotation: rotation });

        if (x > 30) setSwipeDirection("right");
        else if (x < -30) setSwipeDirection("left");
        else setSwipeDirection(null);

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
          setSwipeDirection(null);
        }
      },
    })[0];

    return () => {
      if (draggable) draggable.kill();
    };
  }, [loading, currentIndex, potentialMatches.length]);

  const animateSwipe = (direction: "left" | "right") => {
    if (!cardRef.current) return;

    setSwipeDirection(direction);

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

        gsap.set([likeOverlayRef.current, nopeOverlayRef.current], {
          opacity: 0,
        });
        setSwipeDirection(null);
      },
    });
  };

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

  const currentPotentialMatch = potentialMatches[currentIndex];

  if (loading) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f0f0f0",
        }}
      >
        <Skeleton
          variant="rectangular"
          width={isMobile ? "90vw" : 400}
          height={isMobile ? "60vh" : 500}
          sx={{ borderRadius: 4 }}
        />
      </Box>
    );
  }

  // --- UI KHI HẾT HỒ SƠ ---
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
            width: "90%",
          }}
        >
          <Box sx={{ fontSize: 60, mb: 2 }}>🤔</Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Hết hồ sơ phù hợp
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Hãy thử mở rộng tiêu chí tìm kiếm của bạn để thấy nhiều người hơn.
          </Typography>

          <Stack spacing={2}>
            {/* Nút Mở Cài Đặt */}
            <Button
              variant="contained"
              onClick={handleOpenSettings}
              sx={{
                borderRadius: 20,
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                fontWeight: "bold",
                py: 1.5,
              }}
            >
              Cài đặt tìm kiếm
            </Button>

            {/* Nút Làm mới (Giữ lại để user thích thì bấm) */}
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              sx={{
                borderRadius: 20,
                borderColor: "#FF8E53",
                color: "#FF8E53",
                fontWeight: "bold",
              }}
            >
              Làm mới trang
            </Button>
          </Stack>
        </Card>

        {/* --- DIALOG CÀI ĐẶT --- */}
        <Dialog
          open={showSettings}
          onClose={() => setShowSettings(false)}
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle sx={{ fontWeight: "bold", textAlign: "center" }}>
            Bộ lọc tìm kiếm
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={4} sx={{ mt: 1 }}>
              {/* 1. Khoảng cách */}
              <Box>
                <Typography gutterBottom fontWeight={600}>
                  Khoảng cách tối đa: {preferences.distance}km
                </Typography>
                <Slider
                  value={preferences.distance}
                  onChange={handleDistanceChange}
                  valueLabelDisplay="auto"
                  min={5}
                  max={200} // Ví dụ max 200km
                  sx={{ color: "#E94086" }}
                />
              </Box>

              {/* 2. Độ tuổi */}
              <Box>
                <Typography gutterBottom fontWeight={600}>
                  Độ tuổi: {preferences.age_range.min} -{" "}
                  {preferences.age_range.max}
                </Typography>
                <Slider
                  value={[preferences.age_range.min, preferences.age_range.max]}
                  onChange={handleAgeChange}
                  valueLabelDisplay="auto"
                  min={18}
                  max={60}
                  disableSwap
                  sx={{ color: "#E94086" }}
                />
              </Box>

              {/* 3. Giới tính */}
              <FormControl fullWidth>
                <InputLabel>Hiển thị</InputLabel>
                <Select
                  multiple
                  value={preferences.gender_preference}
                  onChange={handleGenderChange}
                  input={<OutlinedInput label="Hiển thị" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip
                          key={value}
                          label={
                            value === "male"
                              ? "Nam"
                              : value === "female"
                                ? "Nữ"
                                : "Khác"
                          }
                        />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value="male">Nam</MenuItem>
                  <MenuItem value="female">Nữ</MenuItem>
                  <MenuItem value="other">Khác</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2, justifyContent: "center" }}>
            <Button onClick={() => setShowSettings(false)} color="inherit">
              Hủy
            </Button>
            <Button
              onClick={handleSaveSettings}
              variant="contained"
              disabled={savingSettings}
              sx={{
                bgcolor: "#E94086",
                "&:hover": { bgcolor: "#D63376" },
                px: 4,
                borderRadius: 10,
              }}
            >
              {savingSettings ? "Đang lưu..." : "Áp dụng"}
            </Button>
          </DialogActions>
        </Dialog>

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

  return (
    // ... (Giữ nguyên phần return chính của MatchesPage)
    <Box
      ref={containerRef}
      sx={{
        position: { xs: "relative", lg: "fixed" },
        top: { lg: `${NAVBAR_HEIGHT}px` },
        left: 0,
        right: 0,
        width: "100%",
        height: {
          xs: "auto",
          lg: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
        },
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        overflowX: "hidden",
        overflowY: { xs: "auto", lg: "hidden" },
        background: "linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)",
      }}
    >
      {/* ... Phần hiển thị MatchCard và Leaderboard giữ nguyên ... */}
      <Box
        sx={{
          flex: { xs: "none", lg: 1 },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          order: { xs: 1, lg: 2 },
          height: { xs: "auto", lg: "100%" },
          py: { xs: 4, lg: 0 },
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: { xs: "90vw", sm: 380, md: 400 },
            height: { xs: "550px", sm: "600px", lg: "85vh" },
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ position: "relative", flexGrow: 1, zIndex: 20 }}>
            {currentIndex + 1 < potentialMatches.length && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "24px",
                  zIndex: 10,
                  transform: "scale(0.95) translateY(10px)",
                  opacity: 1,
                  overflow: "hidden",
                  pointerEvents: "none",
                }}
              >
                <MatchCard user={potentialMatches[currentIndex + 1]} />
              </Box>
            )}

            <Box
              ref={cardRef}
              sx={{
                position: "absolute",
                inset: 0,
                cursor: "grab",
                touchAction: "none",
                zIndex: 30,
                "&:active": { cursor: "grabbing" },
              }}
            >
              <MatchCard user={currentPotentialMatch} />
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
                  zIndex: 40,
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
                  zIndex: 40,
                }}
              >
                <Typography variant="h4" fontWeight={900} color="#F44336">
                  NOPE
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              height: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
              flexShrink: 0,
            }}
          >
            <MatchButtons
              onLike={onLikeClick}
              onPass={onPassClick}
              disabled={loading}
              swipeDir={swipeDirection}
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          width: { xs: "100%", lg: 550, xl: 600 },
          height: { lg: `calc(100vh - ${NAVBAR_HEIGHT}px)` },
          flexShrink: 0,
          order: { xs: 2, lg: 1 },
          bgcolor: { lg: "rgba(255, 255, 255, 0.65)" },
          backdropFilter: { lg: "blur(20px)" },
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", // Giữ nguyên hidden ở đây
        }}
      >
        <Box
          sx={{
            p: { xs: 2, lg: 4 },
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            // --- SỬA ĐOẠN NÀY ---
            overflow: "hidden", // Đổi từ "scroll" thành "hidden"
            height: "100%", // Đảm bảo chiếm hết chiều cao để Leaderboard bên trong làm việc
            // --------------------
          }}
        >
          <Leaderboard />
        </Box>
      </Box>

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
