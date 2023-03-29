/* eslint-disable max-len */
import { ExpandMore, Print } from "@mui/icons-material";
import { Accordion, Box, Button, CircularProgress, Divider, Paper, Stack, Typography, useMediaQuery, AccordionDetails, AccordionSummary } from "@mui/material";
import Api from "api";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import AttachmentCard from "components/generic/acttachment-card";
import { selectKeycloak } from "features/auth-slice";
import { selectSelectedSurvey } from "features/surveys-slice";
import PdfExportDialog from "components/pdf-export/pdf-export-dialog";
import strings from "localization/strings";
import moment from "moment";
import * as React from "react";
import theme from "theme";
import { SurveySummary } from "types";
import LocalizationUtils from "utils/localization-utils";
import FileUploadUtils from "utils/file-upload";
import { Reusable } from "generated/client";
import ImageGallery from "styled/generic/image-gallery";
import { selectLanguage } from "features/locale-slice";

const initialSurveySummary: SurveySummary = {
  buildingTypes: [],
  reusables: [],
  reusableMaterials: [],
  wastes: [],
  wasteCategories: [],
  wasteMaterials: [],
  wasteSpecifiers: [],
  hazardousWastes: [],
  hazardousMaterials: [],
  usages: [],
  surveyors: [],
  attachments: []
};

/**
 * Component for summary view
 */
const SummaryView: React.FC = () => {
  const keycloak = useAppSelector(selectKeycloak);
  const errorContext = React.useContext(ErrorContext);
  const selectedSurvey = useAppSelector(selectSelectedSurvey);
  const selectedLanguage = useAppSelector(selectLanguage);

  const [ loading, setLoading ] = React.useState(false);
  const [ surveySummary, setSurveySummary ] = React.useState<SurveySummary>(initialSurveySummary);
  const [ pdfDialogOpen, setPdfDialogOpen ] = React.useState(false);

  /**
   * Fetches owner information array
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

      return fetchedOwnerInformationArray[0];
    } catch (error) {
      errorContext.setError(strings.errorHandling.owners.create, error);
    }
  };

  /**
   * Fetches building types
   */
  const fetchBuildingTypes = async () => {
    if (!keycloak?.token || !selectedSurvey?.id) {
      return;
    }

    try {
      return await Api.getBuildingTypesApi(keycloak.token).listBuildingTypes();
    } catch (error) {
      errorContext.setError(strings.errorHandling.buildingTypes.list, error);
    }
  };

  /**
   * Fetches building
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

      return fetchedBuildings[0];
    } catch (error) {
      errorContext.setError(strings.errorHandling.buildings.list, error);
    }
  };

  /**
   * Convert image to base64 encoding
   * 
   * @param image image url
   */
  const imageToBase64 = async (image: string) => {
    const randomString = Math.random().toString();
    const imageUrl = `${image}?noCache=${randomString}`;

    return image.endsWith(".gif") ?
      await FileUploadUtils.gifToDataURL(imageUrl) as string :
      await FileUploadUtils.toDataURL(imageUrl) as string;
  };

  /**
   * Encodes reusable with images
   * 
   * @param reusable reusable
   */
  const encodeReusableImages = async (reusable: Reusable) => {
    const encodedImages = await Promise.all(reusable.images?.map(imageToBase64) || []);
  
    return {
      ...reusable,
      images: encodedImages
    } as Reusable;
  };

  /**
   * Fetches reusables
   */
  const fetchReusables = async () => {
    if (!keycloak?.token || !selectedSurvey?.id) {
      return;
    }

    try {
      const reusablesRaw = await Api
        .getSurveyReusablesApi(keycloak.token)
        .listSurveyReusables({ surveyId: selectedSurvey.id });

      // process the reusable images
      const reusablesImageEncoded = await Promise.all(reusablesRaw.map(encodeReusableImages));

      return reusablesImageEncoded;
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
      return await Api.getReusableMaterialApi(keycloak.token).listReusableMaterials();
    } catch (error) {
      errorContext.setError(strings.errorHandling.materials.list, error);
    }
  };

  /**
   * Fetches waste array
   */
  const fetchWastes = async () => {
    if (!keycloak?.token || !selectedSurvey?.id) {
      return;
    }

    try {
      return await Api.getWastesApi(keycloak.token).listSurveyWastes({ surveyId: selectedSurvey.id });
    } catch (error) {
      errorContext.setError(strings.errorHandling.waste.list, error);
    }
  };

  /**
   * Fetches list of waste categories
   */
  const fetchWasteCategories = async () => {
    if (!keycloak?.token) {
      return;
    }

    try {
      return await Api.getWasteCategoryApi(keycloak.token).listWasteCategories();
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteMaterials.list, error);
    }
  };

  /**
   * Fetches waste material array
   */
  const fetchWasteMaterials = async () => {
    if (!keycloak?.token) {
      return;
    }

    try {
      return await Api.getWasteMaterialApi(keycloak.token).listWasteMaterials();
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteMaterial.list, error);
    }
  };

  /**
   * Fetches waste specifiers array
   */
  const fetchWasteSpecifiers = async () => {
    if (!keycloak?.token) {
      return;
    }

    try {
      return await Api.getWasteSpecifiersApi(keycloak.token).listWasteSpecifiers();
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteSpecifiers.list, error);
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
      return await Api.getHazardousWasteApi(keycloak.token).listSurveyHazardousWastes({ surveyId: selectedSurvey.id });
    } catch (error) {
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
      return await Api.getHazardousMaterialApi(keycloak.token).listHazardousMaterials();
    } catch (error) {
      errorContext.setError(strings.errorHandling.hazardousMaterials.list, error);
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
      return await Api.getUsageApi(keycloak.token).listUsages();
    } catch (error) {
      errorContext.setError(strings.errorHandling.postProcess.list, error);
    }
  };

  /**
   * Fetch surveyor array
   */
  const fetchSurveyors = async () => {
    if (!keycloak?.token || !selectedSurvey?.id) {
      return;
    }

    try {
      return await Api.getSurveyorsApi(keycloak.token).listSurveyors({ surveyId: selectedSurvey.id });
    } catch (error) {
      errorContext.setError(strings.errorHandling.surveyors.list, error);
    }
  };

  /**
   * Fetches survey attachments
   */
  const fetchAttachment = async () => {
    if (!keycloak?.token || !selectedSurvey?.id) {
      return;
    }

    try {
      return await Api.getAttachmentsApi(keycloak.token).listSurveyAttachments({ surveyId: selectedSurvey.id });
    } catch (error) {
      errorContext.setError(strings.errorHandling.attachments.list, error);
    }
  };

  /**
   * Fetches summary data
   */
  const fetchData = async () => {
    setLoading(true);

    const [
      fetchedBuilding,
      fetchedBuildingTypes,
      fetchedOwnerInformation,
      fetchedReusables,
      fetchedReusableMaterials,
      fetchedWasteCategories,
      fetchedWaste,
      fetchedWasteMaterials,
      fetchedWasteSpecifiers,
      fetchedUsages,
      fetchedSurveyors,
      fetchedHazardousWaste,
      fetchedHazardousMaterials,
      fetchedAttachments
    ] = await Promise.all<any>([
      fetchBuilding(),
      fetchBuildingTypes(),
      fetchOwnerInformation(),
      fetchReusables(),
      fetchReusableMaterials(),
      fetchWasteCategories(),
      fetchWastes(),
      fetchWasteMaterials(),
      fetchWasteSpecifiers(),
      fetchUsages(),
      fetchSurveyors(),
      fetchHazardousWaste(),
      fetchHazardousMaterial(),
      fetchAttachment()
    ]);

    fetchSurveyors();

    const fetchedSurveySummary: SurveySummary = {
      building: fetchedBuilding,
      buildingTypes: fetchedBuildingTypes || [],
      ownerInformation: fetchedOwnerInformation,
      reusables: fetchedReusables || [],
      reusableMaterials: fetchedReusableMaterials || [],
      wasteCategories: fetchedWasteCategories || [],
      wastes: fetchedWaste || [],
      wasteMaterials: fetchedWasteMaterials || [],
      wasteSpecifiers: fetchedWasteSpecifiers || [],
      usages: fetchedUsages || [],
      surveyors: fetchedSurveyors || [],
      hazardousWastes: fetchedHazardousWaste || [],
      hazardousMaterials: fetchedHazardousMaterials || [],
      attachments: fetchedAttachments || []
    };

    setSurveySummary(fetchedSurveySummary);
    setLoading(false);
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  /**
   * Check if viewport is mobile size
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const {
    buildingTypes,
    hazardousMaterials,
    hazardousWastes,
    reusableMaterials,
    reusables,
    surveyors,
    usages,
    wasteCategories,
    wasteMaterials,
    wasteSpecifiers,
    wastes,
    building,
    ownerInformation,
    attachments
  } = surveySummary;

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
  const renderDataValue = (value?: string | number) => value?.toString() && (
    <Typography variant="body2">
      { value.toString() }
    </Typography>
  );

  /**
   * Renders data cell
   * 
   * @param title title
   * @param value value
   */
  const renderDataCell = (title: string, value?: string | number) => (
    <Stack>
      { renderDataTitle(title) }
      { renderDataValue(value || "-") }
    </Stack>
  );

  /**
   * Renders data cell with inline label
   * 
   * @param title title
   * @param value value
   */
  const renderMediaDataCell = (title: string, value?: string | number) => (
    <Stack flex={ 1 }>
      { renderDataTitle(`${title}`) }
      { renderDataValue(value || "-") }
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
      <Stack spacing={ 2 }>
        <Stack
          spacing={ 2 }
          direction={ isMobile ? "column" : "row" }
        >
          <Typography width="100%" variant="h3">
            { strings.survey.building.title }
          </Typography>
        </Stack>
        <Stack>
          <Box>
            <Typography>
              { `${building.address?.streetAddress} ${building.address?.postCode} ${building.address?.city}` }
            </Typography>
          </Box>
        </Stack>
        <Paper>
          <Stack
            direction={ isMobile ? "column" : "row" }
            spacing={ 2 }
            p={ 2 }
          >
            <Stack width="100%" spacing={ 2 }>
              { renderDataCell(strings.survey.building.propertyName, building.propertyName) }
              { renderDataCell(strings.survey.building.propertyID, building.propertyId) }
              { renderDataCell(strings.survey.building.buildingID, building.buildingId) }
              { renderDataCell(strings.survey.building.buildingClass, LocalizationUtils.getLocalizedName(buildingTypes.find(buildingType => buildingType.id === building.buildingTypeId)?.localizedNames || [], selectedLanguage)) }
              { renderDataCell(strings.survey.building.year, building.constructionYear) }
              { renderDataCell(strings.survey.building.area, building.space) }
              { renderDataCell(strings.survey.building.volume, building.volume) }
            </Stack>
            <Stack width="100%" spacing={ 2 }>
              { renderDataCell(strings.survey.building.floors, building.floors) }
              { renderDataCell(strings.survey.building.basementFloors, building.basements) }
              { renderDataCell(strings.survey.building.foundationMaterial, building.foundation) }
              { renderDataCell(strings.survey.building.supportingStructure, building.supportingStructure) }
              { renderDataCell(strings.survey.building.façadeMaterial, building.facadeMaterial) }
              { renderDataCell(strings.survey.building.roofStructure, building.roofType) }
            </Stack>
          </Stack>
        </Paper>
      </Stack>
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
      <Stack direction={ isMobile ? "column" : "row" } spacing={ 2 }>
        <Stack spacing={ 2 } width="100%">
          <Typography variant="h3">
            { strings.survey.owner.title }
          </Typography>
          <Paper sx={{ p: 2 }}>
            { renderDataValue(ownerInformation.ownerName) }
          </Paper>
        </Stack>
        <Stack spacing={ 2 } width="100%">
          <Typography variant="h3">
            { strings.survey.owner.contactPerson }
          </Typography>
          <Paper>
            <Stack spacing={ 2 } p={ 2 }>
              { renderDataValue(`${ownerInformation.contactPerson?.firstName || ""} ${ownerInformation.contactPerson?.lastName || ""}`) }
              { renderDataValue(ownerInformation.contactPerson?.profession) }
              { renderDataValue(ownerInformation.contactPerson?.phone) }
              { renderDataValue(ownerInformation.contactPerson?.email) }
            </Stack>
          </Paper>
        </Stack>
      </Stack>
    );
  };

  /**
   * Renders other structures section
   */
  const renderOtherStructuresSection = () => {
    if (!building?.otherStructures) {
      return null;
    }

    return (
      <Stack spacing={ 2 }>
        <Typography variant="h3">
          { strings.survey.otherStructures.title }
        </Typography>
        <Typography>
          { strings.survey.otherStructures.addedDescription }
        </Typography>
        <Stack spacing={ 2 }>
          { building?.otherStructures.map(otherStructure => (
            <Paper elevation={ 1 } key={ otherStructure.name }>
              <Stack spacing={ 2 } p={ 2 }>
                <Typography variant="h4">
                  { otherStructure.name }
                </Typography>
                { renderDataValue(otherStructure.description) }
              </Stack>
            </Paper>
          ))
          }
        </Stack>
      </Stack>
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
      <Stack spacing={ 2 }>
        <Typography variant="h3">
          { strings.survey.summary.demolitionInfo }
        </Typography>
        <Paper>
          <Stack
            direction={ isMobile ? "column" : "row" }
            spacing={ isMobile ? 2 : 6 }
            padding={ 2 }
          >
            { renderDataCell(strings.survey.info.demolitionScope, LocalizationUtils.getLocalizedDemolitionScope(selectedSurvey.type)) }
            { !isMobile &&
              <Divider
                variant="inset"
                orientation="vertical"
                flexItem
              />
            }
            { renderDataCell(strings.survey.info.startDate, selectedSurvey.dateUnknown ? strings.survey.info.dateUnknown : moment(selectedSurvey.startDate).format("DD.MM.YYYY")) }
            { !isMobile &&
              <Divider
                variant="inset"
                orientation="vertical"
                flexItem
              />
            }
            { renderDataCell(strings.survey.info.endDate, moment(selectedSurvey.endDate).format("DD.MM.YYYY")) }
          </Stack>
        </Paper>
      </Stack>
    );
  };

  /**
   * Renders surveyor section
   */
  const renderSurveyorSection = () => {
    if (!surveyors.length) {
      return null;
    }

    return (
      <Stack spacing={ 2 }>
        <Typography variant="h3">
          { strings.survey.info.surveyors }
        </Typography>
        <Paper>
          <Stack direction={ isMobile ? "column" : "row" }>
            { surveyors.map(surveyor =>
              (
                <Stack
                  key={ surveyor.id }
                  flex={ 1 }
                  p={ 2 }
                  spacing={ 1 }
                  direction="column"
                >
                  { renderDataCell(surveyor.role || "", `${surveyor.firstName || ""} ${surveyor.lastName || ""}`) }
                  { renderDataValue(surveyor.company || "") }
                  { renderDataValue(surveyor.phone || "") }
                  { renderDataValue(surveyor.email || "") }
                  { renderDataCell(strings.survey.info.dataGridColumns.reportDate, surveyor.reportDate ? moment(surveyor.reportDate).format("DD.MM.YYYY") : strings.generic.unknown) }
                  { renderDataValue(surveyor.visits || "") }
                  { !isMobile &&
                    <Divider
                      variant="inset"
                      orientation="vertical"
                      flexItem
                    />
                  }
                </Stack>
              )) }
          </Stack>
        </Paper>
      </Stack>
    );
  };

  /**
   * Renders surveyor section
   */
  const renderReusableMaterialsSection = () => {
    if (!reusables.length) {
      return null;
    }

    return (
      <Stack spacing={ 2 }>
        <Typography variant="h3">
          { strings.survey.reusables.title }
        </Typography>
        <Stack spacing={ 2 }>
          { reusables.map(reusable => {
            const materialObject = reusableMaterials.find(reusableMaterial => reusableMaterial.id === reusable.reusableMaterialId);
            const materialName = materialObject && LocalizationUtils.getLocalizedName(materialObject.localizedNames, selectedLanguage);
            const materialUsability = LocalizationUtils.getLocalizedUsability(reusable.usability);
            const materialAmount = `${reusable.amount} ${reusable.unit ? LocalizationUtils.getLocalizedUnits(reusable.unit) : ""}`;
            const materialAmountAsWaste = `${reusable.amountAsWaste} ${strings.units.tons}`;

            return (
              <Paper elevation={ 1 } key={ reusable.id }>
                <Stack spacing={ 2 } p={ 2 }>
                  <Typography variant="h4">
                    { reusable.componentName }
                  </Typography>
                  <Stack
                    spacing={ isMobile ? 2 : 4}
                    justifyContent="space-between"
                    direction={ isMobile ? "column" : "row" }
                  >
                    { renderMediaDataCell(strings.survey.reusables.dataGridColumns.buildingPart, materialName) }
                    <Divider
                      variant="inset"
                      orientation="vertical"
                      flexItem
                    />
                    { renderMediaDataCell(strings.survey.reusables.dataGridColumns.usability, materialUsability)}
                    <Divider
                      variant="inset"
                      orientation="vertical"
                      flexItem
                    />
                    { renderMediaDataCell(strings.survey.reusables.dataGridColumns.amount, materialAmount)}
                    <Divider
                      variant="inset"
                      orientation="vertical"
                      flexItem
                    />
                    { !!reusable.amountAsWaste && renderMediaDataCell(strings.survey.reusables.dataGridColumns.wasteAmount, materialAmountAsWaste) }
                  </Stack>
                  { renderMediaDataCell(strings.survey.reusables.dataGridColumns.description, reusable.description) }
                  { reusable.images?.length &&
                    <Accordion>
                      <AccordionSummary expandIcon={ <ExpandMore/> }>
                        <Typography>
                          { strings.survey.summary.images }
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <ImageGallery>
                          {
                            reusable.images?.map(image => {
                              return (
                                <img
                                  style={{ maxWidth: "100%" }}
                                  key={ `${image}_${Math.random()}` }
                                  alt={ materialName }
                                  src={ image }
                                />
                              );
                            })
                          }
                        </ImageGallery>
                      </AccordionDetails>
                    </Accordion>
                  }
                </Stack>
              </Paper>
            );
          })
          }
        </Stack>
      </Stack>
    );
  };

  /**
   * Renders waste material section
   */
  const renderWasteMaterialsSection = () => {
    if (!wastes.length) {
      return null;
    }

    return (
      <Stack spacing={ 2 }>
        <Typography variant="h3">
          { strings.survey.wasteMaterial.title }
        </Typography>
        <Stack spacing={ 2 }>
          { wastes.map(waste => {
            const wasteMaterial = wasteMaterials.find(material => material.id === waste.wasteMaterialId);
            const wasteMaterialName = wasteMaterial && LocalizationUtils.getLocalizedName(wasteMaterial.localizedNames, selectedLanguage);
            const wasteCategory = wasteCategories.find(category => category.id === wasteMaterial?.wasteCategoryId);
            const fullEwcCode = wasteCategory ? `${wasteCategory?.ewcCode || ""}${wasteMaterial?.ewcSpecificationCode}` : "";
            const wasteUsageObject = usages.find(usage => usage.id === waste.usageId);
            const wasteUsage = wasteUsageObject && LocalizationUtils.getLocalizedName(wasteUsageObject.localizedNames, selectedLanguage);
            const wasteAmount = `${waste?.amount || ""} ${strings.units.tons}`;

            return (
              <Paper elevation={ 1 } key={ waste.id }>
                <Stack spacing={ 2 } p={ 2 }>
                  <Typography variant="h4">
                    { wasteMaterialName }
                  </Typography>
                  <Stack
                    spacing={ isMobile ? 2 : 4}
                    justifyContent="space-between"
                    direction={ isMobile ? "column" : "row" }
                  >
                    { renderMediaDataCell(strings.survey.wasteMaterial.dataGridColumns.wasteCode, fullEwcCode) }
                    <Divider
                      variant="inset"
                      orientation="vertical"
                      flexItem
                    />
                    { renderMediaDataCell(strings.survey.wasteMaterial.dataGridColumns.usage, wasteUsage) }
                    <Divider
                      variant="inset"
                      orientation="vertical"
                      flexItem
                    />
                    { renderMediaDataCell(strings.survey.reusables.dataGridColumns.amount, wasteAmount) }
                  </Stack>
                  { renderMediaDataCell(strings.survey.reusables.dataGridColumns.description, waste.description) }
                </Stack>
              </Paper>
            );
          })
          }
        </Stack>
      </Stack>
    );
  };

  /**
   * Renders hazardous material section
   */
  const renderHazardousMaterialsSection = () => {
    if (!hazardousWastes.length) {
      return null;
    }

    return (
      <Stack spacing={ 2 }>
        <Typography variant="h3">
          { strings.survey.hazardousMaterial.title }
        </Typography>
        <Stack spacing={ 2 }>
          { hazardousWastes.map(hazardousWaste => {
            const wasteMaterial = hazardousMaterials.find(material => material.id === hazardousWaste.hazardousMaterialId);
            const wasteCategory = wasteCategories.find(category => category.id === wasteMaterial?.wasteCategoryId);
            const fullEwcCode = wasteMaterial ? `${wasteCategory?.ewcCode || ""}${wasteMaterial?.ewcSpecificationCode}` : "";
            const wasteSpecifierName = wasteSpecifiers
              .find(wasteSpecifier => wasteSpecifier.id === hazardousWaste.wasteSpecifierId)?.localizedNames
              .find(name => name.language === selectedLanguage)?.value;
            const wasteAmount = `${hazardousWaste?.amount || ""} ${strings.units.tons}`;
            const hazardousMaterialObject = hazardousMaterials.find(hazardousMaterial => hazardousMaterial.id === hazardousWaste.hazardousMaterialId);
            const hazardousMaterialName = LocalizationUtils.getLocalizedName(hazardousMaterialObject?.localizedNames || [], selectedLanguage);

            return (
              <Paper key={ hazardousWaste.id }>
                <Stack spacing={ 2 } p={ 2 }>
                  <Typography variant="h4">
                    { hazardousMaterialName }
                  </Typography>
                  <Stack
                    spacing={ isMobile ? 2 : 4}
                    justifyContent="space-between"
                    direction={ isMobile ? "column" : "row" }
                  >
                    { renderMediaDataCell(strings.survey.hazardousMaterial.dataGridColumns.wasteSpecifier, wasteSpecifierName) }
                    <Divider
                      variant="inset"
                      orientation="vertical"
                      flexItem
                    />
                    { renderMediaDataCell(strings.survey.hazardousMaterial.dataGridColumns.wasteCode, fullEwcCode) }
                    <Divider
                      variant="inset"
                      orientation="vertical"
                      flexItem
                    />
                    { renderMediaDataCell(strings.survey.hazardousMaterial.dataGridColumns.amount, wasteAmount) }
                  </Stack>
                  { renderMediaDataCell(strings.survey.reusables.dataGridColumns.description, hazardousWaste.description) }
                </Stack>
              </Paper>
            );
          })
          }
        </Stack>
      </Stack>
    );
  };

  /**
   * Renders hazardous material section
   * 
   * @param url url
   */
  const renderOpenAttachmentButton = (url: string) => (
    <Button
      color="primary"
      variant="text"
      onClick={ () => window.open(url) }
    >
      { strings.generic.open }
    </Button>
  );

  /**
   * Renders attachment section
   */
  const renderAttachmentsSection = () => {
    if (!attachments.length) {
      return null;
    }

    return (
      <Stack spacing={ 2 }>
        <Typography variant="h3">
          { strings.survey.attachments.title }
        </Typography>
        <Stack spacing={ 2 }>
          { attachments.map(attachment => (
            <AttachmentCard
              attachment={ attachment }
              rightControl={ renderOpenAttachmentButton(attachment.url) }
            />
          )) }
        </Stack>
      </Stack>
    );
  };

  /**
   * Renders loader
   */
  if (loading) {
    return (
      <Box
        display="flex"
        flex={ 1 }
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress color="primary" size={ 60 }/>
      </Box>
    );
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
        <Button
          variant="contained"
          color="secondary"
          startIcon={ <Print/> }
          onClick={ () => setPdfDialogOpen(true) }
        >
          { strings.survey.summary.print }
        </Button>
      </Stack>
      <Stack spacing={ 4 }>
        { renderBuildingInfoSection() }
        { renderOtherStructuresSection() }
        { renderOwnerInfoSection() }
        { renderSurveyInfoSection() }
        { renderSurveyorSection() }
        { renderReusableMaterialsSection() }
        { renderWasteMaterialsSection() }
        { renderHazardousMaterialsSection() }
        { renderAttachmentsSection() }
      </Stack>
      <PdfExportDialog
        open={ pdfDialogOpen }
        onClose={ () => setPdfDialogOpen(false) }
        survey={ selectedSurvey }
        surveySummary={ surveySummary }
      />
    </>
  );
};

export default SummaryView;