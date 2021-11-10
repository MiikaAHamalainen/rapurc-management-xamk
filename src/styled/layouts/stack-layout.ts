import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

/**
 * Styled root component
 */
export const Root = styled(Box, {
  label: "stack-layout-root"
})(() => ({
  height: "100vh",
  width: "100vw",
  overflow: "hidden",
  display: "grid",
  gridTemplateRows: "auto 1fr"
}));

/**
 * Styled content component
 */
export const Content = styled(Box, {
  label: "stack-layout-content"
})(({ theme }) => ({
  backgroundColor: "rgba(209,209,209,0.8)",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  flex: 1,
  width: "100%",
  padding: theme.spacing(2),
  overflow: "auto"
}));