import { Apartment, Attachment, ChangeCircle, Delete, Engineering, NoteAdd, PersonOutlined, Summarize, WarningAmber } from "@mui/icons-material";
import { Divider, List, MenuItem, TextField, Typography } from "@mui/material";
import NavigationItem from "components/layout-components/navigation-item";
import SidePanelLayout from "components/layouts/side-panel-layout";
import strings from "localization/strings";
import React from "react";

/**
 * Survey screen component
 */
const SurveyScreen: React.FC = () => {
  /**
   * Side navigation content
   */
  const renderSideNavigation = () => (
    <List>
      <NavigationItem
        icon={ <PersonOutlined/> }
        title={ strings.surveyScreen.navigation.owner }
        selected
      />
      <NavigationItem
        icon={ <Apartment/> }
        title={ strings.surveyScreen.navigation.building }
      />
      <NavigationItem
        icon={ <NoteAdd/> }
        title={ strings.surveyScreen.navigation.others }
      />
      <NavigationItem
        icon={ <Engineering/> }
        title={ strings.surveyScreen.navigation.survey }
      />
      <NavigationItem
        icon={ <ChangeCircle/> }
        title={ strings.surveyScreen.navigation.reusables }
      />
      <NavigationItem
        icon={ <Delete/> }
        title={ strings.surveyScreen.navigation.waste }
      />
      <NavigationItem
        icon={ <WarningAmber/> }
        title={ strings.surveyScreen.navigation.hazardous }
      />
      <Divider/>
      <NavigationItem
        icon={ <Attachment/> }
        title={ strings.surveyScreen.navigation.attatchments }
      />
      <NavigationItem
        icon={ <Summarize/> }
        title={ strings.surveyScreen.navigation.summary }
      />
    </List>
  );

  /**
   * Render survey status select input
   */
  const renderStatusSelect = () => (
    <TextField
      color="secondary"
      variant="standard"
      select
      value={ 1 }
      label={ strings.surveyScreen.status }
    >
      <MenuItem value={ 1 }>
        { strings.surveyScreen.incomplete }
      </MenuItem>
      <MenuItem value={ 2 }>
        { strings.surveyScreen.ready }
      </MenuItem>
    </TextField>
  );

  /**
   * Component render
   */
  return (
    <SidePanelLayout
      title={ strings.surveyScreen.title }
      sidePanelContent={ renderSideNavigation() }
      headerControls={ renderStatusSelect() }
      back
    >
      <Typography>
        { strings.generic.notImplemented }
      </Typography>
    </SidePanelLayout>
  );
};

export default SurveyScreen;