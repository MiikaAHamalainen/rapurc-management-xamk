import { OwnerInformation, Survey, Building, BuildingType } from "generated/client";
import { SurveyWithInfo } from "types";
import LocalizationUtils from "./localization-utils";
import { store } from "app/store";

/**
 * Utility class for survey
 */
export default class SurveyUtils {

  /**
   * Parse survey with information
   */
  public static parseToSurveyWithInfo = (
    survey: Survey,
    building?: Building,
    buildingType?: BuildingType,
    ownerInformation?: OwnerInformation
  ): SurveyWithInfo => ({
    id: survey.id!,
    status: survey.status,
    ownerId: ownerInformation?.id,
    buildingId: building?.buildingId,
    classificationCode: LocalizationUtils.getLocalizedName(buildingType?.localizedNames ?? [], store.getState().locale.language),
    ownerName: ownerInformation?.ownerName,
    city: building?.address?.city,
    streetAddress: building?.address?.streetAddress,
    creatorId: survey.metadata.creatorId
  });

}