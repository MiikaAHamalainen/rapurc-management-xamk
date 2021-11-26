import { Stack, Button, Typography, TextField, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import Api from "api";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import { selectKeycloak } from "features/auth-slice";
import { Building, OtherStructure } from "generated/client";
import strings from "localization/strings";
import * as React from "react";
import GenericDialog from "components/generic/generic-dialog";
import WithDebounce from "components/generic/with-debounce";

/**
 * Component properties
 */
interface Props {
  surveyId: string;
}

/**
 * Component for other structures
 */
const OtherStructures: React.FC<Props> = ({ surveyId }) => {
  const keycloak = useAppSelector(selectKeycloak);
  const errorContext = React.useContext(ErrorContext);
  const [ building, setBuilding ] = React.useState<Building>();
  const [ creatingOtherStructure, setCreatingOtherStructure ] = React.useState(false);
  const [ deletingOtherStructureId, setDeletingOtherStructureId ] = React.useState<number>();
  const [ newOtherStructureName, setNewOtherStructureName ] = React.useState("");
  const [ newOtherStructureDesc, setNewOtherStructureDesc ] = React.useState("");

  /**
   * Fetch building
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
   * Delete other structure confirm handler
   */
  const onDeleteOtherStructureConfirm = async () => {
    if (!building?.otherStructures || deletingOtherStructureId === undefined) {
      return;
    }

    const updatedOtherStructures = building.otherStructures;

    updatedOtherStructures.splice(deletingOtherStructureId, 1);

    const updatedBuilding: Building = {
      ...building,
      otherStructures: updatedOtherStructures
    };
    await updateBuilding(updatedBuilding);

    setDeletingOtherStructureId(undefined);
  };

  /**
   * Create other structure confirm handler
   */
  const onCreateOtherStructureConfirm = async () => {
    if (!building?.otherStructures) {
      return;
    }

    const newOtherStructure: OtherStructure = {
      name: newOtherStructureName,
      description: newOtherStructureDesc
    };

    const updatedBuilding: Building = {
      ...building,
      otherStructures: [ ...building.otherStructures, newOtherStructure ]
    };
    await updateBuilding(updatedBuilding);

    setNewOtherStructureName("");
    setNewOtherStructureDesc("");
    setCreatingOtherStructure(false);
    fetchBuilding();
  };

  /**
   * Event Handler set building other structure prop
   * 
   * @param index index
   */
  const onBuildingOtherStructurePropChange: (index: number) => React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = (index: number) => ({
    target
  }) => {
    const { value, name } = target;

    if (!keycloak?.token || !building?.id || !building?.otherStructures) {
      return;
    }

    const updatedOtherStructure: OtherStructure = {
      ...building.otherStructures[index],
      [name]: value
    };

    const updatedOtherStructures = building.otherStructures;
    updatedOtherStructures[index] = updatedOtherStructure;

    const updatedBuilding: Building = {
      ...building,
      otherStructures: updatedOtherStructures
    };

    setBuilding(updatedBuilding);
    updateBuilding(updatedBuilding);
  };

  /**
   * Renders new other structure dialog
   */
  const renderNewOtherStructureDialog = () => (
    <GenericDialog
      error={ false }
      open={ creatingOtherStructure }
      onClose={ () => setCreatingOtherStructure(false) }
      onCancel={ () => setCreatingOtherStructure(false) }
      onConfirm={ onCreateOtherStructureConfirm }
      // TODO localization
      title="Other structure"
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <TextField
        // TODO localization
        label="name"
        value={ newOtherStructureName }
        onChange={ e => setNewOtherStructureName(e.target.value) }
      />
      <TextField
        // TODO localization
        label="description"
        value={ newOtherStructureDesc }
        onChange={ e => setNewOtherStructureDesc(e.target.value) }
      />
    </GenericDialog>
  );

  /**
   * Renders delete other structure dialog
   */
  const renderDeleteOtherStructureDialog = () => (
    <GenericDialog
      error={ false }
      open={ deletingOtherStructureId !== undefined }
      onClose={ () => setDeletingOtherStructureId(undefined) }
      onCancel={ () => setDeletingOtherStructureId(undefined) }
      onConfirm={ onDeleteOtherStructureConfirm }
      // TODO localization
      title="delete other structure"
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      {/* TODO localization */}
      sure to delete?
    </GenericDialog>
  );

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
   * Renders other structure accordion
   * 
   * @param otherStructure other structure
   * @param index index
   */
  const renderOtherStructure = (otherStructure: OtherStructure, index: number) => (
    <Accordion key={ index }>
      <AccordionSummary>
        { otherStructure.name }
      </AccordionSummary>
      <AccordionDetails>
        {
          renderWithDebounceTextField(
            "name",
            /* TODO localization */
            "name",
            otherStructure.name,
            onBuildingOtherStructurePropChange(index)
          )
        }
        {
          renderWithDebounceTextField(
            "description",
            /* TODO localization */
            "description",
            otherStructure.description,
            onBuildingOtherStructurePropChange(index)
          )
        }
        <Button
          onClick={ () => setDeletingOtherStructureId(index) }
        >
          {/* TODO localization */}
          delete
        </Button>
      </AccordionDetails>
    </Accordion>
  );

  if (!building?.otherStructures) {
    return null;
  }

  return (
    <>
      {/* TODO localization */}
      <Stack direction="column" spacing={ 2 }>
        <Typography variant="h2">
          Title
        </Typography>
        <Typography variant="h3">
          Jos purkamisen yhteydessä puretaan myös muita samaan kiinteistöön kuuluvia rakennuksia tai rakennelmia, lisää ne tähän listaan.
        </Typography>
        <Button onClick={ () => setCreatingOtherStructure(true) }>
          new Other structure
        </Button>
        { building.otherStructures.map(renderOtherStructure) }
      </Stack>
      { renderNewOtherStructureDialog() }
      { renderDeleteOtherStructureDialog() }
    </>
  );
};

export default OtherStructures;