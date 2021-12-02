import * as React from "react";
import { Route, Routes } from "react-router-dom";
import BuildingTypes from "./buildingTypes";
import PostProcessing from "./post-processing";
import Reusables from "./reusables";

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
        path="buildingtypes"
        element={ <BuildingTypes/> }
      />
      <Route
        path="postprocessing"
        element={ <PostProcessing/> }
      />
    </Routes>
  );
};

export default AdminRoutes;