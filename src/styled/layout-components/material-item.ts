import { ListItemText, ListItemButton } from "@mui/material";
import { styled } from "@mui/material/styles";

/**
 * Styled material item
 */
export const MaterialItem = styled(ListItemButton, {
  label: "material-item"
})(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderBottom: "1px solid rgba(0,0,0,0.1)"
}));

export const MaterialText = styled(ListItemText, {
  label: "material-item-text"
})(({ theme }) => ({
  color: theme.palette.text.primary
}));