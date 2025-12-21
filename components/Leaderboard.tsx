"use client";

import { useEffect, useState } from "react";
import { getLeaderboard } from "@/lib/actions/matches";
import {
    List, ListItem, ListItemAvatar, Avatar, ListItemText,
    Typography, Box, Skeleton, Badge
} from "@mui/material";
import { styled } from '@mui/material/styles';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';

// Cấu hình Font Be Vietnam Pro
const VIETNAMESE_FONT = '"Be Vietnam Pro", sans-serif';

const StyledListItem = styled(ListItem)(({ theme }) => ({
    borderRadius: '16px',
    transition: 'all 0.3s ease',
    marginBottom: '8px',
    '&:hover': {
        transform: 'translateY(-2px)',
        '& .container-box': {
            backgroundColor: 'rgba(255, 255, 255, 1)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
        }
    },
}));
interface LeaderboardUser {
    id: string;          // Hoặc number, tùy thuộc vào DB của bạn
    full_name: string;
    avatar_url: string;  // Hoặc string | null nếu có thể null
    like_count: number;
}
export default function Leaderboard() {
    const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const data = await getLeaderboard();
            setTopUsers(data);
            setLoading(false);
        }
        load();
    }, []);

    const getRankColor = (index: number) => {
        if (index === 0) return '#FFD700';
        if (index === 1) return '#C0C0C0';
        if (index === 2) return '#CD7F32';
        return 'transparent';
    };

    if (loading) return (
        <Box sx={{ p: 2 }}>
            <Skeleton variant="text" width="60%" height={40} sx={{ mb: 2, mx: 'auto' }} />
            {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="rounded" height={70} sx={{ mb: 2, borderRadius: 4 }} />
            ))}
        </Box>
    );

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: 450,
                mx: 'auto',
                height: '100%',
                overflowY: 'auto',
                px: 1,
                // Áp dụng font toàn cục cho các component con
                '& *': { fontFamily: `${VIETNAMESE_FONT} !important` },
                '&::-webkit-scrollbar': { display: 'none' },
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
            }}
        >
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800;900&display=swap');
            `}</style>

            {/* PHẦN TIÊU ĐỀ MỚI */}
            <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        background: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 0.5
                    }}
                >
                    Top 10 Bảng Xếp Hạng
                </Typography>
                <Box
                    sx={{
                        width: '40px',
                        height: '4px',
                        background: 'linear-gradient(90deg, #FF512F, #DD2476)',
                        borderRadius: '2px',
                        mx: 'auto'
                    }}
                />
            </Box>

            <List sx={{ p: 0 }}>
                {topUsers.map((user, index) => {
                    const isTop3 = index < 3;
                    const rankColor = getRankColor(index);

                    return (
                        <StyledListItem key={user.id} disablePadding>
                            <Box
                                className="container-box"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%',
                                    p: 1.5,
                                    borderRadius: '16px',
                                    transition: 'all 0.3s ease',
                                    background: isTop3
                                        ? `linear-gradient(90deg, ${rankColor}15 0%, rgba(255,255,255,0.5) 100%)`
                                        : '#FFFFFF',
                                    border: isTop3
                                        ? `1.5px solid ${rankColor}50`
                                        : '1px solid rgba(0,0,0,0.05)',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                                }}
                            >
                                <Box sx={{ minWidth: 40, textAlign: 'center' }}>
                                    {isTop3 ? (
                                        <MilitaryTechIcon sx={{ color: rankColor, fontSize: 32 }} />
                                    ) : (
                                        <Typography variant="body1" sx={{ fontWeight: 800, color: '#ccc' }}>
                                            {index + 1}
                                        </Typography>
                                    )}
                                </Box>

                                <ListItemAvatar sx={{ minWidth: 65 }}>
                                    <Avatar
                                        src={user.avatar_url}
                                        sx={{
                                            width: 50, height: 50,
                                            border: isTop3 ? `2px solid ${rankColor}` : '1px solid #f0f0f0'
                                        }}
                                    />
                                </ListItemAvatar>

                                <ListItemText
                                    primary={
                                        <Typography
                                            noWrap
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: '0.95rem',
                                                color: '#222',
                                                letterSpacing: '-0.01em'
                                            }}
                                        >
                                            {user.full_name} {index === 0 && '👑'}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                background: 'linear-gradient(45deg, #FF512F 30%, #DD2476 90%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                                fontWeight: 700,
                                                fontSize: '0.75rem'
                                            }}
                                        >
                                            {user.like_count.toLocaleString()} lượt thích
                                        </Typography>
                                    }
                                />
                            </Box>
                        </StyledListItem>
                    );
                })}
            </List>
        </Box>
    );
}