import { ExpandMore } from "@mui/icons-material";
import { Accordion, AccordionDetails, AccordionSummary, List, Typography } from "@mui/material";
import NavigationItem from "components/layout-components/navigation-item";
import SidePanelLayout from "components/layouts/side-panel-layout";
import strings from "localization/strings";
import React from "react";
import AdminRoutes from "../admin/admin-routes";

/**
 * Admin screen component
 */
const AdminScreen: React.FC = () => {
  const { dropdownSettings } = strings.adminScreen.navigation;

  /**
   * Side navigation content
   */
  const renderSideNavigation = () => (
    <List>
      <Accordion defaultExpanded disableGutters>
        <AccordionSummary expandIcon={ <ExpandMore/> }>
          <Typography>
            { dropdownSettings.title }
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <NavigationItem title={ dropdownSettings.buildingTypes } to="buildingTypes"/>
          <NavigationItem title={ dropdownSettings.reusableMaterials } to="reusables"/>
          <NavigationItem title={ dropdownSettings.wasteMaterials } to="waste"/>
          <NavigationItem title={ dropdownSettings.wasteCategories } to="wasteCategories"/>
          <NavigationItem title={ dropdownSettings.postProcessing } to="postProcessing"/>
          <NavigationItem title={ dropdownSettings.hazardousMaterials } to="hazardousMaterials"/>
          <NavigationItem title={ dropdownSettings.hazardousMaterialsAdditionalInfo } to="hazardousMaterialsInfo"/>
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
      <AdminRoutes/>
    </SidePanelLayout>
  );
};

export default AdminScreen;