import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import AccessTokenRefresh from "components/containers/access-token-refresh";
import SurveysScreen from "components/screens/surveys-screen";
import NewSurveyScreen from "./screens/new-survey-screen";
import AdminScreen from "./screens/admin-screen";
import SurveyScreen from "./screens/survey-screen";

/**
 * Application component
 */
const App: React.FC = () => {
  return (
    <AccessTokenRefresh>
      <Router>
        <Switch>
          <Route
            path="/surveys"
            exact
            component={ SurveysScreen }
          />
          <Route
            path="/new-survey"
            exact
            component={ NewSurveyScreen }
          />
          <Route
            path="/survey"
            exact
            component={ SurveyScreen }
          />
          <Route
            path="/admin"
            exact
            component={ AdminScreen }
          />
          <Redirect from="/" to="/surveys"/>
        </Switch>
      </Router>
    </AccessTokenRefresh>
  );
};

export default App;