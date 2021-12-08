import { Add, Delete } from "@mui/icons-material";
import { Box, Hidden, List, MenuItem, Paper, Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import Api from "api";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import GenericDialog from "components/generic/generic-dialog";
import SurveyItem from "components/layout-components/survey-item";
import StackLayout from "components/layouts/stack-layout";
import { selectKeycloak } from "features/auth-slice";
import { deleteSurvey, fetchSurveys } from "features/surveys-slice";
import strings from "localization/strings";
import React from "react";
import { useNavigate } from "react-router-dom";
import { ControlsContainer, FilterRoot, SearchBar, SurveyButton } from "styled/screens/surveys-screen";
import theme from "theme";
import { SurveyWithInfo } from "types";
import LocalizationUtils from "utils/localization-utils";
import SurveyUtils from "utils/survey";
import WhiteOutlinedInput from "../../styled/generic/inputs";
import { SurveyStatus } from "../../generated/client/models/SurveyStatus";

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
   * Lists building types
   */
  const listBuildingTypes = async () => {
    if (!keycloak?.token) {
      return;
    }

    try {
      return await Api.getBuildingTypesApi(keycloak.token).listBuildingTypes();
    } catch (error) {
      errorContext.setError(strings.errorHandling.buildingTypes.list, error);
    }
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
    const buildingTypes = await listBuildingTypes();

    const surveyWithInfoArray: SurveyWithInfo[] = await Promise.all(
      surveys.map(async survey => {
        const building = await fetchBuilding(survey.id);
        const owner = await fetchOwner(survey.id);

        return SurveyUtils.parseToSurveyWithInfo(
          survey,
          building,
          buildingTypes?.find(type => type.id === building?.buildingTypeId),
          owner
        );
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
   * Event handler for delete survey confirm
   */
  const onDeleteSurveyConfirm = async () => {
    try {
      await selectedSurveyIds.forEach(surveyId => {
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
          disabled
          fullWidth={ isMobile }
          label={ strings.surveysScreen.address }
          value={ addressFilter }
          onChange={ event => setAddressFilter(event.target.value) }
          size={ isMobile ? "medium" : "small" }
        />
        <ControlsContainer direction="row" spacing={ 2 }>
          <WhiteOutlinedInput
            disabled
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
      >
        <Stack spacing={ 2 } direction="row">
          <SurveyButton
            color="primary"
            onClick={ () => navigate(`/surveys/${surveyWithInfo.id}/owner`) }
          >
            { strings.generic.open }
          </SurveyButton>
          <SurveyButton
            variant="outlined"
            color="primary"
            onClick={ () => deleteSurveyButtonClick(surveyWithInfo.id) }
          >
            { strings.generic.delete }
          </SurveyButton>
        </Stack>
      </SurveyItem>
    )
  );

  /**
   * Render survey list
   */
  const renderSurveyList = () => (
    <List>
      { renderSurveyListItems() }
    </List>
  );

  /**
   * Render survey data table for desktop
   */
  const renderSurveyDataTable = () => {
    const columns: GridColDef[] = [
      {
        field: "status",
        headerName: strings.surveysScreen.dataGridColumns.status,
        width: 150,
        valueFormatter: ({ value }) => LocalizationUtils.getLocalizedSurveyStatus(value as SurveyStatus)
      },
      {
        field: "buildingId",
        headerName: strings.surveysScreen.dataGridColumns.buildingId,
        width: 200
      },
      {
        field: "classificationCode",
        headerName: strings.surveysScreen.dataGridColumns.classificationCode,
        flex: 1
      },
      {
        field: "ownerName",
        headerName: strings.surveysScreen.dataGridColumns.ownerName,
        flex: 1
      },
      {
        field: "city",
        headerName: strings.surveysScreen.dataGridColumns.city,
        width: 200
      },
      {
        field: "streetAddress",
        headerName: strings.surveysScreen.dataGridColumns.streetAddress,
        flex: 1
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