import { Add, Delete } from "@mui/icons-material";
import { Box, Hidden, MenuItem, Paper, Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import { DataGrid, GridColDef, GridRenderEditCellParams } from "@mui/x-data-grid";
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
  const [ surveyReusables, setSurveyReusables ] = React.useState<Reusable[]>([]);
  const [ reusableMaterials, setReusableMaterials ] = React.useState<ReusableMaterial[]>([]);
  const [ selectedMaterialIds, setSelectedMaterialIds ] = React.useState<string[]>([]);
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
      console.log(fetchedReusables);
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
        reusable: {
          componentName: newMaterial.componentName,
          reusableMaterialId: newMaterial.reusableMaterialId,
          usability: newMaterial.usability,
          unit: newMaterial.unit,
          description: newMaterial.description,
          amount: newMaterial.amount,
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
    if (!keycloak?.token || !newReusable.id || !surveyId) {
      return;
    }

    try {
      const updatedReusable = await Api.getSurveyReusablesApi(keycloak.token).updateSurveyReusable({
        surveyId: surveyId,
        reusableId: newReusable.id,
        reusable: newReusable
      });
      console.log(updatedReusable);
    } catch (error) {
      errorContext.setError(strings.errorHandling.reusables.update, error);
    }
  };

  /**
   * Even handler for new material id change
   */
  const handleNewMaterialIdChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    newMaterial && setNewMaterial({ ...newMaterial, reusableMaterialId: target.value });
  };

  /**
   * Even handler for new material usability change
   */
  const handleNewMaterialUsabilityChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    newMaterial && setNewMaterial({ ...newMaterial, usability: target.value as Usability });
  };

  /**
   * Even handler for new material component name change
   */
  const handleNewMaterialComponentNameChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    newMaterial && setNewMaterial({ ...newMaterial, componentName: target.value });
  };

  /**
   * Even handler for new material amount change
   */
  const handleNewMaterialAmountChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    newMaterial && setNewMaterial({ ...newMaterial, amount: target.value as unknown as number });
  };

  /**
   * Even handler for new material unit change
   */
  const handleNewMaterialUnitChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    newMaterial && setNewMaterial({ ...newMaterial, unit: target.value as Unit });
  };

  /**
   * Even handler for new material description change
   */
  const handleNewMaterialDescriptionChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    newMaterial && setNewMaterial({ ...newMaterial, description: target.value });
  };

  /**
   * Check if viewport is mobile size
   */
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

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
        title={ strings.survey.reusables.addNewBuildinPartsDialog.title }
        positiveButtonText={ strings.generic.confirm }
        cancelButtonText={ strings.generic.cancel }
      >
        <Typography variant="subtitle1">
          { strings.survey.reusables.addNewBuildinPartsDialog.title }
        </Typography>
        <TextField
          fullWidth
          color="primary"
          variant="standard"
          placeholder="Rakennusosa"
          onChange={ handleNewMaterialComponentNameChange }
          helperText="Anna rakennusosaa kuvaava nimi"
        />
        <Stack direction="row" justifyContent="space-between">
          <TextField
            fullWidth={ isMobile }
            select
            color="primary"
            variant="standard"
            placeholder="Rakennusosa tai -materiaali"
            helperText="Anna osaa vastaava tarkenne"
            onChange={ handleNewMaterialIdChange }
          >
            { reusableOptions }
          </TextField>
          <TextField
            select
            color="primary"
            variant="standard"
            placeholder="Käyttökelpoisuus"
            helperText="Jos ei tiedossa, valitse 'ei arvioitu'"
            onChange={ handleNewMaterialUsabilityChange }
          >
            { usabilityOptions }
          </TextField>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <TextField
            fullWidth={ isMobile }
            color="primary"
            variant="standard"
            placeholder="Määrä"
            type="number"
            onChange={ handleNewMaterialAmountChange }
          >
            { reusableOptions }
          </TextField>
          <TextField
            fullWidth={ isMobile }
            select
            color="primary"
            variant="standard"
            label="Mittayksikkö"
            onChange={ handleNewMaterialUnitChange }
          >
            { unitOptions }
          </TextField>
        </Stack>
        <Stack>
          <TextField
            multiline
            rows={ 6 }
            placeholder="Lisätiedot"
            onChange={ handleNewMaterialDescriptionChange }
            helperText="Vapaa kuvaus esim. sijainnista rakennuksessa tms."
          />
        </Stack>
      </GenericDialog>
    );
  };

  /**
   * Render survey reusables table for desktop
   */
  const renderSurveyDataTable = () => {
    const localizedUsability = Object.values(Usability).map(usability => LocalizationUtils.getLocalizedUsability(usability));
    const localizedUnits = Object.values(Unit).map(unit => LocalizationUtils.getLocalizedUnits(unit));
    const reusableMaterialsArray = reusableMaterials.map(material => material.name);

    const columns: GridColDef[] = [
      {
        field: "material",
        headerName: strings.survey.reusables.dataGridColumns.material,
        width: 340,
        editable: editable,
        type: "singleSelect",
        valueOptions: reusableMaterialsArray
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
        editable: editable
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
        editable: editable
      },
      {
        field: "wasteAmount",
        headerName: strings.survey.reusables.dataGridColumns.wasteAmount,
        width: 340,
        editable: editable
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
              title="Muokkaa lisätietoa"
              open={ true }
              onClose={ () => {} }
              onCancel={ () => {} }
              onConfirm={ () => {} }
              positiveButtonText={ strings.generic.confirm }
              cancelButtonText={ strings.generic.cancel }
            >
              <TextField
                label="Lisätieto"
                placeholder="Kirjoita lisätieto"
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
              onSelectionModelChange={ selectedIds => setSelectedMaterialIds(selectedIds as string[]) }
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
              disabled={ !selectedMaterialIds.length }
              variant="contained"
              color="error"
              startIcon={ <Delete/> }
              onClick={ () => console.log("Poista") }
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
      { renderSurveyDataTable() }
    </>
  );
};

export default Reusables;