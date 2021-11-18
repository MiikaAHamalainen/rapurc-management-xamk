import { Add, Delete } from "@mui/icons-material";
import { Box, Hidden, List, MenuItem, Paper, TextField, Typography, useMediaQuery } from "@mui/material";
import SurveyItem from "components/layout-components/survey-item";
import StackLayout from "components/layouts/stack-layout";
import strings from "localization/strings";
import React from "react";
import { ControlsContainer, FilterRoot, SurveyButton, SearchBar } from "styled/screens/surveys-screen";
import theme from "theme";
import WhiteOutlinedInput from "../../styled/generic/inputs";
import { deleteSurvey, fetchSurveys } from "features/surveys-slice";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import { useNavigate } from "react-router-dom";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { selectKeycloak } from "features/auth-slice";
import Api from "api";
import { SurveyWithInfo } from "types";
import SurveyUtils from "utils/survey";
import GenericDialog from "components/generic/generic-dialog";

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
  const [ deletingSurvey, setDeletingSurvey ] = React.useState(false);
  const [ selectedSurveyIds, setSelectedSurveyIds ] = React.useState<string[]>([]);

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
   * Fetches and returns building with given survey ID
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
      * Fetches and returns owner with given survey ID
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
   * Loads component data
   */
  const loadData = async () => {
    setLoading(true);
    const surveys = await listSurveys();

    const surveyWithInfoArray: SurveyWithInfo[] = [];

    await Promise.all(
      await surveys.map(async survey => {
        const surveyBuilding = await fetchBuilding(survey.id);
        const surveyOwner = await fetchOwner(survey.id);

        const surveyWithInfoParsed = SurveyUtils.parseToSurveyWithInfo(survey, surveyBuilding, surveyOwner);
        surveyWithInfoParsed && surveyWithInfoArray.push(surveyWithInfoParsed);
      })
    );

    setSurveysWithInfo(surveyWithInfoArray);
    setLoading(false);
  };

  /**
   * Effect that loads component data
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
   * Event handler for survey table row click
   *
   * @param params row params
   */
  const onSurveyTableRowClick = (params: GridRowParams) => {
    params.id && navigate(`/surveys/${params.id}/owner`);
  };

  /**
   * Event handler for mobile view delete survey click
   *
   * @param surveyId survey id
   */
  const deleteSurveyButtonClick = (surveyId: string) => {
    setSelectedSurveyIds([ surveyId ]);
    setDeletingSurvey(true);
  };
  
  /**
   * Event handler for delete owner
   */
  const deleteOwner = async (surveyId?: string) => {
    const ownerId = surveysWithInfo.find(surveyWithInfo => surveyId === surveyWithInfo.id)?.ownerId;

    if (!surveyId || !keycloak?.token || !ownerId) {
      return;
    }

    try {
      await Api.getOwnersApi(keycloak.token).deleteOwnerInformation({
        surveyId: surveyId,
        ownerId: ownerId
      });
    } catch (error) {
      errorContext.setError(strings.errorHandling.owners.delete, error);
    }
  };

  /**
   * Event handler for delete building
   */
  const deleteBuilding = async (surveyId?: string) => {
    const buildingId = surveysWithInfo.find(surveyWithInfo => surveyId === surveyWithInfo.id)?.buildingId;

    if (!surveyId || !keycloak?.token || !buildingId) {
      return;
    }

    try {
      await Api.getBuildingsApi(keycloak.token).deleteBuilding({
        surveyId: surveyId,
        buildingId: buildingId
      });
    } catch (error) {
      errorContext.setError(strings.errorHandling.buildings.delete, error);
    }
  };

  /**
   * Event handler for delete survey confirm
   */
  const onDeleteSurveyConfirm = async () => {
    try {
      await selectedSurveyIds.forEach(surveyId => {
        deleteBuilding(surveyId);
        deleteOwner(surveyId);
        dispatch(deleteSurvey(surveyId.toString())).unwrap();
      });
    } catch (error) {
      errorContext.setError(strings.errorHandling.surveys.delete, error);
    }

    loadData();
    setSelectedSurveyIds([]);
    setDeletingSurvey(false);
  };

  /**
   * Renders delete survey dialog
   */
  const renderDeleteSurveyDialog = () => (
    <GenericDialog
      error={ false }
      open={ deletingSurvey }
      onClose={ () => setDeletingSurvey(false) }
      onCancel={ () => setDeletingSurvey(false) }
      onConfirm={ onDeleteSurveyConfirm }
      title={ strings.surveysScreen.deleteSurveysDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography>
        { strings.surveysScreen.deleteSurveysDialog.text }
      </Typography>
    </GenericDialog>
  );

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
          fullWidth={ isMobile }
          label={ strings.surveysScreen.address }
          value={ addressFilter }
          onChange={ event => setAddressFilter(event.target.value) }
          size={ isMobile ? "medium" : "small" }
        />
        <ControlsContainer direction="row" spacing={ 2 }>
          <WhiteOutlinedInput
            fullWidth={ isMobile }
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
          <Box
            display="flex"
            alignItems="stretch"
          >
            <Hidden lgDown>
              <SurveyButton
                disabled={ !selectedSurveyIds.length }
                variant="contained"
                color="error"
                startIcon={ <Delete/> }
                onClick={ () => setDeletingSurvey(true) }
                sx={{ mr: 2 }}
              >
                { strings.generic.delete }
              </SurveyButton>
            </Hidden>
            <SurveyButton
              variant="contained"
              color="secondary"
              startIcon={ <Add/> }
              onClick={ () => navigate("/new-survey") }
            >
              { strings.surveysScreen.newSurvey }
            </SurveyButton>
          </Box>
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
      >
        <SurveyButton
          variant="outlined"
          color="primary"
          onClick={ () => deleteSurveyButtonClick(surveyWithInfo.id) }
        >
          <Typography color={ theme.palette.primary.main }>
            { strings.generic.delete }
          </Typography>
        </SurveyButton>
      </SurveyItem>
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
          checkboxSelection
          autoHeight
          loading={ loading }
          rows={ surveysWithInfo }
          columns={ columns }
          pageSize={ 10 }
          disableSelectionOnClick
          onRowClick={ onSurveyTableRowClick }
          onSelectionModelChange={ selectedIds => setSelectedSurveyIds(selectedIds as string[]) }
        />
      </Paper>
    );
  };

  return (
    <>
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
      { renderDeleteSurveyDialog() }
    </>
  );
};

export default SurveysScreen;