import { styled, Box } from "@mui/material";
/**
 * Styled image gallery component that stacks on mobile devices and repeats 4 column row on desktop
 */
export const ImageGallery = styled(Box, {
  label: "side-panel-layout-root"
})(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(2, 1fr)",
  gridGap: theme.spacing(2),
  [theme.breakpoints.up("lg")]: {
    gridTemplateColumns: "repeat(4, 1fr)"
  }
}));

export default ImageGallery;