// eslint-disable-next-line @typescript-eslint/no-shadow
import * as React from "react";
import { KeycloakInstance } from "keycloak-js";
import { login, selectKeycloak } from "features/auth-slice";
import { useAppDispatch, useAppSelector, useInterval } from "app/hooks";
import AuthUtils from "utils/auth";

/**
 * Component for keeping authentication token fresh
 *
 * @param props component properties
 */
const AccessTokenRefresh: React.FC = ({ children }) => {
  const keycloak = useAppSelector(selectKeycloak);
  const dispatch = useAppDispatch();

  /**
   * Dispatches Keycloak instance to Redux
   *
   * @param keycloak Keycloak instance
   */
  const updateKeycloak = (updatedKeycloak?: KeycloakInstance) => {
    updatedKeycloak && dispatch(login(updatedKeycloak));
  };

  /**
   * Initializes authentication
   */
  React.useEffect(() => {
    AuthUtils.initAuth()
      .then(updateKeycloak)
      // eslint-disable-next-line no-console
      .catch(e => console.error(e));
    // eslint-disable-next-line
  }, []);

  /**
   * Begins token refresh interval
   */
  useInterval(() => AuthUtils.refreshAccessToken(keycloak).then(updateKeycloak), 1000 * 60);

  /**
   * Component render
   */
  return keycloak?.token ? <>{ children }</> : null;
};

export default AccessTokenRefresh;