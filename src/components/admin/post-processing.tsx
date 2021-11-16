import { Delete } from "@mui/icons-material";
import { Button, IconButton, List, ListItemSecondaryAction, Stack, Typography } from "@mui/material";
import strings from "localization/strings";
import * as React from "react";
import { MaterialItem, MaterialText } from "../../styled/layout-components/material-item";

/**
 * Component for post processing dropdown menu editor
 */
const PostProcessing: React.FC = () => {
  /**
   * Item for post processing option
   * 
   * @param name 
   * @param code 
   * @returns post processing item
   */
  const postProcessingItem = (name: string) => (
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
   * Renders list of post processing options
   */
  const renderList = () => (
    <List sx={{ pt: 4 }}>
      { postProcessingItem("Maantäyttö") }
    </List>
  );

  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h2">
          { strings.adminScreen.navigation.dropdownSettings.postProcessing }
        </Typography>
        <Button color="secondary">
          { strings.generic.addNew }
        </Button>
      </Stack>
      { renderList() }
    </>
  );
};

export default PostProcessing;