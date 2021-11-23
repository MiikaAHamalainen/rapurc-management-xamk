import { Delete } from "@mui/icons-material";
import { Button, CircularProgress, IconButton, List, ListItemSecondaryAction, Stack, TextField, Typography } from "@mui/material";
import { useAppSelector } from "app/hooks";
import GenericDialog from "components/generic/generic-dialog";
import strings from "localization/strings";
import * as React from "react";
import Api from "api";
import { selectKeycloak } from "features/auth-slice";
import { ErrorContext } from "components/error-handler/error-handler";
import { MaterialItem, MaterialText } from "../../styled/layout-components/material-item";
import { WasteSpecifier } from "generated/client";

/**
 * Component for hazardous material info dropdown menu editor
 */
const HazardousMaterialsInfo: React.FC = () => {
  const errorContext = React.useContext(ErrorContext);
  const keycloak = useAppSelector(selectKeycloak);
  const [ addingWasteSpecifier, setAddingWasteSpecifier ] = React.useState(false);
  const [ newWasteSpecifierName, setNewWasteSpecifierName ] = React.useState<string>();
  const [ deletingWasteSpecifier, setDeletingWasteSpecifier ] = React.useState(false);
  const [ deletableWasteSpecifier, setDeletableWasteSpecifier ] = React.useState<WasteSpecifier>();
  const [ wasteSpecifiers, setWasteSpecifiers ] = React.useState<WasteSpecifier[]>([]);
  const [ loading, setLoading ] = React.useState(false);

  /**
   * Fetches list of hazardous material info
   */
  const fetchWasteSpecifiers = async () => {
    setLoading(true);
    if (!keycloak?.token) {
      return;
    }

    try {
      const fetchedWasteSpecifiers = await Api.getWasteSpecifiersApi(keycloak.token).listWasteSpecifiers();
      setWasteSpecifiers(fetchedWasteSpecifiers);
      setLoading(false);
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteSpecifiers.list, error);
      setLoading(false);
    }
  };

  /**
   * Effect that loads component data
   */
  React.useEffect(() => {
    fetchWasteSpecifiers();
  }, []);

  /**
   * Event handler for adding waste specifier confirm
   */
  const onAddWasteSpecifierConfirm = async () => {
    if (!keycloak?.token || !newWasteSpecifierName) {
      return;
    }

    try {
      const createdWasteSpecifier = await Api.getWasteSpecifiersApi(keycloak.token).createWasteSpecifier({
        wasteSpecifier: {
          name: newWasteSpecifierName,
          metadata: {}
        }
      });
      setWasteSpecifiers([ ...wasteSpecifiers, createdWasteSpecifier ]);
      setNewWasteSpecifierName(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteSpecifiers.create, error);
    }
    setAddingWasteSpecifier(false);
  };

  /**
   * Event handler delete icon click
   *
   * @param wasteSpecifier waste specifier
   */
  const deleteIconClick = (wasteSpecifier : WasteSpecifier) => {
    setDeletableWasteSpecifier(wasteSpecifier);
    setDeletingWasteSpecifier(true);
  };

  /**
   * Event handler for deleting waste specifier confirm
   */
  const onDeleteWasteSpecifierConfirm = async () => {
    if (!keycloak?.token || !deletableWasteSpecifier?.id) {
      return;
    }

    try {
      await Api.getWasteSpecifiersApi(keycloak.token).deleteWasteSpecifier({ wasteSpecifierId: deletableWasteSpecifier?.id });
      const deletableIndex = wasteSpecifiers.findIndex(wasteSpecifier => wasteSpecifier.id === deletableWasteSpecifier?.id);
      const newWasteSpecifiers = [ ...wasteSpecifiers ];
      newWasteSpecifiers.splice(deletableIndex, 1);
      setWasteSpecifiers(newWasteSpecifiers);
      setDeletableWasteSpecifier(undefined);
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteSpecifiers.delete, error);
    }
    setDeletingWasteSpecifier(false);
  };

  /**
   * Items for waste specifier option
   * 
   * @returns waste specifier items
   */
  const wasteSpecifierItems = () => (
    wasteSpecifiers.map(wasteSpecifier =>
      <MaterialItem key={ wasteSpecifier.id }>
        <MaterialText primary={ wasteSpecifier.name }/>
        <ListItemSecondaryAction>
          <IconButton onClick={ () => deleteIconClick(wasteSpecifier) }>
            <Delete/>
          </IconButton>
        </ListItemSecondaryAction>
      </MaterialItem>
    )
  );

  /**
   * Renders add waste specifier dialog
   */
  const renderAddWasteSpecifierDialog = () => (
    <GenericDialog
      error={ false }
      open={ addingWasteSpecifier }
      onClose={ () => setAddingWasteSpecifier(false) }
      onCancel={ () => setAddingWasteSpecifier(false) }
      onConfirm={ onAddWasteSpecifierConfirm }
      title={ strings.adminScreen.addNewWasteSpecifierDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography variant="subtitle1">
        { strings.adminScreen.addNewWasteSpecifierDialog.text }
      </Typography>
      <TextField
        color="secondary"
        variant="standard"
        onChange={ event => setNewWasteSpecifierName(event.target.value) }
      />
    </GenericDialog>
  );

  /**
   * Renders delete waste specifier dialog
   */
  const renderDeleteWasteSpecifierDialog = () => (
    <GenericDialog
      error={ false }
      open={ deletingWasteSpecifier }
      onClose={ () => setDeletingWasteSpecifier(false) }
      onCancel={ () => setDeletingWasteSpecifier(false) }
      onConfirm={ onDeleteWasteSpecifierConfirm }
      title={ strings.adminScreen.deleteWasteSpecifierDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography>
        { strings.adminScreen.deleteWasteSpecifierDialog.text }
      </Typography>
      <Typography variant="subtitle1">
        { deletableWasteSpecifier?.name }
      </Typography>
    </GenericDialog>
  );

  /**
   * Renders list of waste specifier options
   */
  const renderList = () => {
    if (loading) {
      return <CircularProgress color="primary" size={ 60 }/>;
    }

    return (
      <List sx={{ pt: 4 }}>
        { wasteSpecifierItems() }
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
          onClick={ () => setAddingWasteSpecifier(true) }
        >
          { strings.generic.addNew }
        </Button>
      </Stack>
      { renderList() }
      { renderAddWasteSpecifierDialog() }
      { renderDeleteWasteSpecifierDialog() }
    </>
  );
};

export default HazardousMaterialsInfo;