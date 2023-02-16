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
import { LocalizedValue, WasteSpecifier } from "generated/client";
import { selectLanguage } from "features/locale-slice";
import LocalizationUtils from "utils/localization-utils";

/**
 * Component for hazardous waste specifier dropdown menu editor
 */
const HazardousMaterialsSpecifiers: React.FC = () => {
  const errorContext = React.useContext(ErrorContext);
  const keycloak = useAppSelector(selectKeycloak);
  const selectedLanguage = useAppSelector(selectLanguage);
  const availableLanguages = strings.getAvailableLanguages();
  const [ addingHazardousWasteSpecifier, setAddingHazardousWasteSpecifier ] = React.useState(false);
  const [ deletingHazardousWasteSpecifier, setDeletingHazardousWasteSpecifier ] = React.useState(false);
  const [ editingHazardousWasteSpecifier, setEditingHazardousWasteSpecifier ] = React.useState(false);
  const [ loading, setLoading ] = React.useState(false);
  const [ deletableHazardousWasteSpecifier, setDeletableHazardousWasteSpecifier ] = React.useState<WasteSpecifier>();
  const [ editableHazardousWasteSpecifier, setEditableHazardousWasteSpecifier ] = React.useState<WasteSpecifier>();
  const [ hazardousWasteSpecifiers, setHazardousWasteSpecifiers ] = React.useState<WasteSpecifier[]>([]);
  const [ newWasteSpecifierNames, setNewWasteSpecifierNames ] = React.useState<LocalizedValue[]>([]);

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
    if (!keycloak?.token || !newWasteSpecifierNames) {
      return;
    }
    try {
      const createdHazarsousWasteSpecifier = await Api.getWasteSpecifiersApi(keycloak.token).createWasteSpecifier({
        wasteSpecifier: {
          localizedNames: newWasteSpecifierNames,
          metadata: {}
        }
      });
      setHazardousWasteSpecifiers([ ...hazardousWasteSpecifiers, createdHazarsousWasteSpecifier ]);
      setNewWasteSpecifierNames([]);
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

      const hazardousWasteSpecifierList = hazardousWasteSpecifiers.map(
        wasteSpecifier => (wasteSpecifier.id === updatedHazardousWasteSpecifier.id ? updatedHazardousWasteSpecifier : wasteSpecifier)
      );
      setHazardousWasteSpecifiers(hazardousWasteSpecifierList);
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
  const deleteIconClick = (wasteSpecifier: WasteSpecifier) => () => {
    setDeletableHazardousWasteSpecifier(wasteSpecifier);
    setDeletingHazardousWasteSpecifier(true);
  };

  /**
   * Event handler edit icon click
   *
   * @param wasteSpecifier hazardous waste specifier 
   */
  const editIconClick = (wasteSpecifier: WasteSpecifier) => () => {
    setEditableHazardousWasteSpecifier(wasteSpecifier);
    setEditingHazardousWasteSpecifier(true);
  };

  /**
   * Event handler for editable hazardous waste specifier localized name change
   *
   * @param event event
   */
  const handleEditableNameChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    if (!editableHazardousWasteSpecifier) {
      return;
    }

    const { name, value } = target;
    const newLocalizedNames = [ ...editableHazardousWasteSpecifier.localizedNames ];
    const localizedValueIndex = newLocalizedNames.findIndex(localizedValue => localizedValue.language === name);

    if (localizedValueIndex > -1) {
      newLocalizedNames[localizedValueIndex].value = value;
    } else {
      newLocalizedNames.push({ language: name, value: value });
    }

    setEditableHazardousWasteSpecifier({ ...editableHazardousWasteSpecifier, localizedNames: newLocalizedNames });
  };

  /**
   * Even handler for new hazardous waste specifier localized name change
   *
   * @param event event
   */
  const handleNewLocalizedNameChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    if (!newWasteSpecifierNames) {
      return;
    }

    const { name, value } = target;
    const newLocalizedNames = [ ...newWasteSpecifierNames ];
    const localizedValueIndex = newLocalizedNames.findIndex(localizedValue => localizedValue.language === name);

    if (localizedValueIndex > -1) {
      newLocalizedNames[localizedValueIndex].value = value;
      newLocalizedNames[localizedValueIndex].language = name;
    } else {
      newLocalizedNames.push({ language: name, value: value });
    }

    setNewWasteSpecifierNames(newLocalizedNames);
  };

  /**
   * Items for hazardous waste specifier 
   * 
   * @returns hazardous waste specifier items
   */
  const hazardousWasteSpecifierItems = () => (
    hazardousWasteSpecifiers.map(wasteSpecifier =>
      <MaterialItem key={ wasteSpecifier.id }>
        <MaterialText primary={ LocalizationUtils.getLocalizedName(wasteSpecifier.localizedNames, selectedLanguage) }/>
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
      { availableLanguages.map(language => (
        <TextField
          key={ language }
          name={ language }
          label={ language === "fi" ?
            strings.formatString(strings.adminScreen.addNewWasteSpecifierDialog.text.fi) :
            strings.formatString(strings.adminScreen.addNewWasteSpecifierDialog.text.en)
          }
          onChange={ handleNewLocalizedNameChange }
        />
      ))}
    </GenericDialog>
  );

  /**
   * Renders delete hazardous waste specifier dialog
   */
  const renderDeleteHazardousWasteSpecifierDialog = () => {
    if (!deletableHazardousWasteSpecifier) {
      return null;
    }

    return (
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
          {
            strings.formatString(strings.adminScreen.deleteWasteSpecifierDialog.text,
              LocalizationUtils.getLocalizedName(deletableHazardousWasteSpecifier.localizedNames, selectedLanguage))
          }
        </Typography>
      </GenericDialog>
    );
  };

  /**
   * Renders edit hazardous waste specifier dialog
   */
  const renderEditHazardousWasteSpecifierDialog = () => {
    return (
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
        { availableLanguages.map(language => (
          <TextField
            key={ language }
            name={ language }
            label={ language === "fi" ?
              strings.formatString(strings.adminScreen.addNewWasteSpecifierDialog.text.fi) :
              strings.formatString(strings.adminScreen.addNewWasteSpecifierDialog.text.en)
            }
            value={ editableHazardousWasteSpecifier && LocalizationUtils.getLocalizedName(editableHazardousWasteSpecifier.localizedNames, language) }
            onChange={ handleEditableNameChange }
          />
        ))}
      </GenericDialog>
    );
  };

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