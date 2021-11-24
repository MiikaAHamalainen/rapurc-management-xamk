import * as React from "react";
import { MenuItem, Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import strings from "localization/strings";
import theme from "theme";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import { selectKeycloak } from "features/auth-slice";
import { Address, Building } from "generated/client";
import Api from "api";
import WithDebounce from "components/generic/with-debounce";

/**
 * Component properties
 */
interface Props {
  surveyId: string;
}

/**
 * Component for building information
 */
const BuildingView: React.FC<Props> = ({ surveyId }) => {
  const keycloak = useAppSelector(selectKeycloak);
  const errorContext = React.useContext(ErrorContext);
  const [ building, setBuilding ] = React.useState<Building>();

  /**
   * Create new owner information
   */
  const fetchBuilding = async () => {
    if (!keycloak?.token || !surveyId) {
      return;
    }

    try {
      const fetchedBuildings = await Api.getBuildingsApi(keycloak.token).listBuildings({
        surveyId: surveyId
      });

      if (fetchedBuildings.length !== 1) {
        return;
      }

      setBuilding(fetchedBuildings[0]);
    } catch (error) {
      errorContext.setError(strings.errorHandling.buildings.list, error);
    }
  };

  React.useEffect(() => {
    fetchBuilding();
  }, []);

  /**
   * Updates building
   *
   * @param updatedOwnerInformation updated owner information
   */
  const updateBuilding = async (updatedOwnerInformation: Building) => {
    if (!keycloak?.token || !building?.id) {
      return;
    }

    try {
      Api.getBuildingsApi(keycloak.token).updateBuilding({
        surveyId: surveyId,
        buildingId: building.id,
        building: updatedOwnerInformation
      });
    } catch (error) {
      errorContext.setError(strings.errorHandling.buildings.update, error);
    }
  };

  /**
   * Event Handler set survey prop
   */
  const onBuildingPropChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    const { value, name } = target;

    if (!keycloak?.token || !building?.id) {
      return;
    }

    const updatedBuilding: Building = { ...building, [name]: value };
    setBuilding(updatedBuilding);
    updateBuilding(updatedBuilding);
  };

  /**
   * Event Handler set survey contact person prop
   */
  const onBuildingAddressPropChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    const { value, name } = target;

    if (!keycloak?.token || !building?.id) {
      return;
    }

    const updatedBuilding: Building = {
      ...building
    };

    if (!building?.address) {
      const newAddress: Address = {
        streetAddress: "",
        city: "",
        postCode: ""
      };

      updatedBuilding.address = newAddress;
    }

    updatedBuilding.address![name as keyof Address] = value;
    setBuilding(updatedBuilding);
    updateBuilding(updatedBuilding);
  };

  /**
   * Renders textfield with debounce
   * 
   * @param name name
   * @param label label
   * @param value value
   * @param onChange onChange
   */
  const renderWithDebounceTextField = (
    name: string,
    label: string,
    value:string,
    onChange: React.ChangeEventHandler<HTMLInputElement>
  ) => (
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
   * Renders textfield with debounce
   * 
   * @param name name
   * @param label label
   * @param value value
   * @param onChange onChange
   */
  const renderWithDebounceNumberTextField = (
    name: string,
    label: string,
    value:number,
    onChange: React.ChangeEventHandler<HTMLInputElement>
  ) => (
    <WithDebounce
      name={ name }
      value={ value }
      label={ label }
      onChange={ onChange }
      component={ props =>
        <TextField type="number" { ...props }/>
      }
    />
  );

  /**
   * Renders building information form
   */
  const renderBuildingInfoForm = () => {
    if (!building) {
      return null;
    }

    const {
      propertyId,
      buildingId,
      constructionYear,
      space,
      volume,
      floors,
      basements,
      foundation,
      supportingStructure,
      facadeMaterial,
      roofType
    } = building;

    return (
      <>
        <Typography variant="h2">
          { strings.survey.building.title }
        </Typography>
        {
          renderWithDebounceTextField(
            "propertyId",
            strings.survey.building.propertyID,
            propertyId || "",
            onBuildingPropChange
          )
        }
        {
          renderWithDebounceTextField(
            "buildingId",
            strings.survey.building.buildingID,
            buildingId || "",
            onBuildingPropChange
          )
        }
        <TextField disabled select label={ strings.survey.building.buildingClass }>
          <MenuItem>{ strings.generic.notImplemented }</MenuItem>
        </TextField>
        {
          renderWithDebounceNumberTextField(
            "constructionYear",
            strings.survey.building.year,
            constructionYear || 0,
            onBuildingPropChange
          )
        }
        {
          renderWithDebounceNumberTextField(
            "space",
            strings.survey.building.area,
            space || 0,
            onBuildingPropChange
          )
        }
        {
          renderWithDebounceNumberTextField(
            "volume",
            strings.survey.building.volume,
            volume || 0,
            onBuildingPropChange
          )
        }
        {
          renderWithDebounceNumberTextField(
            "floors",
            strings.survey.building.floors,
            floors || 0,
            onBuildingPropChange
          )
        }
        {
          renderWithDebounceNumberTextField(
            "basements",
            strings.survey.building.basementFloors,
            basements || 0,
            onBuildingPropChange
          )
        }
        {
          renderWithDebounceTextField(
            "foundation",
            strings.survey.building.foundationMaterial,
            foundation || "",
            onBuildingPropChange
          )
        }
        {
          renderWithDebounceTextField(
            "supportingStructure",
            strings.survey.building.supportingStructure,
            supportingStructure || "",
            onBuildingPropChange
          )
        }
        {
          renderWithDebounceTextField(
            "facadeMaterial",
            strings.survey.building.façadeMaterial,
            facadeMaterial || "",
            onBuildingPropChange
          )
        }
        {
          renderWithDebounceTextField(
            "roofType",
            strings.survey.building.roofStructure,
            roofType || "",
            onBuildingPropChange
          )
        }
      </>
    );
  };

  /**
   * Renders address form
   */
  const renderAddressForm = () => {
    if (!building) {
      return null;
    }

    const { address } = building;

    return (
      <>
        <Typography variant="h3" sx={{ marginBottom: 0.5 }}>
          { strings.survey.building.address }
        </Typography>
        {
          renderWithDebounceTextField(
            "streetAddress",
            strings.survey.building.street,
            address?.streetAddress || "",
            onBuildingAddressPropChange
          )
        }
        {
          renderWithDebounceTextField(
            "city",
            strings.survey.building.city,
            address?.city || "",
            onBuildingAddressPropChange
          )
        }
        {
          renderWithDebounceTextField(
            "postCode",
            strings.survey.building.postalCode,
            address?.postCode || "",
            onBuildingAddressPropChange
          )
        }
      </>
    );
  };

  /**
   * Check if viewport is mobile size
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  return (
    <Stack direction={ isMobile ? "column" : "row" } spacing={ 2 }>
      <Stack spacing={ 2 } sx={{ flex: 1 }}>
        { renderBuildingInfoForm() }
      </Stack>
      <Stack spacing={ 2 } sx={{ flex: 1 }}>
        { renderAddressForm() }
      </Stack>
    </Stack>
  );
};

export default BuildingView;