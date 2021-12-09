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
  padding: `${theme.spacing(4)} 0`,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  border: "1px black dashed"
}));