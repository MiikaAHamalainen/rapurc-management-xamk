import React from "react";
import { ListItemText, useMediaQuery } from "@mui/material";
import { NavigationButtonIcon, NavigationButton } from "styled/layout-components/navigation-item";
import theme from "theme";
import { useResolvedPath, useMatch, useNavigate } from "react-router-dom";

/**
 * Component properties
 */
interface Props {
  icon?: React.ReactNode;
  title: string;
  to: string;
}

/**
 * Side panel navigation item component
 *
 * @param props component properties
 */
const NavigationItem: React.FC<Props> = ({
  icon,
  title,
  to
}) => {
  const navigate = useNavigate();
  const resolved = useResolvedPath(to);
  const match = useMatch({ path: resolved.pathname, end: true });

  /**
   * Check if viewport is mobile size
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <NavigationButton
      selected={ match !== null }
      onClick={ () => navigate(to) }
    >
      { icon &&
        <NavigationButtonIcon>
          { icon }
        </NavigationButtonIcon>
      }
      { !isMobile &&
        <ListItemText primary={ title }/>
      }
    </NavigationButton>
  );
};

export default NavigationItem;