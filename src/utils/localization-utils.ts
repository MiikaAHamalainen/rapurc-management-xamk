import { SurveyStatus, Unit, Usability } from "generated/client";
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

  /**
   * Gets localized survey status string
   *
   * @param status survey status
   * @returns localized string
   */
  public static getLocalizedUsability = (usability: Usability): string => ({
    [Usability.Excellent]: strings.survey.reusables.usability.excellent,
    [Usability.Good]: strings.survey.reusables.usability.good,
    [Usability.Poor]: strings.survey.reusables.usability.poor,
    [Usability.NotValidated]: strings.survey.reusables.usability.notValidated
  })[usability];

  /**
   * Gets localized survey status string
   *
   * @param status survey status
   * @returns localized string
   */
  public static getLocalizedUnits = (unit: Unit): string => ({
    [Unit.Kg]: strings.survey.reusables.units.kg,
    [Unit.M2]: strings.survey.reusables.units.m2,
    [Unit.M3]: strings.survey.reusables.units.m3,
    [Unit.Pcs]: strings.survey.reusables.units.pcs,
    [Unit.Rm]: strings.survey.reusables.units.rm,
    [Unit.Tn]: strings.survey.reusables.units.tn
  })[unit];

}