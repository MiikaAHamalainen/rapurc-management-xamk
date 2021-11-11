import { Apartment, Attachment, ChangeCircle, Delete, Engineering, NoteAdd, PersonOutlined, Summarize, WarningAmber } from "@mui/icons-material";
import { Divider, List, MenuItem, TextField } from "@mui/material";
import { useAppDispatch } from "app/hooks";
import { ErrorContext } from "components/error-handler/error-handler";
import NavigationItem from "components/layout-components/navigation-item";
import SidePanelLayout from "components/layouts/side-panel-layout";
import { fetchSelectedSurvey, updateSurvey } from "features/surveys-slice";
import { Survey, SurveyStatus } from "generated/client";
import strings from "localization/strings";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import LocalizationUtils from "utils/localization-utils";
import SurveyRoutes from "./survey-routes";

/**
 * Survey screen component
 */
const SurveyScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const errorContext = React.useContext(ErrorContext);
  const { surveyId } = useParams<"surveyId">();
  const pathParam = useParams<"*">();
  const currentPath = pathParam["*"];

  const [ survey, setSurvey ] = React.useState<Survey | undefined>();

  /**
   * Fetches survey based on URL survey ID
   */
  const fetchSurvey = () => {
    surveyId && dispatch(fetchSelectedSurvey(surveyId))
      .unwrap()
      .then(_survey => setSurvey(_survey))
      .catch(error => errorContext.setError(strings.errorHandling.surveys.find, error));
  };

  /**
   * Effect for fetching surveys. Triggered when survey ID is changed
   */
  React.useEffect(fetchSurvey, [ surveyId ]);

  if (!survey) {
    return null;
  }

  /**
   * Event handler for survey status change
   */
  const onStatusChange: React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement> = ({ target }) => {
    const { value } = target;

    dispatch(updateSurvey({
      ...survey,
      status: value as SurveyStatus
    }))
      .unwrap()
      .then(_survey => setSurvey(_survey))
      .catch(error => errorContext.setError(strings.errorHandling.surveys.find, error));
  };

  /**
   * Side navigation content
   *
   * TODO: Add rest of the routes & components
   */
  const renderSideNavigation = () => (
    <List>
      <NavigationItem
        icon={ <PersonOutlined/> }
        onClick={ () => navigate("owner") }
        title={ strings.surveyScreen.navigation.owner }
        selected={ currentPath === "owner" }
      />
      <NavigationItem
        icon={ <Apartment/> }
        onClick={ () => navigate("building") }
        title={ strings.surveyScreen.navigation.building }
        selected={ currentPath === "building" }
      />
      <NavigationItem
        icon={ <NoteAdd/> }
        title={ strings.surveyScreen.navigation.others }
      />
      <NavigationItem
        icon={ <Engineering/> }
        title={ strings.surveyScreen.navigation.survey }
      />
      <NavigationItem
        icon={ <ChangeCircle/> }
        title={ strings.surveyScreen.navigation.reusables }
      />
      <NavigationItem
        icon={ <Delete/> }
        title={ strings.surveyScreen.navigation.waste }
      />
      <NavigationItem
        icon={ <WarningAmber/> }
        title={ strings.surveyScreen.navigation.hazardous }
      />
      <Divider/>
      <NavigationItem
        icon={ <Attachment/> }
        title={ strings.surveyScreen.navigation.attachments }
      />
      <NavigationItem
        icon={ <Summarize/> }
        title={ strings.surveyScreen.navigation.summary }
      />
    </List>
  );

  /**
   * Renders survey status select
   */
  const renderStatusSelect = () => {
    const { status, id } = survey;

    const options = Object.values(SurveyStatus).map(_status =>
      <MenuItem key={ _status } value={ _status }>
        { LocalizationUtils.getLocalizedSurveyStatus(_status) }
      </MenuItem>
    );

    return (
      <TextField
        key={ `SurveyStatus-${id}` }
        color="secondary"
        variant="standard"
        select
        value={ status }
        label={ strings.surveyScreen.status }
        onChange={ onStatusChange }
      >
        { options }
      </TextField>
    );
  };

  /**
   * Component render
   */
  return (
    <SidePanelLayout
      title={ strings.surveyScreen.title }
      sidePanelContent={ renderSideNavigation() }
      headerControls={ renderStatusSelect() }
      back
    >
      <SurveyRoutes/>
    </SidePanelLayout>
  );
};

export default SurveyScreen;