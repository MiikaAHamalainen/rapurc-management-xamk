import { Button, CircularProgress, Hidden, Paper, Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import Api from "api";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import StackLayout from "components/layouts/stack-layout";
import { selectKeycloak } from "features/auth-slice";
import { createSurvey } from "features/surveys-slice";
import { Building, OwnerInformation } from "generated/client";
import strings from "localization/strings";
import React from "react";
import { useNavigate } from "react-router-dom";
import { CreateManuallyButton, FilterRoot, SearchContainer } from "styled/screens/new-survey-screen";
import theme from "theme";

/**
 * New survey screen component
 */
const NewSurveyScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const keycloak = useAppSelector(selectKeycloak);
  const errorContext = React.useContext(ErrorContext);
  const [ loading, setLoading ] = React.useState(false);

  /**
   * Check if viewport is mobile size
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  /**
   * Create new owner information
   * 
   * @param surveyId survey id
   */
  const createOwnerInformation = async (surveyId?: string) => {
    if (!keycloak?.token || !surveyId) {
      return;
    }

    try {
      const newOwner: OwnerInformation = {
        surveyId: surveyId,
        metadata: {}
      };
      await Api.getOwnersApi(keycloak.token).createOwnerInformation({
        surveyId: surveyId,
        ownerInformation: newOwner
      });
    } catch (error) {
      errorContext.setError(strings.errorHandling.owners.create, error);
    }
  };

  /**
   * Create new owner information
   * 
   * @param surveyId survey id
   */
  const createBuilding = async (surveyId?: string) => {
    if (!keycloak?.token || !surveyId) {
      return;
    }

    try {
      const newBuilding: Building = {
        surveyId: surveyId,
        metadata: {}
      };
      await Api.getBuildingsApi(keycloak.token).createBuilding({
        surveyId: surveyId,
        building: newBuilding
      });
    } catch (error) {
      errorContext.setError(strings.errorHandling.buildings.create, error);
    }
  };

  /**
   * Create survey manually
   */
  const createSurveyManually = async () => {
    setLoading(true);

    try {
      const { id } = await dispatch(createSurvey()).unwrap();
      await createOwnerInformation(id);
      await createBuilding(id);
      navigate(`/surveys/${id}/owner`);
    } catch (error) {
      errorContext.setError(strings.errorHandling.surveys.create, error);
    }
  };

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
            onClick={ () => createSurveyManually() }
          >
            { strings.newSurveyScreen.createManually }
          </CreateManuallyButton>
        </Stack>
      </SearchContainer>
    </FilterRoot>
  );

  /**
   * Render building list
   */
  const renderBuildingList = () => (
    <Paper sx={{ p: 2 }}>
      <Typography>{ strings.generic.notImplemented }</Typography>
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

  /**
   * Renders content
   */
  const renderContent = () => {
    if (loading) {
      return <CircularProgress color="primary" size={ 60 }/>;
    }

    return (
      <>
        <Hidden lgUp>
          { renderBuildingList() }
        </Hidden>
        <Hidden lgDown>
          { renderBuildingDataTable() }
        </Hidden>
      </>
    );
  };

  return (
    <StackLayout
      title={ strings.newSurveyScreen.title }
      headerContent={ renderListFilter() }
      back
    >
      { renderContent() }
    </StackLayout>
  );
};

export default NewSurveyScreen;