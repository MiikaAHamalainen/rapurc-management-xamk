import { Add } from "@mui/icons-material";
import { Hidden, List, MenuItem, Paper, TextField, Typography, useMediaQuery } from "@mui/material";
import SurveyItem from "components/layout-components/survey-item";
import StackLayout from "components/layouts/stack-layout";
import strings from "localization/strings";
import React from "react";
import { useHistory } from "react-router-dom";
import { ControlsContainer, FilterRoot, NewSurveyButton, SearchBar } from "styled/screens/surveys-screen";
import theme from "theme";
import WhiteOutlinedInput from "../../styled/generic/inputs";

/**
 * Surveys screen component
 */
const SurveysScreen: React.FC = () => {
  const [filter, setFilter] = React.useState("showAll");
  const history = useHistory();

  /**
   * Check if viewport is mobile size
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  /**
   * Select input handler
   * @param event 
   */
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };
  /**
   * Render header content
   */
  const renderSurveyListFilter = () => (
    <FilterRoot spacing={ 2 }>
      <Typography variant="body2">
        { strings.surveysScreen.description }
      </Typography>
      <SearchBar>
        <TextField
          label={ strings.surveysScreen.address }
          size={ isMobile ? "medium" : "small" }
        />
        <ControlsContainer direction="row" spacing={ 2 }>
          <WhiteOutlinedInput
            color="secondary"
            select
            size={ isMobile ? "medium" : "small" }
            variant="outlined"
            id="filter"
            value={ filter }
            onChange={ handleChange }
            label={ strings.surveysScreen.filter }
          >
            <MenuItem value="showAll">
              { strings.surveysScreen.showAll }
            </MenuItem>
            <MenuItem value="showMine">
              { strings.surveysScreen.showMine }
            </MenuItem>
          </WhiteOutlinedInput>
          <NewSurveyButton
            variant="contained"
            color="secondary"
            startIcon={ <Add/> }
          >
            { strings.surveysScreen.newSurvey }
          </NewSurveyButton>
        </ControlsContainer>
      </SearchBar>
    </FilterRoot>
  );

  /**
   * Render survey list item
   * 
   */
  const renderSurveyListItem = () => (
    <SurveyItem
      title="Otsikko"
      subtitle="Alaotsikko"
      onClick={ () => history.push("/survey") }
    />
  );

  /**
   * Render survey list
   */
  const renderSurveyList = () => (
    <Paper>
      <List>
        { renderSurveyListItem() }
      </List>
    </Paper>
  );

  /**
   * Render survey data table for desktop
   */
  const renderSurveyDataTable = () => (
    <Paper sx={{ p: 2 }}>
      <Typography>{ strings.generic.notImplemented }</Typography>
    </Paper>
  );

  return (
    <StackLayout
      title={ strings.surveysScreen.title }
      headerContent={ renderSurveyListFilter() }
    >
      <Hidden lgUp>
        { renderSurveyList() }
      </Hidden>
      <Hidden lgDown>
        { renderSurveyDataTable() }
      </Hidden>
    </StackLayout>
  );
};

export default SurveysScreen;