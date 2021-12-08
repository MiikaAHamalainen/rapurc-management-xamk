import { Print } from "@mui/icons-material";
import { Box, CircularProgress, Paper, Stack, Typography, useMediaQuery } from "@mui/material";
import Api from "api";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import { selectKeycloak } from "features/auth-slice";
import { selectSelectedSurvey } from "features/surveys-slice";
import { Building, BuildingType, OwnerInformation, Reusable, ReusableMaterial, Surveyor, Waste, WasteMaterial } from "generated/client";
import strings from "localization/strings";
import moment from "moment";
import * as React from "react";
import { SurveyButton } from "styled/screens/surveys-screen";
import theme from "theme";
import LocalizationUtils from "utils/localization-utils";

/**
 * Component for waste material materials
 */
const SummaryView: React.FC = () => {
  const keycloak = useAppSelector(selectKeycloak);
  const errorContext = React.useContext(ErrorContext);
  const selectedSurvey = useAppSelector(selectSelectedSurvey);
  const [ loading, setLoading ] = React.useState(false);
  const [ building, setBuilding ] = React.useState<Building>();
  const [ buildingTypes, setBuildingTypes ] = React.useState<BuildingType[]>();
  const [ ownerInformation, setOwnerInformation ] = React.useState<OwnerInformation>();
  const [ surveyReusables, setSurveyReusables ] = React.useState<Reusable[]>([]);
  const [ reusableMaterials, setReusableMaterials ] = React.useState<ReusableMaterial[]>([]);
  const [ wastes, setWastes ] = React.useState<Waste[]>([]);
  const [ wasteMaterials, setWasteMaterials ] = React.useState<WasteMaterial[]>([]);
  const [ surveyors, setSurveyors ] = React.useState<Surveyor[]>([]);

  /**
   * Fetch owner information array
   */
  const fetchOwnerInformation = async () => {
    if (!keycloak?.token || !selectedSurvey?.id) {
      return;
    }

    try {
      const fetchedOwnerInformationArray = await Api.getOwnersApi(keycloak.token).listOwnerInformation({
        surveyId: selectedSurvey.id
      });

      if (fetchedOwnerInformationArray.length !== 1) {
        return;
      }

      setOwnerInformation(fetchedOwnerInformationArray[0]);
    } catch (error) {
      errorContext.setError(strings.errorHandling.owners.create, error);
    }
  };

  /**
   * Fetch building
   */
  const fetchBuildingTypes = async () => {
    if (!keycloak?.token || !selectedSurvey?.id) {
      return;
    }

    try {
      const fetchedBuildingTypes = await Api.getBuildingTypesApi(keycloak.token).listBuildingTypes();

      setBuildingTypes(fetchedBuildingTypes);
    } catch (error) {
      errorContext.setError(strings.errorHandling.buildingTypes.list, error);
    }
  };

  /**
   * Create new owner information
   */
  const fetchBuilding = async () => {
    if (!keycloak?.token || !selectedSurvey?.id) {
      return;
    }

    try {
      const fetchedBuildings = await Api.getBuildingsApi(keycloak.token).listBuildings({
        surveyId: selectedSurvey.id
      });

      if (fetchedBuildings.length !== 1) {
        return;
      }

      setBuilding(fetchedBuildings[0]);
    } catch (error) {
      errorContext.setError(strings.errorHandling.buildings.list, error);
    }
  };

  /**
   * Fetch owner information array
   */
  const fetchSurveyReusables = async () => {
    if (!keycloak?.token || !selectedSurvey?.id) {
      return;
    }

    try {
      const fetchedReusables = await Api.getSurveyReusablesApi(keycloak.token).listSurveyReusables({ surveyId: selectedSurvey.id });
      setSurveyReusables(fetchedReusables);
    } catch (error) {
      errorContext.setError(strings.errorHandling.reusables.list, error);
    }
  };

  /**
   * Fetches list of reusable materials and building parts
   */
  const fetchReusableMaterials = async () => {
    if (!keycloak?.token) {
      return;
    }

    try {
      setReusableMaterials(await Api.getReusableMaterialApi(keycloak.token).listReusableMaterials());
    } catch (error) {
      errorContext.setError(strings.errorHandling.materials.list, error);
    }
  };

  /**
   * Fetch waste array
   */
  const fetchWastes = async () => {
    if (!keycloak?.token || !selectedSurvey?.id) {
      return;
    }

    try {
      setWastes(await Api.getWastesApi(keycloak.token).listSurveyWastes({ surveyId: selectedSurvey.id }));
    } catch (error) {
      errorContext.setError(strings.errorHandling.waste.list, error);
    }
  };

  /**
   * Fetches waste material array
   */
  const fetchWastesMaterials = async () => {
    if (!keycloak?.token) {
      return;
    }

    try {
      setWasteMaterials(await Api.getWasteMaterialApi(keycloak.token).listWasteMaterials());
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteMaterial.list, error);
    }
  };

  // TODO hazardous materials wastes

  /**
   * Fetch surveyor array
   */
  const fetchSurveyors = async () => {
    if (!keycloak?.token || !selectedSurvey?.id) {
      return;
    }

    setLoading(true);

    try {
      const fetchedSurveyors = await Api.getSurveyorsApi(keycloak.token).listSurveyors({ surveyId: selectedSurvey.id });
      setSurveyors(fetchedSurveyors);
    } catch (error) {
      errorContext.setError(strings.errorHandling.surveyors.list, error);
    }

    setLoading(false);
  };

  /**
   * Check if viewport is mobile size
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  /**
   * Create new owner information
   */
  const fetchData = async () => {
    setLoading(true);
    await fetchBuilding();
    await fetchOwnerInformation();
    await fetchSurveyReusables();
    await fetchReusableMaterials();
    await fetchWastes();
    await fetchWastesMaterials();
    await fetchSurveyors();
    setLoading(false);
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  /**
   * Render data title
   * 
   * @param title title
   */
  const renderDataTitle = (title: string) => (
    <Typography variant="subtitle2">
      { title }
    </Typography>
  );

  /**
   * Render data value
   * 
   * @param value value
   */
  const renderDataValue = (value?: string | number) => (
    <Typography variant="body2">
      { value || "/" }
    </Typography>
  );

  /**
   * Render data cell
   * 
   * @param title title
   * @param value value
   */
  const renderDataCell = (title: string, value?: string | number) => (
    <Stack
      direction="column"
      spacing={ 1 }
      marginBottom={ 2 }
    >
      { renderDataTitle(title) }
      { renderDataValue(value) }
    </Stack>
  );

  /**
   * Render building info section
   */
  const renderBuildingInfoSection = () => {
    if (!building) {
      return null;
    }

    return (
      <Paper>
        <Stack
          direction="column"
          padding={ 2 }
        >
          <Typography variant="h3">
            { strings.survey.building.title }
          </Typography>
          <Stack
            direction={ isMobile ? "column" : "row" }
            marginTop={ 2 }
          >
            <Stack width="100%" direction="column">
              { renderDataCell(strings.survey.building.propertyID, building.propertyId) }
              { renderDataCell(strings.survey.building.buildingID, building.buildingId) }
              { renderDataCell(strings.survey.building.buildingClass, buildingTypes?.find(buildingType => buildingType.id === building.buildingTypeId)?.name ) }
              { renderDataCell(strings.survey.building.year, building.constructionYear) }
              { renderDataCell(strings.survey.building.area, building.space) }
              { renderDataCell(strings.survey.building.volume, building.volume) }
            </Stack>
            <Stack width="100%" direction="column">
              { renderDataCell(strings.survey.building.floors, building.floors) }
              { renderDataCell(strings.survey.building.basementFloors, building.basements) }
              { renderDataCell(strings.survey.building.foundationMaterial, building.foundation) }
              { renderDataCell(strings.survey.building.supportingStructure, building.supportingStructure) }
              { renderDataCell(strings.survey.building.façadeMaterial, building.facadeMaterial) }
              { renderDataCell(strings.survey.building.roofStructure, building.roofType) }
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    );
  };

  /**
   * Render owner info section
   */
  const renderOwnerInfoSection = () => {
    if (!ownerInformation) {
      return null;
    }

    return (
      <Paper>
        <Stack
          direction={ isMobile ? "column" : "row" }
          padding={ 2 }
        >
          <Stack
            spacing={ 2 }
            width="100%"
            direction="column"
          >
            <Typography variant="h3">
              { strings.survey.owner.title }
            </Typography>
            { ownerInformation.ownerName && renderDataValue(ownerInformation.ownerName) }
          </Stack>
          <Stack
            spacing={ 2 }
            width="100%"
            direction="column"
          >
            <Typography variant="h3">
              { strings.survey.owner.contactPerson }
            </Typography>
            { renderDataValue(`${ownerInformation.contactPerson?.firstName} ${ownerInformation.contactPerson?.lastName}`) }
            { ownerInformation.contactPerson?.profession && renderDataValue(ownerInformation.contactPerson?.profession) }
            { ownerInformation.contactPerson?.phone && renderDataValue(ownerInformation.contactPerson?.phone) }
            { ownerInformation.contactPerson?.email && renderDataValue(ownerInformation.contactPerson?.email) }
          </Stack>
        </Stack>
      </Paper>
    );
  };

  /**
   * Render owner info section
   */
  const renderSurveyInfoSection = () => {
    if (!selectedSurvey) {
      return null;
    }

    return (
    <Paper>
      <Stack
        direction="column"
        padding={ 2 }
      >
        <Typography variant="h3">
          { strings.survey.info.title }
        </Typography>
        <Stack
          direction={ isMobile ? "column" : "row" }
          marginTop={ 2 }
        >
          <Box width="100%">
            { renderDataCell(strings.survey.info.demolitionScope, LocalizationUtils.getLocalizedDemolitionScope(selectedSurvey.type)) }
          </Box>
          <Box width="100%">
            { renderDataCell(strings.survey.info.startDate, moment(selectedSurvey.startDate).format("YYYY-MM-DD")) }
          </Box>
          <Box width="100%">
            { renderDataCell(strings.survey.info.endDate, moment(selectedSurvey.endDate).format("YYYY-MM-DD")) }
          </Box>
        </Stack>
      </Stack>
    </Paper>
    );
  };

  /**
   * Render surveyor section
   */
  const renderSurveyorSection = () => {
    if (!surveyors) {
      return null;
    }

    return (
    <Paper>
      <Stack
        direction="column"
        padding={ 2 }
      >
        <Typography variant="h3">
          { strings.survey.info.surveyors }
        </Typography>
        <Stack
          direction={ isMobile ? "column" : "row" }
          marginTop={ 2 }
        >
          { surveyors.map(surveyor => 
            (
              <Box width="100%">
                { renderDataCell(surveyor.role || "", `${surveyor.firstName} ${surveyor.lastName}`) }
              </Box>
            )) }
        </Stack>
      </Stack>
    </Paper>
    );
  };

  /**
   * Renders list of materials
   */
  if (loading) {
    return <CircularProgress color="primary" size={ 60 }/>;
  }

  return (
    <>
      <Stack
        spacing={ 2 }
        direction="row"
        justifyContent="space-between"
        marginBottom={ 2 }
      >
        <Typography variant="h2">
          { strings.survey.summary.title }
        </Typography>
        {/* TODO print button */}
        <SurveyButton
          variant="contained"
          color="secondary"
          startIcon={ <Print/> }
          onClick={ () => {} }
        >
          { strings.survey.summary.print }
        </SurveyButton>
      </Stack>
      <Stack
        spacing={ 2 }
        direction="column"
      >
        { renderBuildingInfoSection() }
        { renderOwnerInfoSection() }
        { renderSurveyInfoSection() }
        { renderSurveyorSection() }
      </Stack>
    </>
  );
};

export default SummaryView;