import * as React from "react";
import { Route, Routes } from "react-router-dom";
import HazardousMaterials from "./hazardous-materials";
import HazardousMaterialsInfo from "./hazardous-materials-info";
import PostProcessing from "./post-processing";
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
      <Route
        path="postProcessing"
        element={ <PostProcessing/> }
      />
      <Route
        path="hazardousMaterials"
        element={ <HazardousMaterials/> }
      />
      <Route
        path="hazardousMaterialsInfo"
        element={ <HazardousMaterialsInfo/> }
      />
    </Routes>
  );
};

export default AdminRoutes;