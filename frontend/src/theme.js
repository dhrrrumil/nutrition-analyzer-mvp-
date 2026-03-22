import { createTheme } from '@mui/material/styles';

const fontHeading = '"Plus Jakarta Sans", system-ui, sans-serif';
const fontBody = '"DM Sans", system-ui, sans-serif';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1b4332',
      light: '#2d6a4f',
      dark: '#081c15',
      contrastText: '#f8faf8',
    },
    secondary: {
      main: '#e07a5f',
      light: '#f4a261',
      dark: '#bc4b33',
      contrastText: '#fffbf8',
    },
    success: {
      main: '#40916c',
    },
    warning: {
      main: '#e9c46a',
    },
    background: {
      default: '#f3f6f4',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1f1c',
      secondary: '#5c6560',
    },
    divider: 'rgba(27, 67, 50, 0.12)',
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: fontBody,
    h1: { fontFamily: fontHeading, fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontFamily: fontHeading, fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontFamily: fontHeading, fontWeight: 700, letterSpacing: '-0.02em' },
    h4: { fontFamily: fontHeading, fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontFamily: fontHeading, fontWeight: 600 },
    h6: { fontFamily: fontHeading, fontWeight: 600 },
    button: { fontFamily: fontBody, fontWeight: 600, textTransform: 'none', letterSpacing: '0.02em' },
  },
  shadows: [
    'none',
    '0 1px 2px rgba(8, 28, 21, 0.06)',
    '0 4px 12px rgba(8, 28, 21, 0.08)',
    '0 8px 24px rgba(8, 28, 21, 0.1)',
    '0 12px 32px rgba(8, 28, 21, 0.12)',
    '0 16px 40px rgba(8, 28, 21, 0.14)',
    '0 20px 48px rgba(8, 28, 21, 0.16)',
    '0 24px 56px rgba(8, 28, 21, 0.18)',
    '0 28px 64px rgba(8, 28, 21, 0.2)',
    '0 32px 72px rgba(8, 28, 21, 0.22)',
    '0 36px 80px rgba(8, 28, 21, 0.24)',
    '0 40px 88px rgba(8, 28, 21, 0.26)',
    '0 44px 96px rgba(8, 28, 21, 0.28)',
    '0 48px 104px rgba(8, 28, 21, 0.3)',
    '0 52px 112px rgba(8, 28, 21, 0.32)',
    '0 56px 120px rgba(8, 28, 21, 0.34)',
    '0 60px 128px rgba(8, 28, 21, 0.36)',
    '0 64px 136px rgba(8, 28, 21, 0.38)',
    '0 68px 144px rgba(8, 28, 21, 0.4)',
    '0 72px 152px rgba(8, 28, 21, 0.42)',
    '0 76px 160px rgba(8, 28, 21, 0.44)',
    '0 80px 168px rgba(8, 28, 21, 0.46)',
    '0 84px 176px rgba(8, 28, 21, 0.48)',
    '0 88px 184px rgba(8, 28, 21, 0.5)',
    '0 92px 192px rgba(8, 28, 21, 0.52)',
    '0 96px 200px rgba(8, 28, 21, 0.54)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#b7c9bf transparent',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingLeft: 22,
          paddingRight: 22,
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 14px rgba(8, 28, 21, 0.15)' },
        },
        containedSecondary: {
          '&:hover': { boxShadow: '0 4px 18px rgba(224, 122, 95, 0.35)' },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid',
          borderColor: 'rgba(27, 67, 50, 0.1)',
          boxShadow: '0 4px 20px rgba(8, 28, 21, 0.06)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 16 },
        elevation1: {
          boxShadow: '0 4px 20px rgba(8, 28, 21, 0.06)',
          border: '1px solid rgba(27, 67, 50, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(180deg, #1b4332 0%, #142e24 100%)',
          boxShadow: '0 4px 24px rgba(8, 28, 21, 0.25)',
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 999, overflow: 'hidden' },
      },
    },
  },
});

export default theme;
