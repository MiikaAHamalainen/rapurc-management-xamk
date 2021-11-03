import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, List, Typography } from "@mui/material";
import NavigationItem from "components/layout-components/navigation-item";
import SidePanelLayout from "components/layouts/side-panel-layout";
import strings from "localization/strings";
import React from "react";

/**
 * Admin screen component
 */
const AdminScreen: React.FC = () => {
  /**
   * Side navigation content
   */
  const renderSideNavigation = () => (
    <List>
      <Accordion defaultExpanded={ true } disableGutters>
        <AccordionSummary expandIcon={ <ExpandMore/> }>
          <Typography>
            { strings.adminScreen.navigation.dropdownSettings.title }
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <NavigationItem
            title={ strings.adminScreen.navigation.dropdownSettings.reusableMaterials }
            selected={ true }
            onClick={ () => {} }
          />
          <NavigationItem
            title={ strings.adminScreen.navigation.dropdownSettings.wasteMaterials }
            selected={ false }
            onClick={ () => {} }
          />
          <NavigationItem
            title={ strings.adminScreen.navigation.dropdownSettings.postProcessing }
            selected={ false }
            onClick={ () => {} }
          />
          <NavigationItem
            title={ strings.adminScreen.navigation.dropdownSettings.hazardousMaterials }
            selected={ false }
            onClick={ () => {} }
          />
          <NavigationItem
            title={ strings.adminScreen.navigation.dropdownSettings.hazardousMaterialsAdditionalInfo }
            selected={ false }
            onClick={ () => {} }
          />
        </AccordionDetails>
      </Accordion>
    </List>
  );

  return (
    <SidePanelLayout
      title={ strings.adminScreen.title }
      sidePanelContent={ renderSideNavigation() }
      back
    >
      <Typography>
        { strings.generic.notImplemented }
      </Typography>
    </SidePanelLayout>
  );
};

export default AdminScreen;