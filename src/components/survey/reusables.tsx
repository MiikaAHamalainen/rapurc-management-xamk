import { Add, Delete } from "@mui/icons-material";
import { Box, Hidden, List, MenuItem, Paper, Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams, GridRenderEditCellParams, GridRowId } from "@mui/x-data-grid";
import Api from "api";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import GenericDialog from "components/generic/generic-dialog";
import WithDataGridDebounceFactory from "components/generic/with-data-grid-debounce";
import WithDebounce from "components/generic/with-debounce";
import SurveyItem from "components/layout-components/survey-item";
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
    if (!keycloak?.token || !surveyId) {
      return;
    }

    setLoading(true);

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
    if (!keycloak?.token || !surveyId) {
      return;
    }

    try {
      const createdReusable = await Api.getSurveyReusablesApi(keycloak.token).createSurveyReusable({
        surveyId: surveyId,
        reusable: newMaterial
      });

      setSurveyReusables([ ...surveyReusables, createdReusable ]);
      setNewMaterial({
        componentName: "",
        usability: Usability.NotValidated,
        reusableMaterialId: "",
        metadata: {}
      });
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
   * Event Handler set material prop
   * 
   * @param reusable reusable
   */
  const onMaterialPropChange: (reusable: Reusable) =>
  React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = (reusable: Reusable) =>
    ({ target }) => {
      const { value, name } = target;

      const updatedReusable: Reusable = { ...reusable, [name]: value };
      onMaterialRowChange(updatedReusable);
    };

  /**
    * Event handler for mobile view delete survey click
    *
    * @param surveyId survey id
    */
  const deleteMaterialButtonClick = (surveyorId?: string) => {
    if (!surveyorId) {
      return;
    }

    setDeletingMaterial(true);
    setSelectedReusableIds([ surveyorId ]);
  };

  /**
   * Event handler for delete survey reusable confirm
   */
  const onDeleteSurveyReusableConfirm = async () => {
    if (!keycloak?.token || !selectedReusableIds || !surveyId) {
      return;
    }

    const reusablesApi = Api.getSurveyReusablesApi(keycloak.token);

    try {
      await Promise.all(
        selectedReusableIds.map(async materialId => {
          await reusablesApi.deleteSurveyReusable({
            surveyId: surveyId,
            reusableId: materialId.toString()
          });
        })
      );
    } catch (error) {
      errorContext.setError(strings.errorHandling.reusables.delete, error);
    }

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
   * Renders textfield with debounce
   * 
   * @param name name
   * @param label label
   * @param value value
   * @param onChange onChange
   */
  const renderWithDebounceTextField = (
    name: string,
    label: string,
    value: string,
    onChange: React.ChangeEventHandler<HTMLInputElement>
  ) => (
    <WithDebounce
      name={ name }
      value={ value }
      label={ label }
      onChange={ onChange }
      component={ props =>
        <TextField sx={{ mb: 1 }} { ...props }/>
      }
    />
  );

  /**
   * Renders multiline textfield with debounce
   * 
   * @param name name
   * @param label label
   * @param value value
   * @param onChange onChange
   */
  const renderWithDebounceMultilineTextField = (
    name: string,
    label: string,
    value: string,
    onChange: React.ChangeEventHandler<HTMLInputElement>
  ) => (
    <WithDebounce
      name={ name }
      value={ value }
      label={ label }
      onChange={ onChange }
      component={ props =>
        <TextField
          multiline
          rows={ 4 }
          sx={{ mb: 1 }}
          { ...props }
        />
      }
    />
  );

  /**
   * Renders number textfield with debounce
   * 
   * @param name name
   * @param label label
   * @param onChange onChange
   * @param value value
   */
  const renderWithDebounceNumberTextField = (
    name: string,
    label: string,
    onChange: React.ChangeEventHandler<HTMLInputElement>,
    value?: number
  ) => (
    <WithDebounce
      name={ name }
      value={ value }
      label={ label }
      onChange={ onChange }
      component={ props =>
        <TextField
          type="number"
          sx={{ mb: 1 }}
          { ...props }
        />
      }
    />
  );

  /**
   * Renders select textfield with debounce
   * 
   * @param name name
   * @param label label
   * @param options options
   * @param onChange onChange
   * @param value value
   */
  const renderWithDebounceSelectTextField = (
    name: string,
    label: string,
    options: React.ReactNode[],
    onChange: React.ChangeEventHandler<HTMLInputElement>,
    value?: string,
  ) => (
    <WithDebounce
      name={ name }
      value={ value }
      label={ label }
      onChange={ onChange }
      component={ props =>
        <TextField
          select
          sx={{ mb: 1 }}
          { ...props }
        >
          { options }
        </TextField>
      }
    />
  );

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
        disabled={ !newMaterial.componentName || !newMaterial.reusableMaterialId }
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
          label={ strings.survey.reusables.dataGridColumns.buildingPart }
          onChange={ onNewMaterialTextChange }
          value={ newMaterial.componentName }
          helperText={ strings.survey.reusables.addNewBuildingPartsDialog.buildingPartHelperText }
        />
        <Stack
          direction={ isMobile ? "column" : "row" }
          spacing={ 2 }
          marginTop={ 2 }
        >
          <TextField
            fullWidth
            select
            color="primary"
            name="reusableMaterialId"
            value={ newMaterial.reusableMaterialId }
            label={ strings.survey.reusables.addNewBuildingPartsDialog.buildingPartOrMaterial }
            helperText={ strings.survey.reusables.addNewBuildingPartsDialog.buildingPartOrMaterialHelperText }
            onChange={ onNewMaterialTextChange }
          >
            { reusableOptions }
          </TextField>
          <TextField
            fullWidth
            select
            color="primary"
            name="usability"
            value={ newMaterial.usability }
            label={ strings.survey.reusables.dataGridColumns.usability }
            helperText={ strings.survey.reusables.addNewBuildingPartsDialog.usabilityHelperText }
            onChange={ onNewMaterialTextChange }
          >
            { usabilityOptions }
          </TextField>
        </Stack>
        <Stack
          direction={ isMobile ? "column" : "row" }
          spacing={ 2 }
          marginTop={ 2 }
        >
          <TextField
            fullWidth
            color="primary"
            name="amount"
            value={ newMaterial.amount }
            label={ strings.survey.reusables.dataGridColumns.amount }
            type="number"
            onChange={ onNewMaterialNumberChange }
          />
          <TextField
            fullWidth
            select
            name="unit"
            color="primary"
            value={ newMaterial.unit }
            label={ strings.survey.reusables.dataGridColumns.unit }
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
            label={ strings.survey.reusables.dataGridColumns.description }
            value={ newMaterial.description }
            onChange={ onNewMaterialTextChange }
            helperText={ strings.survey.reusables.addNewBuildingPartsDialog.descriptionHelperText }
          />
          <TextField
            type="number"
            name="amountAsWaste"
            label={ strings.survey.reusables.dataGridColumns.wasteAmount }
            value={ newMaterial.amountAsWaste }
            onChange={ onNewMaterialNumberChange }
            helperText={ strings.survey.reusables.addNewBuildingPartsDialog.wasteAmountHelperText }
          />
        </Stack>
      </GenericDialog>
    );
  };

  /**
   * Render material list item
   */
  const renderMaterialListItems = () => {
    const materialOptions = reusableMaterials.map(material => (
      <MenuItem value={ material.id }>
        { material.name }
      </MenuItem>
    ));
    const usabilityOptions = Object.values(Usability).map(usability => (
      <MenuItem value={ usability }>
        { LocalizationUtils.getLocalizedUsability(usability) }
      </MenuItem>
    ));
    const UnitOptions = Object.values(Unit).map(unit => (
      <MenuItem value={ unit }>
        { LocalizationUtils.getLocalizedUnits(unit) }
      </MenuItem>
    ));

    return (
      surveyReusables.map(reusable =>
        <SurveyItem
          title={ reusable.componentName }
          subtitle={ `${reusable.amount} ${reusable.unit ? LocalizationUtils.getLocalizedUnits(reusable.unit) : ""}` }
        >
          { renderWithDebounceSelectTextField(
            "reusableMaterialId",
            strings.survey.reusables.dataGridColumns.material,
            materialOptions,
            onMaterialPropChange(reusable),
            reusable.reusableMaterialId
          )
          }
          { renderWithDebounceTextField(
            "componentName",
            strings.survey.reusables.dataGridColumns.buildingPart,
            reusable.componentName,
            onMaterialPropChange(reusable)
          )
          }
          { renderWithDebounceSelectTextField(
            "usability",
            strings.survey.reusables.dataGridColumns.usability,
            usabilityOptions,
            onMaterialPropChange(reusable),
            reusable.usability,
          )
          }
          { renderWithDebounceNumberTextField(
            "amount",
            strings.survey.reusables.dataGridColumns.amount,
            onMaterialPropChange(reusable),
            reusable.amount,
          )
          }
          { renderWithDebounceSelectTextField(
            "unit",
            strings.survey.reusables.dataGridColumns.unit,
            UnitOptions,
            onMaterialPropChange(reusable),
            reusable.unit,
          )
          }
          { renderWithDebounceNumberTextField(
            "amountAsWaste",
            strings.survey.reusables.dataGridColumns.amount,
            onMaterialPropChange(reusable),
            reusable.amountAsWaste
          )
          }
          { renderWithDebounceMultilineTextField(
            "description",
            strings.survey.reusables.dataGridColumns.description,
            reusable.description || "",
            onMaterialPropChange(reusable),
          )
          }
          <SurveyButton
            variant="outlined"
            color="primary"
            onClick={ () => deleteMaterialButtonClick(reusable.id) }
          >
            <Typography color={ theme.palette.primary.main }>
              { strings.generic.delete }
            </Typography>
          </SurveyButton>
        </SurveyItem>
      )
    );
  };

  /**
   * Render surveyor list
   */
  const renderMaterialList = () => (
    <List>
      { renderMaterialListItems() }
    </List>
  );

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
        editable: true,
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
        editable: true
      },
      {
        field: "usability",
        headerName: strings.survey.reusables.dataGridColumns.usability,
        width: 340,
        type: "singleSelect",
        valueOptions: localizedUsability,
        editable: true,
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
        width: 160,
        type: "number",
        editable: true
      },
      {
        field: "unit",
        headerName: strings.survey.reusables.dataGridColumns.unit,
        width: 200,
        type: "singleSelect",
        valueOptions: localizedUnits,
        editable: true,
        renderCell: (params: GridRenderCellParams) => {
          const { formattedValue } = params;
          return (
            <Typography>{ LocalizationUtils.getLocalizedUnits(formattedValue) }</Typography>
          );
        }
      },
      {
        field: "amountAsWaste",
        headerName: strings.survey.reusables.dataGridColumns.wasteAmount,
        width: 340,
        type: "number",
        editable: true
      },
      {
        field: "description",
        headerName: strings.survey.reusables.dataGridColumns.description,
        width: 340,
        editable: true,
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
      <Stack
        spacing={ 2 }
        direction="row"
        justifyContent="space-between"
        marginBottom={ 2 }
      >
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
      <Hidden lgUp>
        { renderMaterialList() }
      </Hidden>
      <Hidden lgDown>
        { renderSurveyDataTable() }
      </Hidden>
      { renderAddSurveyReusableDialog() }
      { renderDeleteSurveyMaterialDialog() }
    </>
  );
};

export default Reusables;