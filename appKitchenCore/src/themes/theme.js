import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",

    primary: {
      main: "#0B0B0B",
      light: "#1F1F1F",
      dark: "#000000",
      contrastText: "#FFFFFF",
    },

    secondary: {
      main: "#E50914",
      light: "#FF2A34",
      dark: "#B80710",
      contrastText: "#FFFFFF",
    },

    error: {
      main: "#E50914",
      contrastText: "#FFFFFF",
    },

    background: {
      default: "#F5F5F5",
      paper: "#FFFFFF",
    },

    text: {
      primary: "#0B0B0B",
      secondary: "#555555",
    },

    primaryLight: {
      main: "#0B0B0B",
      contrastText: "#FFFFFF",
    },
  },

  typography: {
    fontFamily: "Inter, system-ui, Arial, sans-serif",
    button: {
      textTransform: "none",
      fontWeight: 800,
    },
  },

  shape: {
    borderRadius: 16,
  },

  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#0B0B0B",
          color: "#FFFFFF",
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 800,
          borderRadius: "999px",
        },
        containedPrimary: {
          backgroundColor: "#E50914",
          color: "#FFFFFF",
          boxShadow: "0 8px 18px rgba(229, 9, 20, 0.25)",
          "&:hover": {
            backgroundColor: "#B80710",
          },
        },
        containedSecondary: {
          backgroundColor: "#0B0B0B",
          color: "#FFFFFF",
          "&:hover": {
            backgroundColor: "#1F1F1F",
          },
        },
        outlinedPrimary: {
          borderColor: "#E50914",
          color: "#E50914",
          "&:hover": {
            borderColor: "#B80710",
            backgroundColor: "rgba(229, 9, 20, 0.08)",
          },
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: "#0B0B0B",
          color: "#FFFFFF",
          fontWeight: 800,
        },
        colorSecondary: {
          backgroundColor: "#E50914",
          color: "#FFFFFF",
          fontWeight: 800,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "18px",
          border: "1px solid #E6E6E6",
          boxShadow: "0 12px 28px rgba(0, 0, 0, 0.10)",
        },
      },
    },
  },
});