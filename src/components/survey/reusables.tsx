import { Add, Delete } from "@mui/icons-material";
import { Box, Hidden, MenuItem, Paper, Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams, GridRenderEditCellParams, GridRowId } from "@mui/x-data-grid";
import Api from "api";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import GenericDialog from "components/generic/generic-dialog";
import WithDataGridDebounceFactory from "components/generic/with-data-grid-debounce";
import { selectKeycloak } from "features/auth-slice";
import { Reusable, ReusableMaterial, Unit, Usability } from "generated/client";
import strings from "localization/strings";
import * as React from "react";
import { SurveyButton } from "styled/screens/surveys-screen";
import theme from "theme";
import LocalizationUtils from "utils/localization-utils";

const WithReusableDataGridDebounce = WithDataGridDebounceFactory<Reusable>();

/**
 * Component properties
 */
interface Props {
  surveyId: string;
}

/**
 * Component for reusable materials and building parts
 */
const Reusables: React.FC<Props> = ({ surveyId }) => {
  const keycloak = useAppSelector(selectKeycloak);
  const errorContext = React.useContext(ErrorContext);
  const [ addingSurveyReusable, setAddingSurveyReusable ] = React.useState<boolean>(false);
  const [ loading, setLoading ] = React.useState(false);
  const [ editable ] = React.useState(true);
  const [ deletingMaterial, setDeletingMaterial ] = React.useState(false);
  const [ reusableDescriptionDialogOpen, setReusableDescriptionDialogOpen ] = React.useState(true);
  const [ surveyReusables, setSurveyReusables ] = React.useState<Reusable[]>([]);
  const [ reusableMaterials, setReusableMaterials ] = React.useState<ReusableMaterial[]>([]);
  const [ selectedReusableIds, setSelectedReusableIds ] = React.useState<GridRowId[]>([]);
  const [ newMaterial, setNewMaterial ] = React.useState<Reusable>({
    componentName: "",
    usability: Usability.NotValidated,
    reusableMaterialId: "",
    metadata: {}
  });

  /**
   * Fetch owner information array
   */
  const fetchSurveyReusables = async () => {
    setLoading(true);

    if (!keycloak?.token || !surveyId) {
      return;
    }

    try {
      const fetchedReusables = await Api.getSurveyReusablesApi(keycloak.token).listSurveyReusables({ surveyId: surveyId });
      setSurveyReusables(fetchedReusables);
    } catch (error) {
      errorContext.setError(strings.errorHandling.reusables.list, error);
    }

    setLoading(false);
  };

  /**
   * Fetches list of reusable materials and building parts
   */
  const fetchReusableMaterials = async () => {
    if (!keycloak?.token) {
      return;
    }

    try {
      setReusableMaterials(await Api.getReusableMaterialApi(keycloak.token).listReusableMaterials());
    } catch (error) {
      errorContext.setError(strings.errorHandling.materials.list, error);
    }
  };

  /**
   * Effect that loads component data
   */
  React.useEffect(() => {
    fetchSurveyReusables();
    fetchReusableMaterials();
    setSelectedReusableIds([]);
  }, []);

  /**
   * Event handler for add reusable confirm
   */
  const onAddReusableConfirm = async () => {
    const {
      componentName,
      reusableMaterialId,
      usability,
      unit,
      description,
      amount
    } = newMaterial;

    if (!keycloak?.token || !surveyId) {
      return;
    }

    try {
      const createdReusable = await Api.getSurveyReusablesApi(keycloak.token).createSurveyReusable({
        surveyId: surveyId,
        reusable: {
          componentName: componentName,
          reusableMaterialId: reusableMaterialId,
          usability: usability,
          unit: unit,
          description: description,
          amount: amount,
          metadata: {}
        }
      });
      setSurveyReusables([ ...surveyReusables, createdReusable ]);
    } catch (error) {
      errorContext.setError(strings.errorHandling.reusables.create, error);
    }

    setAddingSurveyReusable(false);
  };

  /**
   * Reusable change handler
   * 
   * @param updatedReusable updated reusable
   */
  const onMaterialRowChange = async (newReusable: Reusable) => {
    if (!keycloak?.token || !newReusable.id || !surveyId || newReusable.componentName === "") {
      return;
    }

    try {
      const updatedReusable = await Api.getSurveyReusablesApi(keycloak.token).updateSurveyReusable({
        surveyId: surveyId,
        reusableId: newReusable.id,
        reusable: newReusable
      });

      setSurveyReusables(surveyReusables.map(reusable => (reusable.id === updatedReusable.id ? updatedReusable : reusable)));
    } catch (error) {
      errorContext.setError(strings.errorHandling.reusables.update, error);
    }
    
    setReusableDescriptionDialogOpen(true); // TODO: Find another way to set description dialog open
  };

  /**
   * Event handler for delete survey reusable confirm
   */
  const onDeleteSurveyReusableConfirm = async () => {
    if (!keycloak?.token || !selectedReusableIds || !surveyId) {
      return;
    }

    const reusablesApi = Api.getSurveyReusablesApi(keycloak.token);

    await Promise.all(
      selectedReusableIds.map(async materialId => {
        await reusablesApi.deleteSurveyReusable({
          surveyId: surveyId,
          reusableId: materialId.toString()
        });
      })
    );

    fetchSurveyReusables();
    setSelectedReusableIds([]);
    setDeletingMaterial(false);
  };

  /**
   * Event handler for new material string change
   *
   * @param event React change event
   */
  const onNewMaterialTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;

    setNewMaterial({ ...newMaterial, [name]: value });
  };

  /**
   * Event handler for new material number change
   *
   * @param event React change event
   */
  const onNewMaterialNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;

    setNewMaterial({ ...newMaterial, [name]: Number(value) });
  };

  /**
   * Check if viewport is mobile size
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  /**
   * Renders delete material dialog
   */
  const renderDeleteSurveyMaterialDialog = () => (
    <GenericDialog
      error={ false }
      open={ deletingMaterial }
      onClose={ () => setDeletingMaterial(false) }
      onCancel={ () => setDeletingMaterial(false) }
      onConfirm={ onDeleteSurveyReusableConfirm }
      title={ strings.survey.reusables.deleteReusableDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography>
        { strings.survey.reusables.deleteReusableDialog.text }
      </Typography>
    </GenericDialog>
  );

  /**
   * Renders add survey reusable dialog
   */
  const renderAddSurveyReusableDialog = () => {
    const reusableOptions = Object.values(reusableMaterials).map(material =>
      <MenuItem key={ material.id } value={ material.id }>
        { material.name }
      </MenuItem>
    );

    const usabilityOptions = Object.values(Usability).map(usability =>
      <MenuItem key={ usability } value={ usability }>
        { LocalizationUtils.getLocalizedUsability(usability) }
      </MenuItem>
    );

    const unitOptions = Object.values(Unit).map(unit =>
      <MenuItem key={ unit } value={ unit }>
        { LocalizationUtils.getLocalizedUnits(unit) }
      </MenuItem>
    );

    return (
      <GenericDialog
        error={ false }
        open={ addingSurveyReusable }
        onClose={ () => setAddingSurveyReusable(false) }
        onCancel={ () => setAddingSurveyReusable(false) }
        onConfirm={ onAddReusableConfirm }
        title={ strings.survey.reusables.addNewBuildingPartsDialog.title }
        positiveButtonText={ strings.generic.confirm }
        cancelButtonText={ strings.generic.cancel }
      >
        <TextField
          fullWidth
          color="primary"
          name="componentName"
          label={ strings.survey.reusables.addNewBuildinPartsDialog.buildingPart }
          onChange={ onNewMaterialTextChange }
          helperText={ strings.survey.reusables.addNewBuildinPartsDialog.buildingPartHelperText }
        />
        <Stack
          direction={ isMobile ? "column" : "row" }
          spacing={ 2 }
        >
          <TextField
            fullWidth
            select
            color="primary"
            name="reusableMaterialId"
            label={ strings.survey.reusables.addNewBuildinPartsDialog.buildingPartOrMaterial }
            helperText={ strings.survey.reusables.addNewBuildinPartsDialog.buildingPartOrMaterialHelperText }
            onChange={ onNewMaterialTextChange }
          >
            { reusableOptions }
          </TextField>
          <TextField
            fullWidth
            select
            color="primary"
            name="usability"
            label={ strings.survey.reusables.addNewBuildinPartsDialog.usability }
            helperText={ strings.survey.reusables.addNewBuildinPartsDialog.usabilityHelperText }
            onChange={ onNewMaterialTextChange }
          >
            { usabilityOptions }
          </TextField>
        </Stack>
        <Stack
          direction={ isMobile ? "column" : "row" }
          spacing={ 2 }
        >
          <TextField
            fullWidth
            color="primary"
            name="amount"
            label={ strings.survey.reusables.addNewBuildinPartsDialog.amount }
            type="number"
            onChange={ onNewMaterialNumberChange }
          >
            { reusableOptions }
          </TextField>
          <TextField
            fullWidth
            select
            name="unit"
            color="primary"
            label={ strings.survey.reusables.addNewBuildinPartsDialog.unit }
            onChange={ onNewMaterialTextChange }
          >
            { unitOptions }
          </TextField>
        </Stack>
        <Stack spacing={ 2 } marginTop={ 2 }>
          <TextField
            multiline
            rows={ 6 }
            name="description"
            label={ strings.survey.reusables.addNewBuildinPartsDialog.description }
            onChange={ onNewMaterialTextChange }
            helperText={ strings.survey.reusables.addNewBuildinPartsDialog.descriptionHelperText }
          />
        </Stack>
      </GenericDialog>
    );
  };

  /**
   * Render survey reusables table for desktop
   */
  const renderSurveyDataTable = () => {
    const localizedUsability = Object.values(Usability).map(usability => ({
      label: LocalizationUtils.getLocalizedUsability(usability),
      value: usability
    }));

    const localizedUnits = Object.values(Unit).map(unit => ({
      label: LocalizationUtils.getLocalizedUnits(unit),
      value: unit
    }));
    const reusableMaterialsArray = reusableMaterials.map(material => ({ value: material.id, label: material.name }));
    const columns: GridColDef[] = [
      {
        field: "reusableMaterialId",
        headerName: strings.survey.reusables.dataGridColumns.material,
        width: 340,
        editable: editable,
        type: "singleSelect",
        valueOptions: reusableMaterialsArray,
        renderCell: (params: GridRenderCellParams) => {
          const { formattedValue } = params;
          return (
            <Typography>{ reusableMaterials.find(material => (material.id === formattedValue))?.name }</Typography>
          );
        }
      },
      {
        field: "componentName",
        headerName: strings.survey.reusables.dataGridColumns.buildingPart,
        width: 340,
        editable: editable
      },
      {
        field: "usability",
        headerName: strings.survey.reusables.dataGridColumns.usability,
        width: 340,
        type: "singleSelect",
        valueOptions: localizedUsability,
        editable: editable,
        renderCell: (params: GridRenderCellParams) => {
          const { formattedValue } = params;
          return (
            <Typography>{ LocalizationUtils.getLocalizedUsability(formattedValue) }</Typography>
          );
        }
      },
      {
        field: "amount",
        headerName: strings.survey.reusables.dataGridColumns.amount,
        width: 170,
        type: "number",
        editable: editable
      },
      {
        field: "unit",
        headerName: strings.survey.reusables.dataGridColumns.unit,
        width: 170,
        type: "singleSelect",
        valueOptions: localizedUnits,
        editable: editable,
        renderCell: (params: GridRenderCellParams) => {
          const { formattedValue } = params;
          return (
            <Typography>{ LocalizationUtils.getLocalizedUnits(formattedValue) }</Typography>
          );
        }
      },
      {
        field: "wasteAmount",
        headerName: strings.survey.reusables.dataGridColumns.wasteAmount,
        width: 340,
        editable: false // Not yet implemented
      },
      {
        field: "description",
        headerName: strings.survey.reusables.dataGridColumns.description,
        width: 340,
        editable: editable,
        renderEditCell: (params: GridRenderEditCellParams) => {
          const { value, api, id, field } = params;
          return (
            <GenericDialog
              error={ false }
              title={ strings.survey.reusables.dataGridColumns.editDescription }
              open={ reusableDescriptionDialogOpen }
              onClose={ () => setReusableDescriptionDialogOpen(false) }
              onCancel={ () => setReusableDescriptionDialogOpen(false) }
              onConfirm={ () => setReusableDescriptionDialogOpen(false) }
              positiveButtonText={ strings.generic.confirm }
              cancelButtonText={ strings.generic.cancel }
            >
              <TextField
                label={ strings.survey.reusables.dataGridColumns.description }
                multiline
                rows={ 4 }
                value={ value }
                onChange={ e => api.setEditCellValue({
                  id: id,
                  field: field,
                  value: e.target.value
                }, e) }
              />
            </GenericDialog>
          );
        }
      }
    ];

    return (
      <Paper>
        <WithReusableDataGridDebounce
          rows={ surveyReusables }
          columns={ columns }
          onRowChange={ onMaterialRowChange }
          component={ params =>
            <DataGrid
              onSelectionModelChange={ selectedIds => setSelectedReusableIds(selectedIds) }
              checkboxSelection
              autoHeight
              loading={ loading }
              pageSize={ 10 }
              disableSelectionOnClick
              { ...params }
            />
          }
        />
      </Paper>
    );
  };

  return (
    <>
      <Stack direction={ isMobile ? "column" : "row" } justifyContent="space-between" marginBottom={ 2 }>
        <Typography variant="h2">
          { strings.survey.reusables.title }
        </Typography>
        <Box
          display="flex"
          alignItems="stretch"
        >
          <Hidden lgDown>
            <SurveyButton
              disabled={ selectedReusableIds && !selectedReusableIds.length }
              variant="contained"
              color="error"
              startIcon={ <Delete/> }
              onClick={ () => setDeletingMaterial(true) }
              sx={{ mr: 2 }}
            >
              { strings.survey.reusables.deleteBuildingParts }
            </SurveyButton>
          </Hidden>
          <SurveyButton
            variant="contained"
            color="secondary"
            startIcon={ <Add/> }
            onClick={ () => setAddingSurveyReusable(true) }
          >
            { strings.survey.reusables.addNewBuildingPart }
          </SurveyButton>
        </Box>
      </Stack>
      { renderAddSurveyReusableDialog() }
      { renderDeleteSurveyMaterialDialog() }
      { renderSurveyDataTable() }
    </>
  );
};

export default Reusables;