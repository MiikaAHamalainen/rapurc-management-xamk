import { Delete, Edit } from "@mui/icons-material";
import { Button, CircularProgress, IconButton, List, ListItemSecondaryAction, MenuItem, Stack, TextField, Typography } from "@mui/material";
import strings from "localization/strings";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import * as React from "react";
import Api from "api";
import { selectKeycloak } from "features/auth-slice";
import { MaterialItem, MaterialText } from "../../styled/layout-components/material-item";
import { WasteCategory, WasteMaterial } from "generated/client";
import GenericDialog from "components/generic/generic-dialog";

const initialNewMaterialState: WasteMaterial = {
  name: "",
  ewcSpecificationCode: "",
  wasteCategoryId: "",
  metadata: {}
};

/**
 * Component for waste materials dropdown menu editor
 */
const Waste: React.FC = () => {
  const errorContext = React.useContext(ErrorContext);
  const keycloak = useAppSelector(selectKeycloak);
  
  const [ loading, setLoading ] = React.useState(false);
  const [ addingWaste, setAddingWaste ] = React.useState(false);
  const [ deletingWaste, setDeletingWaste ] = React.useState(false);
  const [ editingWasteMaterial, setEditingWasteMaterial ] = React.useState(false);
  const [ wasteMaterials, setWasteMaterials ] = React.useState<WasteMaterial[]>([]);
  const [ wasteCategories, setWasteCategories ] = React.useState<WasteCategory[]>([]);
  const [ deletableWaste, setDeletableWaste ] = React.useState<WasteMaterial>();
  const [ newWasteMaterial, setNewWasteMaterial ] = React.useState<WasteMaterial>(initialNewMaterialState);
  const [ editableWasteMaterial, setEditableWasteMaterial ] = React.useState<WasteMaterial>();

  /**
   * Fetches list of wastes
   */
  const fetchWasteMaterials = async () => {
    if (!keycloak?.token) {
      return;
    }

    setLoading(true);

    try {
      setWasteMaterials(await Api.getWasteMaterialApi(keycloak.token).listWasteMaterials());
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteMaterials.list, error);
    }

    setLoading(false);
  };

  /**
   * Fetches list of wastes
   */
  const fetchWasteCategories = async () => {
    if (!keycloak?.token) {
      return;
    }

    try {
      setWasteCategories(await Api.getWasteCategoryApi(keycloak.token).listWasteCategories());
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteMaterials.list, error);
    }
  };

  /**
   * Effect that loads component data
   */
  React.useEffect(() => {
    fetchWasteMaterials();
    fetchWasteCategories();
  }, []);

  /**
   * Event handler for adding waste material confirm
   */
  const onAddWasteMaterialConfirm = async () => {
    if (!keycloak?.token || !newWasteMaterial) {
      return;
    }
    
    try {
      const createdWasteMaterial = await Api.getWasteMaterialApi(keycloak.token).createWasteMaterial({
        wasteMaterial: newWasteMaterial
      });
      setWasteMaterials([ ...wasteMaterials, createdWasteMaterial ]);
      setNewWasteMaterial(initialNewMaterialState);
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteMaterials.create, error);
    }

    setAddingWaste(false);
  };

  /**
   * Event handler for deleting waste material confirm
   */
  const onDeleteWasteMaterialConfirm = async () => {
    if (!keycloak?.token || !deletableWaste?.id) {
      return;
    }

    try {
      await Api.getWasteMaterialApi(keycloak.token).deleteWasteMaterial({ wasteMaterialId: deletableWaste?.id });
      setWasteMaterials(wasteMaterials.filter(wasteMaterial => wasteMaterial.id !== deletableWaste.id));
      setDeletableWaste(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteMaterials.delete, error);
    }

    setDeletingWaste(false);
  };

  /**
   * Event handler for editing waste material confirm
   */
  const onEditWasteMaterialConfirm = async () => {
    if (!keycloak?.token || !editableWasteMaterial?.id) {
      return;
    }

    try {
      const updatedWasteMaterial = await Api.getWasteMaterialApi(keycloak.token).updateWasteMaterial({
        wasteMaterialId: editableWasteMaterial.id,
        wasteMaterial: editableWasteMaterial
      });

      setWasteMaterials(wasteMaterials.map(wasteMaterial => wasteMaterial.id === editableWasteMaterial.id ? updatedWasteMaterial : wasteMaterial));
      setEditableWasteMaterial(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.buildingTypes.update, error);
    }

    setEditingWasteMaterial(false);
  };

  /**
   * Event handler delete icon click
   *
   * @param waste waste
   */
  const deleteIconClick = (waste : WasteMaterial) => {
    setDeletableWaste(waste);
    setDeletingWaste(true);
  };

  /**
   * Event handler edit icon click
   *
   * @param wasteMaterial waste material
   */
  const editIconClick = (wasteMaterial: WasteMaterial) => () => {
    setEditableWasteMaterial(wasteMaterial);
    setEditingWasteMaterial(true);
  };

  /**
   * Event handler for new waste change
   *
   * @param event React change event
   */
  const onNewWasteChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = ({ target }) => {
    const { value, name } = target;

    if (!value || !name || !newWasteMaterial) {
      return;
    }

    setNewWasteMaterial({ ...newWasteMaterial, [name]: value });
  };

  /**
   * Event handler for editable waste material change
   *
   * @param event React change event
   */
  const onEditableWasteMaterialChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = ({ target }) => {
    const { value, name } = target;

    if (!value || !name || !editableWasteMaterial) {
      return;
    }

    setEditableWasteMaterial({ ...editableWasteMaterial, [name]: value });
  };

  /**
   * Items for waste material
   * 
   * @returns waste material items
   */
  const wasteMaterialItems = () => (
    wasteMaterials.map(wasteMaterial =>
      <MaterialItem key={ wasteMaterial.id }>
        <MaterialText primary={ wasteMaterial.name } secondary={ wasteMaterial.ewcSpecificationCode }/>
        <ListItemSecondaryAction>
          <IconButton onClick={ () => deleteIconClick(wasteMaterial) }>
            <Delete/>
          </IconButton>
          <IconButton onClick={ editIconClick(wasteMaterial) }>
            <Edit/>
          </IconButton>
        </ListItemSecondaryAction>
      </MaterialItem>
    )
  );

  /**
   * 
   * @returns waste category items
   */
  const wasteCategoryItems = () => (
    wasteCategories.map(wasteCategory =>
      <MenuItem key={ wasteCategory.id } value={ wasteCategory.id }>
        <MaterialText
          primary={ wasteCategory.name }
          secondary={ wasteCategory.ewcCode }
        />
      </MenuItem>
    )
  );

  /**
   * Renders add waste dialog
   */
  const renderAddWasteDialog = () => (
    <GenericDialog
      error={ false }
      open={ addingWaste }
      onClose={ () => setAddingWaste(false) }
      onCancel={ () => setAddingWaste(false) }
      onConfirm={ onAddWasteMaterialConfirm }
      title={ strings.adminScreen.addNewWasteMaterialDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Stack>
        <Stack marginBottom={ 2 }>
          <TextField
            name="name"
            label={ strings.adminScreen.addNewWasteMaterialDialog.text1 }
            onChange={ onNewWasteChange }
          />
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Stack>
            <TextField
              fullWidth
              select
              name="wasteCategoryId"
              label={ strings.adminScreen.addNewWasteMaterialDialog.text3 }
              onChange={ onNewWasteChange }
            >
              { wasteCategoryItems() }
            </TextField>
          </Stack>
          <Stack>
            <TextField
              fullWidth
              name="ewcSpecificationCode"
              label={ strings.adminScreen.addNewWasteMaterialDialog.text2 }
              onChange={ onNewWasteChange }
            />
          </Stack>
        </Stack>
      </Stack>
    </GenericDialog>
  );

  /**
   * Renders delete waste dialog
   */
  const renderDeleteWasteDialog = () => (
    <GenericDialog
      error={ false }
      open={ deletingWaste }
      onClose={ () => setDeletingWaste(false) }
      onCancel={ () => setDeletingWaste(false) }
      onConfirm={ onDeleteWasteMaterialConfirm }
      title={ strings.adminScreen.deleteWasteMaterialDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography>
        { strings.formatString(strings.adminScreen.deleteWasteMaterialDialog.text, deletableWaste ? deletableWaste.name : "") }
      </Typography>
    </GenericDialog>
  );

  /**
   * Renders edit reusable dialog
   */
  const renderEditBuildingTypeDialog = () => (
    <GenericDialog
      error={ false }
      open={ editingWasteMaterial }
      onClose={ () => setEditingWasteMaterial(false) }
      onCancel={ () => setEditingWasteMaterial(false) }
      onConfirm={ onEditWasteMaterialConfirm }
      title={ strings.adminScreen.updateWasteMaterialDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Stack>
        <Stack marginBottom={ 2 }>
          <TextField
            fullWidth
            value={ editableWasteMaterial?.name }
            label={ strings.adminScreen.addNewWasteMaterialDialog.text1 }
            name="name"
            onChange={ onEditableWasteMaterialChange }
          />
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Stack>
            <TextField
              fullWidth
              select
              value={ editableWasteMaterial?.wasteCategoryId }
              label={ strings.adminScreen.addNewWasteMaterialDialog.text3 }
              name="wasteCategoryId"
              onChange={ onEditableWasteMaterialChange }
            >
              { wasteCategoryItems() }
            </TextField>
          </Stack>
          <Stack>
            <TextField
              fullWidth
              name="ewcSpecificationCode"
              value={ editableWasteMaterial?.ewcSpecificationCode }
              label={ strings.adminScreen.addNewWasteMaterialDialog.text2 }
              onChange={ onEditableWasteMaterialChange }
            />
          </Stack>
        </Stack>
      </Stack>
    </GenericDialog>
  );

  /**
   * Renders list of materials
   */
  const renderList = () => {
    if (loading) {
      return <CircularProgress color="primary" size={ 60 }/>;
    }

    return (
      <List sx={{ pt: 4 }}>
        { wasteMaterialItems() }
      </List>
    );
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h2">
          { strings.adminScreen.navigation.dropdownSettings.wasteMaterials }
        </Typography>
        <Button
          color="secondary"
          onClick={ () => setAddingWaste(true) }
        >
          { strings.generic.addNew }
        </Button>
      </Stack>
      { renderList() }
      { renderAddWasteDialog() }
      { renderDeleteWasteDialog() }
      { renderEditBuildingTypeDialog() }
    </>
  );
};

export default Waste;