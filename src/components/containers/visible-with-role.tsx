import { useAppSelector } from "app/hooks";
import { selectKeycloak } from "features/auth-slice";
import * as React from "react";

/**
 * Component props
 */
interface Props {
  userRole: string;
}

/**
 * Shows content only if user has given role
 *
 * @param props component properties
 */
const VisibleWithRole: React.FC<Props> = ({ userRole, children }) => {
  const token = useAppSelector(selectKeycloak)?.tokenParsed;
  const roles = token?.realm_access?.roles;

  return roles?.includes(userRole) ? <>{ children }</> : null;
};

export default VisibleWithRole;