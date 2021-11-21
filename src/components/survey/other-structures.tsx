import * as React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import strings from "localization/strings";
import { Add } from "@mui/icons-material";

/**
 * Component for other structures information
 */
const OtherStructures: React.FC = () => {
  return (
    <Stack spacing={ 2 } sx={{ flex: 1 }}>
      <Typography variant="h2">
        { strings.survey.otherStructures.title }
      </Typography>
      <Typography>
        { strings.survey.otherStructures.description }
      </Typography>
      <Box>
        <Button
          color="secondary"
          startIcon={<Add/>}
        >
          { strings.survey.otherStructures.add }
        </Button>
      </Box>
    </Stack>
  );
};

export default OtherStructures;