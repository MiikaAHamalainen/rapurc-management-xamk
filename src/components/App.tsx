import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AccessTokenRefresh from "components/containers/access-token-refresh";
import SurveysScreen from "components/screens/surveys-screen";
import NewSurveyScreen from "./screens/new-survey-screen";
import AdminScreen from "./screens/admin-screen";
import SurveyScreen from "./screens/survey-screen";
import ErrorHandler from "./error-handler/error-handler";
import VisibleWithRole from "./containers/visible-with-role";
import moment from "moment";
import strings from "localization/strings";
import "moment/locale/fi";

/**
 * Application component
 */
const App: React.FC = () => {
  React.useEffect(() => {
    moment.locale(strings.getLanguage());
  }, []);

  return (
    <ErrorHandler>
      <AccessTokenRefresh>
        <Router>
          <Routes>
            <Route
              path="/surveys"
              element={ <SurveysScreen/> }
            />
            <Route
              path="/new-survey"
              element={ <NewSurveyScreen/> }
            />
            <Route
              path="/surveys/:surveyId/*"
              element={ <SurveyScreen/> }
            />
            <Route
              path="/admin/*"
              element={
                <VisibleWithRole userRole="admin">
                  <AdminScreen/>
                </VisibleWithRole>
              }
            />
            <Route
              path="/"
              element={ <SurveysScreen/> }
            />
          </Routes>
        </Router>
      </AccessTokenRefresh>
    </ErrorHandler>
  );
};

export default App;