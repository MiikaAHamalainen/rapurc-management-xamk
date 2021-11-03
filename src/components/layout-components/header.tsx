import { ArrowBackIosNewSharp, Person } from "@mui/icons-material";
import { Hidden, IconButton, Stack, Toolbar, Typography } from "@mui/material";
import strings from "localization/strings";
import React from "react";
import { useHistory } from "react-router-dom";
import { AppTitle, Root } from "styled/layout-components/header";
import Navigation from "./top-navigation";

interface Props {
  title: string;
  back?: boolean;
}

/**
 * Header component
 */
const Header: React.FC<Props> = ({
  title,
  children,
  back
}) => {
  const history = useHistory();

  return (
    <Root position="relative">
      <Toolbar>
        <AppTitle>
          { strings.appTitle }
        </AppTitle>
        <Stack direction="row" spacing={ 2 }>
          <Hidden smDown>
            <Navigation/>
          </Hidden>
          <IconButton>
            <Person htmlColor="#ffffff"/>
          </IconButton>
        </Stack>
      </Toolbar>
      <Toolbar>
        <Stack
          direction="row"
          spacing={ 2 }
          sx={{ alignItems: "center" }}
        >
          { back &&
            <IconButton onClick={ () => history.goBack() }>
              <ArrowBackIosNewSharp htmlColor="#ffffff"/>
            </IconButton>
          }
          <Typography variant="h1">
            { title }
          </Typography>
        </Stack>
      </Toolbar>
      { children }
    </Root>
  );
};

export default Header;