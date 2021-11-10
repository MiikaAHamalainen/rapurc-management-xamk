import { Button, Hidden, List, Paper, Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import SurveyItem from "components/layout-components/survey-item";
import StackLayout from "components/layouts/stack-layout";
import strings from "localization/strings";
import React from "react";
import { useHistory } from "react-router-dom";
import { CreateManuallyButton, FilterRoot, SearchContainer } from "styled/screens/new-survey-screen";
import theme from "theme";

/**
 * New survey screen component
 */
const NewSurveyScreen: React.FC = () => {
  const history = useHistory();

  /**
   * Check if viewport is mobile size
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  /**
   * Render list filter
   */
  const renderListFilter = () => (
    <FilterRoot spacing={ 2 }>
      <Typography variant="body2">
        { strings.surveysScreen.description }
      </Typography>
      <SearchContainer
        direction={{
          xs: "column",
          md: "row"
        }}
        spacing={ 2 }
      >
        <Stack
          flex={ 1 }
          direction={{
            xs: "column",
            md: "row"
          }}
          spacing={ 2 }
        >
          <TextField
            size={ isMobile ? "medium" : "small" }
            label={ strings.newSurveyScreen.address }
          />
          <TextField
            size={ isMobile ? "medium" : "small" }
            label={ strings.newSurveyScreen.propertyId }
          />
          <TextField
            size={ isMobile ? "medium" : "small" }
            label={ strings.newSurveyScreen.buildingId }
          />
        </Stack>
        <Stack
          direction={{
            xs: "column",
            md: "row"
          }}
          spacing={ 2 }
        >
          <Button
            size={ isMobile ? "medium" : "small" }
            disabled={ true }
          >
            { strings.newSurveyScreen.createSurvey }
          </Button>
          <CreateManuallyButton
            size={ isMobile ? "medium" : "small" }
            variant="outlined"
            onClick={ () => history.push("/survey")}
          >
            { strings.newSurveyScreen.createManually }
          </CreateManuallyButton>
        </Stack>
      </SearchContainer>
    </FilterRoot>
  );

  /**
   * Render building item
   */
  const renderBuildingItem = () => (
    <SurveyItem
      title="Otsikko"
      subtitle="Alaotsikko"
      onClick={ () => history.push("/survey") }
    />
  );

  /**
   * Render building list
   */
  const renderBuildingList = () => (
    <Paper>
      <List>
        { renderBuildingItem() }
      </List>
    </Paper>
  );

  /**
   * Render building data table for desktop
   */
  const renderBuildingDataTable = () => (
    <Paper sx={{ p: 2 }}>
      <Typography>{ strings.generic.notImplemented }</Typography>
    </Paper>
  );

  return (
    <StackLayout
      title={ strings.newSurveyScreen.title }
      headerContent={ renderListFilter() }
      back
    >
      <Hidden lgUp>
        { renderBuildingList() }
      </Hidden>
      <Hidden lgDown>
        { renderBuildingDataTable() }
      </Hidden>
    </StackLayout>
  );
};

export default NewSurveyScreen;