import { Configuration, SurveysApi, BuildingsApi, OwnersApi, ReusableMaterialApi, UsagesApi, WasteSpecifiersApi, WasteCategoryApi, WasteMaterialApi } from "../generated/client";

/**
 * Utility class for loading api with predefined configuration
 */
export default class Api {

  /**
   * Gets initialized waste material API
   *
   * @param accessToken access token
   * @returns initialized waste material API
   */
  public static getWasteMaterialApi = (accessToken: string) => {
    return new WasteMaterialApi(Api.getConfiguration(accessToken));
  };

  /**
   * Gets initialized waste category API
   *
   * @param accessToken access token
   * @returns initialized waste category API
   */
  public static getWasteCategoryApi = (accessToken: string) => {
    return new WasteCategoryApi(Api.getConfiguration(accessToken));
  };

  /**
   * Gets initialized waste specifiers API
   *
   * @param accessToken access token
   * @returns initialized waste specifiers API
   */
  public static getWasteSpecifiersApi = (accessToken: string) => {
    return new WasteSpecifiersApi(Api.getConfiguration(accessToken));
  };

  /**
   * Gets initialized usages API
   *
   * @param accessToken access token
   * @returns initialized usages API
   */
  public static getUsagesApi = (accessToken: string) => {
    return new UsagesApi(Api.getConfiguration(accessToken));
  };

  /**
   * Gets initialized reusable materials API
   *
   * @param accessToken access token
   * @returns initialized reusable materials API
   */
  public static getReusableMaterialApi = (accessToken: string) => {
    return new ReusableMaterialApi(Api.getConfiguration(accessToken));
  };

  /**
   * Gets initialized surveys API
   *
   * @param accessToken access token
   * @returns initialized surveys API
   */
  public static getSurveysApi = (accessToken: string) => {
    return new SurveysApi(Api.getConfiguration(accessToken));
  };

  /**
   * Gets initialized buildings API
   *
   * @param accessToken access token
   * @returns initialized buildings API
   */
  public static getBuildingsApi = (accessToken: string) => {
    return new BuildingsApi(Api.getConfiguration(accessToken));
  };

  /**
   * Gets initialized owners API
   *
   * @param accessToken access token
   * @returns initialized owners API
   */
  public static getOwnersApi = (accessToken: string) => {
    return new OwnersApi(Api.getConfiguration(accessToken));
  };

  /**
   * Gets api configuration
   *
   * @returns new configuration
   */
  private static getConfiguration(accessToken: string) {
    return new Configuration({
      basePath: process.env.REACT_APP_API_BASE_URL,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

}