import { Delete } from "@mui/icons-material";
import { Button, IconButton, List, ListItemSecondaryAction, Stack, Typography } from "@mui/material";
import strings from "localization/strings";
import * as React from "react";
import { MaterialItem, MaterialText } from "../../styled/layout-components/material-item";

/**
 * Component for hazardous material info dropdown menu editor
 */
const HazardousMaterialsInfo: React.FC = () => {
  /**
   * Item for hazardous material info
   * 
   * @param name 
   * @param code 
   * @returns hazardous material info item
   */
  const hazardousMaterialInfoItem = (name: string) => (
    <MaterialItem>
      <MaterialText primary={ name }/>
      <ListItemSecondaryAction>
        <IconButton>
          <Delete/>
        </IconButton>
      </ListItemSecondaryAction>
    </MaterialItem>
  );

  /**
   * Renders list of materials
   */
  const renderList = () => (
    <List sx={{ pt: 4 }}>
      { hazardousMaterialInfoItem("Bitumilla käsitelty betoni") }
    </List>
  );

  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h2">
          { strings.adminScreen.navigation.dropdownSettings.hazardousMaterialsAdditionalInfo }
        </Typography>
        <Button color="secondary">
          { strings.generic.addNew }
        </Button>
      </Stack>
      { renderList() }
    </>
  );
};

export default HazardousMaterialsInfo;