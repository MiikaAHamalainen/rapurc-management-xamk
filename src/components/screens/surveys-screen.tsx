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
import { useAppDispatch, useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { selectKeycloak } from "features/auth-slice";
import Api from "api";
import { SurveyWithInfo } from "types";
import SurveyUtils from "utils/survey";

/**
 * Surveys screen component
 */
const SurveysScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const keycloak = useAppSelector(selectKeycloak);
  const errorContext = React.useContext(ErrorContext);
  const [ filter, setFilter ] = React.useState("showAll");
  const [ addressFilter, setAddressFilter ] = React.useState("");
  const [ surveysWithInfo, setSurveysWithInfo ] = React.useState<SurveyWithInfo[]>([]);
  const [ loading, setLoading ] = React.useState(false);

  /**
   * Lists surveys
   */
  const listSurveys = async () => {
    try {
      return await dispatch(fetchSurveys()).unwrap();
    } catch (error) {
      errorContext.setError(strings.errorHandling.surveys.list, error);
    }
    return [];
  };

  /**
   * Lists buildings
   *
   * @param surveyId survey id
   */
  const fetchBuilding = async (surveyId?: string) => {
    if (!keycloak?.token || !surveyId) {
      return;
    }

    try {
      const buildings = await Api.getBuildingsApi(keycloak?.token).listBuildings({
        surveyId: surveyId
      });

      return buildings[0];
    } catch (error) {
      errorContext.setError(strings.errorHandling.buildings.list, error);
    }
  };

  /**
   * Lists owners
   * 
   * @param surveyId survey id
   */
  const fetchOwner = async (surveyId?: string) => {
    if (!keycloak?.token || !surveyId) {
      return;
    }

    try {
      const owners = await Api.getOwnersApi(keycloak?.token).listOwnerInformation({
        surveyId: surveyId
      });

      return owners[0];
    } catch (error) {
      errorContext.setError(strings.errorHandling.owners.list, error);
    }
  };

  /**
   * Load data
   */
  const loadData = async () => {
    setLoading(true);
    const surveys = await listSurveys();

    const surveyWithInfoArray: SurveyWithInfo[] = [];

    await Promise.all(
      await surveys.map(async survey => {
        const surveyBuilding = await fetchBuilding(survey.id);
        const surveyOwner = await fetchOwner(survey.id);

        const surveyWithInfoParsed = SurveyUtils.surveyWithInfoParser(survey, surveyBuilding, surveyOwner);
        surveyWithInfoParsed && surveyWithInfoArray.push(surveyWithInfoParsed);
      })
    );

    setSurveysWithInfo(surveyWithInfoArray);
    setLoading(false);
  };

  /**
   * Effect for listing surveys
   */
  React.useEffect(() => {
    loadData();
  }, []);

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
          value={ addressFilter }
          onChange={ event => setAddressFilter(event.target.value) }
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
    surveysWithInfo.map(surveyWithInfo =>
      <SurveyItem
        title={ surveyWithInfo.ownerName || "" }
        subtitle={ surveyWithInfo.streetAddress || "" }
        onClick={ () => navigate(`/surveys/${surveyWithInfo.id}/owner`) }
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
        field: "buildingId",
        headerName: strings.surveysScreen.dataGridColumns.buildingId,
        width: 360
      },
      {
        field: "classificationCode",
        headerName: strings.surveysScreen.dataGridColumns.classificationCode,
        width: 360
      },
      {
        field: "ownerName",
        headerName: strings.surveysScreen.dataGridColumns.ownerName,
        width: 360
      },
      {
        field: "city",
        headerName: strings.surveysScreen.dataGridColumns.city,
        width: 360
      },
      {
        field: "streetAddress",
        headerName: strings.surveysScreen.dataGridColumns.streetAddress,
        width: 360
      }
    ];
  
    return (
      <Paper>
        <DataGrid
          loading={ loading }
          autoHeight
          rows={ surveysWithInfo }
          columns={ columns }
          pageSize={ 10 }
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