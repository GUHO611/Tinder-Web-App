"use client";

import { useEffect, useState } from "react";
import { getLeaderboard } from "@/lib/actions/matches";
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Box, Skeleton } from "@mui/material";
import { styled, alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from "framer-motion";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

const VIETNAMESE_FONT = '"Be Vietnam Pro", sans-serif';

export default function Leaderboard() {
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(data => { 
      setTopUsers(data || []); 
      setLoading(false); 
    });
  }, []);

  if (loading) return <LeaderboardSkeleton />;

  const top3 = topUsers.slice(0, 3);
  const others = topUsers.slice(3);

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex',
      flexDirection: 'column',
      '& *': { fontFamily: `${VIETNAMESE_FONT} !important` } 
    }}>
      
      {/* --- HEADER --- */}
      <Box sx={{ textAlign: 'center', mb: 2, pt: 1, flexShrink: 0 }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 900, 
          background: 'linear-gradient(45deg, #FF512F 30%, #DD2476 90%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1
        }}>
          <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 24 }} /> 
          BẢNG VÀNG
        </Typography>
      </Box>

      <Box sx={{ 
        flexGrow: 1,
        overflowY: 'auto', 
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        px: 1.5,
        pb: 4 
      }}>
        
        {/* PODIUM */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 2, mb: 4 }}>
          {top3[1] && <PodiumItem user={top3[1]} rank={2} height={60} color="#C0C0C0" size={60} />}
          {top3[0] && <PodiumItem user={top3[0]} rank={1} height={90} color="#FFD700" isWinner size={80} />}
          {top3[2] && <PodiumItem user={top3[2]} rank={3} height={50} color="#CD7F32" size={60} />}
        </Box>

        {/* LIST CÁC HẠNG TIẾP THEO (TẤT CẢ ĐỀU CÓ VIỀN) */}
        <AnimatePresence>
          {others.map((user, index) => {
            const isTop4 = index === 0;
            const rank = index + 4;

            return (
              <motion.div 
                key={user.id} 
                initial={{ x: -10, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }} 
                transition={{ delay: index * 0.05 }}
              >
                <Box sx={{ 
                  mb: 1.2, // Khoảng cách giữa các thẻ
                  borderRadius: '16px',
                  // --- CẤU HÌNH VIỀN GIỐNG TOP 4 ---
                  border: isTop4 
                    ? '1.5px solid #FF512F' 
                    : `1.5px solid ${alpha('#a0aec0', 0.3)}`, // Top khác viền xám nhẹ hơn
                  background: isTop4 
                    ? alpha('#FF512F', 0.04) 
                    : alpha('#ffffff', 0.5),
                  boxShadow: isTop4 
                    ? `0 4px 12px ${alpha('#FF512F', 0.1)}` 
                    : '0 2px 8px rgba(0,0,0,0.03)',
                  // -------------------------------
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': { 
                    transform: 'translateY(-2px)',
                    borderColor: isTop4 ? '#FF512F' : alpha('#FF512F', 0.5)
                  }
                }}>
                  <ListItem sx={{ py: 1, px: 1.5 }}>
                    <Box sx={{ minWidth: 32 }}>
                      <Typography sx={{ 
                        fontWeight: 900, 
                        color: isTop4 ? '#FF512F' : '#a0aec0', 
                        fontSize: '0.85rem' 
                      }}>
                        #{rank}
                      </Typography>
                    </Box>
                    
                    <ListItemAvatar sx={{ minWidth: 48 }}>
                      <Avatar 
                        src={user.avatar_url || ""} 
                        sx={{ 
                          width: 38, 
                          height: 38, 
                          border: `1.5px solid ${isTop4 ? '#FF512F' : '#fff'}`,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                        }} 
                      />
                    </ListItemAvatar>

                    <ListItemText 
                      primary={
                        <Typography noWrap sx={{ 
                          fontWeight: 800, 
                          fontSize: '0.85rem', 
                          color: isTop4 ? '#000' : '#4a5568' 
                        }}>
                          {user.full_name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocalFireDepartmentIcon sx={{ fontSize: 13, color: '#FF512F' }} />
                          <Typography sx={{ fontWeight: 700, color: '#FF512F', fontSize: '0.75rem' }}>
                            {user.like_count.toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                </Box>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </Box>
    </Box>
  );
}

// Giữ nguyên PodiumItem và LeaderboardSkeleton như cũ...
function PodiumItem({ user, rank, height, color, isWinner = false, size }: any) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: size + 10 }}>
      <Box sx={{ position: 'relative', mb: 0.5 }}>
        <Avatar src={user.avatar_url || ""} sx={{ width: size, height: size, border: `3px solid ${color}` }} />
        <Box sx={{ 
          position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)', 
          bgcolor: color, color: '#fff', px: 0.8, borderRadius: '6px', 
          fontSize: '0.6rem', fontWeight: 900, zIndex: 2 
        }}>
          #{rank}
        </Box>
      </Box>
      <Typography noWrap sx={{ fontWeight: 800, fontSize: '0.65rem', color: '#333' }}>
        {user.full_name?.split(' ').pop()}
      </Typography>
      <Typography sx={{ color: color, fontWeight: 800, fontSize: '0.75rem', mb: 0.5 }}>
        {user.like_count.toLocaleString()} 🔥
      </Typography>
      <Box sx={{ 
        width: '85%', height: height, 
        background: `linear-gradient(180deg, ${alpha(color, 0.6)} 0%, ${alpha(color, 0.05)} 100%)`, 
        borderRadius: '6px 6px 0 0' 
      }} />
    </Box>
  );
}

function LeaderboardSkeleton() {
  return (
    <Box sx={{ p: 2 }}>
      <Skeleton variant="text" width="40%" height={30} sx={{ mx: 'auto', mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 4 }}>
        <Skeleton variant="circular" width={60} height={60} />
        <Skeleton variant="circular" width={80} height={80} />
        <Skeleton variant="circular" width={60} height={60} />
      </Box>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} variant="rectangular" height={50} sx={{ mb: 1.2, borderRadius: '16px' }} />
      ))}
    </Box>
  );
}