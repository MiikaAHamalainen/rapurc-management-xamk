import { Stack, TextField, Typography, MenuItem, Paper, Box, Hidden, useMediaQuery, List, Checkbox, FormControlLabel } from "@mui/material";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import WithDebounce from "components/generic/with-debounce";
import { selectSelectedSurvey, updateSurvey } from "features/surveys-slice";
import { Surveyor, SurveyType } from "generated/client";
import strings from "localization/strings";
import React from "react";
import { useAppDispatch } from "../../app/hooks";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DatePicker from "@mui/lab/DatePicker";
import fiLocale from "date-fns/locale/fi";
import enLocale from "date-fns/locale/en-US";
import LocalizationUtils from "utils/localization-utils";
import WithDataGridDebounceFactory from "components/generic/with-data-grid-debounce";
import { selectKeycloak } from "features/auth-slice";
import { GridColDef, DataGrid, GridRowId, GridRenderEditCellParams } from "@mui/x-data-grid";
import Api from "api";
import { Delete, Add } from "@mui/icons-material";
import { SurveyButton } from "styled/screens/surveys-screen";
import GenericDialog from "components/generic/generic-dialog";
import theme from "theme";
import SurveyItem from "components/layout-components/survey-item";

const WithSurveyDataGridDebounce = WithDataGridDebounceFactory<Surveyor>();

/**
 * Component for survey information
 */
const SurveyInformation: React.FC = () => {
  const keycloak = useAppSelector(selectKeycloak);
  const selectedSurvey = useAppSelector(selectSelectedSurvey);
  const errorContext = React.useContext(ErrorContext);
  const dispatch = useAppDispatch();
  const [ surveyors, setSurveyors ] = React.useState<Surveyor[]>([]);
  const [ loading, setLoading ] = React.useState(false);
  const [ selectedSurveyorIds, setSelectedSurveyorIds ] = React.useState<GridRowId[]>([]);
  const [ deletingSurveyor, setDeletingSurveyor ] = React.useState(false);
  const [ addingSurveyor, setAddingSurveyor ] = React.useState(false);
  const [ newSurveyor, setNewSurveyor ] = React.useState<Surveyor>({
    firstName: "",
    lastName: "",
    company: "",
    phone: ""
  });

  /**
   * Fetch surveyor array
   */
  const fetchSurveyors = async () => {
    if (!keycloak?.token || !selectedSurvey?.id) {
      return;
    }

    setLoading(true);

    try {
      const fetchedSurveyors = await Api.getSurveyorsApi(keycloak.token).listSurveyors({ surveyId: selectedSurvey.id });
      setSurveyors(fetchedSurveyors);
    } catch (error) {
      errorContext.setError(strings.errorHandling.surveyors.list, error);
    }

    setLoading(false);
  };

  /**
   * Effect that loads component data
   */
  React.useEffect(() => {
    fetchSurveyors();
  }, []);

  /**
   * Event Handler set survey date
   * 
   * @param name field name
   * @param selectedDate selected date
   */
  const onSurveyInfoDateChange = (name: string) => async (selectedDate: Date | null) => {
    if (!selectedSurvey?.id || !selectedDate || Number.isNaN(selectedDate.getTime())) {
      return;
    }

    try {
      await dispatch(updateSurvey({ ...selectedSurvey, [name]: selectedDate })).unwrap();
    } catch (error) {
      errorContext.setError(strings.errorHandling.surveys.update);
    }
  };
  /**
  * Event Handler set survey date
  * 
  * @param name field name
  * @param dateUnknown date unknown
  */
  const onDateUnknownChange = (name: string) => async (event: React.ChangeEvent<HTMLInputElement>, Checked: Boolean | null) => {
    if (!selectedSurvey || !selectedSurvey.id) {
      return;
    }
    try {
      await dispatch(updateSurvey({ ...selectedSurvey, [name]: Checked })).unwrap();
    } catch (error) {
      errorContext.setError(strings.errorHandling.surveys.update);
    }
  };

  /**
   * Event Handler set survey type
   * 
   * @param event event
   */
  const onSurveyInfoTypeChange: React.ChangeEventHandler<HTMLInputElement> = async ({ target }) => {
    const { value } = target;

    if (!selectedSurvey?.id) {
      return;
    }

    try {
      await dispatch(updateSurvey({ ...selectedSurvey, type: value as SurveyType })).unwrap();
    } catch (error) {
      errorContext.setError(strings.errorHandling.surveys.update);
    }
  };

  /**
   * Surveyor change handler
   * 
   * @param surveyor updated surveyor
   */
  const onSurveyorRowChange = async (surveyor: Surveyor) => {
    if (!keycloak?.token || !selectedSurvey?.id || !surveyor.id) {
      return;
    }

    setSurveyors(surveyors.map(surveyorData => (surveyorData.id === surveyor.id ? surveyor : surveyorData)));
    try {
      await Api.getSurveyorsApi(keycloak.token).updateSurveyor({
        surveyId: selectedSurvey.id,
        surveyorId: surveyor.id,
        surveyor: surveyor
      });
    } catch (error) {
      errorContext.setError(strings.errorHandling.surveyors.update, error);
    }
  };

  /**
   * Event Handler set surveyor prop
   */
  const onSurveyorPropChange: (surveyor: Surveyor) =>
  React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = (surveyor: Surveyor) =>
    ({ target }) => {
      const { value, name } = target;

      const updatedSurveyor: Surveyor = { ...surveyor, [name]: value };
      onSurveyorRowChange(updatedSurveyor);
    };

  /**
   * Event handler for mobile view delete survey click
   *
   * @param surveyId survey id
   */
  const deleteSurveyorButtonClick = (surveyorId?: string) => {
    if (!surveyorId) {
      return;
    }

    setDeletingSurveyor(true);
    setSelectedSurveyorIds([ surveyorId ]);
  };

  /**
   * Event handler for delete surveyor confirm
   */
  const onDeleteSurveyorConfirm = async () => {
    if (!keycloak?.token || !selectedSurvey?.id || !selectedSurveyorIds.length) {
      return;
    }

    const surveyorsApi = Api.getSurveyorsApi(keycloak.token);
    const surveyId = selectedSurvey?.id;

    try {
      await Promise.all(
        selectedSurveyorIds.map(async surveyorId => {
          await surveyorsApi.deleteSurveyor({
            surveyId: surveyId,
            surveyorId: surveyorId.toString()
          });
        })
      );
  
      fetchSurveyors();
      setSelectedSurveyorIds([]);
    } catch (error) {
      errorContext.setError(strings.errorHandling.surveyors.delete, error);
    }
    setDeletingSurveyor(false);
  };

  /**
   * Event handler for new surveyor string change
   *
   * @param event React change event
   */
  const onNewSurveyorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name } = event.target;

    setNewSurveyor({ ...newSurveyor, [name]: value });
  };

  /**
   * Event handler for add surveyor confirm
   */
  const onAddSurveyorConfirm = async () => {
    if (!keycloak?.token || !selectedSurvey?.id) {
      return;
    }

    try {
      const createdSurveyor = await Api.getSurveyorsApi(keycloak.token).createSurveyor({
        surveyId: selectedSurvey.id,
        surveyor: newSurveyor
      });

      setSurveyors([ ...surveyors, createdSurveyor ]);
      setNewSurveyor({
        firstName: "",
        lastName: "",
        company: "",
        phone: ""
      });
    } catch (error) {
      errorContext.setError(strings.errorHandling.surveyors.create, error);
    }

    setAddingSurveyor(false);
  };

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
    value:string,
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
   * Renders demolition scope option
   * 
   * @param type type
   */
  const renderDemolitionScopeOption = (type: SurveyType) => (
    <MenuItem value={ type }>
      { LocalizationUtils.getLocalizedDemolitionScope(type) }
    </MenuItem>
  );

  /**
   * Renders textfield with debounce
   * 
   * @param name name
   * @param label label
   * @param value value
   * @param onChange onChange
   */
  const renderDemolitionScopeSelect = (
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
        <TextField select { ...props }>
          { Object.values(SurveyType).map(renderDemolitionScopeOption) }
        </TextField>
      }
    />
  );

  /**
   * Renders date pickers
   */
  const renderDatePickers = () => {
    if (!selectedSurvey) {
      return null;
    }

    return (
      <LocalizationProvider dateAdapter={ AdapterDateFns } locale={ strings.getLanguage() === "fi" ? fiLocale : enLocale }>
        <DatePicker
          views={["year", "month"]}
          label={ strings.survey.info.startDate }
          value={ (selectedSurvey.startDate) }
          disabled={selectedSurvey.dateUnknown}
          onChange={ onSurveyInfoDateChange("startDate") }
          renderInput={ params =>
            <TextField label={ strings.survey.info.startDate } { ...params }/>
          }
        />
        <DatePicker
          views={["year", "month", "day"]}
          label={ strings.survey.info.endDate }
          value={ selectedSurvey.endDate }
          onChange={ onSurveyInfoDateChange("endDate") }
          renderInput={ params =>
            <TextField label={ strings.survey.info.startDate } { ...params }/>
          }
        />
      </LocalizationProvider>
    );
  };

  /**
   * Renders Date unknown checkbox
   */
  const renderDateUnknownCheckbox = () => {
    if (!selectedSurvey) {
      return null;
    }

    return (
      <FormControlLabel
        label={ strings.survey.info.dateUnknown }
        control={
          <Checkbox
            checked={ selectedSurvey.dateUnknown }
            onChange={ onDateUnknownChange("dateUnknown") }
          />
        }
      />
    );
  };
  /**
   * Renders surveyor data grid header
   */
  const renderSurveyorHeader = () => (
    <>
      <Typography variant="h3">
        { strings.survey.info.surveyors }
      </Typography>
      <Box
        display="flex"
        alignItems="stretch"
      >
        <Hidden lgDown>
          <SurveyButton
            disabled={ selectedSurveyorIds && !selectedSurveyorIds.length }
            variant="contained"
            color="error"
            startIcon={ <Delete/> }
            onClick={ () => setDeletingSurveyor(true) }
            sx={{ mr: 2 }}
          >
            { strings.survey.info.deleteSurveyor }
          </SurveyButton>
        </Hidden>
        <SurveyButton
          variant="contained"
          color="secondary"
          startIcon={ <Add/> }
          onClick={ () => setAddingSurveyor(true) }
        >
          { strings.survey.info.addSurveyor }
        </SurveyButton>
      </Box>
    </>
  );

  /**
   * Render surveyor list item
   */
  const renderSurveyorListItems = () => (
    surveyors.map(surveyor =>
      <SurveyItem
        title={ `${surveyor.firstName} ${surveyor.lastName}` }
        subtitle={ surveyor.role || "" }
      >
        { renderWithDebounceTextField(
          "role",
          strings.survey.info.dataGridColumns.role,
          surveyor.role || "",
          onSurveyorPropChange(surveyor)
        )
        }
        { renderWithDebounceTextField(
          "firstName",
          strings.survey.info.dataGridColumns.firstName,
          surveyor.firstName,
          onSurveyorPropChange(surveyor)
        )
        }
        { renderWithDebounceTextField(
          "lastName",
          strings.survey.info.dataGridColumns.lastName,
          surveyor.lastName || "",
          onSurveyorPropChange(surveyor)
        )
        }
        { renderWithDebounceTextField(
          "company",
          strings.survey.info.dataGridColumns.company,
          surveyor.company,
          onSurveyorPropChange(surveyor)
        )
        }
        { renderWithDebounceTextField(
          "email",
          strings.survey.info.dataGridColumns.email,
          surveyor.email || "",
          onSurveyorPropChange(surveyor)
        )
        }
        { renderWithDebounceTextField(
          "phone",
          strings.survey.info.dataGridColumns.phone,
          surveyor.phone,
          onSurveyorPropChange(surveyor)
        )
        }
        <SurveyButton
          variant="outlined"
          color="primary"
          onClick={ () => deleteSurveyorButtonClick(surveyor.id) }
        >
          <Typography color={ theme.palette.primary.main }>
            { strings.generic.delete }
          </Typography>
        </SurveyButton>
      </SurveyItem>
    )
  );

  /**
   * Render surveyor list
   */
  const renderSurveyorList = () => (
    <List>
      { renderSurveyorListItems() }
    </List>
  );

  /**
   * Render surveyor table for desktop
   */
  const renderSurveyorDataTable = () => {
    const columns: GridColDef[] = [
      {
        field: "firstName",
        headerName: strings.survey.info.dataGridColumns.firstName,
        width: 150,
        editable: true
      },
      {
        field: "lastName",
        headerName: strings.survey.info.dataGridColumns.lastName,
        width: 200,
        editable: true
      },
      {
        field: "company",
        headerName: strings.survey.info.dataGridColumns.company,
        width: 200,
        editable: true
      },
      {
        field: "role",
        headerName: strings.survey.info.dataGridColumns.role,
        width: 150,
        editable: true
      },
      {
        field: "phone",
        headerName: strings.survey.info.dataGridColumns.phone,
        width: 170,
        editable: true
      },
      {
        field: "email",
        headerName: strings.survey.info.dataGridColumns.email,
        width: 200,
        editable: true
      },
      {
        field: "reportDate",
        headerName: strings.survey.info.dataGridColumns.reportDate,
        width: 325,
        type: "date",
        editable: true,
        renderEditCell: (params: GridRenderEditCellParams) => {
          const { value, api, id, field } = params;
          return (
            <LocalizationProvider dateAdapter={ AdapterDateFns } locale={ strings.getLanguage() === "fi" ? fiLocale : enLocale }>
              <DatePicker
                value={ value }
                onChange={ date =>
                  api.setEditCellValue({
                    id: id,
                    field: field,
                    value: (!date || Number.isNaN((date as Date).getTime())) ? undefined : date
                  })
                }
                renderInput={ inputParams =>
                  <TextField { ...inputParams }/>
                }
              />
            </LocalizationProvider>
          );
        }
      },
      {
        field: "visits",
        headerName: strings.survey.info.dataGridColumns.visits,
        width: 200,
        editable: true
      }
    ];

    return (
      <Paper>
        <WithSurveyDataGridDebounce
          rows={ surveyors }
          columns={ columns }
          onRowChange={ onSurveyorRowChange }
          component={ params =>
            <DataGrid
              onSelectionModelChange={ selectedIds => setSelectedSurveyorIds(selectedIds) }
              checkboxSelection
              autoHeight
              loading={ loading }
              pageSize={ 5 }
              disableSelectionOnClick
              { ...params }
            />
          }
        />
      </Paper>
    );
  };

  /**
   * Renders delete surveyor dialog
   */
  const renderDeleteSurveyorDialog = () => (
    <GenericDialog
      error={ false }
      open={ deletingSurveyor }
      onClose={ () => setDeletingSurveyor(false) }
      onCancel={ () => setDeletingSurveyor(false) }
      onConfirm={ onDeleteSurveyorConfirm }
      title={ strings.survey.info.deleteSurveyorDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <Typography>
        { strings.survey.info.deleteSurveyorDialog.text }
      </Typography>
    </GenericDialog>
  );

  /**
   * Renders add surveyor dialog
   */
  const renderAddSurveyorDialog = () => (
    <GenericDialog
      error={ false }
      open={ addingSurveyor }
      onClose={ () => setAddingSurveyor(false) }
      onCancel={ () => setAddingSurveyor(false) }
      onConfirm={ onAddSurveyorConfirm }
      title={ strings.survey.info.addNewSurveyorDialog.title }
      positiveButtonText={ strings.generic.confirm }
      cancelButtonText={ strings.generic.cancel }
    >
      <TextField
        fullWidth
        color="primary"
        name="role"
        label={ strings.survey.info.dataGridColumns.role }
        value={ newSurveyor.role }
        onChange={ onNewSurveyorChange }
      />
      <Stack
        direction={ isMobile ? "column" : "row" }
        spacing={ 2 }
        marginTop={ 2 }
      >
        <TextField
          fullWidth
          color="primary"
          name="firstName"
          label={ strings.survey.info.dataGridColumns.firstName }
          value={ newSurveyor.firstName }
          onChange={ onNewSurveyorChange }
        />
        <TextField
          fullWidth
          color="primary"
          name="lastName"
          label={ strings.survey.info.dataGridColumns.lastName }
          value={ newSurveyor.lastName }
          onChange={ onNewSurveyorChange }
        />
      </Stack>
      <TextField
        sx={{ mt: 2 }}
        fullWidth
        color="primary"
        name="company"
        label={ strings.survey.info.dataGridColumns.company }
        value={ newSurveyor.company }
        onChange={ onNewSurveyorChange }
      />
      <TextField
        fullWidth
        sx={{ mt: 2 }}
        name="email"
        color="primary"
        label={ strings.survey.info.dataGridColumns.email }
        value={ newSurveyor.email }
        onChange={ onNewSurveyorChange }
      />
      <TextField
        fullWidth
        sx={{ mt: 2 }}
        name="phone"
        color="primary"
        label={ strings.survey.info.dataGridColumns.phone }
        value={ newSurveyor.phone }
        onChange={ onNewSurveyorChange }
      />
      <TextField
        fullWidth
        sx={{ mt: 2 }}
        name="visits"
        color="primary"
        label={ strings.survey.info.dataGridColumns.visits }
        value={ newSurveyor.visits }
        onChange={ onNewSurveyorChange }
      />
    </GenericDialog>
  );

  if (!selectedSurvey) {
    return null;
  }

  return (
    <Stack spacing={ 2 } sx={{ flex: 1 }}>
      <Typography variant="h2">
        { strings.survey.info.title }
      </Typography>
      <Typography variant="h3">
        { strings.survey.info.demolitionInfo }
      </Typography>
      { renderDemolitionScopeSelect(
        "type",
        strings.survey.info.demolitionScope,
        selectedSurvey.type as string,
        onSurveyInfoTypeChange
      ) }
      <Stack direction={ isMobile ? "column" : "row" } spacing={ 2 }>
        { renderDatePickers() }
      </Stack>
      <Stack>
        { renderDateUnknownCheckbox() }
      </Stack>
      <Stack
        spacing={ 2 }
        marginTop={ 2 }
        direction="row"
        justifyContent="space-between"
      >
        { renderSurveyorHeader() }
      </Stack>
      <Hidden lgUp>
        { renderSurveyorList() }
      </Hidden>
      <Hidden lgDown>
        { renderSurveyorDataTable() }
      </Hidden>
      { renderDeleteSurveyorDialog() }
      { renderAddSurveyorDialog() }
    </Stack>
  );
};

export default SurveyInformation;