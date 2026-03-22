import React from 'react';
import {
  Paper,
  Box,
  Typography,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';

const formatMemberSince = (iso) => {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return null;
  }
};

const ProfileSummary = ({ username, isAdmin, createdAt, mealsLogged }) => {
  const initial = (username && username[0] ? username[0] : '?').toUpperCase();
  const memberSince = formatMemberSince(createdAt);

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 8px 28px rgba(8, 28, 21, 0.06)',
        mb: 3,
      }}
    >
      <Typography variant="overline" color="primary" sx={{ fontWeight: 700, letterSpacing: '0.12em' }}>
        Your profile
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2.5,
          mt: 1.5,
        }}
      >
        <Avatar
          sx={{
            width: 72,
            height: 72,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: '1.75rem',
            fontWeight: 700,
            boxShadow: '0 8px 20px rgba(8, 28, 21, 0.2)',
          }}
        >
          {initial}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="h5" component="p" sx={{ fontWeight: 700, wordBreak: 'break-word' }}>
              {username || 'User'}
            </Typography>
            {isAdmin ? (
              <Chip
                icon={<AdminPanelSettingsOutlinedIcon sx={{ fontSize: 18 }} />}
                label="Admin"
                size="small"
                color="secondary"
                sx={{ fontWeight: 600 }}
              />
            ) : (
              <Chip label="Member" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <PersonOutlineRoundedIcon sx={{ fontSize: 18, opacity: 0.85 }} />
            Username used to sign in
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2.5 }} />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
            <CalendarTodayOutlinedIcon sx={{ fontSize: 16 }} />
            Member since
          </Typography>
          <Typography variant="body1" sx={{ mt: 0.75, fontWeight: 600 }}>
            {memberSince || '—'}
          </Typography>
          {!memberSince && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Older accounts may not have a join date on file.
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
            <RestaurantMenuOutlinedIcon sx={{ fontSize: 16 }} />
            Meals logged
          </Typography>
          <Typography variant="body1" sx={{ mt: 0.75, fontWeight: 600 }}>
            {typeof mealsLogged === 'number' ? mealsLogged : '—'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Total meals in your account
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ProfileSummary;
