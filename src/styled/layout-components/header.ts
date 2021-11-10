import { Typography, AppBar } from "@mui/material";
import { styled } from "@mui/material/styles";

/**
 * Styled header
 */
export const Root = styled(AppBar, {
  label: "header-root"
})(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: "rgba(0,158,158,0.85)",
  display: "flex",
  flexDirection: "column",
  paddingBottom: theme.spacing(2)
}));

/**
 * Styled app title
 */
export const AppTitle = styled(Typography, {
  label: "header-app-title"
})(({ theme }) => ({
  textTransform: "uppercase",
  fontWeight: 900,
  fontFamily: "Oswald, sans-serif",
  fontSize: 24,
  [theme.breakpoints.up("md")]: {
    fontSize: 28
  },
  [theme.breakpoints.up("xl")]: {
    fontSize: 36
  }
}));