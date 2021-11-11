import { SurveyStatus } from "generated/client";
import strings from "localization/strings";

/**
 * Utility class for localizations
 */
export default class LocalizationUtils {

  /**
   * Gets localized survey status string
   *
   * @param status survey status
   * @returns localized string
   */
  public static getLocalizedSurveyStatus = (status: SurveyStatus): string => ({
    [SurveyStatus.Draft]: strings.survey.surveyStatus.draft,
    [SurveyStatus.Done]: strings.survey.surveyStatus.done
  })[status];

}