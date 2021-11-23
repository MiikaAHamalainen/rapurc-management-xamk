import { Delete } from "@mui/icons-material";
import { Button, CircularProgress, IconButton, List, ListItemSecondaryAction, Stack, TextField, Typography } from "@mui/material";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import GenericDialog from "components/generic/generic-dialog";
import { selectKeycloak } from "features/auth-slice";
import { WasteCategory } from "generated/client";
import strings from "localization/strings";
import * as React from "react";
import Api from "api";
import { MaterialItem, MaterialText } from "../../styled/layout-components/material-item";

/**
 * Component for hazardous materials dropdown menu editor
 */
const HazardousMaterials: React.FC = () => {
  const errorContext = React.useContext(ErrorContext);
  const keycloak = useAppSelector(selectKeycloak);
  const [ addingCategory, setAddingCategory ] = React.useState(false);
  const [ deletingCategory, setDeletingCategory ] = React.useState(false);
  const [ deletableCategory, setDeletableCategory ] = React.useState<WasteCategory>();
  const [ categories, setCategories] = React.useState<WasteCategory[]>([]);
  const [ newCategoryName, setNewCategoryName ] = React.useState<string>();
  const [ newEwcCode, setNewEwcCode ] = React.useState<string>();
  const [ loading, setLoading ] = React.useState(false);

  /**
   * Fetches list of waste categories
   */
  const fetchWasteCategories = async () => {
    setLoading(true);
    if (!keycloak?.token) {
      return;
    }

    try {
      const fetchedCategories = await Api.getWasteCategoryApi(keycloak.token).listWasteCategories();
      setCategories(fetchedCategories);
      setLoading(false);
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteCategories.list, error);
      setLoading(false);
    }
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
    if (!keycloak?.token || !newCategoryName || !newEwcCode) {
      return;
    }

    try {
      const createdWasteCategory = await Api.getWasteCategoryApi(keycloak.token).createWasteCategory({
        wasteCategory: {
          name: newCategoryName,
          ewcCode: newEwcCode,
          metadata: {}
        }
      });
      setCategories([ ...categories, createdWasteCategory ]);
      setNewCategoryName(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteCategories.create, error);
    }
    setAddingCategory(false);
  };

  /**
   * Event handler delete icon click
   *
   * @param category category
   */
  const deleteIconClick = (category : WasteCategory) => {
    setDeletableCategory(category);
    setDeletingCategory(true);
  };

  /**
   * Event handler for deleting waste category confirm
   */
  const onDeleteWasteCategoryConfirm = async () => {
    if (!keycloak?.token || !deletableCategory?.id) {
      return;
    }

    try {
      await Api.getWasteCategoryApi(keycloak.token).deleteWasteCategory({ wasteCategoryId: deletableCategory?.id });
      const deletableIndex = categories.findIndex(category => category.id === deletableCategory?.id);
      const newWasteCategories = [ ...categories ];
      newWasteCategories.splice(deletableIndex, 1);
      setCategories(newWasteCategories);
      setDeletableCategory(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteCategories.delete, error);
    }
    setDeletingCategory(false);
  };

  /**
   * Items for waste categories
   * 
   * @returns waste category items
   */
  const wasteCategoryItems = () => (
    categories.map(category =>
      <MaterialItem key={ category.id }>
        <MaterialText primary={ category.name } secondary={ category.ewcCode }/>
        <ListItemSecondaryAction>
          <IconButton onClick={ () => deleteIconClick(category) }>
            <Delete/>
          </IconButton>
        </ListItemSecondaryAction>
      </MaterialItem>
    )
  );

  /**
   * Renders add waste category dialog
   */
  const renderAddWasteCategoryDialog = () => (
    <GenericDialog
      error={ false }
      open={ addingCategory }
      onClose={ () => setAddingCategory(false) }
      onCancel={ () => setAddingCategory(false) }
      onConfirm={ onAddWasteCategoryConfirm }
      title={ strings.adminScreen.addNewWasteCategoryDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography variant="subtitle1">
        { strings.adminScreen.addNewWasteCategoryDialog.text1 }
      </Typography>
      <TextField
        color="secondary"
        variant="standard"
        onChange={ event => setNewCategoryName(event.target.value) }
      />
      <Typography variant="subtitle1">
        { strings.adminScreen.addNewWasteCategoryDialog.text2 }
      </Typography>
      <TextField
        color="secondary"
        variant="standard"
        onChange={ event => setNewEwcCode(event.target.value) }
      />
    </GenericDialog>
  );

  /**
   * Renders delete waste category dialog
   */
  const renderDeleteWasteCategoryDialog = () => (
    <GenericDialog
      error={ false }
      open={ deletingCategory }
      onClose={ () => setDeletingCategory(false) }
      onCancel={ () => setDeletingCategory(false) }
      onConfirm={ onDeleteWasteCategoryConfirm }
      title={ strings.adminScreen.deleteWasteCategoryDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography>
        { strings.adminScreen.deleteWasteCategoryDialog.text }
      </Typography>
      <Typography variant="subtitle1">
        { deletableCategory?.name }
      </Typography>
    </GenericDialog>
  );

  /**
   * Renders list of waste categories
   */
  const renderList = () => {
    if (loading) {
      return <CircularProgress color="primary" size={ 60 }/>;
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
          { strings.adminScreen.navigation.dropdownSettings.hazardousMaterials }
        </Typography>
        <Button
          color="secondary"
          onClick={ () => setAddingCategory(true) }
        >
          { strings.generic.addNew }
        </Button>
      </Stack>
      { renderList() }
      { renderAddWasteCategoryDialog() }
      { renderDeleteWasteCategoryDialog() }
    </>
  );
};

export default HazardousMaterials;