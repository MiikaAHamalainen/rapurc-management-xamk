import { Box, Button, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";

/**
 * Styled search bar component
 */
export const FilterRoot = styled(Stack, {
  label: "surveys-screen-filter-root"
})(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  width: "100%"
}));

/**
 * Styled search bar component
 */
export const SearchBar = styled(Box, {
  label: "surveys-screen-search-bar"
})(({ theme }) => ({
  display: "flex",
  width: "100%",
  flexDirection: "column",
  [theme.breakpoints.up("md")]: {
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row"
  }
}));

/**
 * Styled search bar controls container
 */
export const ControlsContainer = styled(Stack, {
  label: "surveys-screen-controls-container"
})(({ theme }) => ({
  marginTop: theme.spacing(2),
  flex: 1,
  justifyContent: "space-between",
  [theme.breakpoints.up("md")]: {
    marginTop: 0,
    marginLeft: theme.spacing(2)
  }
}));

/**
 * Styled new survey button
 */
export const SurveyButton = styled(Button, {
  label: "surveys-screen-new-survey-button"
})(({ theme }) => ({
  [theme.breakpoints.down("md")]: {
    width: "100%"
  }
}));

/**
 * Styled drop zone container
 */
export const DropZoneContainer = styled(Box, {
  label: "surveys-screen-drop-zone-container"
})(({ theme }) => ({
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  border: "1px black dashed",
  borderRadius: 5,
  backgroundColor: "rgba(0,0,0,0.1)"
}));

/**
 * Styled attachment card container
 */
export const AttachmentContainer = styled(Stack, {
  label: "survey-attachment-container"
})(({ theme }) => ({
  height: 72,
  alignItems: "center",
  backgroundColor: "#fff",
  padding: theme.spacing(4)
}));

/**
 * Styled image thumbnail button
 */
export const ThumbnailButton = styled(Button, {
  label: "survey-reusable-image-thumbnail-button"
})(({ theme }) => ({
  position: "relative",
  backgroundColor: "transparent",
  padding: 2,
  width: 150,
  height: "auto",
  [theme.breakpoints.up("sm")]: {
    width: 100,
    height: 100
  },
  [theme.breakpoints.up("md")]: {
    width: 150,
    height: 150
  },
  "&:hover": {
    backgroundColor: "rgba(0,0,0,0.1)"
  },
  "& img": {
    maxWidth: "100%",
    maxHeight: "100%"
  }
}));

/**
 * Styled image delete button
 */
export const DeleteButton = styled(Button, {
  label: "survey-reusable-image-delete-button"
})(({ theme }) => ({
  position: "absolute",
  top: 8,
  right: 8,
  padding: 0,
  height: 40,
  width: 40,
  minWidth: 40,
  minHeight: 40,
  backgroundColor: theme.palette.common.black,
  borderRadius: 50,
  color: "#fff"
}));