"use client";

// --- Imports Logic & Context ---
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { getCurrentUserProfile, markUserAsVerified } from "@/lib/actions/profile";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState, useLayoutEffect } from "react";

// --- Imports UI Libraries ---
import gsap from "gsap";
import {
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    InputAdornment,
    Paper,
    TextField,
    Typography,
    Link as MuiLink,
    Alert,
    CircularProgress,
    Fade,
    useMediaQuery,
    useTheme
} from "@mui/material";
import { styled } from "@mui/material/styles";

// --- Custom Icons ---
const SvgIconWrapper = ({ children, color = "currentColor" }: { children: React.ReactNode, color?: string }) => (
    <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: color }}>
        {children}
    </Box>
);

const Icons = {
    Mail: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    Lock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    ),
    Key: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
    ),
    Heart: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FFC5D3" stroke="none">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
    )
};

// --- STYLED COMPONENTS ---

// 1. Page Background
const PageWrapper = styled(Box)({
    height: '90vh',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #FF9A9E 0%, #FECFEF 50%, #FF99AC 100%)',
    position: 'relative',
    overflow: 'hidden',
});

// 2. Glassmorphism Card Container
const AuthCard = styled(Paper)(({ theme }) => ({
    display: 'flex',
    borderRadius: '32px',
    overflow: 'hidden',
    boxShadow: '0 20px 80px rgba(233, 64, 134, 0.25)',
    maxWidth: '900px',
    width: '90%',
    maxHeight: '85vh',
    overflowY: 'auto',
    position: 'relative',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(40px)',
    border: '1px solid rgba(255, 255, 255, 0.6)',

    '&::-webkit-scrollbar': {
        width: '0px',
        background: 'transparent',
    },

    [theme.breakpoints.down('md')]: {
        flexDirection: 'column',
        width: '95%',
        maxHeight: '95vh',
    },
}));

// 3. Left Panel (Illustration)
const LeftPanel = styled(Box)({
    flex: 0.8,
    background: 'linear-gradient(135deg, rgba(233, 64, 134, 0.8) 0%, rgba(255, 126, 179, 0.8) 100%)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '32px',
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
});

// 4. Right Panel (Form)
const RightPanel = styled(Box)(({ theme }) => ({
    flex: 1,
    padding: '48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    [theme.breakpoints.down('sm')]: {
        padding: '32px 24px',
    },
}));

// 5. Romantic Styled Input
const RomanticTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        borderRadius: '16px',
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        transition: 'all 0.3s ease',
        '& fieldset': {
            borderColor: 'rgba(233, 64, 134, 0.2)',
        },
        '&:hover fieldset': {
            borderColor: '#E94086',
        },
        '&.Mui-focused': {
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 20px rgba(233, 64, 134, 0.1)',
            '& fieldset': {
                borderColor: '#E94086',
            },
        },
    },
});

// 6. Action Button with Glow
const GlowButton = styled(Button)({
    borderRadius: '16px',
    padding: '12px',
    fontSize: '1rem',
    fontWeight: 700,
    textTransform: 'none',
    background: 'linear-gradient(45deg, #E94086 30%, #FF7EB3 90%)',
    boxShadow: '0 3px 15px rgba(233, 64, 134, 0.3)',
    color: 'white',
    transition: 'all 0.3s ease',
    '&:hover': {
        background: 'linear-gradient(45deg, #D63376 30%, #FF5C9D 90%)',
        boxShadow: '0 8px 25px rgba(233, 64, 134, 0.5)',
        transform: 'translateY(-2px)',
    },
    '&:disabled': {
        background: '#e0e0e0',
        boxShadow: 'none',
    }
});

// --- ANIMATION COMPONENTS ---
const FloatingHeartsBackground = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            const hearts = gsap.utils.toArray('.heart-item') as HTMLElement[];
            hearts.forEach((heart) => {
                const duration = gsap.utils.random(6, 15);
                const delay = gsap.utils.random(0, 5);
                const xStart = gsap.utils.random(0, 100);
                const scale = gsap.utils.random(0.4, 1);

                gsap.set(heart, {
                    x: `${xStart}vw`,
                    y: '110vh',
                    scale: scale,
                    opacity: gsap.utils.random(0.3, 0.6),
                });

                gsap.to(heart, {
                    y: '-20vh',
                    x: `+=${gsap.utils.random(-20, 20)}`,
                    rotation: gsap.utils.random(-180, 180),
                    duration: duration,
                    repeat: -1,
                    delay: delay,
                    ease: 'none',
                });
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    return (
        <Box ref={containerRef} sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
            {[...Array(15)].map((_, i) => (
                <Box key={i} className="heart-item" sx={{ position: 'absolute' }}>
                    <Icons.Heart />
                </Box>
            ))}
        </Box>
    );
};

// --- MAIN COMPONENT ---
function AuthPage() {
    // === LOGIC GIỮ NGUYÊN ===
    const [view, setView] = useState<'login' | 'signup' | 'verify_signup'>('login');
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [otp, setOtp] = useState<string>("");
    const [rememberMe, setRememberMe] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [message, setMessage] = useState<string>("");

    const supabase = createClient();
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    // Refs for animation
    const cardRef = useRef<HTMLDivElement>(null);
    const illustrationRef = useRef<HTMLImageElement>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    useEffect(() => {
        if (user && !authLoading && !loading) {
            router.push("/");
        }
    }, [user, authLoading, router, loading]);

    useEffect(() => {
        setError("");
        setMessage("");
        setPassword("");
        setConfirmPassword("");
        setOtp("");
    }, [view]);

    // === ANIMATIONS (GSAP) ===
    useLayoutEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(cardRef.current, {
                y: 100,
                opacity: 0,
                duration: 1.2,
                ease: "power3.out",
                delay: 0.2
            });

            if (illustrationRef.current) {
                gsap.from(illustrationRef.current, {
                    scale: 1.1,
                    filter: "blur(10px)",
                    duration: 1.5,
                    ease: "power2.out"
                });
            }
        });
        return () => ctx.revert();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            if (formRef.current) {
                gsap.fromTo(formRef.current.children,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: "back.out(1.7)" }
                );
            }
        });
        return () => ctx.revert();
    }, [view]);

    // === HANDLERS ===
    const switchView = (newView: 'login' | 'signup') => {
        setView(newView);
    };

    const handleResendOtp = async () => {
        if (!email) return setError("Vui lòng nhập email trước");
        setLoading(true);
        setMessage("");
        setError("");
        try {
            const { error } = await supabase.auth.resend({ type: 'signup', email: email });
            if (error) throw error;
            setMessage("Đã gửi lại mã xác minh mới. Vui lòng kiểm tra email.");
        } catch (err: unknown) {
            let errorMessage = "Không thể gửi lại mã";
            if (err instanceof Error) errorMessage = err.message;
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    async function handleAuth(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            if (view === 'signup') {
                if (password !== confirmPassword) throw new Error("Mật khẩu xác nhận không khớp");
                const { data, error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                if (data.user && !data.session) {
                    setMessage(`Mã xác minh đã được gửi đến ${email}`);
                    setView('verify_signup');
                    setLoading(false);
                } else if (data.session) {
                    router.push("/");
                }
            } else if (view === 'verify_signup') {
                if (!email) throw new Error("Email bị trống. Vui lòng nhập lại email.");
                const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'signup' });
                if (error) throw error;

                // FIX: Sử dụng try-catch riêng cho việc cập nhật profile server
                // Nếu verifyOtp thành công nghĩa là đã login được
                try {
                    await markUserAsVerified();
                    router.refresh();
                    const profile = await getCurrentUserProfile();
                    if (profile && !profile.is_profile_completed) {
                        router.push("/profile/edit");
                    } else {
                        router.push("/");
                    }
                } catch (profileError) {
                    console.error("Profile sync error (ignored):", profileError);
                    // Dù lỗi server action, vẫn redirect về Home vì đã login thành công
                    router.push("/");
                }

            } else if (view === 'login') {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) {
                    if (error.message.includes("Email not confirmed")) {
                        setMessage("Tài khoản chưa được xác thực. Vui lòng nhập mã OTP đã gửi về email.");
                        setView('verify_signup');
                        await supabase.auth.resend({ type: 'signup', email });
                        setLoading(false);
                        return;
                    }
                    throw error;
                }

                router.refresh(); // Làm mới server components (để cập nhật header, auth state)
                router.push("/");
            }
        } catch (err: unknown) {
            // FIX: Kiểm tra lần cuối xem session có tồn tại không trước khi báo lỗi
            // Nếu session tồn tại, nghĩa là lỗi chỉ là do server action sync chậm -> bỏ qua và redirect
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push("/");
                return;
            }

            let errorMessage = "Đã xảy ra lỗi";
            if (err instanceof Error) errorMessage = err.message;
            else if (typeof err === "string") errorMessage = err;
            setError(errorMessage);
            setLoading(false);
        }
    }

    const handleForgotPassword = () => {
        router.push("/auth/reset-password");
    };

    if (authLoading) return <LoadingSpinner />;

    return (
        <PageWrapper>
            {/* GSAP Floating Background */}
            <FloatingHeartsBackground />

            {/* Main Glass Card */}
            <AuthCard ref={cardRef}>
                {/* --- LEFT PANEL: Illustration --- */}
                {!isMobile && (
                    <LeftPanel>
                        {/* Decorative Circles */}
                        <Box sx={{ position: 'absolute', width: 300, height: 300, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', top: -50, left: -50 }} />
                        <Box sx={{ position: 'absolute', width: 200, height: 200, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', bottom: 50, right: -20 }} />

                        <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                            <Box
                                ref={illustrationRef}
                                sx={{
                                    width: '100%',
                                    maxWidth: 240,
                                    height: '90%',
                                    mb: 3,
                                    borderRadius: '24px',
                                    overflow: 'hidden',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                }}
                            >
                                <img
                                    src="/romantic.jpg"
                                    alt="Romantic Couple"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => e.currentTarget.style.display = 'none'}
                                />
                            </Box>
                            <Typography variant="h5" sx={{ fontFamily: '"Playfair Display", serif', fontWeight: 700, mb: 1 }}>
                                Find Your Missing Piece
                            </Typography>
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Kết nối trái tim, chia sẻ yêu thương
                            </Typography>
                        </Box>
                    </LeftPanel>
                )}

                {/* --- RIGHT PANEL: Form --- */}
                <RightPanel>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 800,
                                background: 'linear-gradient(45deg, #E94086, #FF99AC)',
                                backgroundClip: 'text',
                                textFillColor: 'transparent',
                                mb: 1,
                                letterSpacing: '-0.02em'
                            }}
                        >
                            {view === 'login' ? "Welcome Back" : view === 'signup' ? "Join Us" : "Verify OTP"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {view === 'verify_signup'
                                ? "Nhập mã xác nhận chúng tôi vừa gửi"
                                : "Bắt đầu hành trình tìm kiếm hạnh phúc của bạn"}
                        </Typography>
                    </Box>

                    <form ref={formRef} onSubmit={handleAuth} style={{ width: '100%' }}>
                        {/* EMAIL INPUT */}
                        <Box sx={{ mb: 2 }}>
                            <RomanticTextField
                                fullWidth
                                label="Địa chỉ Email"
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={view === 'verify_signup' || loading}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SvgIconWrapper color="#E94086"><Icons.Mail /></SvgIconWrapper>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>

                        {/* PASSWORD INPUT */}
                        {view !== 'verify_signup' && (
                            <Box sx={{ mb: 2 }}>
                                <RomanticTextField
                                    fullWidth
                                    label="Mật khẩu"
                                    type="password"
                                    variant="outlined"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SvgIconWrapper color="#E94086"><Icons.Lock /></SvgIconWrapper>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        )}

                        {/* CONFIRM PASSWORD */}
                        {view === 'signup' && (
                            <Box sx={{ mb: 2 }}>
                                <RomanticTextField
                                    fullWidth
                                    label="Xác nhận mật khẩu"
                                    type="password"
                                    variant="outlined"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={loading}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SvgIconWrapper color="#E94086"><Icons.Lock /></SvgIconWrapper>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        )}

                        {/* OTP INPUT */}
                        {view === 'verify_signup' && (
                            <Box sx={{ mb: 3 }}>
                                <RomanticTextField
                                    fullWidth
                                    placeholder="XXXXXX"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    disabled={loading}
                                    inputProps={{
                                        maxLength: 8,
                                        style: { textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.5em', fontWeight: 'bold' }
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SvgIconWrapper color="#E94086"><Icons.Key /></SvgIconWrapper>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        )}

                        {/* LOGIN EXTRAS */}
                        {view === 'login' && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            sx={{ color: '#E94086', '&.Mui-checked': { color: '#E94086' } }}
                                        />
                                    }
                                    label={<Typography variant="body2" color="text.secondary">Ghi nhớ tôi</Typography>}
                                />
                                <MuiLink
                                    component="button"
                                    type="button"
                                    onClick={handleForgotPassword}
                                    underline="hover"
                                    sx={{ color: '#E94086', fontWeight: 600, fontSize: '0.875rem' }}
                                >
                                    Quên mật khẩu?
                                </MuiLink>
                            </Box>
                        )}

                        {/* NOTIFICATIONS */}
                        {error && <Fade in><Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert></Fade>}
                        {message && <Fade in><Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>{message}</Alert></Fade>}

                        {/* VERIFY ACTIONS */}
                        {view === 'verify_signup' && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Button size="small" onClick={() => switchView('signup')} sx={{ color: '#888' }}>
                                    Quay lại
                                </Button>
                                <Button size="small" onClick={handleResendOtp} disabled={loading} sx={{ color: '#E94086', fontWeight: 'bold' }}>
                                    Gửi lại mã
                                </Button>
                            </Box>
                        )}

                        {/* SUBMIT BUTTON */}
                        <GlowButton
                            fullWidth
                            type="submit"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                        >
                            {loading ? "Đang xử lý..." : (
                                view === 'login' ? "Đăng Nhập" :
                                    view === 'signup' ? "Tạo Tài Khoản" : "Xác Nhận"
                            )}
                        </GlowButton>

                        {/* SWITCH VIEW */}
                        {view !== 'verify_signup' && (
                            <Box sx={{ mt: 3, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    {view === 'login' ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
                                    <MuiLink
                                        component="button"
                                        type="button"
                                        onClick={() => switchView(view === 'login' ? 'signup' : 'login')}
                                        sx={{ color: '#E94086', fontWeight: 700, textDecoration: 'none', cursor: 'pointer' }}
                                    >
                                        {view === 'login' ? "Đăng ký ngay" : "Đăng nhập"}
                                    </MuiLink>
                                </Typography>
                            </Box>
                        )}
                    </form>
                </RightPanel>
            </AuthCard>
        </PageWrapper>
    );
}

export default AuthPage;

// --- Loading Spinner Component ---
export function LoadingSpinner() {
    return (
        <Box sx={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#FFC5D3'
        }}>
            <CircularProgress sx={{ color: '#E94086' }} size={60} thickness={4} />
        </Box>
    );
};
