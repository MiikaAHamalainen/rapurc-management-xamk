import { Stack, TextField, Typography } from "@mui/material";
import strings from "localization/strings";
import * as React from "react";

/**
 * Component for survey information
 */
const SurveyInformation: React.FC = () => {
  return (
    <Stack spacing={ 2 } sx={{ flex: 1 }}>
      <Typography variant="h2">
        { strings.survey.info.title }
      </Typography>
      <Typography variant="h3">
        { strings.survey.info.demolitionInfo }
      </Typography>
      <TextField
        select
        label={ strings.survey.info.demolitionScope }
      />
      <Stack direction="row" spacing={ 2 }>
        <TextField label={ strings.survey.info.startDate }/>
        <TextField label={ strings.survey.info.endDate }/>
      </Stack>
      <Typography variant="h3">
        { strings.survey.info.surveyors }
      </Typography>
    </Stack>
  );
};

export default SurveyInformation;