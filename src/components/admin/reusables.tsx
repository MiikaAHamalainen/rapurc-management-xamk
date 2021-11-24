import { Delete, Edit } from "@mui/icons-material";
import { Button, CircularProgress, IconButton, List, ListItemSecondaryAction, Stack, TextField, Typography } from "@mui/material";
import GenericDialog from "components/generic/generic-dialog";
import strings from "localization/strings";
import * as React from "react";
import Api from "api";
import { useAppSelector } from "app/hooks";
import { MaterialItem, MaterialText } from "../../styled/layout-components/material-item";
import { selectKeycloak } from "features/auth-slice";
import { ErrorContext } from "components/error-handler/error-handler";
import { ReusableMaterial } from "generated/client";

/**
 * Component for reusable materials dropdown menu editor
 */
const Reusables: React.FC = () => {
  const errorContext = React.useContext(ErrorContext);
  const keycloak = useAppSelector(selectKeycloak);

  const [ addingMaterial, setAddingMaterial ] = React.useState(false);
  const [ deletingMaterial, setDeletingMaterial ] = React.useState(false);
  const [ editingMaterial, setEditingMaterial ] = React.useState(false);
  const [ loading, setLoading ] = React.useState(false);
  const [ deletableMaterial, setDeletableMaterial ] = React.useState<ReusableMaterial>();
  const [ editableMaterial, setEditableMaterial ] = React.useState<ReusableMaterial>();
  const [ materials, setMaterials ] = React.useState<ReusableMaterial[]>([]);
  const [ newMaterialName, setNewMaterialName ] = React.useState<string>();

  /**
   * Fetches list of reusable materials and building parts
   */
  const fetchReusableMaterials = async () => {
    if (!keycloak?.token) {
      return;
    }

    setLoading(true);

    try {
      const fetchedMaterials = await Api.getReusableMaterialApi(keycloak.token).listReusableMaterials();
      setMaterials(fetchedMaterials);
    } catch (error) {
      errorContext.setError(strings.errorHandling.materials.list, error);
    }

    setLoading(false);
  };

  /**
   * Effect that loads component data
   */
  React.useEffect(() => {
    fetchReusableMaterials();
  }, []);
  
  /**
   * Event handler for adding reusable material confirm
   */
  const onAddReusableMaterialConfirm = async () => {
    if (!keycloak?.token || !newMaterialName) {
      return;
    }

    try {
      const createdReusableMaterial = await Api.getReusableMaterialApi(keycloak.token).createReusableMaterial({
        reusableMaterial: {
          name: newMaterialName,
          metadata: {}
        }
      });
      setMaterials([ ...materials, createdReusableMaterial ]);
      setNewMaterialName(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.materials.create, error);
    }

    setAddingMaterial(false);
  };

  /**
   * Event handler for deleting reusable material confirm
   */
  const onDeleteReusableMaterialConfirm = async () => {
    if (!keycloak?.token || !deletableMaterial?.id) {
      return;
    }

    try {
      await Api.getReusableMaterialApi(keycloak.token).deleteReusableMaterial({ reusableMaterialId: deletableMaterial.id });
      setMaterials(materials.filter(material => material.id !== deletableMaterial.id));
      setDeletableMaterial(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.materials.delete, error);
    }

    setDeletingMaterial(false);
  };

  /**
   * Event handler for editing reusable material confirm
   */
  const onEditReusableMaterialConfirm = async () => {
    if (!keycloak?.token || !editableMaterial?.id) {
      return;
    }

    try {
      await Api.getReusableMaterialApi(keycloak.token).updateReusableMaterial({
        reusableMaterialId: editableMaterial.id, reusableMaterial: editableMaterial
      });
      const editableIndex = materials.findIndex(material => material.id === editableMaterial?.id);
      const newReusableMaterials = [ ...materials ];
      newReusableMaterials[editableIndex] = editableMaterial;
      setMaterials(newReusableMaterials);
      setEditableMaterial(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.materials.update, error);
    }
    setEditingMaterial(false);
  };

  /**
   * Event handler delete icon click
   *
   * @param material material
   */
  const deleteIconClick = (material : ReusableMaterial) => {
    setDeletableMaterial(material);
    setDeletingMaterial(true);
  };

  /**
   * Event handler edit icon click
   *
   * @param material material
   */
  const editIconClick = (material : ReusableMaterial) => () => {
    setEditableMaterial(material);
    setEditingMaterial(true);
  };

  /**
   * Even handler for editable material name change
   */
  const handleEditableNameChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    if (editableMaterial) {
      setEditableMaterial({ ...editableMaterial, name: target.value });
    }
  };

  /**
   * Items for reusable material
   * 
   * @returns reusable material items
   */
  const reusableMaterialItems = () => (
    materials.map(material =>
      <MaterialItem key={ material.id }>
        <MaterialText primary={ material.name }/>
        <ListItemSecondaryAction>
          <IconButton onClick={ deleteIconClick(material) }>
            <Delete/>
          </IconButton>
          <IconButton onClick={ editIconClick(material) }>
            <Edit/>
          </IconButton>
        </ListItemSecondaryAction>
      </MaterialItem>
    )
  );

  /**
   * Renders add reusable dialog
   */
  const renderAddReusableMaterialDialog = () => (
    <GenericDialog
      error={ false }
      open={ addingMaterial }
      onClose={ () => setAddingMaterial(false) }
      onCancel={ () => setAddingMaterial(false) }
      onConfirm={ onAddReusableMaterialConfirm }
      title={ strings.adminScreen.addNewReusableMaterialDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography variant="subtitle1">
        { strings.adminScreen.addNewReusableMaterialDialog.text }
      </Typography>
      <TextField
        color="secondary"
        variant="standard"
        onChange={ event => setNewMaterialName(event.target.value) }
      />
    </GenericDialog>
  );

  /**
   * Renders delete reusable material dialog
   */
  const renderDeleteReusableMaterialDialog = () => (
    <GenericDialog
      error={ false }
      open={ deletingMaterial }
      onClose={ () => setDeletingMaterial(false) }
      onCancel={ () => setDeletingMaterial(false) }
      onConfirm={ onDeleteReusableMaterialConfirm }
      title={ strings.adminScreen.deleteReusableMaterialDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography>
        { strings.adminScreen.deleteReusableMaterialDialog.text }
      </Typography>
      <Typography variant="subtitle1">
        { deletableMaterial?.name }
      </Typography>
    </GenericDialog>
  );

  /**
   * Renders edit reusable dialog
   */
  const renderEditReusableMaterialDialog = () => (
    <GenericDialog
      error={ false }
      open={ editingMaterial }
      onClose={ () => setEditingMaterial(false) }
      onCancel={ () => setEditingMaterial(false) }
      onConfirm={ onEditReusableMaterialConfirm }
      title={ strings.adminScreen.updateReusableMaterialDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography variant="subtitle1">
        { strings.adminScreen.updateReusableMaterialDialog.text }
      </Typography>
      <TextField
        value={ editableMaterial?.name }
        color="secondary"
        variant="standard"
        onChange={ handleEditableNameChange }
      />
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
        { reusableMaterialItems() }
      </List>
    );
  };

  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h2">
          { strings.adminScreen.navigation.dropdownSettings.reusableMaterials }
        </Typography>
        <Button
          color="secondary"
          onClick={ () => setAddingMaterial(true) }
        >
          { strings.generic.addNew }
        </Button>
      </Stack>
      { renderList() }
      { renderAddReusableMaterialDialog() }
      { renderDeleteReusableMaterialDialog() }
      { renderEditReusableMaterialDialog() }
    </>
  );
};

export default Reusables;