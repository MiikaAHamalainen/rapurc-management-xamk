import Config from "app/config";
import Keycloak, { KeycloakInstance } from "keycloak-js";

/**
 * Utility class for authentication
 */
export default class AuthUtils {

  /**
   * Initializes Keycloak instance
   *
   * @param keycloak Keycloak instance
   */
  public static keycloakInit = (keycloak: KeycloakInstance) => {
    return new Promise<boolean>((resolve, reject) =>
      keycloak.init({ onLoad: "login-required", checkLoginIframe: false })
        .then(resolve)
        .catch(reject));
  };

  /**
   * Loads user profile from Keycloak
   *
   * @param keycloak keycloak instance
   */
  public static loadUserProfile = (keycloak: KeycloakInstance) => {
    return new Promise((resolve, reject) => keycloak.loadUserProfile()
      .then(resolve)
      .catch(reject));
  };

  /**
   * Initializes Keycloak authentication flow
   *
   * @returns promise of initialized Keycloak instance
   */
  public static initAuth = async (): Promise<KeycloakInstance> => {
    try {
      const keycloak = Keycloak(Config.get().auth);

      await AuthUtils.keycloakInit(keycloak);

      keycloak.token && await AuthUtils.loadUserProfile(keycloak);

      return keycloak;
    } catch (error) {
      return Promise.reject(error);
    }
  };

  /**
   * Refreshes access token
   *
   * @param keycloak Keycloak instance
   * @returns refreshed access token or undefined if token did not need refreshing
   */
  public static refreshAccessToken = async (keycloak?: KeycloakInstance): Promise<KeycloakInstance | undefined> => {
    try {
      if (!keycloak?.authenticated) {
        return;
      }

      const refreshed = await keycloak.updateToken(70);

      if (!refreshed) {
        return;
      }

      const { token, tokenParsed } = keycloak;

      if (!tokenParsed || !tokenParsed.sub || !token) {
        return;
      }

      return keycloak;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
    }
  };

}