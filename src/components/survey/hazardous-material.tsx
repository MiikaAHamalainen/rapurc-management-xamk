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
import { WasteCategory, HazardousWaste, HazardousMaterial, WasteSpecifier } from "generated/client";
import strings from "localization/strings";
import * as React from "react";
import { SurveyButton } from "styled/screens/surveys-screen";
import theme from "theme";

const WithWasteDataGridDebounce = WithDataGridDebounceFactory<HazardousWaste>();

/**
 * Component properties
 */
interface Props {
  surveyId: string;
}

/**
 * Component for hazardous materials
 */
const HazardousMaterialView: React.FC<Props> = ({ surveyId }) => {
  const keycloak = useAppSelector(selectKeycloak);
  const errorContext = React.useContext(ErrorContext);
  const [ loading, setLoading ] = React.useState(false);
  const [ addingWaste, setAddingHazardousWaste ] = React.useState(false);
  const [ deletingHazardousWaste, setDeletingHazardousWaste ] = React.useState(false);
  const [ wasteDescriptionDialogOpen, setWasteDescriptionDialogOpen ] = React.useState(true);
  const [ hazardousWastes, setHazardousWastes ] = React.useState<HazardousWaste[]>([]);
  const [ hazardousWasteMaterials, setHazardousWasteMaterials ] = React.useState<HazardousMaterial[]>([]);
  const [ wasteSpecifiers, setWasteSpecifiers ] = React.useState<WasteSpecifier[]>([]);
  const [ wasteCategories, setWasteCategories ] = React.useState<WasteCategory[]>([]);
  const [ selectedHazardousWasteIds, setSelectedHazardousWasteIds ] = React.useState<GridRowId[]>([]);
  const [ newHazardousWaste, setNewHazardousWaste ] = React.useState<HazardousWaste>({
    hazardousMaterialId: "",
    amount: 0,
    metadata: {}
  });

  /**
   * Fetch hazardous waste array
   */
  const fetchHazardousWastes = async () => {
    if (!keycloak?.token || !surveyId) {
      return;
    }

    try {
      setHazardousWastes(await Api.getHazardousWasteApi(keycloak.token).listSurveyHazardousWastes({ surveyId: surveyId }));
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
      setHazardousWasteMaterials(await Api.getHazardousMaterialApi(keycloak.token).listHazardousMaterials());
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
      errorContext.setError(strings.errorHandling.wasteMaterials.list, error);
    }
  };

  /**
   * Fetches waste specifiers array
   */
  const fetchWasteSpecifiers = async () => {
    if (!keycloak?.token) {
      return;
    }

    try {
      setWasteSpecifiers(await Api.getWasteSpecifiersApi(keycloak.token).listWasteSpecifiers());
    } catch (error) {
      errorContext.setError(strings.errorHandling.hazardousMaterials.list, error);
    }
  };

  /**
   * Loads data
   */
  const loadData = async () => {
    setLoading(true);
    await fetchHazardousWastes();
    await fetchWastesMaterials();
    await fetchWasteCategories();
    await fetchWasteSpecifiers();
    setLoading(false);
  };

  /**
   * Effect that loads component data
   */
  React.useEffect(() => {
    loadData();
  }, []);

  /**
   * Event handler for add hazardous waste confirm
   */
  const onAddHazardousWasteConfirm = async () => {
    if (!keycloak?.token || !surveyId) {
      return;
    }

    try {
      const createHazardousWaste = await Api.getHazardousWasteApi(keycloak.token).createSurveyHazardousWaste({
        surveyId: surveyId,
        hazardousWaste: newHazardousWaste
      });

      setHazardousWastes([ ...hazardousWastes, createHazardousWaste ]);
      setNewHazardousWaste({
        hazardousMaterialId: "",
        amount: 0,
        metadata: {}
      });
    } catch (error) {
      errorContext.setError(strings.errorHandling.hazardousWastes.create, error);
    }

    setAddingHazardousWaste(false);
  };

  /**
   * Hazardous waste change handler
   * 
   * @param updatedHazardousWaste updated hazardous waste
   */
  const onHazardousWasteRowChange = async (updatedHazardousWaste: HazardousWaste) => {
    if (!keycloak?.token || !updatedHazardousWaste.id || !surveyId) {
      return;
    }

    try {
      const fetchedUpdatedMaterial = await Api.getHazardousWasteApi(keycloak.token).updateSurveyHazardousWaste({
        surveyId: surveyId,
        hazardousWasteId: updatedHazardousWaste.id,
        hazardousWaste: updatedHazardousWaste
      });

      setHazardousWastes(hazardousWastes.map(hazardousWaste => (hazardousWaste.id === fetchedUpdatedMaterial.id ? fetchedUpdatedMaterial : hazardousWaste)));
    } catch (error) {
      errorContext.setError(strings.errorHandling.waste.update, error);
    }

    setWasteDescriptionDialogOpen(true);
  };

  /**
   * Validates number input event
   * 
   * @param onChange event handler callback
   * @param event event
   */
  const numberValidator =
  (onChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>) => (event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { value } = event.target;
    if (!value) {
      const updatedEvent: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement> = {
        ...event,
        target: {
          ...event.target,
          value: "0"
        }
      };
      onChange(updatedEvent);
      return;
    }

    if (Number.isNaN(parseFloat(value))) {
      return;
    }

    onChange(event);
  };

  /**
   * Event Handler set hazardous waste prop
   * 
   * @param hazardousWaste hazardous waste
   */
  const onWastePropChange: (hazardousWaste: HazardousWaste) => React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> =
  (hazardousWaste: HazardousWaste) => ({ target }) => {
    const { value, name } = target;

    const updatedHazardousWaste: HazardousWaste = { ...hazardousWaste, [name]: value };
    onHazardousWasteRowChange(updatedHazardousWaste);
  };

  /**
    * Event handler for mobile view delete hazardous waste click
    *
    * @param wasteId waste id
    */
  const deleteWasteButtonClick = (wasteId?: string) => {
    if (!wasteId) {
      return;
    }

    setDeletingHazardousWaste(true);
    setSelectedHazardousWasteIds([ wasteId ]);
  };

  /**
   * Event handler for delete hazardous waste confirm
   */
  const onDeleteWasteConfirm = async () => {
    if (!keycloak?.token || !selectedHazardousWasteIds || !surveyId) {
      return;
    }

    const hazardousWasteApi = Api.getHazardousWasteApi(keycloak.token);

    try {
      await Promise.all(
        selectedHazardousWasteIds.map(async hazardousWasteId => {
          await hazardousWasteApi.deleteSurveyHazardousWaste({
            surveyId: surveyId,
            hazardousWasteId: hazardousWasteId.toString()
          });
        })
      );
    } catch (error) {
      errorContext.setError(strings.errorHandling.waste.delete, error);
    }

    fetchHazardousWastes();
    setSelectedHazardousWasteIds([]);
    setDeletingHazardousWaste(false);
  };

  /**
   * Event handler for new hazardous waste string change
   *
   * @param event React change event
   */
  const onNewHazardousWasteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;

    setNewHazardousWaste({ ...newHazardousWaste, [name]: value });
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
      onChange={ numberValidator(onChange) }
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
   * Renders delete hazardous material dialog
   */
  const renderDeleteHazardousWasteDialog = () => (
    <GenericDialog
      error={ false }
      open={ deletingHazardousWaste }
      onClose={ () => setDeletingHazardousWaste(false) }
      onCancel={ () => setDeletingHazardousWaste(false) }
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
   * Renders add hazardous waste dialog
   */
  const renderAddHazardousWasteDialog = () => {
    const wasteMaterialOptions = hazardousWasteMaterials
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(wasteMaterial =>
        <MenuItem value={ wasteMaterial.id }>
          { wasteMaterial.name }
        </MenuItem>
      );

    const wasteSpecifierOptions = wasteSpecifiers
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(wasteSpecifier =>
        <MenuItem value={ wasteSpecifier.id }>
          { wasteSpecifier.name }
        </MenuItem>
      );

    wasteSpecifierOptions.unshift(
      <MenuItem value={ undefined }>
        { strings.generic.empty }
      </MenuItem>
    );

    const materialId = hazardousWasteMaterials.find(material => material.id === newHazardousWaste.hazardousMaterialId);
    const wasteCategory = wasteCategories.find(category => category.id === materialId?.wasteCategoryId);
    const fullEwcCode = materialId ? `${wasteCategory?.ewcCode || ""}${materialId?.ewcSpecificationCode}` : "";

    return (
      <GenericDialog
        fullScreen={ useMediaQuery(theme.breakpoints.down("sm")) }
        error={ false }
        disabled={ !newHazardousWaste.hazardousMaterialId }
        open={ addingWaste }
        onClose={ () => setAddingHazardousWaste(false) }
        onCancel={ () => setAddingHazardousWaste(false) }
        onConfirm={ onAddHazardousWasteConfirm }
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
            value={ newHazardousWaste.hazardousMaterialId }
            name="hazardousMaterialId"
            label={ strings.survey.hazardousMaterial.dataGridColumns.material }
            onChange={ onNewHazardousWasteChange }
          >
            { wasteMaterialOptions }
          </TextField>
          <TextField
            disabled
            value={ fullEwcCode || "" }
            color="primary"
            label={ strings.survey.hazardousMaterial.dataGridColumns.wasteCode }
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
            name="wasteSpecifierId"
            label={ strings.survey.hazardousMaterial.dataGridColumns.wasteSpecifier }
            value={ newHazardousWaste.wasteSpecifierId }
            onChange={ onNewHazardousWasteChange }
          >
            { wasteSpecifierOptions }
          </TextField>
          <TextField
            name="amount"
            type="number"
            color="primary"
            value={ newHazardousWaste.amount }
            label={ strings.survey.hazardousMaterial.dataGridColumns.amountInTons }
            onChange={ onNewHazardousWasteChange }
          />
        </Stack>
        <Stack spacing={ 2 } marginTop={ 2 }>
          <TextField
            multiline
            rows={ 6 }
            name="description"
            label={ strings.survey.hazardousMaterial.dataGridColumns.description }
            value={ newHazardousWaste.description }
            onChange={ onNewHazardousWasteChange }
          />
        </Stack>
      </GenericDialog>
    );
  };

  /**
   * Render hazardous waste list
   */
  const renderHazardousWasteList = () => {
    const wasteMaterialOptions = hazardousWasteMaterials
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(wasteMaterial =>
        <MenuItem value={ wasteMaterial.id }>
          { wasteMaterial.name }
        </MenuItem>
      );

    const wasteSpecifierOptions = wasteSpecifiers
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(wasteSpecifier =>
        <MenuItem value={ wasteSpecifier.id }>
          { wasteSpecifier.name }
        </MenuItem>
      );

    wasteSpecifierOptions.unshift(
      <MenuItem value={ undefined }>
        { strings.generic.empty }
      </MenuItem>
    );

    return (
      <List>
        {
          hazardousWastes.map(hazardousWaste => {
            const materialId = hazardousWasteMaterials.find(material => material.id === newHazardousWaste.hazardousMaterialId);
            const wasteCategory = wasteCategories.find(category => category.id === materialId?.wasteCategoryId);
            const fullEwcCode = materialId ? `${wasteCategory?.ewcCode || ""}${materialId?.ewcSpecificationCode}` : "";

            return (
              <SurveyItem
                title={ hazardousWasteMaterials.find(wasteMaterial => wasteMaterial.id === hazardousWaste.hazardousMaterialId)?.name || "" }
                subtitle={ `${hazardousWaste.amount} t` }
              >
                {
                  renderWithDebounceSelectTextField(
                    "hazardousMaterialId",
                    strings.survey.hazardousMaterial.dataGridColumns.material,
                    wasteMaterialOptions,
                    onWastePropChange(hazardousWaste),
                    hazardousWaste.hazardousMaterialId
                  )
                }
                <TextField
                  disabled
                  color="primary"
                  sx={{ mb: 1 }}
                  value={ fullEwcCode }
                  label={ strings.survey.hazardousMaterial.dataGridColumns.wasteCode }
                />
                {
                  renderWithDebounceSelectTextField(
                    "wasteSpecifierId",
                    strings.survey.hazardousMaterial.dataGridColumns.wasteSpecifier,
                    wasteSpecifierOptions,
                    onWastePropChange(hazardousWaste),
                    hazardousWaste.wasteSpecifierId,
                  )
                }
                {
                  renderWithDebounceNumberTextField(
                    "amount",
                    strings.survey.hazardousMaterial.dataGridColumns.amountInTons,
                    onWastePropChange(hazardousWaste),
                    hazardousWaste.amount,
                  )
                }
                {
                  renderWithDebounceMultilineTextField(
                    "description",
                    strings.survey.hazardousMaterial.dataGridColumns.description,
                    hazardousWaste.description || "",
                    onWastePropChange(hazardousWaste),
                  )
                }
                <SurveyButton
                  variant="outlined"
                  color="primary"
                  onClick={ () => deleteWasteButtonClick(hazardousWaste.id) }
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
   * Render survey hazardous waste table for desktop
   */
  const renderHazardousWasteDataTable = () => {
    const hazardousWasteMaterialOptions = hazardousWasteMaterials
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(hazardousWasteMaterial => ({
        label: hazardousWasteMaterial.name,
        value: hazardousWasteMaterial.id
      }));

    const wasteSpecifierOptions = wasteSpecifiers
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(wasteSpecifier => ({
        label: wasteSpecifier.name,
        value: wasteSpecifier.id
      }));

    wasteSpecifierOptions.unshift(
      ({
        label: strings.generic.empty,
        value: undefined
      })
    );

    const columns: GridColDef[] = [
      {
        field: "hazardousMaterialId",
        headerName: strings.survey.hazardousMaterial.dataGridColumns.material,
        width: 450,
        type: "singleSelect",
        editable: true,
        valueOptions: hazardousWasteMaterialOptions,
        renderCell: (params: GridRenderCellParams) => {
          const { formattedValue } = params;
          return (
            <Typography variant="body2">
              { hazardousWasteMaterials.find(hazardousWasteMaterial => (hazardousWasteMaterial.id === formattedValue))?.name }
            </Typography>
          );
        }
      },
      {
        field: "wasteCode",
        valueGetter: (params: GridValueGetterParams) => {
          return params.getValue(params.id, "hazardousMaterialId");
        },
        headerName: strings.survey.hazardousMaterial.dataGridColumns.wasteCode,
        width: 150,
        type: "string",
        editable: false,
        renderCell: (params: GridRenderCellParams) => {
          const hazardousWasteMaterial = hazardousWasteMaterials.find(material => material.id === params.value);
          const wasteCategory = wasteCategories.find(category => category.id === hazardousWasteMaterial?.wasteCategoryId);
          const fullEwcCode = `${wasteCategory?.ewcCode || ""}${hazardousWasteMaterial?.ewcSpecificationCode}`;
          return (
            <Typography variant="body2">{ fullEwcCode }</Typography>
          );
        }
      },
      {
        field: "wasteSpecifierId",
        headerName: strings.survey.hazardousMaterial.dataGridColumns.wasteSpecifier,
        width: 280,
        type: "singleSelect",
        editable: true,
        valueOptions: wasteSpecifierOptions,
        renderCell: (params: GridRenderCellParams) => {
          const { formattedValue } = params;
          return (
            <Typography variant="body2">
              { wasteSpecifiers.find(wasteSpecifier => (wasteSpecifier.id === formattedValue))?.name }
            </Typography>
          );
        }
      },
      {
        field: "amount",
        headerName: strings.survey.hazardousMaterial.dataGridColumns.amount,
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
        headerName: strings.survey.hazardousMaterial.dataGridColumns.description,
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
                label={ strings.survey.hazardousMaterial.dataGridColumns.description }
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
          rows={ hazardousWastes }
          columns={ columns }
          onRowChange={ onHazardousWasteRowChange }
          component={ params =>
            <DataGrid
              onSelectionModelChange={ selectedIds => setSelectedHazardousWasteIds(selectedIds) }
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
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        marginBottom={ 2 }
      >
        <Typography variant="h2">
          { strings.survey.hazardousMaterial.title }
        </Typography>
        <Box
          display="flex"
          alignItems="stretch"
        >
          <Hidden lgDown>
            <SurveyButton
              disabled={ selectedHazardousWasteIds && !selectedHazardousWasteIds.length }
              variant="contained"
              color="error"
              startIcon={ <Delete/> }
              onClick={ () => setDeletingHazardousWaste(true) }
              sx={{ mr: 2 }}
            >
              { strings.survey.wasteMaterial.deleteWaste }
            </SurveyButton>
          </Hidden>
          <SurveyButton
            variant="contained"
            color="secondary"
            startIcon={ <Add/> }
            onClick={ () => setAddingHazardousWaste(true) }
          >
            { strings.survey.wasteMaterial.addNewWaste }
          </SurveyButton>
        </Box>
      </Stack>
      <Hidden lgUp>
        { renderHazardousWasteList() }
      </Hidden>
      <Hidden lgDown>
        { renderHazardousWasteDataTable() }
      </Hidden>
      { renderAddHazardousWasteDialog() }
      { renderDeleteHazardousWasteDialog() }
    </>
  );
};

export default HazardousMaterialView;