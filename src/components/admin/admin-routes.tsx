import * as React from "react";
import { Route, Routes } from "react-router-dom";
import Reusables from "./reusables";
import Waste from "./waste";

/**
 * Component for admin routes
 */
const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route
        path="reusables"
        element={ <Reusables/> }
      />
      <Route
        path="waste"
        element={ <Waste/> }
      />
    </Routes>
  );
};

export default AdminRoutes;