import { Delete } from "@mui/icons-material";
import { Button, IconButton, List, ListItemSecondaryAction, Stack, TextField, Typography } from "@mui/material";
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
  const [ addingReusableMaterial, setAddingReusableMaterial ] = React.useState(false);
  const [ deletingReusableMaterial, setDeletingReusableMaterial ] = React.useState(false);
  const [ deletableMaterialId, setDeletableMaterialId ] = React.useState<string>();
  const [ reusableMaterials, setReusableMaterials ] = React.useState<ReusableMaterial[]>([]);
  const [ newMaterialName, setNewMaterialName ] = React.useState<string>();

  /**
   * Fetches list of reusable materials and building parts
   */
  const fetchReusableMaterials = async () => {
    if (!keycloak?.token) {
      return;
    }

    try {
      const materials = await Api.getReusableMaterialApi(keycloak.token).listReusableMaterials();
      setReusableMaterials(materials);
    } catch (error) {
      errorContext.setError(strings.errorHandling.materials.list, error);
    }
  };
  
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
      setReusableMaterials([ ...reusableMaterials, createdReusableMaterial ]);
      setNewMaterialName(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.materials.create, error);
    }
    setAddingReusableMaterial(false);
  };

  /**
   * Event handler delete icon click
   *
   * @param index material index
   */
  const deleteIconClick = (id: string | undefined) => {
    setDeletableMaterialId(id);
    setDeletingReusableMaterial(true);
  };

  /**
   * Event handler for deleting reusable material confirm
   */
  const onDeleteReusableMaterialConfirm = async () => {
    if (!keycloak?.token || !deletableMaterialId) {
      return;
    }

    try {
      await Api.getReusableMaterialApi(keycloak.token).deleteReusableMaterial({ reusableMaterialId: deletableMaterialId });
      const deletableIndex = reusableMaterials.findIndex(material => material.id === deletableMaterialId);
      const newReusableMaterials = [ ...reusableMaterials ];
      newReusableMaterials.splice(deletableIndex, 1);
      setReusableMaterials(newReusableMaterials);
      setDeletableMaterialId(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.materials.delete, error);
    }
    setDeletingReusableMaterial(false);
  };

  /**
   * Item for reusable material
   * 
   * @param name
   * @param code 
   * @returns reusable material item
   */
  const reusableMaterialItem = () => (
    reusableMaterials.map(material =>
      <MaterialItem key={ material.id }>
        <MaterialText primary={ material.name }/>
        <ListItemSecondaryAction>
          <IconButton onClick={ () => deleteIconClick(material.id) }>
            <Delete/>
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
      open={ addingReusableMaterial }
      onClose={ () => setAddingReusableMaterial(false) }
      onCancel={ () => setAddingReusableMaterial(false) }
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
      open={ deletingReusableMaterial }
      onClose={ () => setDeletingReusableMaterial(false) }
      onCancel={ () => setDeletingReusableMaterial(false) }
      onConfirm={ onDeleteReusableMaterialConfirm }
      title={ strings.adminScreen.deleteReusableMaterialDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography>
        { strings.adminScreen.deleteReusableMaterialDialog.text }
      </Typography>
      <Typography>
        { deletableMaterialId }
      </Typography>
    </GenericDialog>
  );

  /**
   * Renders list of materials
   */
  const renderList = () => {
    if (reusableMaterials.length < 1) {
      fetchReusableMaterials();
    }

    return (
      <List sx={{ pt: 4 }}>
        { reusableMaterialItem() }
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
          onClick={ () => setAddingReusableMaterial(true) }
        >
          { strings.generic.addNew }
        </Button>
      </Stack>
      { renderList() }
      { renderAddReusableMaterialDialog() }
      { renderDeleteReusableMaterialDialog() }
    </>
  );
};

export default Reusables;