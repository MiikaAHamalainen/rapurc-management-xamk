import { FileCopy } from "@mui/icons-material";
import { Stack, Typography, Hidden, CircularProgress } from "@mui/material";
import { Attachment } from "generated/client";
import * as React from "react";
import { AttachmentContainer } from "styled/screens/surveys-screen";

/**
 * Component properties
 */
interface Props {
  loading?: boolean;
  attachment: Attachment;
  rightControl?: JSX.Element;
  onClick?: () => void;
}

/**
 * Attachment card component
 *
 * @param props component properties
 */
const AttachmentCard: React.FC<Props> = ({
  loading,
  attachment,
  onClick,
  rightControl
}) => {
  /**
   * Component render
   */
  return (
    <AttachmentContainer
      direction="row"
      justifyContent="space-between"
      onClick={ onClick }
      sx={{ backgroundColor: "#fff" }}
    >
      <Stack
        direction="row"
        spacing={ 3 }
      >
        <Hidden lgDown>
          <FileCopy htmlColor="rgba(0,0,0,0.54)"/>
        </Hidden>
        <Typography>
          { attachment.name }
        </Typography>
      </Stack>
      { loading ? <CircularProgress/> : rightControl }
    </AttachmentContainer>
  );
};

export default AttachmentCard;