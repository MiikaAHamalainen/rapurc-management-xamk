import { styled, TextField } from "@mui/material";
/**
 * Styled white outlined input component
 */
const WhiteOutlinedInput = styled(TextField, {
  label: "inputs-white-outlined-input"
})(() => ({
  color: "rgba(255,255,255,0.8)",
  borderColor: "rgba(255,255,255,0.8)",
  "& .MuiOutlinedInput-notchedOutline": {
    color: "rgba(255,255,255,0.8)",
    borderColor: "rgba(255,255,255,0.8)",
    "& .Mui-focused": {
      color: "rgba(255,255,255,1)",
      borderColor: "rgba(255,255,255,1)"
    },
    "&:hover:not(.Mui-disabled)": {
      color: "rgba(255,255,255,1)",
      borderColor: "rgba(255,255,255,1)"
    }
  }
}));

export default WhiteOutlinedInput;