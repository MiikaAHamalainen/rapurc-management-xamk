import { Paper, Stack } from "@mui/material";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

/**
 * Styled root component
 */
export const Root = styled(Box, {
  label: "side-panel-layout-root"
})(() => ({
  height: "100vh",
  width: "100vw",
  overflow: "hidden",
  display: "grid",
  gridTemplateRows: "auto 1fr"
}));

/**
 * Styled content container component
 */
export const ContentContainer = styled(Stack, {
  label: "side-panel-layout-content-container"
})(({ theme }) => ({
  overflow: "hidden",
  backgroundColor: "rgba(209,209,209,0.85)",
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(2)
  }
}));

/**
 * Styled content component
 */
export const Content = styled(Paper, {
  label: "side-panel-layout-content"
})(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  display: "flex",
  flexDirection: "column",
  flex: 1,
  width: "100%",
  overflow: "auto",
  padding: theme.spacing(4)
}));