import Building from "components/survey/building";
import Owner from "components/survey/owner";
import * as React from "react";
import { Route, Routes } from "react-router-dom";
import OtherStructures from "../survey/other-structures";

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
        element={ <Building/> }
      />
      <Route
        path="otherStructures"
        element={ <OtherStructures/> }
      />
    </Routes>
  );
};

export default SurveyRoutes;