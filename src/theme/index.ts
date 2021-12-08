import { createTheme, darkScrollbar } from "@mui/material";
// Photo by Teodor Drobota on Unsplash
import background1920 from "../resources/images/teodor-drobota-1920.jpg";
import background2400 from "../resources/images/teodor-drobota-2400.jpg";
import background4k from "../resources/images/teodor-drobota-4k.jpg";

/**
 * Values from default theme to use in custom theme
 */
const { breakpoints, palette, spacing } = createTheme();

/**
 * Custom theme for Material UI
 */
export default createTheme({

  palette: {
    primary: {
      main: "#009E9E",
      light: "#56D0CF",
      dark: "#006F70"
    },
    secondary: {
      main: "#FF7F56",
      light: "#FFB084",
      dark: "#C74F2B"
    },
    text: {
      primary: "#333333",
      secondary: "#ffffff"
    },
    background: {
      default: "#FAFAFA",
      paper: "#ffffff"
    }
  },

  typography: {
    allVariants: {
      fontFamily: "Quicksand, sans-serif",
      fontWeight: 400
    },
    h1: {
      fontFamily: "Oswald, sans-serif",
      fontWeight: 800,
      fontSize: 36,
      [breakpoints.down("sm")]: {
        fontSize: "1.75rem"
      }
    },
    h2: {
      fontFamily: "Oswald, sans-serif",
      fontWeight: 800,
      fontSize: 30
    },
    h3: {
      fontFamily: "Oswald, sans-serif",
      fontSize: 26
    },
    h4: {
      fontFamily: "Oswald, sans-serif",
      fontSize: 20
    },
    body1: {
      fontSize: 18
    },
    h5: {
      fontSize: 16
    },
    h6: {
      fontSize: 12
    },
    subtitle1: {
      fontFamily: "Quicksand, sans-serif",
      fontWeight: 700,
      fontSize: 16
    },
    subtitle2: {
      fontFamily: "Quicksand, sans-serif",
      fontWeight: 700,
      fontSize: 14
    },
    body2: {
      fontSize: 16,
      lineHeight: 1.63
    },
    button: {
      fontWeight: 700
    }
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "@global": {
          a: {
            textDecoration: "none"
          }
        },
        body: {
          ...(palette.mode === "dark" ? darkScrollbar() : {}),
          background: `url(${background1920})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          height: "100vh",
          [breakpoints.up("md")]: {
            background: `url(${background2400})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover"
          },
          [breakpoints.up("xl")]: {
            background: `url(${background4k})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover"
          }
        }
      }
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        position: "fixed"
      },
      styleOverrides: {
        root: {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between"
        },
        colorPrimary: {
          backgroundColor: "#000"
        }
      }
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          background: "rgba(0, 111, 112, 0.08)"
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          width: "100%"
        }
      }
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          color: "rgba(0, 0, 0, 0.54)"
        },
        colorSecondary: {
          color: "rgba(255,255,255,0.8)",
          borderColor: "rgba(255,255,255,0.8)",
          "&.Mui-focused": {
            color: "rgba(255,255,255,1)",
            borderColor: "rgba(255,255,255,1)"
          }
        }
      }
    },
    MuiTextField: {
      defaultProps: {
        variant: "filled",
        fullWidth: true,
        size: "medium"
      },
      styleOverrides: {
        root: {
          [breakpoints.up("md")]: {
            minWidth: 320
          }
        }
      }
    },
    MuiSelect: {
      defaultProps: {
        fullWidth: true,
        variant: "filled"
      },
      styleOverrides: {
        iconOutlined: {
          color: "#fff"
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          color: "rgba(255,255,255,0.8)",
          borderColor: "rgba(255,255,255,0.8)",
          "&.Mui-focused": {
            color: "rgba(255,255,255,1)",
            borderColor: "rgba(255,255,255,1)",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255,255,255,1)"
            }
          },
          "&:hover:not(.Mui-disabled)": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255,255,255,1)"
            }
          }
        },
        input: {
          color: "#fff",
          borderColor: "#fff"
        },
        notchedOutline: {
          color: "rgba(255,255,255,0.8)",
          borderColor: "rgba(255,255,255,0.8)",
          "&.Mui-focused": {
            color: "rgba(255,255,255,1)",
            borderColor: "rgba(255,255,255,1)"
          }
        }
      }
    },
    MuiFilledInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: palette.background.default,
          "&:before": {
            borderBottom: "1px solid rgba(0,0,0,0)"
          },
          "&:hover": {
            backgroundColor: "#fff"
          },
          "&.Mui-focused": {
            backgroundColor: "#fff"
          }
        },
        input: {
          backgroundColor: palette.background.default
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        colorSecondary: {
          "& .MuiSelect-select, .MuiSelect-icon": {
            color: "#ffffff"
          },
          "&.MuiInputBase-root": {
            "&:before": {
              borderBottom: "1px solid rgba(255,255,255,0.5)"
            },
            "&:after": {
              borderBottom: "2px solid #ffffff"
            },
            "&:hover:not(.Mui-disabled)": {
              "&:before": {
                borderBottom: "2px solid rgba(255,255,255,0.8)"
              }
            }
          }
        }
      }
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between"
        }
      }
    },
    MuiButton: {
      defaultProps: {
        variant: "contained",
        color: "secondary"
      },
      styleOverrides: {
        root: {
          color: "#fff",
          fontWeight: 700
        },
        containedSecondary: {
          color: "#fff"
        },
        textPrimary: {
          color: "#006F70"
        },
        outlinedPrimary: {
          color: "#006F70",
          borderWidth: 2,
          "&:hover": {
            borderWidth: 2
          }
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            color: "#006F70",
            "& .MuiListItemIcon-root": {
              color: "#006F70"
            }
          }
        }
      }
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "rgba(0, 0, 0, 0.5)",
          "&.Mui-checked": {
            color: palette.primary.main
          }
        }
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: spacing(6)
        }
      }
    },
    MuiListItemText: {
      styleOverrides: {
        secondary: {
          color: "#999999"
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 0
        }
      }
    },
    MuiDialog: {
      defaultProps: {
        fullWidth: true,
        maxWidth: "md"
      },
      styleOverrides: {
        paper: {
          backgroundColor: "#FAFAFA"
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: "Oswald, sans-serif",
          fontWeight: 500,
          fontSize: 24
        }
      }
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: "rgba(0, 0, 0, 0.6)"
        }
      }
    }
  }
});