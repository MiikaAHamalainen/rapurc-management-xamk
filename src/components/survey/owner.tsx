import { Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import Api from "api";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import { selectKeycloak } from "features/auth-slice";
import { OwnerInformation } from "generated/client";
import strings from "localization/strings";
import * as React from "react";
import theme from "theme";

/**
 * Component properties
 */
interface Props {
  surveyId: string;
}

/**
 * Component for owner information
 */
const Owner: React.FC<Props> = ({ surveyId }) => {
  const keycloak = useAppSelector(selectKeycloak);
  const errorContext = React.useContext(ErrorContext);
  const [ ownerInformation, setOwnerInformation ] = React.useState<OwnerInformation | undefined>(undefined);

  /**
   * Create new owner information
   * 
   * @param surveyId survey id
   */
  const fetchOwnerInformation = async () => {
    if (!keycloak?.token || !surveyId) {
      return;
    }

    try {
      const fetchedOwnerInformationArray = await Api.getOwnersApi(keycloak.token).listOwnerInformation({
        surveyId: surveyId
      });
      setOwnerInformation(fetchedOwnerInformationArray[0]);
    } catch (error) {
      errorContext.setError(strings.errorHandling.owner.create, error);
    }
  };

  React.useEffect(() => {
    fetchOwnerInformation();
  }, []);

  /**
   * Check if viewport is mobile size
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  return (
    <Stack direction={ isMobile ? "column" : "row" } spacing={ 2 }>
      <Stack spacing={ 2 } sx={{ flex: 1 }}>
        <Typography variant="h2">
          { strings.survey.owner.title }
        </Typography>
        <TextField label={ strings.survey.owner.name }/>
        <TextField label={ strings.survey.owner.tradeName }/>
      </Stack>
      <Stack spacing={ 2 } sx={{ flex: 1 }}>
        <Typography variant="h3" sx={{ marginBottom: 0.5 }}>
          { strings.survey.owner.contactPerson }
        </Typography>
        <TextField label={ strings.survey.owner.firstName }/>
        <TextField label={ strings.survey.owner.surname }/>
        <TextField label={ strings.survey.owner.occupation }/>
        <TextField label={ strings.survey.owner.phone }/>
        <TextField label={ strings.survey.owner.email }/>
      </Stack>
    </Stack>
  );
};

export default Owner;