import { Stack, TextField, Typography, MenuItem } from "@mui/material";
import { useAppSelector } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import WithDebounce from "components/generic/with-debounce";
import { selectSelectedSurvey, updateSurvey } from "features/surveys-slice";
import { Survey, SurveyType } from "generated/client";
import strings from "localization/strings";
import * as React from "react";
import { useAppDispatch } from "../../app/hooks";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";
import DatePicker from "@mui/lab/DatePicker";
import LocalizationUtils from "utils/localization-utils";

/**
 * Component for survey information
 */
const SurveyInformation: React.FC = () => {
  const selectedSurvey = useAppSelector(selectSelectedSurvey);
  const errorContext = React.useContext(ErrorContext);
  const dispatch = useAppDispatch();

  /**
   * Event Handler set survey date
   * 
   * @param name field name
   * @param selectedDate selected date
   */
  const onSurveyInfoDateChange = (name: string) => (selectedDate: Date | null) => {
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
  const onSurveyInfoTypeChange: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    const { value } = target;

    if (!selectedSurvey?.id) {
      return;
    }

    const updatedSelectedSurvey: Survey = { ...selectedSurvey, type: value as SurveyType };

    try {
      dispatch(updateSurvey(updatedSelectedSurvey)).unwrap();
    } catch (error) {
      errorContext.setError(strings.errorHandling.surveys.update);
    }
  };

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
          { Object.values(SurveyType).map(type =>
            (
              <MenuItem value={ type }>
                { LocalizationUtils.getLocalizedDemolitionScope(type) }
              </MenuItem>
            ))
          }
        </TextField>
      }
    />
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
    </Stack>
  );
};

export default SurveyInformation;