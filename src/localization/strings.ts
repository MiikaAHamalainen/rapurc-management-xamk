import LocalizedStrings, { LocalizedStringsMethods } from "localized-strings";
import en from "./en.json";
import fi from "./fi.json";

/**
 * Localized strings
 */
export interface Localized extends LocalizedStringsMethods {

  /**
   * App title translation
   */
  appTitle: string;

  /**
   * Translations related to generic words
   */
  generic: {
    add: string;
    addNew: string;
    notImplemented: string;
    confirm: string;
    cancel: string;
    delete: string;
    logout: string;
  };

  /**
   * Translations related to error handling
   */
  errorHandling: {
    title: string;
    missingAccessToken: string;
    surveys: {
      list: string;
      create: string;
      find: string;
      update: string;
      delete: string;
    };
    buildings: {
      list: string;
      create: string;
      update: string;
      delete: string;
    };
    owners: {
      list: string;
      create: string;
      update: string;
      delete: string;
    };
    materials: {
      list: string;
      create: string;
      delete: string;
      update: string;
    };
  };

  /**
   * Translations related to navigation
   */
  navigation: {
    surveys: string;
    newSurvey: string;
    admin: string;
  };

  /**
   * Translations related to surveys screen
   */
  surveysScreen: {
    title: string;
    description: string;
    address: string;
    showAll: string;
    showMine: string;
    newSurvey: string;
    filter: string;
    dataGridColumns: {
      status: string;
      buildingId: string;
      classificationCode: string;
      ownerName: string;
      city: string;
      streetAddress: string;
    };
    deleteSurveysDialog: {
      title: string;
      text: string;
    };
  };

  /**
   * Translations related to create new survey screen
   */
  newSurveyScreen: {
    title: string;
    description: string;
    address: string;
    propertyId: string;
    buildingId: string;
    search: string;
    createManually: string;
    createSurvey: string;
  };

  /**
   * Translations related to create new survey screen
   */
  surveyScreen: {
    title: string;
    status: string;
    navigation: {
      owner: string;
      building: string;
      otherStructures: string;
      info: string;
      reusables: string;
      waste: string;
      hazardous: string;
      attachments: string;
      summary: string;
    };
  };

  /**
   * Translations related to admin screen
   */
  adminScreen: {
    title: string;
    description: string;
    navigation: {
      dropdownSettings: {
        title: string;
        reusableMaterials: string;
        wasteMaterials: string;
        postProcessing: string;
        hazardousMaterials: string;
        hazardousMaterialsAdditionalInfo: string;
      };
    };
    addNewReusableMaterialDialog: {
      title: string;
      text: string;
    };
    deleteReusableMaterialDialog: {
      title: string;
      text: string;
    };
    updateReusableMaterialDialog: {
      title: string;
      text: string;
    };
  };

  /**
   * Translations related to surveys
   */
  survey: {
    surveyStatus: {
      draft: string;
      done: string;
    };
    building: {
      title: string;
      propertyID: string;
      buildingID: string;
      buildingClass: string;
      year: string;
      area: string;
      volume: string;
      floors: string;
      basementFloors: string;
      foundationMaterial: string;
      supportingStructure: string;
      façadeMaterial: string;
      roofStructure: string;
      address: string;
      street: string;
      city: string;
      postalCode: string;
    };
    owner: {
      title: string;
      name: string;
      tradeName: string;
      contactPerson: string;
      firstName: string;
      surname: string;
      occupation: string;
      phone: string;
      email: string;
    };
    info: {
      title: string;
      demolitionInfo: string;
      surveyors: string;
      demolitionScope: string;
      startDate: string;
      endDate: string;
      addSurveyor: string;
      firstName: string;
      surName: string;
      organisation: string;
      role: string;
      phone: string;
      email: string;
      reportingDate: string;
    };
    otherStructures: {
      title: string;
      description: string;
      add: string;
      dialog: {
        title: string;
        name: string;
        description: string;
        deleteBuilding: string;
        areYouSure: string;
      }
    };
  };
}

/**
 * Initialized localized strings
 */
const strings: Localized = new LocalizedStrings({ en: en, fi: fi });

export default strings;