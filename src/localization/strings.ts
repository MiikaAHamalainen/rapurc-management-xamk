import LocalizedStrings, { LocalizedStringsMethods } from "localized-strings";
import en from "./en.json";
import fi from "./fi.json";

/**
 * Localized strings
 */
export interface Localized extends LocalizedStringsMethods {

  /**
   * Apptitle translation
   */
  appTitle: string;

  /**
   * Translations related to generic words
   */
  generic: {
    notImplemented: string;
  };

  /**
   * Translations related to error handling
   */
  errorHandling: {
    title: string;
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
    ready: string;
    incomplete: string;
    navigation: {
      owner: string;
      building: string;
      others: string;
      survey: string;
      reusables: string;
      waste: string;
      hazardous: string;
      attatchments: string;
      summary: string;
    }
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
      }
    }
  };
}

/**
 * Initialized localized strings
 */
const strings: Localized = new LocalizedStrings({ en: en, fi: fi });

export default strings;