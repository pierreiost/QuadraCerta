import { createTheme } from '@mui/material/styles';

// Cores do sistema conforme especificação
const colors = {
  primary: '#FF0000',      // Vermelho - alertas e importantes
  secondary: '#DCDCDC',    // Gainsboro - detalhes e botões
  background: '#FFFFFF',   // Branco - background principal
  
  // Cores das quadras
  futebol: '#28A745',      // Verde
  beachTenis: '#FFC107',   // Amarelo
  society: '#007BFF',      // Azul
  
  // Estados
  success: '#28A745',
  warning: '#FFC107',
  error: '#FF0000',
  info: '#007BFF'
};

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: colors.secondary,
      contrastText: '#000000'
    },
    background: {
      default: colors.background,
      paper: colors.background
    },
    error: {
      main: colors.error
    },
    success: {
      main: colors.success
    },
    warning: {
      main: colors.warning
    },
    info: {
      main: colors.info
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#333333'
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      color: '#333333'
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#333333'
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#333333'
    },
    body1: {
      fontSize: '1rem',
      color: '#333333'
    },
    body2: {
      fontSize: '0.875rem',
      color: '#666666'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 20px'
        },
        containedPrimary: {
          backgroundColor: colors.primary,
          '&:hover': {
            backgroundColor: '#CC0000'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: `1px solid ${colors.secondary}`
        }
      }
    }
  }
});

// Cores específicas das quadras para uso nos componentes
export const quadraColors = {
  futebol: colors.futebol,
  beach_tenis: colors.beachTenis,
  society: colors.society
};

export default theme;