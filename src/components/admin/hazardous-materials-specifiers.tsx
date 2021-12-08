import { Delete, Edit } from "@mui/icons-material";
import { Box, Button, CircularProgress, IconButton, List, ListItemSecondaryAction, Stack, TextField, Typography } from "@mui/material";
import GenericDialog from "components/generic/generic-dialog";
import strings from "localization/strings";
import * as React from "react";
import Api from "api";
import { useAppSelector } from "app/hooks";
import { MaterialItem, MaterialText } from "../../styled/layout-components/material-item";
import { selectKeycloak } from "features/auth-slice";
import { ErrorContext } from "components/error-handler/error-handler";
import { WasteSpecifier } from "generated/client";

/**
 * Component for hazardous waste specifier dropdown menu editor
 */
const HazardousMaterialsSpecifiers: React.FC = () => {
  const errorContext = React.useContext(ErrorContext);
  const keycloak = useAppSelector(selectKeycloak);

  const [ addingHazardousWasteSpecifier, setAddingHazardousWasteSpecifier ] = React.useState(false);
  const [ deletingHazardousWasteSpecifier, setDeletingHazardousWasteSpecifier ] = React.useState(false);
  const [ editingHazardousWasteSpecifier, setEditingHazardousWasteSpecifier ] = React.useState(false);
  const [ loading, setLoading ] = React.useState(false);
  const [ deletableHazardousWasteSpecifier, setDeletableHazardousWasteSpecifier ] = React.useState<WasteSpecifier>();
  const [ editableHazardousWasteSpecifier, setEditableHazardousWasteSpecifier ] = React.useState<WasteSpecifier>();
  const [ hazardousWasteSpecifiers, setHazardousWasteSpecifiers ] = React.useState<WasteSpecifier[]>([]);
  const [ newWasteSpecifierName, setNewWasteSpecifierName ] = React.useState<string>();

  /**
   * Fetches list of hazardous waste specifiers
   */
  const fetchWasteSpecifiers = async () => {
    if (!keycloak?.token) {
      return;
    }

    setLoading(true);

    try {
      setHazardousWasteSpecifiers(await Api.getWasteSpecifiersApi(keycloak.token).listWasteSpecifiers());
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteSpecifiers.list, error);
    }

    setLoading(false);
  };

  /**
   * Effect that loads component data
   */
  React.useEffect(() => {
    fetchWasteSpecifiers();
  }, []);
  
  /**
   * Event handler for adding hazardous waste specifier confirm
   */
  const onAddHazardousWasteSpecifierConfirm = async () => {
    if (!keycloak?.token || !newWasteSpecifierName) {
      return;
    }

    try {
      const createdHazarsousWasteSpecifier = await Api.getWasteSpecifiersApi(keycloak.token).createWasteSpecifier({
        wasteSpecifier: {
          name: newWasteSpecifierName,
          metadata: {}
        }
      });
      setHazardousWasteSpecifiers([ ...hazardousWasteSpecifiers, createdHazarsousWasteSpecifier ]);
      setNewWasteSpecifierName(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteSpecifiers.create, error);
    }

    setAddingHazardousWasteSpecifier(false);
  };

  /**
   * Event handler for deleting hazardous waste specifier confirm
   */
  const onDeleteHazardousWasteSpecifierConfirm = async () => {
    if (!keycloak?.token || !deletableHazardousWasteSpecifier?.id) {
      return;
    }

    try {
      await Api.getWasteSpecifiersApi(keycloak.token).deleteWasteSpecifier({ wasteSpecifierId: deletableHazardousWasteSpecifier.id });
      setHazardousWasteSpecifiers(hazardousWasteSpecifiers.filter(wasteSpecifier => wasteSpecifier.id !== deletableHazardousWasteSpecifier.id));
      setDeletableHazardousWasteSpecifier(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteSpecifiers.delete, error);
    }

    setDeletingHazardousWasteSpecifier(false);
  };

  /**
   * Event handler for editing hazardous waste specifier confirm
   */
  const onEditReusableMaterialConfirm = async () => {
    if (!keycloak?.token || !editableHazardousWasteSpecifier?.id) {
      return;
    }

    try {
      const updatedHazardousWasteSpecifier = await Api.getWasteSpecifiersApi(keycloak.token).updateWasteSpecifier({
        wasteSpecifierId: editableHazardousWasteSpecifier.id, wasteSpecifier: editableHazardousWasteSpecifier
      });

      // eslint-disable-next-line max-len
      setHazardousWasteSpecifiers(hazardousWasteSpecifiers.map(wasteSpecifier => (wasteSpecifier.id === updatedHazardousWasteSpecifier.id ? updatedHazardousWasteSpecifier : wasteSpecifier)));
      setEditableHazardousWasteSpecifier(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteSpecifiers.update, error);
    }

    setEditingHazardousWasteSpecifier(false);
  };

  /**
   * Event handler delete icon click
   *
   * @param wasteSpecifier hazardous waste specifier
   */
  const deleteIconClick = (wasteSpecifier : WasteSpecifier) => () => {
    setDeletableHazardousWasteSpecifier(wasteSpecifier);
    setDeletingHazardousWasteSpecifier(true);
  };

  /**
   * Event handler edit icon click
   *
   * @param wasteSpecifier hazardous waste specifier 
   */
  const editIconClick = (wasteSpecifier : WasteSpecifier) => () => {
    setEditableHazardousWasteSpecifier(wasteSpecifier);
    setEditingHazardousWasteSpecifier(true);
  };

  /**
   * Even handler for editable hazardous waste specifier name change
   */
  const handleEditableNameChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    editableHazardousWasteSpecifier && setEditableHazardousWasteSpecifier({ ...editableHazardousWasteSpecifier, name: target.value });
  };

  /**
   * Items for hazardous waste specifier 
   * 
   * @returns hazardous waste specifier items
   */
  const hazardousWasteSpecifierItems = () => (
    hazardousWasteSpecifiers.map(wasteSpecifier =>
      <MaterialItem key={ wasteSpecifier.id }>
        <MaterialText primary={ wasteSpecifier.name }/>
        <ListItemSecondaryAction>
          <IconButton onClick={ deleteIconClick(wasteSpecifier) }>
            <Delete/>
          </IconButton>
          <IconButton onClick={ editIconClick(wasteSpecifier) }>
            <Edit/>
          </IconButton>
        </ListItemSecondaryAction>
      </MaterialItem>
    )
  );

  /**
   * Renders add hazardous waste specifier dialog
   */
  const renderAddReusableMaterialDialog = () => (
    <GenericDialog
      error={ false }
      open={ addingHazardousWasteSpecifier }
      onClose={ () => setAddingHazardousWasteSpecifier(false) }
      onCancel={ () => setAddingHazardousWasteSpecifier(false) }
      onConfirm={ onAddHazardousWasteSpecifierConfirm }
      title={ strings.adminScreen.addNewWasteSpecifierDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <TextField
        label={ strings.adminScreen.addNewWasteSpecifierDialog.text }
        onChange={ event => setNewWasteSpecifierName(event.target.value) }
      />
    </GenericDialog>
  );

  /**
   * Renders delete hazardous waste specifier dialog
   */
  const renderDeleteHazardousWasteSpecifierDialog = () => (
    <GenericDialog
      error={ false }
      open={ deletingHazardousWasteSpecifier }
      onClose={ () => setDeletingHazardousWasteSpecifier(false) }
      onCancel={ () => setDeletingHazardousWasteSpecifier(false) }
      onConfirm={ onDeleteHazardousWasteSpecifierConfirm }
      title={ strings.adminScreen.deleteWasteSpecifierDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography>
        { strings.formatString(strings.adminScreen.deleteWasteSpecifierDialog.text, deletableHazardousWasteSpecifier ? deletableHazardousWasteSpecifier.name : "") }
      </Typography>
    </GenericDialog>
  );

  /**
   * Renders edit hazardous waste specifier dialog
   */
  const renderEditHazardousWasteSpecifierDialog = () => (
    <GenericDialog
      error={ false }
      open={ editingHazardousWasteSpecifier }
      onClose={ () => setEditingHazardousWasteSpecifier(false) }
      onCancel={ () => setEditingHazardousWasteSpecifier(false) }
      onConfirm={ onEditReusableMaterialConfirm }
      title={ strings.adminScreen.updateWasteSpecifierDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <TextField
        label={ strings.adminScreen.updateWasteSpecifierDialog.text }
        value={ editableHazardousWasteSpecifier?.name }
        onChange={ handleEditableNameChange }
      />
    </GenericDialog>
  );

  /**
   * Renders list of hazardous waste specifiers
   */
  const renderList = () => {
    if (loading) {
      return (
        <Box
          display="flex"
          flex={ 1 }
          justifyContent="center"
          alignItems="center"
        >
          <CircularProgress color="primary" size={ 60 }/>
        </Box>
      );
    }

    return (
      <List sx={{ pt: 4 }}>
        { hazardousWasteSpecifierItems() }
      </List>
    );
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h2">
          { strings.adminScreen.navigation.dropdownSettings.hazardousMaterialsAdditionalInfo }
        </Typography>
        <Button
          color="secondary"
          onClick={ () => setAddingHazardousWasteSpecifier(true) }
        >
          { strings.generic.addNew }
        </Button>
      </Stack>
      { renderList() }
      { renderAddReusableMaterialDialog() }
      { renderDeleteHazardousWasteSpecifierDialog() }
      { renderEditHazardousWasteSpecifierDialog() }
    </>
  );
};

export default HazardousMaterialsSpecifiers;