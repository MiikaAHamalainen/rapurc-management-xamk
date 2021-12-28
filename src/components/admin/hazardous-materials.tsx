import { Delete, Edit } from "@mui/icons-material";
import { Box, Button, CircularProgress, IconButton, List, ListItemSecondaryAction, MenuItem, Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import strings from "localization/strings";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import * as React from "react";
import Api from "api";
import { selectKeycloak } from "features/auth-slice";
import { MaterialItem, MaterialText } from "../../styled/layout-components/material-item";
import { WasteCategory, HazardousMaterial } from "generated/client";
import GenericDialog from "components/generic/generic-dialog";
import theme from "theme";

const initialNewHazardousMaterialState: HazardousMaterial = {
  name: "",
  ewcSpecificationCode: "",
  wasteCategoryId: "",
  metadata: {}
};

/**
 * Component for waste materials dropdown menu editor
 */
const HazardousMaterials: React.FC = () => {
  const errorContext = React.useContext(ErrorContext);
  const keycloak = useAppSelector(selectKeycloak);
  
  const [ loading, setLoading ] = React.useState(false);
  const [ addingHazardousMaterial, setAddingHazardousMaterial ] = React.useState(false);
  const [ deletingHazardousMaterial, setDeletingHazardousMaterial ] = React.useState(false);
  const [ editingHazardousMaterial, setEditingHazardousMaterial ] = React.useState(false);
  const [ hazardousMaterials, setHazardousMaterials ] = React.useState<HazardousMaterial[]>([]);
  const [ wasteCategories, setWasteCategories ] = React.useState<WasteCategory[]>([]);
  const [ deletableHazardousMaterial, setDeletableHazardousMaterial ] = React.useState<HazardousMaterial>();
  const [ newHazardousMaterial, setNewHazardousMaterial ] = React.useState<HazardousMaterial>(initialNewHazardousMaterialState);
  const [ editableHazardousMaterial, setEditableHazardousMaterial ] = React.useState<HazardousMaterial>();

  /**
   * Check if viewport is mobile size
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  /**
   * Fetches list of hazardous materials
   */
  const fetchHazardousMaterials = async () => {
    if (!keycloak?.token) {
      return;
    }

    try {
      setHazardousMaterials(await Api.getHazardousMaterialApi(keycloak.token).listHazardousMaterials());
    } catch (error) {
      errorContext.setError(strings.errorHandling.hazardousMaterials.list, error);
    }
  };

  /**
   * Fetches list of waste categories
   */
  const fetchWasteCategories = async () => {
    if (!keycloak?.token) {
      return;
    }

    try {
      setWasteCategories(await Api.getWasteCategoryApi(keycloak.token).listWasteCategories());
    } catch (error) {
      errorContext.setError(strings.errorHandling.hazardousMaterials.list, error);
    }
  };

  /**
   * Fetches data
   */
  const loadData = async () => {
    setLoading(true);
    await fetchHazardousMaterials();
    await fetchWasteCategories();
    setLoading(false);
  };

  /**
   * Effect that loads component data
   */
  React.useEffect(() => {
    loadData();
  }, []);

  /**
   * Event handler for adding hazardous material confirm
   */
  const onAddHazardousMaterialConfirm = async () => {
    if (!keycloak?.token || !newHazardousMaterial) {
      return;
    }
    
    try {
      const createdHazardousMaterial = await Api.getHazardousMaterialApi(keycloak.token).createHazardousMaterial({
        hazardousMaterial: newHazardousMaterial
      });
      setHazardousMaterials([ ...hazardousMaterials, createdHazardousMaterial ]);
      setNewHazardousMaterial(initialNewHazardousMaterialState);
    } catch (error) {
      errorContext.setError(strings.errorHandling.hazardousMaterials.create, error);
    }

    setAddingHazardousMaterial(false);
  };

  /**
   * Event handler for deleting hazardous material confirm
   */
  const onDeleteHazardousMaterialConfirm = async () => {
    if (!keycloak?.token || !deletableHazardousMaterial?.id) {
      return;
    }

    try {
      await Api.getHazardousMaterialApi(keycloak.token).deleteHazardousMaterial({ hazardousMaterialId: deletableHazardousMaterial?.id });
      setHazardousMaterials(hazardousMaterials.filter(hazardousMaterial => hazardousMaterial.id !== deletableHazardousMaterial.id));
      setDeletableHazardousMaterial(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.hazardousMaterials.delete, error);
    }

    setDeletingHazardousMaterial(false);
  };

  /**
   * Event handler for editing waste material confirm
   */
  const onEditHazardousMaterialConfirm = async () => {
    if (!keycloak?.token || !editableHazardousMaterial?.id) {
      return;
    }

    try {
      const updatedHazardousMaterial = await Api.getHazardousMaterialApi(keycloak.token).updateHazardousMaterial({
        hazardousMaterialId: editableHazardousMaterial.id,
        hazardousMaterial: editableHazardousMaterial
      });

      const hazardousMaterialsList = hazardousMaterials.map(
        hazardousMaterial => (hazardousMaterial.id === editableHazardousMaterial.id ? updatedHazardousMaterial : hazardousMaterial)
      );
      setHazardousMaterials(hazardousMaterialsList);
      setEditableHazardousMaterial(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.buildingTypes.update, error);
    }

    setEditingHazardousMaterial(false);
  };

  /**
   * Event handler delete icon click
   *
   * @param hazardousMaterial hazardous material
   */
  const deleteIconClick = (hazardousMaterial: HazardousMaterial) => {
    setDeletableHazardousMaterial(hazardousMaterial);
    setDeletingHazardousMaterial(true);
  };

  /**
   * Event handler edit icon click
   *
   * @param hazardousMaterial hazardous material
   */
  const editIconClick = (hazardousMaterial: HazardousMaterial) => () => {
    setEditableHazardousMaterial(hazardousMaterial);
    setEditingHazardousMaterial(true);
  };

  /**
   * Event handler for new waste change
   *
   * @param event React change event
   */
  const onNewHazardousMaterialChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = ({ target }) => {
    const { value, name } = target;

    if (!value || !name || !newHazardousMaterial) {
      return;
    }

    setNewHazardousMaterial({ ...newHazardousMaterial, [name]: value });
  };

  /**
   * Event handler for editable waste material change
   *
   * @param event React change event
   */
  const onEditableHazardousMaterialChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = ({ target }) => {
    const { value, name } = target;

    if (!name || !editableHazardousMaterial) {
      return;
    }

    setEditableHazardousMaterial({ ...editableHazardousMaterial, [name]: value || "" });
  };

  /**
   * Items for hazardous material
   * 
   * @returns hazardous material items
   */
  const hazardousMaterialItems = () => (
    hazardousMaterials.map(hazardousMaterial => {
      const wasteCategory = wasteCategories.find(category => (category.id === hazardousMaterial.wasteCategoryId));
      const fullEwcCode = `${wasteCategory?.ewcCode || ""}${hazardousMaterial.ewcSpecificationCode}`;

      return (
        <MaterialItem key={ hazardousMaterial.id }>
          <MaterialText primary={ hazardousMaterial.name } secondary={ fullEwcCode }/>
          <ListItemSecondaryAction>
            <IconButton onClick={ () => deleteIconClick(hazardousMaterial) }>
              <Delete/>
            </IconButton>
            <IconButton onClick={ editIconClick(hazardousMaterial) }>
              <Edit/>
            </IconButton>
          </ListItemSecondaryAction>
        </MaterialItem>
      );
    })
  );

  /**
   * Renders waste category items
   *
   * @returns waste category items
   */
  const wasteCategoryItems = () => (
    wasteCategories
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(wasteCategory =>
        <MenuItem key={ wasteCategory.id } value={ wasteCategory.id }>
          <MaterialText
            primary={ wasteCategory.name }
            secondary={ wasteCategory.ewcCode }
          />
        </MenuItem>
      )
  );

  /**
   * Renders add hazardous material dialog
   */
  const renderAddHazardousMaterialDialog = () => (
    <GenericDialog
      error={ false }
      open={ addingHazardousMaterial }
      onClose={ () => setAddingHazardousMaterial(false) }
      onCancel={ () => setAddingHazardousMaterial(false) }
      onConfirm={ onAddHazardousMaterialConfirm }
      title={ strings.adminScreen.addNewHazardousMaterialDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Stack>
        <TextField
          sx={{ marginBottom: theme.spacing(2) }}
          name="name"
          label={ strings.adminScreen.addNewHazardousMaterialDialog.text1 }
          onChange={ onNewHazardousMaterialChange }
        />
        <Stack direction={ isMobile ? "column" : "row" } spacing={ 2 }>
          <TextField
            fullWidth
            select
            name="wasteCategoryId"
            label={ strings.adminScreen.addNewHazardousMaterialDialog.text3 }
            onChange={ onNewHazardousMaterialChange }
          >
            { wasteCategoryItems() }
          </TextField>
          <TextField
            fullWidth
            name="ewcSpecificationCode"
            label={ strings.adminScreen.addNewHazardousMaterialDialog.text2 }
            onChange={ onNewHazardousMaterialChange }
          />
        </Stack>
      </Stack>
    </GenericDialog>
  );

  /**
   * Renders delete hazardous material dialog
   */
  const renderDeleteHazardousMaterialDialog = () => (
    <GenericDialog
      error={ false }
      open={ deletingHazardousMaterial }
      onClose={ () => setDeletingHazardousMaterial(false) }
      onCancel={ () => setDeletingHazardousMaterial(false) }
      onConfirm={ onDeleteHazardousMaterialConfirm }
      title={ strings.adminScreen.deleteHazardousMaterialDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography>
        { strings.formatString(strings.adminScreen.deleteHazardousMaterialDialog.text, deletableHazardousMaterial ? deletableHazardousMaterial.name : "") }
      </Typography>
    </GenericDialog>
  );

  /**
   * Renders edit hazardous material dialog
   */
  const renderEditHazardousMaterialDialog = () => (
    <GenericDialog
      error={ false }
      open={ editingHazardousMaterial }
      onClose={ () => setEditingHazardousMaterial(false) }
      onCancel={ () => setEditingHazardousMaterial(false) }
      onConfirm={ onEditHazardousMaterialConfirm }
      title={ strings.adminScreen.updateHazardousMaterialDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Stack>
        <TextField
          sx={{ marginBottom: theme.spacing(2) }}
          fullWidth
          value={ editableHazardousMaterial?.name }
          label={ strings.adminScreen.addNewHazardousMaterialDialog.text1 }
          name="name"
          onChange={ onEditableHazardousMaterialChange }
        />
        <Stack direction={ isMobile ? "column" : "row" } spacing={ 2 }>
          <TextField
            fullWidth
            select
            value={ editableHazardousMaterial?.wasteCategoryId }
            label={ strings.adminScreen.addNewHazardousMaterialDialog.text3 }
            name="wasteCategoryId"
            onChange={ onEditableHazardousMaterialChange }
          >
            { wasteCategoryItems() }
          </TextField>
          <TextField
            fullWidth
            name="ewcSpecificationCode"
            value={ editableHazardousMaterial?.ewcSpecificationCode }
            label={ strings.adminScreen.addNewHazardousMaterialDialog.text2 }
            onChange={ onEditableHazardousMaterialChange }
          />
        </Stack>
      </Stack>
    </GenericDialog>
  );

  /**
   * Renders list of hazardous materials
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
        { hazardousMaterialItems() }
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
          onClick={ () => setAddingHazardousMaterial(true) }
        >
          { strings.generic.addNew }
        </Button>
      </Stack>
      { renderList() }
      { renderAddHazardousMaterialDialog() }
      { renderDeleteHazardousMaterialDialog() }
      { renderEditHazardousMaterialDialog() }
    </>
  );
};

export default HazardousMaterials;