import { Stack, TextField, Typography, MenuItem, Paper } from "@mui/material";
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
import LocalizationUtils from "utils/localization-utils";
import WithDataGridDebounceFactory from "components/generic/with-data-grid-debounce";
import { selectKeycloak } from "features/auth-slice";
import { GridColDef, DataGrid } from "@mui/x-data-grid";
import Api from "api";

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

  /**
   * Fetch owner information array
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
      errorContext.setError(strings.errorHandling.reusables.list, error);
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
    if (!selectedSurvey?.id || !selectedDate) {
      return;
    }

    try {
      await dispatch(updateSurvey({ ...selectedSurvey, [name]: selectedDate })).unwrap();
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
   * Reusable change handler
   * 
   * @param updatedReusable updated reusable
   */
  const onSurveyorRowChange = async (surveyor: Surveyor) => {
    if (!keycloak?.token || !selectedSurvey?.id || !surveyor.id) {
      return;
    }

    try {
      const updatedSurveyor = await Api.getSurveyorsApi(keycloak.token).updateSurveyor({
        surveyId: selectedSurvey.id,
        surveyorId: surveyor.id,
        surveyor: surveyor
      });

      // TODO ERROR handling 
      setSurveyors(surveyors.map(surveyorData => (surveyorData.id === updatedSurveyor.id ? updatedSurveyor : surveyorData)));
    } catch (error) {
      errorContext.setError(strings.errorHandling.reusables.update, error);
    }
  };

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
   * Render survey reusables table for desktop
   */
  const renderSurveyorDataTable = () => {
    const columns: GridColDef[] = [
      {
        field: "firstName",
        headerName: strings.survey.info.dataGridColumns.firstName,
        width: 340,
        editable: true
      },
      {
        field: "lastName",
        headerName: strings.survey.info.dataGridColumns.lastName,
        width: 340,
        editable: true
      },
      {
        field: "company",
        headerName: strings.survey.info.dataGridColumns.company,
        width: 340,
        type: "singleSelect",
        editable: true
      },
      {
        field: "role",
        headerName: strings.survey.info.dataGridColumns.role,
        width: 160,
        editable: true
      },
      {
        field: "phone",
        headerName: strings.survey.info.dataGridColumns.phone,
        width: 200,
        editable: true
      },
      {
        field: "email",
        headerName: strings.survey.info.dataGridColumns.email,
        width: 340,
        editable: true
      },
      {
        field: "reportDate",
        headerName: strings.survey.info.dataGridColumns.reportDate,
        width: 340,
        type: "date",
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
              // onSelectionModelChange={ selectedIds => setSelectedReusableIds(selectedIds) }
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
      <Stack direction="row" spacing={ 2 }>
        <LocalizationProvider dateAdapter={ AdapterDateFns }>
          <DatePicker
            views={["year", "month"]}
            label={ strings.survey.info.startDate }
            value={ selectedSurvey.startDate }
            onChange={ onSurveyInfoDateChange("startDate") }
            renderInput={params =>
              <TextField label={ strings.survey.info.startDate } { ...params }/>
            }
          />
          <DatePicker
            views={["year", "month"]}
            label={ strings.survey.info.endDate }
            value={ selectedSurvey.endDate }
            onChange={ onSurveyInfoDateChange("endDate") }
            renderInput={params =>
              <TextField label={ strings.survey.info.startDate } { ...params }/>
            }
          />
        </LocalizationProvider>
      </Stack>
      <Typography variant="h3">
        { strings.survey.info.surveyors }
      </Typography>
      { renderSurveyorDataTable() }
    </Stack>
  );
};

export default SurveyInformation;