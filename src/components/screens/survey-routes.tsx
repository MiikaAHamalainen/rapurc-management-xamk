import Building from "components/survey/building";
import Owner from "components/survey/owner";
import SurveyInformation from "components/survey/survey-information";
import OtherStructures from "components/survey/other-structure";
import Reusables from "components/survey/reusables";
import * as React from "react";
import { Route, Routes } from "react-router-dom";
import WasteMaterial from "components/survey/waste-material";
import SummaryView from "components/survey/summary";
import HazardousMaterial from "components/survey/hazardous-material";

/**
 * Component properties
 */
interface Props {
  surveyId?: string;
}

/**
 * Component for survey routes
 */
const SurveyRoutes: React.FC<Props> = ({ surveyId }) => {
  if (!surveyId) {
    return null;
  }

  return (
    <Routes>
      <Route
        path="owner"
        element={ <Owner surveyId={ surveyId }/> }
      />
      <Route
        path="building"
        element={ <Building surveyId={ surveyId }/> }
      />
      <Route
        path="reusables"
        element={ <Reusables surveyId={ surveyId }/> }
      />
      <Route
        path="otherStructures"
        element={ <OtherStructures surveyId={ surveyId }/> }
      />
      <Route
        path="info"
        element={ <SurveyInformation/> }
      />
      <Route
        path="waste"
        element={ <WasteMaterial surveyId={ surveyId }/> }
      />
      <Route
        path="hazardous"
        element={ <HazardousMaterial surveyId={ surveyId }/> }
      />
      <Route
        path="summary"
        element={ <SummaryView/> }
      />
    </Routes>
  );
};

export default SurveyRoutes;