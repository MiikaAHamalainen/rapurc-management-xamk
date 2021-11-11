import { Button, Stack } from "@mui/material";
import strings from "localization/strings";
import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * Navigation component
 */
const TopNavigation: React.FC = () => {
  const navigate = useNavigate();

  /**
   * Component render
   */
  return (
    <Stack direction="row" spacing={ 2 }>
      <Button
        variant="text"
        onClick={ () => navigate("/surveys") }
      >
        { strings.navigation.surveys }
      </Button>
      <Button
        variant="text"
        onClick={ () => navigate("/new-survey") }
      >
        { strings.navigation.newSurvey }
      </Button>
      <Button
        variant="text"
        onClick={ () => navigate("/admin") }
      >
        { strings.navigation.admin }
      </Button>
    </Stack>
  );
};

export default TopNavigation;