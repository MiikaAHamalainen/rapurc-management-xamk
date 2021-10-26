import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import AccessTokenRefresh from "components/containers/access-token-refresh";
import MainScreen from "components/screens/main-screen";

/**
 * Application component
 */
const App: React.FC = () => {
  return (
    <AccessTokenRefresh>
      <Router>
        <Switch>
          <Route
            path="/"
            exact
            component={ MainScreen }
          />
        </Switch>
      </Router>
    </AccessTokenRefresh>
  );
};

export default App;