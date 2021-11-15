import { Add } from "@mui/icons-material";
import { Hidden, List, MenuItem, Paper, TextField, Typography, useMediaQuery } from "@mui/material";
import SurveyItem from "components/layout-components/survey-item";
import StackLayout from "components/layouts/stack-layout";
import strings from "localization/strings";
import React from "react";
import { ControlsContainer, FilterRoot, NewSurveyButton, SearchBar } from "styled/screens/surveys-screen";
import theme from "theme";
import WhiteOutlinedInput from "../../styled/generic/inputs";
import { fetchSurveys } from "features/surveys-slice";
import { useAppDispatch } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import { Survey } from "generated/client";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";

/**
 * Surveys screen component
 */
const SurveysScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const errorContext = React.useContext(ErrorContext);

  const [ filter, setFilter ] = React.useState("showAll");
  const [ surveys, setSurveys ] = React.useState<Survey[]>([]);

  /**
   * Lists surveys
   */
  const listSurveys = async () => {
    try {
      const allSurveys = await dispatch(fetchSurveys()).unwrap();
      setSurveys(allSurveys);
    } catch (error) {
      errorContext.setError(strings.errorHandling.surveys.list, error);
    }
  };

  /**
   * Effect for listing surveys
   */
  React.useEffect(() => { listSurveys(); }, []);

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
   * Select input handler
   * @param event 
   */
  const onSurveyTableRowClick = (params: GridRowParams) => {
    params.id && navigate(`/surveys/${params.id}/owner`);
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
            onClick={ () => navigate("/new-survey") }
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
  const renderSurveyListItems = () => (
    surveys.map(survey =>
      <SurveyItem
        title={ survey.status }
        subtitle={ moment(survey.startDate).format("DD.MM.YYYY") }
        onClick={ () => navigate(`/surveys/${survey.id}/owner`) }
      />
    )
  );

  /**
   * Render survey list
   */
  const renderSurveyList = () => (
    <Paper>
      <List>
        { renderSurveyListItems() }
      </List>
    </Paper>
  );

  /**
   * Render survey data table for desktop
   */
  const renderSurveyDataTable = () => {
    const columns: GridColDef[] = [
      {
        field: "status",
        headerName: "status",
        width: 450
      }
    ];
  
    return (
      <Paper sx={{ height: 280 }}>
        <DataGrid
          rows={ surveys }
          columns={ columns }
          pageSize={ 3 }
          disableSelectionOnClick
          onRowClick={ onSurveyTableRowClick }
        />
      </Paper>
    );
  };

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