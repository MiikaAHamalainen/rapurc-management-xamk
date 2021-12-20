import { Add, Delete } from "@mui/icons-material";
import { Box, Hidden, List, MenuItem, Paper, Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams, GridRenderEditCellParams, GridRowId, GridValueGetterParams } from "@mui/x-data-grid";
import Api from "api";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import GenericDialog from "components/generic/generic-dialog";
import WithDataGridDebounceFactory from "components/generic/with-data-grid-debounce";
import WithDebounce from "components/generic/with-debounce";
import SurveyItem from "components/layout-components/survey-item";
import { selectKeycloak } from "features/auth-slice";
import { Usage, Waste, WasteCategory, WasteMaterial } from "generated/client";
import strings from "localization/strings";
import * as React from "react";
import { SurveyButton } from "styled/screens/surveys-screen";
import theme from "theme";

const WithWasteDataGridDebounce = WithDataGridDebounceFactory<Waste>();

/**
 * Component properties
 */
interface Props {
  surveyId: string;
}

/**
 * Component for waste material materials
 */
const WasteMaterialView: React.FC<Props> = ({ surveyId }) => {
  const keycloak = useAppSelector(selectKeycloak);
  const errorContext = React.useContext(ErrorContext);
  const [ loading, setLoading ] = React.useState(false);
  const [ addingWaste, setAddingWaste ] = React.useState(false);
  const [ deletingWaste, setDeletingWaste ] = React.useState(false);
  const [ wasteDescriptionDialogOpen, setWasteDescriptionDialogOpen ] = React.useState(true);
  const [ wastes, setWastes ] = React.useState<Waste[]>([]);
  const [ wasteMaterials, setWasteMaterials ] = React.useState<WasteMaterial[]>([]);
  const [ wasteCategories, setWasteCategories ] = React.useState<WasteCategory[]>([]);
  const [ usages, setUsages ] = React.useState<Usage[]>([]);
  const [ selectedWasteIds, setSelectedWasteIds ] = React.useState<GridRowId[]>([]);
  const [ newWaste, setNewWaste ] = React.useState<Waste>({
    wasteMaterialId: "",
    usageId: "",
    amount: 0,
    metadata: {}
  });

  /**
   * Fetch waste array
   */
  const fetchWastes = async () => {
    if (!keycloak?.token || !surveyId) {
      return;
    }

    try {
      setWastes(await Api.getWastesApi(keycloak.token).listSurveyWastes({ surveyId: surveyId }));
    } catch (error) {
      errorContext.setError(strings.errorHandling.waste.list, error);
    }
  };

  /**
   * Fetches waste material array
   */
  const fetchWastesMaterials = async () => {
    if (!keycloak?.token) {
      return;
    }

    try {
      setWasteMaterials(await Api.getWasteMaterialApi(keycloak.token).listWasteMaterials());
    } catch (error) {
      errorContext.setError(strings.errorHandling.wasteMaterial.list, error);
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
      errorContext.setError(strings.errorHandling.wasteMaterials.list, error);
    }
  };

  /**
   * Fetches usage array
   */
  const fetchUsages = async () => {
    if (!keycloak?.token) {
      return;
    }

    try {
      setUsages(await Api.getUsageApi(keycloak.token).listUsages());
    } catch (error) {
      errorContext.setError(strings.errorHandling.postProcess.list, error);
    }
  };

  /**
   * Loads data
   */
  const loadData = async () => {
    setLoading(true);
    await fetchWastes();
    await fetchWastesMaterials();
    await fetchUsages();
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
   * Event handler for add waste confirm
   */
  const onAddWasteConfirm = async () => {
    if (!keycloak?.token || !surveyId) {
      return;
    }

    try {
      const createWaste = await Api.getWastesApi(keycloak.token).createSurveyWaste({
        surveyId: surveyId,
        waste: newWaste
      });

      setWastes([ ...wastes, createWaste ]);
      setNewWaste({
        wasteMaterialId: "",
        usageId: "",
        amount: 0,
        metadata: {}
      });
    } catch (error) {
      errorContext.setError(strings.errorHandling.waste.create, error);
    }

    setAddingWaste(false);
  };

  /**
   * Waste change handler
   * 
   * @param updatedWaste updated waste
   */
  const onWasteRowChange = async (updatedWaste: Waste) => {
    if (!keycloak?.token || !updatedWaste.id || !surveyId) {
      return;
    }

    try {
      const fetchedUpdatedMaterial = await Api.getWastesApi(keycloak.token).updateSurveyWaste({
        surveyId: surveyId,
        wasteId: updatedWaste.id,
        waste: updatedWaste
      });

      setWastes(wastes.map(waste => (waste.id === fetchedUpdatedMaterial.id ? fetchedUpdatedMaterial : waste)));
    } catch (error) {
      errorContext.setError(strings.errorHandling.waste.update, error);
    }

    setWasteDescriptionDialogOpen(true); // TODO: Find another way to set description dialog open
  };

  /**
   * Event Handler set waste prop
   * 
   * @param waste waste
   */
  const onWastePropChange: (waste: Waste) => React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> =
  (waste: Waste) => ({ target }) => {
    const { value, name } = target;

    const updatedWaste: Waste = { ...waste, [name]: value };
    onWasteRowChange(updatedWaste);
  };

  /**
    * Event handler for mobile view delete waste click
    *
    * @param wasteId waste id
    */
  const deleteWasteButtonClick = (wasteId?: string) => {
    if (!wasteId) {
      return;
    }

    setDeletingWaste(true);
    setSelectedWasteIds([ wasteId ]);
  };

  /**
   * Event handler for delete waste confirm
   */
  const onDeleteWasteConfirm = async () => {
    if (!keycloak?.token || !selectedWasteIds || !surveyId) {
      return;
    }

    const wasteApi = Api.getWastesApi(keycloak.token);

    try {
      await Promise.all(
        selectedWasteIds.map(async wasteId => {
          await wasteApi.deleteSurveyWaste({
            surveyId: surveyId,
            wasteId: wasteId.toString()
          });
        })
      );
    } catch (error) {
      errorContext.setError(strings.errorHandling.waste.delete, error);
    }

    fetchWastes();
    setSelectedWasteIds([]);
    setDeletingWaste(false);
  };

  /**
   * Event handler for new waste string change
   *
   * @param event React change event
   */
  const onNewWasteTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;

    setNewWaste({ ...newWaste, [name]: value });
  };

  /**
   * Event handler for new waste number change
   *
   * @param event React change event
   */
  const onNewWasteNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;

    setNewWaste({ ...newWaste, [name]: Number(value) });
  };

  /**
   * Check if viewport is mobile size
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

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
  const renderDeleteWasteDialog = () => (
    <GenericDialog
      error={ false }
      open={ deletingWaste }
      onClose={ () => setDeletingWaste(false) }
      onCancel={ () => setDeletingWaste(false) }
      onConfirm={ onDeleteWasteConfirm }
      title={ strings.survey.wasteMaterial.deleteWasteDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography>
        { strings.survey.wasteMaterial.deleteWasteDialog.text }
      </Typography>
    </GenericDialog>
  );

  /**
   * Renders add waste dialog
   */
  const renderAddWasteDialog = () => {
    const wasteMaterialOptions = wasteMaterials.map(wasteMaterial =>
      <MenuItem value={ wasteMaterial.id }>
        { wasteMaterial.name }
      </MenuItem>
    );

    const usageOptions = usages.map(usage =>
      <MenuItem value={ usage.id }>
        { usage.name }
      </MenuItem>
    );

    const materialId = wasteMaterials.find(material => material.id === newWaste.wasteMaterialId);
    const wasteCategory = wasteCategories.find(category => category.id === materialId?.wasteCategoryId);
    const fullEwcCode = materialId ? `${wasteCategory?.ewcCode || ""}${materialId?.ewcSpecificationCode}` : "";
  
    return (
      <GenericDialog
        error={ false }
        disabled={ !newWaste.wasteMaterialId || !newWaste.usageId }
        open={ addingWaste }
        onClose={ () => setAddingWaste(false) }
        onCancel={ () => setAddingWaste(false) }
        onConfirm={ onAddWasteConfirm }
        title={ strings.survey.wasteMaterial.addNewWasteDialog.title }
        positiveButtonText={ strings.generic.confirm }
        cancelButtonText={ strings.generic.cancel }
      >
        <Stack
          direction={ isMobile ? "column" : "row" }
          spacing={ 2 }
          marginTop={ 2 }
        >
          <TextField
            fullWidth
            select
            color="primary"
            value={ newWaste.wasteMaterialId }
            name="wasteMaterialId"
            label={ strings.survey.wasteMaterial.dataGridColumns.material }
            onChange={ onNewWasteTextChange }
          >
            { wasteMaterialOptions }
          </TextField>
          <TextField
            disabled
            value={ fullEwcCode || "" }
            color="primary"
            label={ strings.survey.wasteMaterial.dataGridColumns.wasteCode }
          />
        </Stack>
        <Stack
          direction={ isMobile ? "column" : "row" }
          spacing={ 2 }
          marginTop={ 2 }
        >
          <TextField
            fullWidth
            select
            color="primary"
            name="usageId"
            label={ strings.survey.wasteMaterial.dataGridColumns.usage }
            value={ newWaste.usageId }
            onChange={ onNewWasteTextChange }
          >
            { usageOptions }
          </TextField>
          <TextField
            name="amount"
            type="number"
            color="primary"
            value={ newWaste.amount }
            label={ strings.survey.wasteMaterial.dataGridColumns.amountInTons }
            onChange={ onNewWasteNumberChange }
          />
        </Stack>
        <Stack spacing={ 2 } marginTop={ 2 }>
          <TextField
            multiline
            rows={ 6 }
            name="description"
            label={ strings.survey.wasteMaterial.dataGridColumns.description }
            value={ newWaste.description }
            onChange={ onNewWasteTextChange }
          />
        </Stack>
      </GenericDialog>
    );
  };

  /**
   * Render waste list
   */
  const renderWasteList = () => {
    const wasteMaterialOptions = wasteMaterials.map(wasteMaterial =>
      <MenuItem value={ wasteMaterial.id }>
        { wasteMaterial.name }
      </MenuItem>
    );

    const usageOptions = usages.map(usage =>
      <MenuItem value={ usage.id }>
        { usage.name }
      </MenuItem>
    );

    return (
      <List>
        {
          wastes.map(waste => {
            const materialId = wasteMaterials.find(material => material.id === waste.wasteMaterialId);
            const wasteCategory = wasteCategories.find(category => category.id === materialId?.wasteCategoryId);
            const fullEwcCode = `${wasteCategory?.ewcCode || ""}${materialId?.ewcSpecificationCode}`;
            return (
              <SurveyItem
                title={ wasteMaterials.find(wasteMaterial => wasteMaterial.id === waste.wasteMaterialId)?.name || "" }
                subtitle={ `${waste.amount} t` }
              >
                {
                  renderWithDebounceSelectTextField(
                    "wasteMaterialId",
                    strings.survey.wasteMaterial.dataGridColumns.material,
                    wasteMaterialOptions,
                    onWastePropChange(waste),
                    waste.wasteMaterialId
                  )
                }
                <TextField
                  disabled
                  color="primary"
                  sx={{ mb: 1 }}
                  value={ fullEwcCode}
                  label={ strings.survey.wasteMaterial.dataGridColumns.wasteCode }
                />
                {
                  renderWithDebounceSelectTextField(
                    "usageId",
                    strings.survey.wasteMaterial.dataGridColumns.usage,
                    usageOptions,
                    onWastePropChange(waste),
                    waste.usageId,
                  )
                }
                {
                  renderWithDebounceNumberTextField(
                    "amount",
                    strings.survey.wasteMaterial.dataGridColumns.amountInTons,
                    onWastePropChange(waste),
                    waste.amount,
                  )
                }
                {
                  renderWithDebounceMultilineTextField(
                    "description",
                    strings.survey.wasteMaterial.dataGridColumns.description,
                    waste.description || "",
                    onWastePropChange(waste),
                  )
                }
                <SurveyButton
                  variant="outlined"
                  color="primary"
                  onClick={ () => deleteWasteButtonClick(waste.id) }
                >
                  <Typography color={ theme.palette.primary.main }>
                    { strings.generic.delete }
                  </Typography>
                </SurveyButton>
              </SurveyItem>
            );
          })
        }
      </List>
    );
  };

  /**
   * Render survey waste table for desktop
   */
  const renderWasteDataTable = () => {
    const wasteMaterialOptions = wasteMaterials.map(wasteMaterial => ({
      label: wasteMaterial.name,
      value: wasteMaterial.id
    }));

    const usageOptions = usages.map(usage => ({
      label: usage.name,
      value: usage.id
    }));

    const columns: GridColDef[] = [
      {
        field: "wasteMaterialId",
        headerName: strings.survey.wasteMaterial.dataGridColumns.material,
        width: 280,
        type: "singleSelect",
        editable: true,
        valueOptions: wasteMaterialOptions,
        renderCell: (params: GridRenderCellParams) => {
          const { formattedValue } = params;
          return (
            <Typography variant="body2">{ wasteMaterials.find(wasteMaterial => (wasteMaterial.id === formattedValue))?.name }</Typography>
          );
        }
      },
      {
        field: "wasteCode",
        valueGetter: (params: GridValueGetterParams) => {
          return params.getValue(params.id, "wasteMaterialId");
        },
        headerName: strings.survey.wasteMaterial.dataGridColumns.wasteCode,
        width: 150,
        type: "string",
        editable: false,
        renderCell: (params: GridRenderCellParams) => {
          const wasteMaterial = wasteMaterials.find(material => material.id === params.value);
          const wasteCategory = wasteCategories.find(category => category.id === wasteMaterial?.wasteCategoryId);
          const fullEwcCode = `${wasteCategory?.ewcCode || ""}${wasteMaterial?.ewcSpecificationCode}`;
          return (
            <Typography variant="body2">{ fullEwcCode }</Typography>
          );
        }
      },
      {
        field: "usageId",
        headerName: strings.survey.wasteMaterial.dataGridColumns.usage,
        width: 280,
        type: "singleSelect",
        editable: true,
        valueOptions: usageOptions,
        renderCell: (params: GridRenderCellParams) => {
          const { formattedValue } = params;
          return (
            <Typography variant="body2">{ usages.find(usage => (usage.id === formattedValue))?.name }</Typography>
          );
        }
      },
      {
        field: "amount",
        headerName: strings.survey.wasteMaterial.dataGridColumns.amount,
        width: 120,
        type: "number",
        editable: true,
        renderCell: (params: GridRenderCellParams) => {
          const { value } = params;
          return (
            <Typography variant="body2">
              {`${value} tn`}
            </Typography>
          );
        }
      },
      {
        field: "description",
        headerName: strings.survey.wasteMaterial.dataGridColumns.description,
        width: 400,
        editable: true,
        renderEditCell: (params: GridRenderEditCellParams) => {
          const { value, api, id, field } = params;
          return (
            <GenericDialog
              error={ false }
              title={ strings.survey.wasteMaterial.dataGridColumns.editDescription }
              open={ wasteDescriptionDialogOpen }
              onClose={ () => setWasteDescriptionDialogOpen(false) }
              onCancel={ () => setWasteDescriptionDialogOpen(false) }
              onConfirm={ () => setWasteDescriptionDialogOpen(false) }
              positiveButtonText={ strings.generic.confirm }
              cancelButtonText={ strings.generic.cancel }
            >
              <TextField
                label={ strings.survey.wasteMaterial.dataGridColumns.description }
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
        <WithWasteDataGridDebounce
          rows={ wastes }
          columns={ columns }
          onRowChange={ onWasteRowChange }
          component={ params =>
            <DataGrid
              onSelectionModelChange={ selectedIds => setSelectedWasteIds(selectedIds) }
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
          { strings.survey.wasteMaterial.title }
        </Typography>
        <Box
          display="flex"
          alignItems="stretch"
        >
          <Hidden lgDown>
            <SurveyButton
              disabled={ selectedWasteIds && !selectedWasteIds.length }
              variant="contained"
              color="error"
              startIcon={ <Delete/> }
              onClick={ () => setDeletingWaste(true) }
              sx={{ mr: 2 }}
            >
              { strings.survey.wasteMaterial.deleteWaste }
            </SurveyButton>
          </Hidden>
          <SurveyButton
            variant="contained"
            color="secondary"
            startIcon={ <Add/> }
            onClick={ () => setAddingWaste(true) }
          >
            { strings.survey.wasteMaterial.addNewWaste }
          </SurveyButton>
        </Box>
      </Stack>
      <Hidden lgUp>
        { renderWasteList() }
      </Hidden>
      <Hidden lgDown>
        { renderWasteDataTable() }
      </Hidden>
      { renderAddWasteDialog() }
      { renderDeleteWasteDialog() }
    </>
  );
};

export default WasteMaterialView;