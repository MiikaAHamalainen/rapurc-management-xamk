import { Print } from "@mui/icons-material";
import { Box, CircularProgress, Paper, Stack, Typography, useMediaQuery } from "@mui/material";
import Api from "api";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import { selectKeycloak } from "features/auth-slice";
import { selectSelectedSurvey } from "features/surveys-slice";
import { Building, BuildingType, HazardousMaterial, HazardousWaste, OwnerInformation, Reusable, ReusableMaterial, Surveyor, Usage, Waste, WasteMaterial, WasteSpecifier } from "generated/client";
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
  const [ hazardousWastes, setHazardousWastes ] = React.useState<HazardousWaste[]>([]);
  const [ hazardousMaterials, setHazardousMaterials ] = React.useState<HazardousMaterial[]>([]);
  const [ wasteSpecifiers, setWasteSpecifiers ] = React.useState<WasteSpecifier[]>([]);
  const [ usages, setUsages ] = React.useState<Usage[]>([]);
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

  /**
   * Fetch hazardous waste array
   */
  const fetchHazardousWaste = async () => {
    if (!keycloak?.token || !selectedSurvey?.id) {
      return;
    }

    try {
      setHazardousWastes(await Api.getHazardousWasteApi(keycloak.token).listSurveyHazardousWastes({ surveyId: selectedSurvey.id }));
    } catch (error) {
      // TODO error catching
      errorContext.setError(strings.errorHandling.hazardousWastes.list, error);
    }
  };

  /**
   * Fetches hazardous material array
   */
  const fetchHazardousMaterial = async () => {
    if (!keycloak?.token) {
      return;
    }

    try {
      setHazardousMaterials(await Api.getHazardousMaterialApi(keycloak.token).listHazardousMaterials());
    } catch (error) {
      errorContext.setError(strings.errorHandling.hazardousMaterials.list, error);
    }
  };

  /**
   * Fetches waste specifier array
   */
  const fetchWasteSpecifier = async () => {
    if (!keycloak?.token) {
      return;
    }

    try {
      setWasteSpecifiers(await Api.getWasteSpecifiersApi(keycloak.token).listWasteSpecifiers());
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteSpecifiers.list, error);
    }
  };

  /**
   * Fetches usage array
   */
  const fetchUsages = async () => {
    if (!keycloak?.token) {
      return;
    }

    try {
      setUsages(await Api.getUsageApi(keycloak.token).listUsages());
    } catch (error) {
      errorContext.setError(strings.errorHandling.postProcess.list, error);
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

    try {
      const fetchedSurveyors = await Api.getSurveyorsApi(keycloak.token).listSurveyors({ surveyId: selectedSurvey.id });
      setSurveyors(fetchedSurveyors);
    } catch (error) {
      errorContext.setError(strings.errorHandling.surveyors.list, error);
    }
  };

  /**
   * Create new owner information
   */
  const fetchData = async () => {
    setLoading(true);
    await fetchBuilding();
    await fetchBuildingTypes();
    await fetchOwnerInformation();
    await fetchSurveyReusables();
    await fetchReusableMaterials();
    await fetchWastes();
    await fetchWastesMaterials();
    await fetchUsages();
    await fetchSurveyors();
    await fetchHazardousWaste();
    await fetchHazardousMaterial();
    setLoading(false);
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  /**
   * Check if viewport is mobile size
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  /**
   * Renders data title
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
   * Renders data cell
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
   * Renders data cell
   * 
   * @param title title
   * @param value value
   */
  const renderMediaDataCell = (title: string, value?: string | number) => (
    <Stack
      direction={ isMobile ? "column" : "row" }
      spacing={ 1 }
    >
      { renderDataTitle(`${title}:`) }
      { renderDataValue(value) }
    </Stack>
  );

  /**
   * Renders building info section
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
   * Renders owner info section
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
   * Renders owner info section
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
   * Renders surveyor section
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
   * Renders surveyor section
   */
  const renderReusableMaterialsSection = () => {
    if (!surveyReusables) {
      return null;
    }

    return (
      <Paper>
        <Stack
          direction="column"
          padding={ 2 }
        >
          <Typography variant="h3">
            { strings.survey.reusables.title }
          </Typography>
          <Stack
            direction="column"
          >
            { surveyReusables.map(surveyReusable => 
              (
                <Stack
                  direction="column"
                  spacing={ 1 }
                  mt={ 2 }
                >
                  <Typography variant="subtitle1">
                    { reusableMaterials.find(reusableMaterial => reusableMaterial.id === surveyReusable.reusableMaterialId)?.name || "" }
                  </Typography>
                  { renderMediaDataCell(strings.survey.reusables.dataGridColumns.buildingPart, surveyReusable.componentName) }
                  { renderMediaDataCell(strings.survey.reusables.dataGridColumns.usability, LocalizationUtils.getLocalizedUsability(surveyReusable.usability)) }
                  { renderMediaDataCell(strings.survey.reusables.dataGridColumns.unit, surveyReusable.unit ? LocalizationUtils.getLocalizedUnits(surveyReusable.unit) : "") }
                  { renderMediaDataCell(strings.survey.reusables.dataGridColumns.wasteAmount, surveyReusable.amount) }
                  { renderMediaDataCell(strings.survey.reusables.dataGridColumns.description, surveyReusable.description) }
                </Stack>
              )) }
          </Stack>
        </Stack>
      </Paper>
    );
  };

  /**
   * Renders waste material section
   */
  const renderWasteMaterialsSection = () => {
    if (!wastes) {
      return null;
    }

    return (
      <Paper>
        <Stack
          direction="column"
          padding={ 2 }
        >
          <Typography variant="h3">
            { strings.survey.wasteMaterial.title }
          </Typography>
          <Stack
            direction="column"
          >
            { wastes.map(waste => 
              (
                <Stack
                  direction="column"
                  spacing={ 1 }
                  mt={ 2 }
                >
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="subtitle1">
                      { wasteMaterials.find(wasteMaterial => wasteMaterial.id === waste.wasteMaterialId)?.name }
                    </Typography>
                    <Typography variant="subtitle1">
                      { wasteMaterials.find(wasteMaterial => wasteMaterial.id === waste.wasteMaterialId)?.ewcSpecificationCode }
                    </Typography>
                  </Stack>
                  { renderMediaDataCell(strings.survey.wasteMaterial.dataGridColumns.usage, usages.find(usage => usage.id === waste.usageId)?.name) }
                  { renderMediaDataCell(strings.survey.reusables.dataGridColumns.amount, waste.amount) }
                  { renderMediaDataCell(strings.survey.reusables.dataGridColumns.description, waste.description) }
                </Stack>
              )) }
          </Stack>
        </Stack>
      </Paper>
    );
  };


  /**
   * Renders hazardous material section
   */
  const renderHazardousMaterialsSection = () => {
    if (!hazardousWastes) {
      return null;
    }

    return (
      <Paper>
        <Stack
          direction="column"
          padding={ 2 }
        >
          <Typography variant="h3">
            { strings.survey.hazardousMaterial.title }
          </Typography>
          <Stack
            direction="column"
          >
            { hazardousWastes.map(hazardousWaste => 
              (
                <Stack
                  direction="column"
                  spacing={ 1 }
                  mt={ 2 }
                >
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="subtitle1">
                      { hazardousMaterials.find(hazardousMaterial => hazardousMaterial.id === hazardousWaste.hazardousMaterialId)?.name }
                    </Typography>
                    <Typography variant="subtitle1">
                      { wasteSpecifiers.find(wasteSpecifier => wasteSpecifier.id === hazardousWaste.wasteSpecifierId)?.name }
                    </Typography>
                  </Stack>
                  { renderMediaDataCell(strings.survey.hazardousMaterial.dataGridColumns.amount, hazardousWaste.amount) }
                  { renderMediaDataCell(strings.survey.reusables.dataGridColumns.description, hazardousWaste.description) }
                </Stack>
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
        { renderReusableMaterialsSection() }
        { renderWasteMaterialsSection() }
        { renderHazardousMaterialsSection() }
      </Stack>
    </>
  );
};

export default SummaryView;