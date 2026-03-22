import React from 'react';
import { Box, Typography } from '@mui/material';

const PageBanner = ({ title, subtitle, imageSrc, height = { xs: 180, sm: 220 } }) => (
  <Box
    sx={{
      position: 'relative',
      borderRadius: 3,
      overflow: 'hidden',
      mb: 3,
      minHeight: height,
      boxShadow: '0 8px 32px rgba(8, 28, 21, 0.12)',
      border: '1px solid rgba(27, 67, 50, 0.12)',
    }}
  >
    <Box
      component="img"
      src={imageSrc}
      alt=""
      sx={{
        width: '100%',
        height: '100%',
        minHeight: height,
        objectFit: 'cover',
        display: 'block',
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        background:
          'linear-gradient(105deg, rgba(27, 67, 50, 0.94) 0%, rgba(27, 67, 50, 0.65) 42%, rgba(8, 28, 21, 0.2) 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        px: { xs: 2, sm: 4 },
        py: 2,
      }}
    >
      <Typography
        variant="h4"
        component="h1"
        color="common.white"
        sx={{ fontWeight: 700, letterSpacing: '-0.03em', mb: subtitle ? 1 : 0 }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.92)', maxWidth: 560, lineHeight: 1.6 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

export default PageBanner;
