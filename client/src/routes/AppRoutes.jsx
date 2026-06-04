import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home/Home";
import AboutPage from "../pages/About/About";
//import ToursPage from "../pages/Tours/Tours";
import MapPage from "../pages/Map/Map";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/tours" element={<ToursPage />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
