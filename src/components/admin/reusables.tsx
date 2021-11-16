import { Delete } from "@mui/icons-material";
import { Button, IconButton, List, ListItemSecondaryAction, Stack, Typography } from "@mui/material";
import strings from "localization/strings";
import * as React from "react";
import { MaterialItem, MaterialText } from "../../styled/layout-components/material-item";

/**
 * Component for reusable materials dropdown menu editor
 */
const Reusables: React.FC = () => {
  /**
   * Item for reusable material
   * 
   * @param name 
   * @param code 
   * @returns reusable material item
   */
  const reusableMaterialItem = (name: string) => (
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
      { reusableMaterialItem("Betonielementti") }
    </List>
  );

  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h2">
          { strings.adminScreen.navigation.dropdownSettings.reusableMaterials }
        </Typography>
        <Button color="secondary">
          { strings.generic.addNew }
        </Button>
      </Stack>
      { renderList() }
    </>
  );
};

export default Reusables;