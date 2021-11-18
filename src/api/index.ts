import { Configuration, SurveysApi, BuildingsApi, OwnersApi } from "../generated/client";

/**
 * Utility class for loading api with predefined configuration
 */
export default class Api {

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