import { MenuItem, Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import Api from "api";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import WithDebounce from "components/generic/with-debounce";
import { selectKeycloak } from "features/auth-slice";
import { Address, Building, BuildingType } from "generated/client";
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
 * Component for building information
 */
const BuildingView: React.FC<Props> = ({ surveyId }) => {
  const keycloak = useAppSelector(selectKeycloak);
  const errorContext = React.useContext(ErrorContext);
  const [ building, setBuilding ] = React.useState<Building>();
  const [ buildingTypes, setBuildingTypes ] = React.useState<BuildingType[]>();

  /**
   * Fetch building array
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

  /**
   * Fetch building type array
   */
  const fetchBuildingType = async () => {
    if (!keycloak?.token || !surveyId) {
      return;
    }

    try {
      const fetchedBuildingTypes = await Api.getBuildingTypesApi(keycloak.token).listBuildingTypes();

      setBuildingTypes(fetchedBuildingTypes);
    } catch (error) {
      errorContext.setError(strings.errorHandling.buildingTypes.list, error);
    }
  };

  React.useEffect(() => {
    fetchBuilding();
    fetchBuildingType();
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
   * Renders building select textfield with debounce
   * 
   * @param name name
   * @param label label
   * @param onChange onChange
   * @param value value
   */
  const renderBuildingTypeSelect = (
    name: string,
    label: string,
    onChange: React.ChangeEventHandler<HTMLInputElement>,
    value?: string,
  ) => (
    <WithDebounce
      name={ name }
      value={ value }
      label={ label }
      onChange={ onChange }
      component={ props =>
        <TextField
          select
          sx={{ mb: 1 }}
          { ...props }
        >
          { buildingTypes?.map(buildingType =>
            (
              <MenuItem
                key={ buildingType.id }
                value={ buildingType.id }
              >
                { buildingType.name }
              </MenuItem>
            )) }
        </TextField>
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
    onChange: React.ChangeEventHandler<HTMLInputElement>,
    value?: number
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
      buildingTypeId,
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
        {
          renderBuildingTypeSelect(
            "buildingTypeId",
            strings.survey.building.buildingClass,
            onBuildingPropChange,
            buildingTypeId || ""
          )
        }
        {
          renderWithDebounceNumberTextField(
            "constructionYear",
            strings.survey.building.year,
            onBuildingPropChange,
            constructionYear
          )
        }
        {
          renderWithDebounceNumberTextField(
            "space",
            strings.survey.building.area,
            onBuildingPropChange,
            space
          )
        }
        {
          renderWithDebounceNumberTextField(
            "volume",
            strings.survey.building.volume,
            onBuildingPropChange,
            volume
          )
        }
        {
          renderWithDebounceNumberTextField(
            "floors",
            strings.survey.building.floors,
            onBuildingPropChange,
            floors
          )
        }
        {
          renderWithDebounceNumberTextField(
            "basements",
            strings.survey.building.basementFloors,
            onBuildingPropChange,
            basements
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