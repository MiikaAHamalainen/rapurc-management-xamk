import * as React from "react";
import { Route, Routes } from "react-router-dom";
import BuildingTypes from "./buildingTypes";
import Reusables from "./reusables";
import WasteCategories from "./waste-categories";

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
    </Routes>
  );
};

export default AdminRoutes;