import { Delete, Edit } from "@mui/icons-material";
import { Box, Button, CircularProgress, IconButton, List, ListItemSecondaryAction, Stack, TextField, Typography } from "@mui/material";
import strings from "localization/strings";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import * as React from "react";
import Api from "api";
import { selectKeycloak } from "features/auth-slice";
import { MaterialItem, MaterialText } from "../../styled/layout-components/material-item";
import { WasteCategory } from "generated/client";
import GenericDialog from "components/generic/generic-dialog";
import { selectLanguage } from "features/locale-slice";
import LocalizationUtils from "utils/localization-utils";

const initialNewCategoryState: WasteCategory = {
  localizedNames: [],
  ewcCode: "",
  metadata: {}
};

/**
 * Component for waste categories dropdown menu editor
 */
const WasteCategories: React.FC = () => {
  const errorContext = React.useContext(ErrorContext);
  const keycloak = useAppSelector(selectKeycloak);
  const selectedLanguage = useAppSelector(selectLanguage);
  const availableLanguages = strings.getAvailableLanguages();
  
  const [ loading, setLoading ] = React.useState(false);
  const [ addingWasteCategory, setAddingWasteCategory ] = React.useState(false);
  const [ deletingWasteCategory, setDeletingWasteCategory ] = React.useState(false);
  const [ editingWasteCategory, setEditingWasteCategory ] = React.useState(false);
  const [ wasteCategories, setWasteCategories ] = React.useState<WasteCategory[]>([]);
  const [ deletableWasteCategory, setDeletableWasteCategory ] = React.useState<WasteCategory>();
  const [ newWasteCategory, setNewWasteCategory ] = React.useState<WasteCategory>(initialNewCategoryState);
  const [ editableWasteCategory, setEditableWasteCategory ] = React.useState<WasteCategory>();

  /**
   * Fetches list of waste categories
   */
  const fetchWasteCategories = async () => {
    if (!keycloak?.token) {
      return;
    }

    setLoading(true);

    try {
      setWasteCategories(await Api.getWasteCategoryApi(keycloak.token).listWasteCategories());
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteCategories.list, error);
    }

    setLoading(false);
  };

  /**
   * Effect that loads component data
   */
  React.useEffect(() => {
    fetchWasteCategories();
  }, []);

  /**
   * Event handler for adding waste category confirm
   */
  const onAddWasteCategoryConfirm = async () => {
    if (!keycloak?.token || !newWasteCategory) {
      return;
    }
    
    try {
      const createdWasteCategory = await Api.getWasteCategoryApi(keycloak.token).createWasteCategory({
        wasteCategory: newWasteCategory
      });
      setWasteCategories([ ...wasteCategories, createdWasteCategory ]);
      setNewWasteCategory(initialNewCategoryState);
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteCategories.create, error);
    }

    setAddingWasteCategory(false);
  };

  /**
   * Event handler for deleting waste category confirm
   */
  const onDeleteWasteCategoryConfirm = async () => {
    if (!keycloak?.token || !deletableWasteCategory?.id) {
      return;
    }

    try {
      await Api.getWasteCategoryApi(keycloak.token).deleteWasteCategory({ wasteCategoryId: deletableWasteCategory?.id });
      setWasteCategories(wasteCategories.filter(wasteCategory => wasteCategory.id !== deletableWasteCategory.id));
      setDeletableWasteCategory(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteCategories.delete, error);
    }

    setDeletingWasteCategory(false);
  };

  /**
   * Event handler for editing waste category confirm
   */
  const onEditWasteCategoryConfirm = async () => {
    if (!keycloak?.token || !editableWasteCategory?.id) {
      return;
    }

    try {
      const updatedWasteCategory = await Api.getWasteCategoryApi(keycloak.token).updateWasteCategory({
        wasteCategoryId: editableWasteCategory.id,
        wasteCategory: editableWasteCategory
      });

      setWasteCategories(wasteCategories.map(wasteCategory => (wasteCategory.id === editableWasteCategory.id ? updatedWasteCategory : wasteCategory)));
      setEditableWasteCategory(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteCategories.update, error);
    }

    setEditingWasteCategory(false);
  };

  /**
   * Event handler delete icon click
   *
   * @param wasteCategory waste category
   */
  const deleteIconClick = (wasteCategory: WasteCategory) => {
    setDeletableWasteCategory(wasteCategory);
    setDeletingWasteCategory(true);
  };

  /**
   * Event handler edit icon click
   *
   * @param wasteCategory waste category
   */
  const editIconClick = (wasteCategory: WasteCategory) => () => {
    setEditableWasteCategory(wasteCategory);
    setEditingWasteCategory(true);
  };

  /**
   * Event handler for new waste category change
   *
   * @param event React change event
   */
  const onNewWasteCategoryChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = ({ target }) => {
    const { value, name } = target;

    if (!value || !name || !newWasteCategory) {
      return;
    }

    setNewWasteCategory({ ...newWasteCategory, [name]: value });
  };

  /**
   * Even handler for new localized name change
   *
   * @param event event
   */
  const handleNewLocalizedNameChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    const { name, value } = target;
    const localizedNames = newWasteCategory.localizedNames ? [ ...newWasteCategory.localizedNames ] : [];
    const localizedValueIndex = localizedNames.findIndex(localizedValue => localizedValue.language === name);

    if (localizedValueIndex > -1) {
      localizedNames[localizedValueIndex].value = value;
      localizedNames[localizedValueIndex].language = name;
    } else {
      localizedNames.push({ language: name, value: value });
    }

    setNewWasteCategory({ ...newWasteCategory, localizedNames: localizedNames });
  };

  /**
   * Event handler for editable waste category change
   *
   * @param event React change event
   */
  const onEditableWasteCategoryChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = ({ target }) => {
    const { value, name } = target;

    if (!name || !editableWasteCategory) {
      return;
    }

    setEditableWasteCategory({ ...editableWasteCategory, [name]: value || "" });
  };

  /**
   * Event handler for editable localized name change
   *
   * @param event event
   */
  const handleEditableLocalizedNameChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    if (!editableWasteCategory) {
      return;
    }
  
    const { name, value } = target;
    const newLocalizedNames = [ ...editableWasteCategory.localizedNames ];
    const localizedValueIndex = newLocalizedNames.findIndex(localizedValue => localizedValue.language === name);
      
    if (localizedValueIndex > -1) {
      newLocalizedNames[localizedValueIndex].value = value;
    } else {
      newLocalizedNames.push({ language: name, value: value });
    }

    setEditableWasteCategory({ ...editableWasteCategory, localizedNames: newLocalizedNames });
  };

  /**
   * Items for waste category
   * 
   * @returns waste category items
   */
  const wasteCategoryItems = () => (
    wasteCategories.map(wasteCategory =>
      <MaterialItem key={ wasteCategory.id }>
        <MaterialText
          primary={ LocalizationUtils.getLocalizedName(wasteCategory.localizedNames, selectedLanguage) }
          secondary={ wasteCategory.ewcCode }
        />
        <ListItemSecondaryAction>
          <IconButton onClick={ () => deleteIconClick(wasteCategory) }>
            <Delete/>
          </IconButton>
          <IconButton onClick={ editIconClick(wasteCategory) }>
            <Edit/>
          </IconButton>
        </ListItemSecondaryAction>
      </MaterialItem>
    )
  );

  /**
   * Renders add waste dialog
   */
  const renderAddWasteCategoryDialog = () => (
    <GenericDialog
      open={ addingWasteCategory }
      onClose={ () => setAddingWasteCategory(false) }
      onCancel={ () => setAddingWasteCategory(false) }
      onConfirm={ onAddWasteCategoryConfirm }
      title={ strings.adminScreen.addNewWasteCategoryDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Stack spacing={ 2 }>
        { availableLanguages.map(language => (
          <TextField
            key={ language }
            name={ language }
            label={ language === "fi" ?
              strings.formatString(strings.adminScreen.dialogText.fi) :
              strings.formatString(strings.adminScreen.dialogText.en)
            }
            onChange={ handleNewLocalizedNameChange }
          />
        ))}
        
        <TextField
          name="ewcCode"
          label={ strings.adminScreen.addNewWasteCategoryDialog.text2 }
          onChange={ onNewWasteCategoryChange }
        />
      </Stack>
    </GenericDialog>
  );

  /**
   * Renders delete waste category dialog
   */
  const renderDeleteWasteCategoryDialog = () => (
    <GenericDialog
      open={ deletingWasteCategory }
      onClose={ () => setDeletingWasteCategory(false) }
      onCancel={ () => setDeletingWasteCategory(false) }
      onConfirm={ onDeleteWasteCategoryConfirm }
      title={ strings.adminScreen.deleteWasteCategoryDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography>
        { strings.formatString(strings.adminScreen.deleteWasteCategoryDialog.text,
          deletableWasteCategory ? LocalizationUtils.getLocalizedName(deletableWasteCategory.localizedNames, selectedLanguage) : "") }
      </Typography>
    </GenericDialog>
  );

  /**
   * Renders edit waste category dialog
   */
  const renderEditWasteCategoryDialog = () => (
    <GenericDialog
      open={ editingWasteCategory }
      onClose={ () => setEditingWasteCategory(false) }
      onCancel={ () => setEditingWasteCategory(false) }
      onConfirm={ onEditWasteCategoryConfirm }
      title={ strings.adminScreen.updateWasteCategoryDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Stack spacing={ 2 }>
        { availableLanguages.map(language => (
          <TextField
            fullWidth
            key={ language }
            value={ editableWasteCategory && LocalizationUtils.getLocalizedName(editableWasteCategory.localizedNames, language) }
            label={ language === "fi" ?
              strings.formatString(strings.adminScreen.dialogText.fi) :
              strings.formatString(strings.adminScreen.dialogText.en)
            }
            name={ language }
            onChange={ handleEditableLocalizedNameChange }
          />
        ))}
        <TextField
          value={ editableWasteCategory?.ewcCode }
          label={ strings.adminScreen.updateWasteCategoryDialog.text2 }
          name="ewcCode"
          onChange={ onEditableWasteCategoryChange }
        />
      </Stack>
    </GenericDialog>
  );

  /**
   * Renders list of categories
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
        { wasteCategoryItems() }
      </List>
    );
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h2">
          { strings.adminScreen.navigation.dropdownSettings.wasteCategories }
        </Typography>
        <Button
          color="secondary"
          onClick={ () => setAddingWasteCategory(true) }
        >
          { strings.generic.addNew }
        </Button>
      </Stack>
      { renderList() }
      { renderAddWasteCategoryDialog() }
      { renderDeleteWasteCategoryDialog() }
      { renderEditWasteCategoryDialog() }
    </>
  );
};

export default WasteCategories;