import { AdminPanelSettings } from "@mui/icons-material";
import { Button, Stack } from "@mui/material";
import VisibleWithRole from "components/containers/visible-with-role";
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
      <VisibleWithRole userRole="admin">
        <Button
          variant="text"
          onClick={ () => navigate("/admin") }
          startIcon={ <AdminPanelSettings htmlColor="#fff"/> }
        >
          { strings.navigation.admin }
        </Button>
      </VisibleWithRole>
    </Stack>
  );
};

export default TopNavigation;