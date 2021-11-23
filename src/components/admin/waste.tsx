import { Delete } from "@mui/icons-material";
import { Button, CircularProgress, IconButton, List, ListItemSecondaryAction, Stack, TextField, Typography } from "@mui/material";
import strings from "localization/strings";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import * as React from "react";
import Api from "api";
import { selectKeycloak } from "features/auth-slice";
import { MaterialItem, MaterialText } from "../../styled/layout-components/material-item";
import { WasteMaterial } from "generated/client";
import GenericDialog from "components/generic/generic-dialog";

/**
 * Component for waste materials dropdown menu editor
 */
const Waste: React.FC = () => {
  const errorContext = React.useContext(ErrorContext);
  const keycloak = useAppSelector(selectKeycloak);
  const [ wasteMaterials, setWasteMaterials ] = React.useState<WasteMaterial[]>([]);
  const [ loading, setLoading ] = React.useState(false);
  const [ addingWaste, setAddingWaste ] = React.useState(false);
  const [ deletingWaste, setDeletingWaste ] = React.useState(false);
  const [ deletableWaste, setDeletableWaste ] = React.useState<WasteMaterial>();
  const [ newWasteName, setNewWasteName ] = React.useState<string>();
  const [ newEwcCode, setNewEwcCode ] = React.useState<string>();

  /**
   * Fetches list of wastes
   */
  const fetchWasteMaterials = async () => {
    setLoading(true);
    if (!keycloak?.token) {
      return;
    }

    try {
      const fetchedWasteMaterials = await Api.getWasteMaterialApi(keycloak.token).listWasteMaterials();
      setWasteMaterials(fetchedWasteMaterials);
      setLoading(false);
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteMaterials.list, error);
      setLoading(false);
    }
  };

  /**
   * Effect that loads component data
   */
  React.useEffect(() => {
    fetchWasteMaterials();
  }, []);

  /**
   * Event handler for adding waste material confirm
   */
  const onAddWasteMaterialConfirm = async () => {
    if (!keycloak?.token || !newWasteName || !newEwcCode) {
      return;
    }

    try {
      const test = await Api.getWasteCategoryApi(keycloak.token).createWasteCategory({
        wasteCategory: {
          ewcCode: "1701",
          name: "Category name",
          metadata: {}
        }
      });

      if (!test.id) {
        return;
      }

      const createdWasteMaterial = await Api.getWasteMaterialApi(keycloak.token).createWasteMaterial({
        wasteMaterial: {
          name: newWasteName,
          wasteCategoryId: test.id,
          ewcSpecificationCode: newEwcCode.slice(-2),
          metadata: {}
        }
      });
      setWasteMaterials([ ...wasteMaterials, createdWasteMaterial ]);
      setNewWasteName(undefined);
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
      const deletableIndex = wasteMaterials.findIndex(wasteMaterial => wasteMaterial.id === deletableWaste?.id);
      const newWasteMaterials = [ ...wasteMaterials ];
      newWasteMaterials.splice(deletableIndex, 1);
      setWasteMaterials(newWasteMaterials);
      setDeletableWaste(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteMaterials.delete, error);
    }
    setDeletingWaste(false);
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
        </ListItemSecondaryAction>
      </MaterialItem>
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
      <Typography variant="subtitle1">
        { strings.adminScreen.addNewWasteMaterialDialog.text1 }
      </Typography>
      <TextField
        color="secondary"
        variant="standard"
        onChange={ event => setNewWasteName(event.target.value) }
      />
      <Typography variant="subtitle1">
        { strings.adminScreen.addNewWasteMaterialDialog.text2 }
      </Typography>
      <TextField
        color="secondary"
        variant="standard"
        onChange={ event => setNewEwcCode(event.target.value) }
      />
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
        { strings.adminScreen.deleteWasteMaterialDialog.text }
      </Typography>
      <Typography variant="subtitle1">
        { deletableWaste?.name }
      </Typography>
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
    </>
  );
};

export default Waste;