import { ListItemText, useMediaQuery } from "@mui/material";
import React from "react";
import { NavigationButtonIcon, NavigationButton } from "styled/layout-components/navigation-item";
import theme from "theme";

interface Props {
  icon?: JSX.Element;
  title: string;
  selected: boolean;
  onClick(): void;
}

/**
 * Side panel navigation item component
 */
const NavigationItem: React.FC<Props> = ({
  icon,
  title,
  selected,
  onClick
}) => {
  /**
   * Check if viewport is mobile size
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <NavigationButton
      selected={ selected }
      onClick={ onClick }
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