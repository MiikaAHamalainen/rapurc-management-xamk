import { LocalizedValue, SurveyStatus, SurveyType, Unit, Usability } from "generated/client";
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

  /**
   * Gets localized demolition scope string
   *
   * @param scope demolition scope
   * @returns localized string
   */
  public static getLocalizedDemolitionScope = (scope: SurveyType): string => ({
    [SurveyType.Demolition]: strings.survey.info.demolitionScopes.full,
    [SurveyType.PartialDemolition]: strings.survey.info.demolitionScopes.partial,
    [SurveyType.Renovation]: strings.survey.info.demolitionScopes.renovation
  })[scope];

  /**
   * Gets localized value for name
   * 
   * @param localizedNames localized names
   * @returns localized name
   */
  public static getLocalizedName = (localizedNames: LocalizedValue[], selectedLanguage: string) => {
    const localizedName = localizedNames.find(name => name.language === selectedLanguage);
    return localizedName?.value || "";
  };

}