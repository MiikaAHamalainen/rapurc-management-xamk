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
    open: string;
    close: string;
    save: string;
    download: string;
    unknown: string;
  };

  /**
   * Translations related to PDF export
   */
  pdf: {
    previewTitle: string;
    demolitionSurvey: string;
  }

  /**
   * Translations related to generic units
   */
  units: {
    tons: string;
  }

  /**
   * Translations related to error handling
   */
  errorHandling: {
    title: string;
    missingAccessToken: string;
    failToUpload: string;
    failToLoadUserId: string;
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
    reusables: {
      list: string;
      create: string;
      update: string;
      delete: string;
    },
    materials: {
      list: string;
      create: string;
      delete: string;
      update: string;
    };
    buildingTypes: {
      list: string;
      create: string;
      delete: string;
      update: string;
    };
    wasteCategories: {
      list: string;
      create: string;
      delete: string;
      update: string;
    };
    wasteMaterials: {
      list: string;
      create: string;
      delete: string;
    };
    hazardousMaterials: {
      list: string;
      create: string;
      delete: string;
    };
    hazardousWastes: {
      list: string;
      update: string;
      create: string;
      delete: string;
    };
    surveyors: {
      list: string;
      create: string;
      delete: string;
      update: string;
    };
    waste: {
      list: string;
      create: string;
      delete: string;
      update: string;
    };
    wasteMaterial: {
      list: string;
      create: string;
      delete: string;
      update: string;
    };
    postProcess: {
      list: string;
      create: string;
      delete: string;
      update: string;
    };
    wasteSpecifiers: {
      list: string;
      create: string;
      delete: string;
      update: string;
    };
    attachments: {
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
    loadingSurveys: string;
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
        wasteCategories: string;
        postProcessing: string;
        hazardousMaterials: string;
        hazardousMaterialsAdditionalInfo: string;
        buildingTypes: string;
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
    addNewBuildingTypeDialog: {
      title: string;
      text1: string;
      text2: string;
      text1help: string;
      text2help: string;
    };
    deleteBuildingTypeDialog: {
      title: string;
      text: string;
    };
    updateBuildingTypeDialog: {
      title: string;
      text1: string;
      text2: string;
    };
    addNewWasteCategoryDialog: {
      title: string;
      text1: string;
      text2: string;
    };
    deleteWasteCategoryDialog: {
      title: string;
      text: string;
    };
    updateWasteCategoryDialog: {
      title: string;
      text1: string;
      text2: string;
    };
    addNewWasteMaterialDialog: {
      title: string;
      text1: string;
      text2: string;
      text3: string;
    };
    deleteWasteMaterialDialog: {
      title: string;
      text: string;
    };
    updateWasteMaterialDialog: {
      title: string;
    };
    addNewPostProcessDialog: {
      title: string;
      text: string;
    };
    deletePostProcessDialog: {
      title: string;
      text: string;
    };
    updatePostProcessDialog: {
      title: string;
      text: string;
    };
    addNewWasteSpecifierDialog: {
      title: string;
      text: string;
    };
    deleteWasteSpecifierDialog: {
      title: string;
      text: string;
    };
    updateWasteSpecifierDialog: {
      title: string;
      text: string;
    };
    addNewHazardousMaterialDialog: {
      title: string;
      text1: string;
      text2: string;
      text3: string;
    };
    deleteHazardousMaterialDialog: {
      title: string;
      text: string;
    };
    updateHazardousMaterialDialog: {
      title: string;
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
      deleteSurveyor: string;
      demolitionScopes: {
        renovation: string;
        partial: string;
        full: string;
      };
      dataGridColumns: {
        firstName: string;
        lastName: string;
        company: string;
        role: string;
        phone: string;
        email: string;
        reportDate: string;
      };
      addNewSurveyorDialog: {
        title: string;
      };
      deleteSurveyorDialog: {
        title: string;
        text: string;
      };
    };
    reusables: {
      title: string;
      dropFile: string;
      viewImage: string;
      moreImage: string;
      addImage: string;
      deleteImage: string;
      addNewBuildingPart: string;
      deleteBuildingParts: string;
      addNewBuildingPartsDialog: {
        title: string;
        buildingPartHelperText: string;
        buildingPartOrMaterial: string;
        buildingPartOrMaterialHelperText: string;
        usabilityHelperText: string;
        descriptionHelperText: string;
        wasteAmountHelperText: string;
        imageDescription: string
      };
      deleteReusableDialog: {
        title: string;
        text: string;
      };
      dataGridColumns: {
        images: string;
        material: string;
        buildingPart: string;
        usability: string;
        wasteAmount: string;
        wasteAmountInTons: string;
        amount: string;
        description: string;
        unit: string;
        editDescription: string;
      };
      usability: {
        excellent: string;
        good: string;
        poor: string;
        notValidated: string;
      };
      units: {
        kg: string;
        m2: string;
        m3: string;
        pcs: string;
        rm: string;
        tn: string;
      };
    };
    wasteMaterial: {
      title: string;
      addNewWaste: string;
      deleteWaste: string;
      addNewWasteDialog: {
        title: string;
      };
      deleteWasteDialog: {
        title: string;
        text: string;
      };
      dataGridColumns: {
        material: string;
        wasteCode: string;
        usage: string;
        amount: string;
        amountInTons: string;
        description: string;
        editDescription: string;
      };
    };
    hazardousMaterial: {
      title: string;
      dataGridColumns: {
        hazardousMaterial: string;
        material: string;
        wasteCode: string;
        amount: string;
        amountInTons: string;
        description: string;
        wasteSpecifier: string;
      };
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
    attachments: {
      title: string;
      add: string;
      dialog: {
        title: string;
        text: string;
      }
    };
    summary: {
      title: string;
      print: string;
      demolitionInfo: string;
      images: string;
      image: string;
    };
  };
}

/**
 * Initialized localized strings
 */
const strings: Localized = new LocalizedStrings({ en: en, fi: fi });

export default strings;