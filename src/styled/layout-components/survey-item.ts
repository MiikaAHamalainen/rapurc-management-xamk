import { Stack } from "@mui/material";
import { styled } from "@mui/material/styles";

/**
 * Styled survey item clickable title row
 */
const SurveyTitle = styled(Stack, {
  label: "survey-item-title"
})(({ theme }) => ({
  width: "100%",
  transition: "color 0.2s ease-out",
  "&:hover": {
    color: theme.palette.primary.dark
  }
}));

export default SurveyTitle;