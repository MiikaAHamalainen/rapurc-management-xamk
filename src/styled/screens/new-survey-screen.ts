import { Button, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";

/**
 * Styled filter root component
 */
export const FilterRoot = styled(Stack, {
  label: "new-survey-screen-filter-root"
})(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  width: "100%"
}));

/**
 * Styled search input container component
 */
export const SearchContainer = styled(Stack, {
  label: "new-survey-screen-search-container"
})(() => ({
  justifyContent: "space-between"
}));

/**
 * Styled search input container component
 */
export const CreateManuallyButton = styled(Button, {
  label: "new-survey-screen-create-manually-button"
})(({ theme }) => ({
  color: theme.palette.text.secondary,
  borderColor: "rgba(255,255,255,0.8)",
  "&:hover": {
    borderColor: theme.palette.text.secondary
  }
}));