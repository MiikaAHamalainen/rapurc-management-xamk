import { OwnerInformation, Survey, Building, BuildingType } from "generated/client";
import { SurveyWithInfo } from "types";

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
    classificationCode: buildingType?.name,
    ownerName: ownerInformation?.ownerName,
    city: building?.address?.city,
    streetAddress: building?.address?.streetAddress,
    creatorId: survey.metadata.creatorId
  });

}