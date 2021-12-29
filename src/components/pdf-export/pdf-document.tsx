import React from "react";
import { Page, Text, View, Document, StyleSheet, Font, Image } from "@react-pdf/renderer";
import { SurveySummary } from "../../types/index";
import strings from "localization/strings";
import theme from "theme";
import OswaldBold from "../../resources/fonts/oswald/Oswald-Bold.ttf";
import QuicksandRegular from "../../resources/fonts/quicksand/Quicksand-Regular.ttf";
import QuicksandBold from "../../resources/fonts/quicksand/Quicksand-Bold.ttf";
import LocalizationUtils from "utils/localization-utils";
import { Survey } from "../../generated/client/models/Survey";
import moment from "moment";

// Register Oswald font
Font.register({
  family: "Oswald",
  format: "truetype",
  fonts: [
    {
      src: OswaldBold,
      fontWeight: "bold"
    }
  ]
});

// Register Quicksand font
Font.register({
  family: "Quicksand",
  format: "truetype",
  fonts: [
    {
      src: QuicksandRegular,
      fontWeight: "normal"
    },
    {
      src: QuicksandBold,
      fontWeight: "bold"
    }
  ]
});

const styles = StyleSheet.create({

  page: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
    paddingHorizontal: theme.spacing(6),
    fontSize: 10,
    fontFamily: "Quicksand"
  },

  header: {
    display: "flex",
    textAlign: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingBottom: theme.spacing(2)
  },

  documentHeaderText: {
    fontFamily: "Oswald",
    fontSize: 12,
    color: "rgba(0,0,0,0.6)"
  },

  titleText: {
    fontSize: 16,
    fontFamily: "Oswald",
    marginBottom: theme.spacing(2)
  },

  subtitle: {
    fontSize: 14,
    fontFamily: "Oswald",
    marginBottom: theme.spacing(2)
  },

  bold: {
    fontFamily: "Quicksand",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: theme.spacing(1)
  },

  boldSmall: {
    fontFamily: "Quicksand",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },

  materialItem: {
    display: "flex",
    borderBottom: "1px solid #ddd",
    padding: theme.spacing(2)
  },

  container: {
    padding: theme.spacing(2)
  },

  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing(1),
    paddingBottom: theme.spacing(0.5),
    borderBottom: "1px dashed #ddd"
  },

  cell: {
    borderBottom: "1px solid #ddd",
    paddingBottom: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  
  marginBottom: {
    marginBottom: theme.spacing(1)
  }

});

/**
 * Component props interface
 */
interface Props {
  selectedSurvey: Survey;
  summary: SurveySummary;
}

/**
 * PDF document
 * 
 * @param props component properties
 * @returns survey report pdf
 */
const PdfDocument: React.FC<Props> = ({ selectedSurvey, summary }) => {
  const date = moment().format("DD.MM.YYYY");
  /**
   * Render document info with current date
   */
  const renderDocumentInfo = () => (
    <View style={ styles.header } fixed>
      <Text style={ styles.documentHeaderText }>
        { strings.pdf.demolitionSurvey }
      </Text>
      <Text style={ styles.documentHeaderText }>
        {`${summary.ownerInformation?.ownerName} ${date}`}
      </Text>
    </View>
  );

  /**
   * Render survey info
   */
  const renderSurveyInfo = () => {
    const scope = selectedSurvey ? LocalizationUtils.getLocalizedDemolitionScope(selectedSurvey.type) : "";
    const startDate = selectedSurvey ? moment(selectedSurvey.startDate).format("MMMM YYYY") : "";
    const endDate = selectedSurvey ? moment(selectedSurvey.endDate).format("MMMM YYYY") : "";

    return (
      <View style={ styles.container }>
        <Text style={ styles.titleText }>
          { strings.survey.summary.demolitionInfo }
        </Text>
        <View style={ styles.row }>
          <Text>{ strings.survey.info.demolitionScope }</Text>
          <Text>{ scope }</Text>
        </View>
        <View style={ styles.row }>
          <Text>{ strings.survey.info.startDate }</Text>
          <Text>{ startDate }</Text>
        </View>
        <View style={ styles.row }>
          <Text>{ strings.survey.info.endDate }</Text>
          <Text>{ endDate }</Text>
        </View>
      </View>
    );
  };

  /**
   * Render surveyors
   */
  const renderSurveyors = () => {
    const { surveyors } = summary;

    return (
      <View style={ styles.container }>
        <Text style={ styles.subtitle }>
          { strings.survey.info.surveyors }
        </Text>
        { surveyors.map(surveyor =>
          (
            <View style={ styles.cell }>
              <Text style={ styles.bold }>{ surveyor.role }</Text>
              <Text>{`${surveyor.firstName} ${surveyor.lastName}`}</Text>
              <Text>{ surveyor.company }</Text>
              <Text>{ surveyor.email }</Text>
              <Text>{ surveyor.phone }</Text>
              <Text style={ styles.boldSmall }>{ strings.survey.info.dataGridColumns.reportDate }</Text>
              <Text>{ moment(surveyor.reportDate).format("DD.MM.YYYY") }</Text>
            </View>
          ))
        }
      </View>
    );
  };

  /**
   * Render contact person
   */
  const renderContactPerson = () => {
    if (!summary?.ownerInformation?.contactPerson) {
      return null;
    }

    const {
      firstName,
      lastName,
      profession,
      phone,
      email
    } = summary?.ownerInformation?.contactPerson;

    return (
      <View style={ styles.container }>
        <Text style={ styles.subtitle }>
          { strings.survey.owner.contactPerson }
        </Text>
        <View style={ styles.cell }>
          <Text>{`${firstName || ""} ${lastName || ""}`}</Text>
          <Text>{ profession }</Text>
          <Text>{ phone }</Text>
          <Text>{ email }</Text>
        </View>
      </View>
    );
  };

  /**
   * Render owner and contact info
   */
  const renderOwnerInfo = () => {
    const { ownerInformation } = summary;

    if (!ownerInformation) {
      return null;
    }

    return (
      <View style={ styles.container }>
        <Text style={ styles.subtitle }>
          { strings.survey.owner.title }
        </Text>
        <View style={ styles.row }>
          <Text>{ strings.surveysScreen.dataGridColumns.ownerName }</Text>
          <Text>{ ownerInformation.ownerName }</Text>
          { ownerInformation.businessId &&
            <Text>{ ownerInformation.businessId }</Text>
          }
        </View>
      </View>
    );
  };

  /**
   * Render building info
   */
  const renderBuildingInfo = () => {
    const {
      building,
      buildingTypes
    } = summary;
    
    if (!building) {
      return null;
    }
    
    const {
      address,
      buildingId,
      basements,
      buildingTypeId,
      propertyId,
      constructionYear,
      space,
      volume,
      floors,
      foundation,
      supportingStructure,
      facadeMaterial,
      roofType
    } = building;

    const buildingTypeName = buildingTypes?.find(buildingType => buildingType.id === buildingTypeId)?.name || "";

    return (
      <View style={ styles.container }>
        <Text style={ styles.subtitle }>
          { strings.survey.building.title }
        </Text>
        <Text style={ styles.bold }>
          { `${address?.streetAddress} ${address?.postCode} ${address?.city}` }
        </Text>
        <View style={ styles.row }>
          <Text>{ strings.survey.building.buildingID }</Text>
          <Text>{ buildingId }</Text>
        </View>
        <View style={ styles.row }>
          <Text>{ strings.survey.building.propertyID }</Text>
          <Text>{ propertyId }</Text>
        </View>
        <View style={ styles.row }>
          <Text>{ strings.survey.building.buildingClass }</Text>
          <Text>{ buildingTypeName }</Text>
        </View>
        <View style={ styles.row }>
          <Text>{ strings.survey.building.year }</Text>
          <Text>{ constructionYear }</Text>
        </View>
        <View style={ styles.row }>
          <Text>{ strings.survey.building.area }</Text>
          <Text>{ space }</Text>
        </View>
        <View style={ styles.row }>
          <Text>{ strings.survey.building.volume }</Text>
          <Text>{ volume }</Text>
        </View>
        <View style={ styles.row }>
          <Text>{ strings.survey.building.floors }</Text>
          <Text>{ floors }</Text>
        </View>
        <View style={ styles.row }>
          <Text>{ strings.survey.building.basementFloors }</Text>
          <Text>{ basements }</Text>
        </View>
        <View style={ styles.row }>
          <Text>{ strings.survey.building.foundationMaterial }</Text>
          <Text>{ foundation }</Text>
        </View>
        <View style={ styles.row }>
          <Text>{ strings.survey.building.supportingStructure }</Text>
          <Text>{ supportingStructure }</Text>
        </View>
        <View style={ styles.row }>
          <Text>{ strings.survey.building.façadeMaterial }</Text>
          <Text>{ facadeMaterial }</Text>
        </View>
        <View style={ styles.row }>
          <Text>{ strings.survey.building.roofStructure }</Text>
          <Text>{ roofType }</Text>
        </View>
      </View>
    );
  };

  /**
   * Render other buildings
   */
  const renderOtherStructuresInfo = () => {
    const { building } = summary;

    if (!building?.otherStructures?.length) {
      return null;
    }

    return (
      <View style={ styles.container }>
        <Text style={ styles.subtitle }>
          { strings.survey.otherStructures.title }
        </Text>
        {
          building.otherStructures.map(otherStructure => (
            <View style={ styles.row }>
              <Text>{ otherStructure?.name }</Text>
              <Text>{ otherStructure?.description }</Text>
            </View>
          ))
        }
      </View>
    );
  };

  /**
   * Render reusable materials
   */
  const renderReusableMaterials = () => {
    const {
      reusables,
      reusableMaterials
    } = summary;

    if (!reusables.length) {
      return null;
    }

    return (
      <View>
        <Text style={ styles.titleText }>
          { strings.survey.reusables.title }
        </Text>
        <View>
          {
            reusables.map(reusable => {
              const materialName = reusableMaterials.find(reusableMaterial => reusableMaterial.id === reusable.reusableMaterialId)?.name || "";
              const materialUsability = LocalizationUtils.getLocalizedUsability(reusable.usability);
              const materialAmount = `${reusable.amount} ${reusable.unit ? LocalizationUtils.getLocalizedUnits(reusable.unit) : ""}`;
              const materialAmountAsWaste = `${reusable.amountAsWaste} ${strings.units.tons}`;
              const imageCount = reusable.images ? reusable.images.length : "";

              return (
                <View style={ styles.materialItem } key={ reusable.id }>
                  <Text style={ styles.bold }>{ reusable.componentName }</Text>
                  <Text style={ styles.marginBottom }>{`${strings.survey.reusables.dataGridColumns.buildingPart}: ${materialName}`}</Text>
                  <Text style={ styles.marginBottom }>{`${strings.survey.reusables.dataGridColumns.usability}: ${materialUsability}`}</Text>
                  <Text style={ styles.marginBottom }>{`${strings.survey.reusables.dataGridColumns.amount}: ${materialAmount}`}</Text>
                  { !!reusable.amountAsWaste &&
                    <Text style={ styles.marginBottom }>{`${strings.survey.reusables.dataGridColumns.wasteAmount}: ${materialAmountAsWaste}`}</Text>
                  }
                  { !!reusable.description &&
                    <View>
                      <Text style={ styles.boldSmall }>
                        { strings.survey.reusables.dataGridColumns.description }
                      </Text>
                      <Text>{ reusable.description }</Text>
                    </View>
                  }
                  {
                    reusable.images?.map((image, index) => {
                      return (
                        <View>
                          <Image
                            key={ `image:${reusable.id}` }
                            src={{
                              uri: image,
                              method: "GET",
                              headers: {},
                              body: ""
                            }}
                          />
                          <Text>{`${strings.survey.summary.image}: ${reusable.componentName} ${index + 1}/${imageCount}`}</Text>
                        </View>
                      );
                    })
                  }
                </View>
              );
            })
          }
        </View>
      </View>
    );
  };

  /**
   * Render waste materials
   */
  const renderWasteMaterials = () => {
    const {
      wastes,
      wasteMaterials,
      wasteCategories,
      usages
    } = summary;

    if (!wastes.length) {
      return null;
    }

    return (
      <View style={ styles.container }>
        <Text style={ styles.titleText }>
          { strings.survey.wasteMaterial.title }
        </Text>
        <View>
          {
            wastes.map(waste => {
              const wasteMaterial = wasteMaterials.find(material => material.id === waste.wasteMaterialId);
              const wasteCategory = wasteCategories.find(category => category.id === wasteMaterial?.wasteCategoryId);
              const fullEwcCode = wasteCategory ? `${wasteCategory?.ewcCode || ""}${wasteMaterial?.ewcSpecificationCode}` : "";
              const wasteUsage = usages.find(usage => usage.id === waste.usageId)?.name;
              const wasteAmount = `${waste?.amount || ""} ${strings.units.tons}`;

              return (
                <View wrap={ false } style={ styles.materialItem } key={ waste.id }>
                  <Text style={ styles.bold }>{ wasteMaterial?.name }</Text>
                  <Text style={ styles.marginBottom }>{`${strings.survey.wasteMaterial.dataGridColumns.wasteCode}: ${fullEwcCode}`}</Text>
                  <Text style={ styles.marginBottom }>{`${strings.survey.wasteMaterial.dataGridColumns.usage}: ${wasteUsage}`}</Text>
                  { !!waste.amount &&
                    <Text style={ styles.marginBottom }>{`${strings.survey.reusables.dataGridColumns.amount}: ${wasteAmount}`}</Text>
                  }
                  { !!waste.description &&
                    <>
                      <Text style={ styles.boldSmall }>
                        { strings.survey.reusables.dataGridColumns.description }
                      </Text>
                      <Text>{ waste.description }</Text>
                    </>
                  }
                </View>
              );
            })
          }
        </View>
      </View>
    );
  };

  /**
   * Render hazardous materials
   */
  const renderHazardousMaterials = () => {
    const {
      hazardousWastes,
      hazardousMaterials,
      wasteCategories,
      wasteSpecifiers
    } = summary;

    if (!hazardousWastes.length) {
      return null;
    }

    return (
      <View style={ styles.container }>
        <Text style={ styles.titleText }>
          { strings.survey.hazardousMaterial.title }
        </Text>
        <View>
          {
            hazardousWastes.map(hazardousWaste => {
              const wasteMaterial = hazardousMaterials.find(material => material.id === hazardousWaste.hazardousMaterialId);
              const wasteCategory = wasteCategories.find(category => category.id === wasteMaterial?.wasteCategoryId);
              const fullEwcCode = wasteMaterial ? `${wasteCategory?.ewcCode || ""}${wasteMaterial?.ewcSpecificationCode}` : "";
              const wasteSpecifierName = wasteSpecifiers.find(wasteSpecifier => wasteSpecifier.id === hazardousWaste.wasteSpecifierId)?.name;
              const wasteAmount = `${hazardousWaste?.amount || ""} ${strings.units.tons}`;

              return (
                <View style={ styles.materialItem } key={ hazardousWaste.id }>
                  <Text style={ styles.bold }>{ wasteMaterial?.name }</Text>
                  { !!hazardousWaste.wasteSpecifierId &&
                    <Text style={ styles.marginBottom }>{`${strings.survey.hazardousMaterial.dataGridColumns.wasteSpecifier}: ${wasteSpecifierName}`}</Text>
                  }
                  <Text style={ styles.marginBottom }>{`${strings.survey.hazardousMaterial.dataGridColumns.wasteCode}: ${fullEwcCode}`}</Text>
                  { !!hazardousWaste?.amount &&
                    <Text style={ styles.marginBottom }>{`${strings.survey.hazardousMaterial.dataGridColumns.amount}: ${wasteAmount}`}</Text>
                  }
                  <Text style={ styles.boldSmall }>
                    { strings.survey.reusables.dataGridColumns.description }
                  </Text>
                  <Text>{ hazardousWaste.description }</Text>
                </View>
              );
            })
          }
        </View>
      </View>
    );
  };

  return (
    <Document
      title={`${strings.pdf.demolitionSurvey} ${summary.ownerInformation?.ownerName}`}
    >
      <Page size="A4" style={ styles.page }>
        <View>
          { renderDocumentInfo() }
          { renderSurveyInfo() }
          { renderSurveyors() }
          { renderContactPerson() }
        </View>
        <View break>
          { renderDocumentInfo() }
          { renderOwnerInfo() }
          { renderBuildingInfo() }
          { renderOtherStructuresInfo() }
        </View>
        <View break>
          { renderDocumentInfo() }
          { renderReusableMaterials() }
        </View>
        <View break>
          { renderDocumentInfo() }
          { renderWasteMaterials() }
        </View>
        <View break>
          { renderDocumentInfo() }
          { renderHazardousMaterials() }
        </View>
      </Page>
    </Document>
  );
};

export default PdfDocument;