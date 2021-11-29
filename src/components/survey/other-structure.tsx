import { Stack, Button, Typography, TextField, Accordion, AccordionSummary, AccordionDetails, Box, List } from "@mui/material";
import Api from "api";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import { selectKeycloak } from "features/auth-slice";
import { Building, OtherStructure } from "generated/client";
import strings from "localization/strings";
import * as React from "react";
import GenericDialog from "components/generic/generic-dialog";
import WithDebounce from "components/generic/with-debounce";
import produce from "immer";
import { Add, ExpandMore } from "@mui/icons-material";

/**
 * Component properties
 */
interface Props {
  surveyId: string;
}

/**
 * Component for other structures
 *
 * @param props component properties
 */
const OtherStructures: React.FC<Props> = ({ surveyId }) => {
  const keycloak = useAppSelector(selectKeycloak);
  const errorContext = React.useContext(ErrorContext);
  const [ building, setBuilding ] = React.useState<Building>();
  const [ creatingOtherStructure, setCreatingOtherStructure ] = React.useState(false);
  const [ deletingOtherStructureIndex, setDeletingOtherStructureIndex ] = React.useState<number>();
  const [ newOtherStructure, setNewOtherStructure ] = React.useState({} as OtherStructure);

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
   * @param updatedBuilding updated building information
   */
  const updateBuilding = async (updatedBuilding: Building) => {
    if (!keycloak?.token || !building?.id) {
      return;
    }

    try {
      const fetchedUpdatedBuilding = await Api.getBuildingsApi(keycloak.token).updateBuilding({
        surveyId: surveyId,
        buildingId: building.id,
        building: updatedBuilding
      });

      setBuilding(fetchedUpdatedBuilding);
    } catch (error) {
      errorContext.setError(strings.errorHandling.buildings.update, error);
    }
  };

  /**
   * Delete other structure confirm handler
   */
  const onDeleteOtherStructureConfirm = async () => {
    if (!building?.otherStructures || deletingOtherStructureIndex === undefined) {
      return;
    }

    const updatedBuilding = produce(building, draft => {
      draft.otherStructures?.splice(deletingOtherStructureIndex, 1);
    });

    await updateBuilding(updatedBuilding);
    setDeletingOtherStructureIndex(undefined);
  };

  /**
   * Create other structure confirm handler
   */
  const onCreateOtherStructureConfirm = async () => {
    if (!building?.otherStructures) {
      return;
    }

    const updatedBuilding: Building = {
      ...building,
      otherStructures: [ ...building.otherStructures, newOtherStructure ]
    };

    await updateBuilding(updatedBuilding);
    setNewOtherStructure({} as OtherStructure);
    setCreatingOtherStructure(false);
  };

  /**
   * Event Handler set pending new machine prop
   */
  const onNewOtherStructurePropChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    const { value, name } = target;
    setNewOtherStructure({ ...newOtherStructure, [name]: value });
  };

  /**
   * Event Handler set building other structure prop
   * 
   * @param index index
   */
const onBuildingOtherStructurePropChange = (index: number): React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> => ({ target }) => {
    const { value, name } = target;

    if (!keycloak?.token || !building?.id || !building?.otherStructures) {
      return;
    }

    const updatedBuilding = produce(building, draft => {
      draft.otherStructures!![index] = {
        ...draft.otherStructures!![index],
        [name]: value
      };
    });

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
      title={ strings.survey.otherStructures.dialog.title }
      positiveButtonText={ strings.generic.add }
      cancelButtonText={ strings.generic.cancel }
    >
      <Stack spacing={ 2 }>
        <TextField
          name="name"
          label={ strings.survey.otherStructures.dialog.name }
          color="primary"
          value={ newOtherStructure.name }
          onChange={ onNewOtherStructurePropChange }
        />
        <TextField
          name="description"
          label={ strings.survey.otherStructures.dialog.description }
          multiline
          rows={ 4 }
          color="primary"
          value={ newOtherStructure.description }
          onChange={ onNewOtherStructurePropChange }
        />
      </Stack>
    </GenericDialog>
  );

  /**
   * Renders delete other structure dialog
   */
  const renderDeleteOtherStructureDialog = () => (
    <GenericDialog
      error={ false }
      open={ deletingOtherStructureIndex !== undefined }
      onClose={ () => setDeletingOtherStructureIndex(undefined) }
      onCancel={ () => setDeletingOtherStructureIndex(undefined) }
      onConfirm={ onDeleteOtherStructureConfirm }
      title={ strings.survey.otherStructures.dialog.deleteBuilding }
      positiveButtonText={ strings.generic.delete }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography>
        { strings.survey.otherStructures.dialog.areYouSure }
      </Typography>
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
    onChange: React.ChangeEventHandler<HTMLInputElement>,
    multiline?: boolean,
    rows?: number
  ) => (
    <WithDebounce
      name={ name }
      value={ value }
      label={ label }
      onChange={ onChange }
      component={ props =>
        <TextField
          multiline={ multiline }
          rows={ rows }
          { ...props }
        />
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
    <Accordion key={ index } disableGutters>
      <AccordionSummary expandIcon={ <ExpandMore/> }>
        { otherStructure.name }
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={ 2 }>
          {
            renderWithDebounceTextField(
              "name",
              strings.survey.otherStructures.dialog.name,
              otherStructure.name,
              onBuildingOtherStructurePropChange(index)
            )
          }
          {
            renderWithDebounceTextField(
              "description",
              strings.survey.otherStructures.dialog.description,
              otherStructure.description,
              onBuildingOtherStructurePropChange(index),
              true,
              4
            )
          }
          <Button
            variant="outlined"
            color="primary"
            onClick={ () => setDeletingOtherStructureIndex(index) }
          >
            { strings.generic.delete }
          </Button>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );

  if (!building?.otherStructures) {
    return null;
  }

  return (
    <>
      <Stack spacing={ 2 } sx={{ flex: 1 }}>
        <Typography variant="h2">
          { strings.survey.otherStructures.title }
        </Typography>
        <Typography>
          { strings.survey.otherStructures.description }
        </Typography>
        <Box>
          <Button
            color="secondary"
            startIcon={<Add/>}
            onClick={ () => setCreatingOtherStructure(true) }
          >
            { strings.survey.otherStructures.add }
          </Button>
        </Box>
        <List>
          { building.otherStructures.map(renderOtherStructure) }
        </List>
      </Stack>
      { renderNewOtherStructureDialog() }
      { renderDeleteOtherStructureDialog() }
    </>
  );
};

export default OtherStructures;