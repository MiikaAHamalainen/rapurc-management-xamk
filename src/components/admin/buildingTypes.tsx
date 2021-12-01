import { Delete, Edit } from "@mui/icons-material";
import { Button, CircularProgress, IconButton, List, ListItemSecondaryAction, Stack, TextField, Typography } from "@mui/material";
import GenericDialog from "components/generic/generic-dialog";
import strings from "localization/strings";
import React from "react";
import Api from "api";
import { useAppSelector } from "app/hooks";
import { MaterialItem, MaterialText } from "../../styled/layout-components/material-item";
import { selectKeycloak } from "features/auth-slice";
import { ErrorContext } from "components/error-handler/error-handler";
import { BuildingType } from "generated/client";

/**
 * Component for reusable materials dropdown menu editor
 */
const BuildingTypes: React.FC = () => {
  const errorContext = React.useContext(ErrorContext);
  const keycloak = useAppSelector(selectKeycloak);

  const [ addingBuildingType, setAddingBuildingType ] = React.useState(false);
  const [ deletingBuildingType, setDeletingBuildingType ] = React.useState(false);
  const [ editingBuildingType, setEditingBuildingType ] = React.useState(false);
  const [ loading, setLoading ] = React.useState(false);
  const [ deletableBuildingType, setDeletableBuildingType ] = React.useState<BuildingType>();
  const [ buildingTypes, setBuildingTypes ] = React.useState<BuildingType[]>([]);
  const [ editableBuildingType, setEditableBuildingType ] = React.useState<BuildingType>({
    name: "",
    code: "",
    metadata: {}
  });
  const [ newBuildingType, setNewBuildingType ] = React.useState<BuildingType>({
    name: "",
    code: "",
    metadata: {}
  });

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
    const { name, code } = newBuildingType;
    if (!keycloak?.token) {
      return;
    }

    try {
      const createdBuildingType = await Api.getBuildingTypesApi(keycloak.token).createBuildingType({
        buildingType: {
          name: name,
          code: code,
          metadata: {}
        }
      });
      setBuildingTypes([ ...buildingTypes, createdBuildingType ]);
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
   * @param buildingType material
   */
  const editIconClick = (buildingType : BuildingType) => () => {
    setEditableBuildingType(buildingType);
    setEditingBuildingType(true);
  };

  /**
   * Event handler for editable building type string change
   *
   * @param event React change event
   */
  const onEditableBuildingTypeTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;

    setEditableBuildingType({ ...editableBuildingType, [name]: value });
  };

  /**
   * Event handler for new building type string change
   *
   * @param event React change event
   */
  const onNewBuildingTypeTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;

    setNewBuildingType({ ...newBuildingType, [name]: value });
  };

  /**
   * Items for building types
   * 
   * @returns building type items
   */
  const buildingTypeItems = () => (
    buildingTypes.map(buildingType =>
      <MaterialItem key={ buildingType.id }>
        <MaterialText primary={ buildingType.name } secondary={ buildingType.code }/>
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
      error={ false }
      open={ addingBuildingType }
      onClose={ () => setAddingBuildingType(false) }
      onCancel={ () => setAddingBuildingType(false) }
      onConfirm={ onAddBuildingTypeConfirm }
      title={ strings.adminScreen.addNewBuildingTypeDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <TextField
        placeholder={ strings.adminScreen.addNewBuildingTypeDialog.text1 }
        name="name"
        onChange={ onNewBuildingTypeTextChange }
      />
      <TextField
        placeholder={ strings.adminScreen.addNewBuildingTypeDialog.text2 }
        name="code"
        onChange={ onNewBuildingTypeTextChange }
      />
    </GenericDialog>
  );

  /**
   * Renders delete reusable material dialog
   */
  const renderDeleteBuildingTypeDialog = () => (
    <GenericDialog
      error={ false }
      open={ deletingBuildingType }
      onClose={ () => setDeletingBuildingType(false) }
      onCancel={ () => setDeletingBuildingType(false) }
      onConfirm={ onDeleteReusableMaterialConfirm }
      title={ strings.adminScreen.deleteBuildingTypeDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography>
        { strings.formatString(strings.adminScreen.deleteBuildingTypeDialog.text, deletableBuildingType ? deletableBuildingType.name : "") }
      </Typography>
    </GenericDialog>
  );

  /**
   * Renders edit reusable dialog
   */
  const renderEditBuildingTypeDialog = () => (
    <GenericDialog
      error={ false }
      open={ editingBuildingType }
      onClose={ () => setEditingBuildingType(false) }
      onCancel={ () => setEditingBuildingType(false) }
      onConfirm={ onEditBuildingTypeConfirm }
      title={ strings.adminScreen.updateBuildingTypeDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Stack>
        <Stack marginBottom={ 2 }>
          <TextField
            fullWidth
            value={ editableBuildingType?.name }
            placeholder={ strings.adminScreen.updateBuildingTypeDialog.text1 }
            name="name"
            onChange={ onEditableBuildingTypeTextChange }
          />
        </Stack>
        <Stack>
          <TextField
            fullWidth
            value={ editableBuildingType?.code }
            placeholder={ strings.adminScreen.updateBuildingTypeDialog.text2 }
            name="code"
            onChange={ onEditableBuildingTypeTextChange }
          />
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