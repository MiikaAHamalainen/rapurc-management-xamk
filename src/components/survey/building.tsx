import * as React from "react";
import { MenuItem, Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import strings from "localization/strings";
import theme from "theme";

/**
 * Component for building information
 */
const Building: React.FC = () => {
  /**
   * Check if viewport is mobile size
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  return (
    <Stack direction={ isMobile ? "column" : "row" } spacing={ 2 }>
      <Stack spacing={ 2 } sx={{ flex: 1 }}>
        <Typography variant="h2">
          { strings.survey.building.title }
        </Typography>
        <TextField label={ strings.survey.building.propertyID }/>
        <TextField label={ strings.survey.building.buildingID }/>
        <TextField select label={ strings.survey.building.buildingClass }>
          <MenuItem>{ strings.generic.notImplemented }</MenuItem>
        </TextField>
        <TextField label={ strings.survey.building.year }/>
        <TextField label={ strings.survey.building.area }/>
        <TextField label={ strings.survey.building.volume }/>
        <TextField label={ strings.survey.building.floors }/>
        <TextField label={ strings.survey.building.basementFloors }/>
        <TextField label={ strings.survey.building.foundationMaterial }/>
        <TextField label={ strings.survey.building.supportingStructure }/>
        <TextField label={ strings.survey.building.façadeMaterial }/>
        <TextField label={ strings.survey.building.roofStructure }/>
      </Stack>
      <Stack spacing={ 2 } sx={{ flex: 1 }}>
        <Typography variant="h3" sx={{ marginBottom: 0.5 }}>
          { strings.survey.building.address }
        </Typography>
        <TextField label={ strings.survey.building.street }/>
        <TextField label={ strings.survey.building.city }/>
        <TextField label={ strings.survey.building.postalCode }/>
      </Stack>
    </Stack>
  );
};

export default Building;