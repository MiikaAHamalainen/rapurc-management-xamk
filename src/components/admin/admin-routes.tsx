import * as React from "react";
import { Route, Routes } from "react-router-dom";
import BuildingTypes from "./buildingTypes";
import PostProcessing from "./post-processing";
import Reusables from "./reusables";
import WasteCategories from "./waste-categories";
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
        path="buildingtypes"
        element={ <BuildingTypes/> }
      />
      <Route
        path="wastecategories"
        element={ <WasteCategories/> }
      />
      <Route
        path="waste"
        element={ <Waste/> }
      />
      <Route
        path="postProcessing"
        element={ <PostProcessing/> }
      />
    </Routes>
  );
};

export default AdminRoutes;