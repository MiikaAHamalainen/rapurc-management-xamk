import { Button, Stack } from "@mui/material";
import strings from "localization/strings";
import React from "react";
import { useHistory } from "react-router-dom";

/**
 * Navigation component
 */
const TopNavigation: React.FC = () => {
  const history = useHistory();
  /**
   * Component render
   */
  return (
    <Stack direction="row" spacing={ 2 }>
      <Button
        variant="text"
        onClick={ () => history.push("/surveys") }
      >
        { strings.navigation.surveys }
      </Button>
      <Button
        variant="text"
        onClick={ () => history.push("/new-survey") }
      >
        { strings.navigation.newSurvey }
      </Button>
      <Button
        variant="text"
        onClick={ () => history.push("/admin") }
      >
        { strings.navigation.admin }
      </Button>
    </Stack>
  );
};

export default TopNavigation;