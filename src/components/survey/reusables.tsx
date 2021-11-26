import { Add, Delete } from "@mui/icons-material";
import { Box, Hidden, MenuItem, Paper, Stack, TextField, Typography, useMediaQuery } from "@mui/material";
import { DataGrid, GridRenderEditCellParams, GridColDef } from "@mui/x-data-grid";
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
  const [ selectedSurveyIds ] = React.useState<string[]>([]);

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
          componentName: "Testikomponentti",
          reusableMaterialId: reusableMaterials[0].id || "test",
          usability: Usability.Good,
          unit: Unit.M2,
          description: "Testikuvaus",
          amount: 10,
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
  const onMachineChange = async (updatedReusable: Reusable) => {
    try {
      console.log(updatedReusable);
    } catch (error) {
      errorContext.setError(strings.errorHandling.reusables.update, error);
    }
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
      <MenuItem key={ material.id } value={ material.name }>
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
          onChange={ event => console.log(event.target.value) }
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
          >
            { reusableOptions }
          </TextField>
          <TextField
            select
            color="primary"
            variant="standard"
            placeholder="Käyttökelpoisuus"
            helperText="Jos ei tiedossa, valitse 'ei arvioitu'"
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
          >
            { reusableOptions }
          </TextField>
          <TextField
            fullWidth={ isMobile }
            select
            color="primary"
            variant="standard"
            label="Mittayksikkö"
          >
            { unitOptions }
          </TextField>
        </Stack>
      </GenericDialog>
    );
  };

  /**
   * Render survey reusables table for desktop
   */
  const renderSurveyDataTable = () => {
    const localizedUnits = Object.values(Usability).map(usability => LocalizationUtils.getLocalizedUsability(usability));

    const columns: GridColDef[] = [
      {
        field: "material",
        headerName: strings.survey.reusables.dataGridColumns.material,
        width: 340,
        editable: editable
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
        valueOptions: localizedUnits,
        editable: editable
      },
      {
        field: "pcs",
        headerName: strings.survey.reusables.dataGridColumns.pcs,
        width: 340,
        editable: editable
      },
      {
        field: "amount",
        headerName: strings.survey.reusables.dataGridColumns.amount,
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
            <div style={{ overflow: "visible !important" }}>
              <TextField
                sx={{
                  zIndex: 1000,
                  backgroundColor: "#fff",
                  position: "fixed",
                  border: `1px solid ${theme.palette.primary.main}`
                }}
                placeholder="test"
                multiline
                rows={ 4 }
                value={ value }
                onChange={ e => api.setEditCellValue({
                  id: id,
                  field: field,
                  value: e.target.value
                }, e) }
              />
            </div>
          );
        }
      }
    ];

    return (
      <Paper>
        <WithReusableDataGridDebounce
          rows={ surveyReusables }
          columns={ columns }
          onRowChange={ onMachineChange }
          component={ params =>
            <DataGrid
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
              disabled={ !selectedSurveyIds.length }
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