import { Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import Api from "api";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import WithDebounce from "components/generic/with-debounce";
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
   * Event Handler set survey prop
   */
  const onOwnerInfoPropChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    const { value, name } = target;

    if (!keycloak?.token || !ownerInformation?.id) {
      return;
    }

    const updatedOwnerInformation: OwnerInformation = { ...ownerInformation, [name]: value };
    setOwnerInformation(updatedOwnerInformation);

    try {
      Api.getOwnersApi(keycloak.token).updateOwnerInformation({
        surveyId: surveyId,
        ownerId: ownerInformation.id,
        ownerInformation: updatedOwnerInformation
      });
    } catch (error) {
      errorContext.setError(strings.errorHandling.owner.update, error);
    }
  };

  /**
   * Event Handler set survey contact person prop
   */
  const onOwnerInfoContactPersonPropChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    const { value, name } = target;

    if (!keycloak?.token || !ownerInformation?.id) {
      return;
    }

    const updatedOwnerInformation: OwnerInformation = {
      ...ownerInformation,
      contactPerson: {
        ...ownerInformation.contactPerson,
        [name]: value
      }
    };
    setOwnerInformation(updatedOwnerInformation);

    try {
      Api.getOwnersApi(keycloak.token).updateOwnerInformation({
        surveyId: surveyId,
        ownerId: ownerInformation.id,
        ownerInformation: updatedOwnerInformation
      });
    } catch (error) {
      errorContext.setError(strings.errorHandling.owner.update, error);
    }
  };

  /**
   * Renders textfield with debounce
   * 
   * @param name name
   * @param label label
   * @param value value
   * @param onChange onChange
   */
  const renderWithDebounceTextField = (name: string, label: string, value:string, onChange: React.ChangeEventHandler<HTMLInputElement>) => (
    <WithDebounce
      name={ name }
      value={ value }
      label={ label }
      onChange={ onChange }
      component={ props =>
        <TextField { ...props }/>
      }
    />
  );

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
        {
          renderWithDebounceTextField(
            "ownerName",
            strings.survey.owner.name,
            ownerInformation?.ownerName || "",
            onOwnerInfoPropChange
          )
        }
        <TextField disabled label={ strings.survey.owner.tradeName }/>
      </Stack>
      <Stack spacing={ 2 } sx={{ flex: 1 }}>
        <Typography variant="h3" sx={{ marginBottom: 0.5 }}>
          { strings.survey.owner.contactPerson }
        </Typography>
        {
          renderWithDebounceTextField(
            "firstName",
            strings.survey.owner.firstName,
            ownerInformation?.contactPerson?.firstName || "",
            onOwnerInfoContactPersonPropChange
          )
        }
        {
          renderWithDebounceTextField(
            "lastName",
            strings.survey.owner.surname,
            ownerInformation?.contactPerson?.lastName || "",
            onOwnerInfoContactPersonPropChange
          )
        }
        {
          renderWithDebounceTextField(
            "profession",
            strings.survey.owner.occupation,
            ownerInformation?.contactPerson?.profession || "",
            onOwnerInfoContactPersonPropChange
          )
        }
        {
          renderWithDebounceTextField(
            "phone",
            strings.survey.owner.phone,
            ownerInformation?.contactPerson?.phone || "",
            onOwnerInfoContactPersonPropChange
          )
        }
        {
          renderWithDebounceTextField(
            "email",
            strings.survey.owner.email,
            ownerInformation?.contactPerson?.email || "",
            onOwnerInfoContactPersonPropChange
          )
        }
      </Stack>
    </Stack>
  );
};

export default Owner;