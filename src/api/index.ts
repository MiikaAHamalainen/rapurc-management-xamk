import { Configuration } from "../generated/client";

/**
 * Utility class for loading api with predefined configuration
 */
export default class Api {

  /**
   * Gets api configuration
   *
   * @returns new configuration
   */
  private static getConfiguration() {
    return new Configuration({
      basePath: process.env.REACT_APP_API_BASE_PATH
    });
  }

}