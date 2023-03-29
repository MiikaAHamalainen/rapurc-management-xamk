import { Delete, Edit } from "@mui/icons-material";
import { Box, Button, CircularProgress, IconButton, List, ListItemSecondaryAction, Stack, TextField, Typography } from "@mui/material";
import GenericDialog from "components/generic/generic-dialog";
import strings from "localization/strings";
import React from "react";
import Api from "api";
import { useAppSelector } from "app/hooks";
import { MaterialItem, MaterialText } from "../../styled/layout-components/material-item";
import { selectKeycloak } from "features/auth-slice";
import { ErrorContext } from "components/error-handler/error-handler";
import { BuildingType } from "generated/client";
import LocalizationUtils from "utils/localization-utils";
import { selectLanguage } from "features/locale-slice";

const initialNewBuildingTypeState: BuildingType = {
  code: "",
  localizedNames: [],
  metadata: {}
};

/**
 * Component for reusable materials dropdown menu editor
 */
const BuildingTypes: React.FC = () => {
  const errorContext = React.useContext(ErrorContext);
  const keycloak = useAppSelector(selectKeycloak);
  const selectedLanguage = useAppSelector(selectLanguage);
  const availableLanguages = strings.getAvailableLanguages();

  const [ addingBuildingType, setAddingBuildingType ] = React.useState(false);
  const [ deletingBuildingType, setDeletingBuildingType ] = React.useState(false);
  const [ editingBuildingType, setEditingBuildingType ] = React.useState(false);
  const [ loading, setLoading ] = React.useState(false);
  const [ deletableBuildingType, setDeletableBuildingType ] = React.useState<BuildingType>();
  const [ buildingTypes, setBuildingTypes ] = React.useState<BuildingType[]>([]);
  const [ editableBuildingType, setEditableBuildingType ] = React.useState<BuildingType>();
  const [ newBuildingType, setNewBuildingType ] = React.useState<BuildingType>(initialNewBuildingTypeState);

  /**
   * Fetches list of building types
   */
  const fetchBuildingTypes = async () => {
    if (!keycloak?.token) {
      return;
    }

    setLoading(true);

    try {
      setBuildingTypes(await Api.getBuildingTypesApi(keycloak.token).listBuildingTypes());
    } catch (error) {
      errorContext.setError(strings.errorHandling.buildingTypes.list, error);
    }

    setLoading(false);
  };

  /**
   * Effect that loads component data
   */
  React.useEffect(() => {
    fetchBuildingTypes();
  }, []);
  
  /**
   * Event handler for adding building type confirm
   */
  const onAddBuildingTypeConfirm = async () => {
    if (!keycloak?.token || !newBuildingType) {
      return;
    }

    try {
      const createdBuildingType = await Api.getBuildingTypesApi(keycloak.token).createBuildingType({
        buildingType: newBuildingType
      });
      setBuildingTypes([ ...buildingTypes, createdBuildingType ]);
      setNewBuildingType(initialNewBuildingTypeState);
    } catch (error) {
      errorContext.setError(strings.errorHandling.buildingTypes.create, error);
    }

    setAddingBuildingType(false);
  };

  /**
   * Event handler for deleting building type confirm
   */
  const onDeleteReusableMaterialConfirm = async () => {
    if (!keycloak?.token || !deletableBuildingType?.id) {
      return;
    }

    try {
      await Api.getBuildingTypesApi(keycloak.token).deleteBuildingType({ buildingTypeId: deletableBuildingType.id });
      setBuildingTypes(buildingTypes.filter(buildingType => buildingType.id !== deletableBuildingType.id));
      setDeletableBuildingType(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.buildingTypes.delete, error);
    }

    setDeletingBuildingType(false);
  };

  /**
   * Event handler for editing building type confirm
   */
  const onEditBuildingTypeConfirm = async () => {
    if (!keycloak?.token || !editableBuildingType?.id) {
      return;
    }

    try {
      const updatedBuildingType = await Api.getBuildingTypesApi(keycloak.token).updateBuildingType({
        buildingTypeId: editableBuildingType.id,
        buildingType: editableBuildingType
      });

      setBuildingTypes(buildingTypes.map(buildingType => (buildingType.id === updatedBuildingType.id ? updatedBuildingType : buildingType)));
      setEditableBuildingType(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.buildingTypes.update, error);
    }

    setEditingBuildingType(false);
  };

  /**
   * Event handler delete icon click
   *
   * @param buildingType building type
   */
  const deleteIconClick = (buildingType: BuildingType) => () => {
    setDeletableBuildingType(buildingType);
    setDeletingBuildingType(true);
  };

  /**
   * Event handler edit icon click
   *
   * @param buildingType building type
   */
  const editIconClick = (buildingType: BuildingType) => () => {
    setEditableBuildingType(buildingType);
    setEditingBuildingType(true);
  };

  /**
   * Event handler for editable building type string change
   *
   * @param event React change event
   */
  const onEditableBuildingTypeTextChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = ({ target }) => {
    const { value, name } = target;

    if (!value || !name || !editableBuildingType) {
      return;
    }

    setEditableBuildingType({ ...editableBuildingType, [name]: value });
  };

  /**
   * Event handler for editable localized name change
   *
   * @param event event
   */
  const handleEditableLocalizedNameChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    if (!editableBuildingType) {
      return;
    }

    const { name, value } = target;
    const newLocalizedNames = [ ...editableBuildingType.localizedNames ];
    const localizedValueIndex = newLocalizedNames.findIndex(localizedValue => localizedValue.language === name);
    
    if (localizedValueIndex > -1) {
      newLocalizedNames[localizedValueIndex].value = value;
    } else {
      newLocalizedNames.push({ language: name, value: value });
    }

    setEditableBuildingType({ ...editableBuildingType, localizedNames: newLocalizedNames });
  };

  /**
   * Event handler for new building type string change
   *
   * @param event React change event
   */
  const onNewBuildingTypeTextChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = ({ target }) => {
    const { value, name } = target;

    if (!value || !name || !newBuildingType) {
      return;
    }

    setNewBuildingType({ ...newBuildingType, [name]: value });
  };

  /**
   * Even handler for new localized name change
   *
   * @param event event
   */
  const handleNewLocalizedNameChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    const { name, value } = target;
    const localizedNames = newBuildingType.localizedNames ? [ ...newBuildingType.localizedNames ] : [];
    const localizedValueIndex = localizedNames.findIndex(localizedValue => localizedValue.language === name);
  
    if (localizedValueIndex > -1) {
      localizedNames[localizedValueIndex].value = value;
      localizedNames[localizedValueIndex].language = name;
    } else {
      localizedNames.push({ language: name, value: value });
    }
  
    setNewBuildingType({ ...newBuildingType, localizedNames: localizedNames });
  };

  /**
   * Items for building types
   * 
   * @returns building type items
   */
  const buildingTypeItems = () => (
    buildingTypes.map(buildingType =>
      <MaterialItem key={ buildingType.id }>
        <MaterialText primary={ LocalizationUtils.getLocalizedName(buildingType.localizedNames, selectedLanguage) } secondary={ buildingType.code }/>
        <ListItemSecondaryAction>
          <IconButton onClick={ deleteIconClick(buildingType) }>
            <Delete/>
          </IconButton>
          <IconButton onClick={ editIconClick(buildingType) }>
            <Edit/>
          </IconButton>
        </ListItemSecondaryAction>
      </MaterialItem>
    )
  );

  /**
   * Renders add building type dialog
   */
  const renderAddBuildingTypeDialog = () => (
    <GenericDialog
      open={ addingBuildingType }
      onClose={ () => setAddingBuildingType(false) }
      onCancel={ () => setAddingBuildingType(false) }
      onConfirm={ onAddBuildingTypeConfirm }
      title={ strings.adminScreen.addNewBuildingTypeDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Stack spacing={ 2 }>
        { availableLanguages.map(language => (
          <TextField
            key={ language }
            label={ language === "fi" ?
              strings.formatString(strings.adminScreen.dialogText.fi) :
              strings.formatString(strings.adminScreen.dialogText.en)
            }
            helperText={ strings.adminScreen.addNewBuildingTypeDialog.text1help }
            name={ language }
            onChange={ handleNewLocalizedNameChange }
          />
        ))}
        
        <TextField
          label={ strings.adminScreen.addNewBuildingTypeDialog.text2 }
          helperText={ strings.adminScreen.addNewBuildingTypeDialog.text2help }
          name="code"
          onChange={ onNewBuildingTypeTextChange }
        />
      </Stack>
    </GenericDialog>
  );

  /**
   * Renders delete reusable material dialog
   */
  const renderDeleteBuildingTypeDialog = () => (
    <GenericDialog
      open={ deletingBuildingType }
      onClose={ () => setDeletingBuildingType(false) }
      onCancel={ () => setDeletingBuildingType(false) }
      onConfirm={ onDeleteReusableMaterialConfirm }
      title={ strings.adminScreen.deleteBuildingTypeDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography>
        { strings.formatString(strings.adminScreen.deleteBuildingTypeDialog.text,
          deletableBuildingType ?
            LocalizationUtils.getLocalizedName(deletableBuildingType.localizedNames, selectedLanguage)
            : ""
        )}
      </Typography>
    </GenericDialog>
  );

  /**
   * Renders edit reusable dialog
   */
  const renderEditBuildingTypeDialog = () => (
    <GenericDialog
      open={ editingBuildingType }
      onClose={ () => setEditingBuildingType(false) }
      onCancel={ () => setEditingBuildingType(false) }
      onConfirm={ onEditBuildingTypeConfirm }
      title={ strings.adminScreen.updateBuildingTypeDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Stack spacing={ 2 }>
        { availableLanguages.map(language => (
          <TextField
            fullWidth
            key={ language }
            name={ language }
            value={ editableBuildingType && LocalizationUtils.getLocalizedName(editableBuildingType.localizedNames, language) }
            label={ language === "fi" ?
              strings.formatString(strings.adminScreen.dialogText.fi) :
              strings.formatString(strings.adminScreen.dialogText.en)
            }
            onChange={ handleEditableLocalizedNameChange }
          />
        ))}
        <TextField
          fullWidth
          value={ editableBuildingType?.code }
          label={ strings.adminScreen.updateBuildingTypeDialog.text2 }
          name="code"
          onChange={ onEditableBuildingTypeTextChange }
        />
      </Stack>
    </GenericDialog>
  );

  /**
   * Renders list of materials
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
        { buildingTypeItems() }
      </List>
    );
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h2">
          { strings.adminScreen.navigation.dropdownSettings.buildingTypes }
        </Typography>
        <Button
          color="secondary"
          onClick={ () => setAddingBuildingType(true) }
        >
          { strings.generic.addNew }
        </Button>
      </Stack>
      { renderList() }
      { renderAddBuildingTypeDialog() }
      { renderDeleteBuildingTypeDialog() }
      { renderEditBuildingTypeDialog() }
    </>
  );
};

export default BuildingTypes;