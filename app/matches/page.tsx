"use client";

import { getPotentialMatches, likeUser } from "@/lib/actions/matches";
import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { calculateAge } from "@/lib/helpers/calculate-age";

// QUAN TRỌNG: Import UserProfile từ file actions chuẩn
import { UserProfile } from "@/lib/actions/profile";
import { useRouter } from "next/navigation";
import MatchNotification from "@/components/MatchNotification";

// --- MUI Imports ---
import {
    Box,
    Card,
    CardContent,
    Typography,
    IconButton,
    Fab,
    Stack,
    Chip,
    Skeleton,
    useTheme,
    useMediaQuery,
    Button,
} from "@mui/material";
import {
    Close as CloseIcon,
    Favorite as FavoriteIcon,
    Star as StarIcon,
    Replay as UndoIcon,
    LocationOn as LocationOnIcon,
    ArrowBackIos as ArrowBackIcon,
    ArrowForwardIos as ArrowForwardIcon,
    Verified as VerifiedIcon,
    FiberManualRecord as OnlineIcon,
} from "@mui/icons-material";

// --- GSAP Imports ---
import gsap from "gsap";
import Draggable from "gsap/Draggable";

// Đăng ký plugin Draggable (cần chạy trong môi trường client)
if (typeof window !== "undefined") {
    gsap.registerPlugin(Draggable);
}

export default function MatchesPage() {
    const [potentialMatches, setPotentialMatches] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    const [showMatchNotification, setShowMatchNotification] = useState(false);
    const [matchedUser, setMatchedUser] = useState<UserProfile | null>(null);

    // State cho Carousel ảnh
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

    // Reset index ảnh khi chuyển sang user mới
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [currentIndex]);

    // --- GSAP Draggable Setup ---
    useLayoutEffect(() => {
        if (loading || currentIndex >= potentialMatches.length || !cardRef.current) return;

        const card = cardRef.current;
        const likeOverlay = likeOverlayRef.current;
        const nopeOverlay = nopeOverlayRef.current;

        // Animation xuất hiện (Reveal)
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
                const rotation = x * 0.05; // Xoay nhẹ khi kéo
                gsap.set(card, { rotation: rotation });

                // Hiển thị Overlay dựa trên vị trí kéo
                // Kéo sang phải -> Like (Xanh)
                if (x > 0) {
                    const opacity = Math.min(x / 100, 1);
                    gsap.set(likeOverlay, { opacity: opacity });
                    gsap.set(nopeOverlay, { opacity: 0 });
                }
                // Kéo sang trái -> Nope (Đỏ)
                else {
                    const opacity = Math.min(Math.abs(x) / 100, 1);
                    gsap.set(nopeOverlay, { opacity: opacity });
                    gsap.set(likeOverlay, { opacity: 0 });
                }
            },
            onDragEnd: function () {
                const x = this.x;
                const threshold = 100; // Ngưỡng để quyết định Swipe

                if (x > threshold) {
                    // Swipe Right (Like)
                    animateSwipe("right");
                } else if (x < -threshold) {
                    // Swipe Left (Pass)
                    animateSwipe("left");
                } else {
                    // Snap back (Quay lại vị trí cũ)
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

        const xDest = direction === "right" ? window.innerWidth : -window.innerWidth;
        const rotateDest = direction === "right" ? 30 : -30;

        gsap.to(cardRef.current, {
            x: xDest,
            y: 50,
            rotation: rotateDest,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                // Gọi logic gốc sau khi animation xong
                if (direction === "right") {
                    handleLike();
                } else {
                    handlePass();
                }
                // Reset properties cho card tiếp theo (React sẽ render lại card mới)
                gsap.set(cardRef.current, { x: 0, y: 0, rotation: 0, opacity: 1 });
                gsap.set([likeOverlayRef.current, nopeOverlayRef.current], { opacity: 0 });
            },
        });
    };

    // --- Logic Gốc được bọc lại ---
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

    // --- Handler cho Button Click (mô phỏng swipe) ---
    const onLikeClick = () => animateSwipe("right");
    const onPassClick = () => animateSwipe("left");

    // --- Handler Logic khác ---
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

    // --- UI Components ---
    const currentPotentialMatch = potentialMatches[currentIndex];

    // Logic hiển thị ảnh (giả sử UserProfile có photos[], nếu không dùng avatar làm fallback)
    // Lưu ý: Cần điều chỉnh theo interface thực tế của UserProfile
    const userImages: string[] = (Array.isArray(currentPotentialMatch?.avatar_url) && currentPotentialMatch.avatar_url.length > 0)
        ? currentPotentialMatch.avatar_url
        : [currentPotentialMatch?.avatar_url || "/default-avatar.png"];

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentImageIndex < userImages.length - 1) setCurrentImageIndex(prev => prev + 1);
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentImageIndex > 0) setCurrentImageIndex(prev => prev - 1);
    };

    // 1. Loading State (MUI Skeleton)
    if (loading) {
        return (
            <Box sx={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #f0f0f0 0%, #ffffff 100%)'
            }}>
                <Stack spacing={2} alignItems="center">
                    <Skeleton variant="rectangular" width={isMobile ? "90vw" : 400} height={isMobile ? "60vh" : 500} sx={{ borderRadius: 4 }} />
                    <Stack direction="row" spacing={3}>
                        <Skeleton variant="circular" width={60} height={60} />
                        <Skeleton variant="circular" width={60} height={60} />
                    </Stack>
                </Stack>
            </Box>
        );
    }

    // 2. Empty State (Hết hồ sơ)
    if (currentIndex >= potentialMatches.length) {
        return (
            <Box sx={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #FFDEE9 0%, #B5FFFC 100%)' // Gradient nhẹ nhàng
            }}>
                <Card sx={{
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 4,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    maxWidth: 400
                }}>
                    <Box sx={{ fontSize: 60, mb: 2 }}>💕</Box>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Hết hồ sơ để hiển thị
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Hãy quay lại sau hoặc điều chỉnh bộ lọc của bạn để tìm thêm người phù hợp.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => window.location.reload()}
                        sx={{
                            borderRadius: 20,
                            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                            textTransform: 'none',
                            fontWeight: 'bold'
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

    // 3. Main UI (Card Stack)
    return (
        <Box
            ref={containerRef}
            sx={{
                height: '100vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                position: 'relative',
                // Hiệu ứng nền mờ từ ảnh user hiện tại
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: `url(${userImages[0]})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(30px) brightness(0.9)',
                    zIndex: -1,
                    opacity: 0.4
                },
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(255,255,255,0.95))'
            }}
        >
            {/* Card Wrapper */}
            <Box sx={{
                position: 'relative',
                width: { xs: '90vw', sm: 400 },
                height: { xs: '70vh', sm: 600 },
                zIndex: 10
            }}>
                {/* The Active Card */}
                <Card
                    ref={cardRef}
                    key={currentPotentialMatch.id} // Quan trọng: Key giúp React mount lại component mới cho user mới
                    elevation={4}
                    sx={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '24px',
                        position: 'absolute',
                        overflow: 'hidden',
                        cursor: 'grab',
                        touchAction: 'none', // Cần thiết cho Draggable trên mobile
                        '&:active': { cursor: 'grabbing' }
                    }}
                >
                    {/* --- Image Carousel Section (Top 70%) --- */}
                    <Box sx={{
                        position: 'relative',
                        height: '70%',
                        width: '100%',
                        backgroundColor: '#000'
                    }}>
                        {/* Ảnh */}
                        <Box
                            component="img"
                            src={userImages[currentImageIndex]}
                            alt={currentPotentialMatch.full_name}
                            sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'opacity 0.3s ease'
                            }}
                        />

                        {/* Gradient Overlay để text dễ đọc */}
                        <Box sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            width: '100%',
                            height: '40%',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                            pointerEvents: 'none'
                        }} />

                        {/* Navigation Arrows (nếu có nhiều ảnh) */}
                        {userImages.length > 1 && (
                            <>
                                <IconButton
                                    onClick={handlePrevImage}
                                    sx={{ position: 'absolute', left: 8, top: '50%', color: 'white', bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}
                                >
                                    <ArrowBackIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    onClick={handleNextImage}
                                    sx={{ position: 'absolute', right: 8, top: '50%', color: 'white', bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.5)' } }}
                                >
                                    <ArrowForwardIcon fontSize="small" />
                                </IconButton>

                                {/* Pagination Dots */}
                                <Stack direction="row" spacing={0.5} sx={{ position: 'absolute', top: 10, width: '100%', justifyContent: 'center' }}>
                                    {userImages.map((_img: string, idx: number) => (
                                        <Box
                                            key={idx}
                                            sx={{
                                                width: idx === currentImageIndex ? 24 : 6,
                                                height: 4,
                                                bgcolor: idx === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)',
                                                borderRadius: 2,
                                                transition: 'all 0.3s'
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </>
                        )}

                        {/* --- Swipe Overlays (Absolute) --- */}
                        {/* LIKE Overlay */}
                        <Box ref={likeOverlayRef} sx={{
                            position: 'absolute',
                            top: 40,
                            left: 40,
                            border: '4px solid #4CAF50',
                            borderRadius: 2,
                            padding: '4px 12px',
                            transform: 'rotate(-15deg)',
                            opacity: 0, // GSAP sẽ điều khiển cái này
                            pointerEvents: 'none'
                        }}>
                            <Typography variant="h4" fontWeight={900} color="#4CAF50" sx={{ textTransform: 'uppercase', letterSpacing: 2 }}>
                                LIKE
                            </Typography>
                        </Box>

                        {/* NOPE Overlay */}
                        <Box ref={nopeOverlayRef} sx={{
                            position: 'absolute',
                            top: 40,
                            right: 40,
                            border: '4px solid #F44336',
                            borderRadius: 2,
                            padding: '4px 12px',
                            transform: 'rotate(15deg)',
                            opacity: 0, // GSAP sẽ điều khiển cái này
                            pointerEvents: 'none'
                        }}>
                            <Typography variant="h4" fontWeight={900} color="#F44336" sx={{ textTransform: 'uppercase', letterSpacing: 2 }}>
                                NOPE
                            </Typography>
                        </Box>
                    </Box>

                    {/* --- Info Section (Bottom 30%) --- */}
                    <CardContent sx={{ height: '30%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', pt: 2, pb: '16px !important' }}>
                        <Box>
                            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                                <Typography variant="h5" fontWeight="bold">
                                    {currentPotentialMatch.full_name}, {currentPotentialMatch.birthdate ? calculateAge(currentPotentialMatch.birthdate) : "??"}
                                </Typography>
                                <VerifiedIcon color="primary" sx={{ fontSize: 20 }} />
                                {/* Giả lập online status */}
                                <OnlineIcon color="success" sx={{ fontSize: 12 }} />
                            </Stack>

                            {/* <Stack direction="row" alignItems="center" spacing={0.5} color="text.secondary" mb={1}>
                            <LocationOnIcon fontSize="small" />
                            <Typography variant="body2">
                                {currentPotentialMatch. || "Cách 5km"}
                            </Typography>
                        </Stack> */}

                            {/* Interests Chips */}
                            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1, '::-webkit-scrollbar': { display: 'none' } }}>
                                {currentPotentialMatch.hobbies?.slice(0, 5).map((hobby, index) => (
                                    <Chip
                                        key={index}
                                        label={hobby.name}
                                        size="small"
                                        variant="outlined"
                                        color="secondary"
                                        sx={{ fontSize: '0.7rem' }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        <Typography variant="body2" color="text.primary" sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: 1.4
                        }}>
                            {currentPotentialMatch.bio || "Chưa có giới thiệu..."}
                        </Typography>
                    </CardContent>
                </Card>

                {/* Thẻ ảo phía sau để tạo hiệu ứng Stack (Độ sâu) */}
                {currentIndex + 1 < potentialMatches.length && (
                    <Card sx={{
                        position: 'absolute',
                        top: 0,
                        width: '100%',
                        height: '100%',
                        borderRadius: '24px',
                        zIndex: -1,
                        transform: 'scale(0.95) translateY(10px)',
                        opacity: 0.8,
                        bgcolor: 'grey.300',
                        pointerEvents: 'none'
                    }} />
                )}
            </Box>

            {/* --- Action Buttons (Footer) --- */}
            <Stack direction="row" spacing={3} alignItems="center" sx={{ mt: 4, zIndex: 20 }}>
                {/* Undo Button (Giả lập - disabled) */}
                <Fab size={isMobile ? "medium" : "large"} sx={{ bgcolor: 'white', color: '#FDD835' }} disabled>
                    <UndoIcon />
                </Fab>

                {/* Pass Button */}
                <Fab
                    size={isMobile ? "medium" : "large"}
                    onClick={onPassClick}
                    sx={{
                        bgcolor: 'white',
                        color: '#F44336',
                        border: '1px solid #ffebee',
                        boxShadow: '0 4px 10px rgba(244, 67, 54, 0.2)',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.1)' }
                    }}
                    aria-label="Pass"
                >
                    <CloseIcon fontSize="large" />
                </Fab>

                {/* Like Button */}
                <Fab
                    size={isMobile ? "medium" : "large"}
                    onClick={onLikeClick}
                    sx={{
                        bgcolor: 'white',
                        color: '#4CAF50',
                        border: '1px solid #e8f5e9',
                        boxShadow: '0 4px 10px rgba(76, 175, 80, 0.2)',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.1)' }
                    }}
                    aria-label="Like"
                >
                    <FavoriteIcon fontSize="large" />
                </Fab>

                {/* Super Like Button */}
                <Fab
                    size={isMobile ? "medium" : "large"}
                    sx={{
                        bgcolor: 'white',
                        color: '#2196F3',
                        transition: 'transform 0.2s',
                        '&:hover': { transform: 'scale(1.1)' }
                    }}
                >
                    <StarIcon />
                </Fab>
            </Stack>

            {/* Popup khi Match thành công */}
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