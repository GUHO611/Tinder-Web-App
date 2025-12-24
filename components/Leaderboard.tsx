"use client";

import { useEffect, useState } from "react";
import { getLeaderboard } from "@/lib/actions/matches";
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Box, Skeleton, Divider } from "@mui/material";
import { styled, alpha } from '@mui/material/styles';
import { motion, AnimatePresence } from "framer-motion";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

const VIETNAMESE_FONT = '"Be Vietnam Pro", sans-serif';

const GlassCard = styled(motion.div)({
  background: alpha('#ffffff', 0.8),
  backdropFilter: 'blur(12px)',
  borderRadius: '32px',
  border: `1px solid ${alpha('#ffffff', 0.5)}`,
  boxShadow: '0 12px 40px rgba(0,0,0,0.08)',
  overflow: 'hidden',
  width: '100%',
});

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
      
      {/* --- PHẦN HEADER CỐ ĐỊNH --- */}
      <Box sx={{ textAlign: 'center', mb: 4, pt: 2, flexShrink: 0 }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 900, 
          background: 'linear-gradient(45deg, #FF512F 30%, #DD2476 90%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2
        }}>
          <EmojiEventsIcon sx={{ color: '#FFD700', fontSize: 40 }} /> 
          BẢNG VÀNG
        </Typography>
        <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase' }}>
          TOP NHÂN VẬT ĐƯỢC YÊU THÍCH
        </Typography>
      </Box>

      {/* --- VÙNG NỘI DUNG CUỘN --- */}
      <Box sx={{ 
        flexGrow: 1,
        overflowY: 'auto', 
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        px: 1,
        pb: 10 
      }}>
        
        {/* PODIUM (To hơn) */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: { xs: 2, md: 4 }, mb: 6, pt: 2 }}>
          {top3[1] && <PodiumItem user={top3[1]} rank={2} height={120} color="#C0C0C0" size={90} />}
          {top3[0] && <PodiumItem user={top3[0]} rank={1} height={160} color="#FFD700" isWinner size={120} />}
          {top3[2] && <PodiumItem user={top3[2]} rank={3} height={100} color="#CD7F32" size={90} />}
        </Box>

        {/* LIST (Phóng to lại như cũ) */}
        <GlassCard initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <List sx={{ p: 1 }}>
            <AnimatePresence>
              {others.map((user, index) => (
                <motion.div 
                  key={user.id} 
                  initial={{ x: -20, opacity: 0 }} 
                  animate={{ x: 0, opacity: 1 }} 
                  transition={{ delay: index * 0.05 }}
                >
                  <ListItem sx={{ py: 2.5, px: 3 }}>
                    <Box sx={{ minWidth: 50 }}>
                       <Typography sx={{ fontWeight: 900, color: '#a0aec0', fontSize: '1.1rem' }}>#{index + 4}</Typography>
                    </Box>
                    <ListItemAvatar sx={{ minWidth: 80 }}>
                      <Avatar src={user.avatar_url || ""} sx={{ width: 56, height: 56, border: '3px solid #fff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    </ListItemAvatar>
                    <ListItemText 
                      primary={<Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: '#2d3748' }}>{user.full_name}</Typography>}
                      secondary={
                        <Typography component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <LocalFireDepartmentIcon sx={{ fontSize: 18, color: '#FF512F' }} />
                          {/* ĐÃ THÊM LẠI CHỮ "LƯỢT YÊU THÍCH" */}
                          <Typography component="span" sx={{ fontWeight: 800, color: '#FF512F', fontSize: '0.9rem' }}>
                            {user.like_count.toLocaleString()} lượt yêu thích
                          </Typography>
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < others.length - 1 && <Divider variant="inset" sx={{ opacity: 0.6 }} />}
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
        </GlassCard>
      </Box>
    </Box>
  );
}

function PodiumItem({ user, rank, height, color, isWinner = false, size }: any) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: size + 40 }}>
      <Box sx={{ position: 'relative', mb: 2 }}>
        <Avatar src={user.avatar_url || ""} sx={{ width: size, height: size, border: `4px solid ${color}`, boxShadow: isWinner ? `0 0 30px ${alpha(color, 0.5)}` : 'none' }} />
        <Box sx={{ position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)', bgcolor: color, color: '#fff', px: 1.5, borderRadius: '12px', fontWeight: 900, zIndex: 2 }}>#{rank}</Box>
      </Box>
      <Typography noWrap sx={{ fontWeight: 900, fontSize: isWinner ? '1rem' : '0.9rem', mb: 0.5, color: '#000' }}>
        {user.full_name?.split(' ').pop()}
      </Typography>
      <Typography sx={{ color: color, fontWeight: 800, fontSize: '1rem', mb: 1 }}>
        {user.like_count.toLocaleString()} 🔥
      </Typography>
      <Box sx={{ width: '100%', height: height, background: `linear-gradient(180deg, ${alpha(color, 0.8)} 0%, ${alpha(color, 0.02)} 100%)`, borderRadius: '16px 16px 0 0' }} />
    </Box>
  );
}

function LeaderboardSkeleton() {
  return (
    <Box sx={{ p: 4 }}>
      <Skeleton variant="text" width="60%" height={60} sx={{ mx: 'auto', mb: 4 }} />
      <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 8 }} />
    </Box>
  );
}