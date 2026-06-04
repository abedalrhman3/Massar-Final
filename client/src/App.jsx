import React from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Home from "./pages/costumer/Home/Home";
import About from "./pages/costumer/About/About";
import DestinationDetails from "./pages/costumer/DestinationsDetails/DestinationDetails";
import Destinations from "./pages/costumer/Destinations/Destinations";
import Map from "./pages/costumer/Map/Map";

// Register-Login Pages
import RegisterLogin, {
  ForgotPassword,
  ResetPassword,
  VerifyEmail,
} from "./pages/costumer/Register-Login/Register-Login";
import UserDashboard from "./pages/costumer/UserAccount/UserDashboard";
import UserProfile from "./pages/costumer/UserProfile/UserProfile";

// Admin Panel Layout & Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import DestinationsManagement from "./pages/admin/DestinationsManagement";
import AccountManagement from "./pages/admin/AccountsManagement";
import BanHistory from "./pages/admin/BanHistory";
import Support from "./pages/admin/Support";
import Settings from "./pages/admin/Settings";
import AdminUserProfile from "./pages/admin/UserProfile";
import AdminChat from "./pages/admin/AdminChat";

// Chatbot Component
import Chatbot from "./components/Chatbot/Chatbot";

// Footer Component
import Footer from "./components/Footer/Footer";

// Navbar Component
import Navbar from "./components/Navbar/Navbar";

// Error Boundary Component
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

// ── Private Route Guard for User Dashboard ────────────────────────
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
};

// ── Admin Route Guard ─────────────────────────────────────────────
function isAdmin() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return user.is_admin === true;
}

function AdminGuard() {
  return isAdmin() ? <AdminLayout /> : <Navigate to="/login" replace />;
}

// ── Customer Layout (Includes Navbar & Footer) ─────────────────────────────
const CustomerLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

function App() {
  return (
    <>
      <Routes>
        {/* ── Customer Pages ────────────────────────────────────── */}
        <Route element={<CustomerLayout />}>
          <Route
            path="/"
            element={
              <ErrorBoundary message="The home page failed to load. Please try again.">
                <Home />
              </ErrorBoundary>
            }
          />
          <Route
            path="/about"
            element={
              <ErrorBoundary message="The about page failed to load.">
                <About />
              </ErrorBoundary>
            }
          />
          <Route
            path="/destinations"
            element={
              <ErrorBoundary message="Unable to load destinations. Please try again.">
                <Destinations />
              </ErrorBoundary>
            }
          />
          <Route
            path="/destinations/:id"
            element={
              <ErrorBoundary message="Unable to load this destination's details.">
                <DestinationDetails />
              </ErrorBoundary>
            }
          />
          <Route
            path="/map"
            element={
              <PrivateRoute>
                <ErrorBoundary message="The map failed to load. Please refresh.">
                  <Map />
                </ErrorBoundary>
              </PrivateRoute>
            }
          />
        </Route>

        {/* ── Register-Login Pages ──────────────────────────────── */}
        <Route path="/login" element={<RegisterLogin />} />
        <Route path="/register" element={<RegisterLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* ── User Account Pages ────────────────────────────────── */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          }
        />

        {/* ── Admin Dashboard Routes ────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <ErrorBoundary message="An error occurred in the admin panel.">
              <AdminGuard />
            </ErrorBoundary>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="destinations" element={<DestinationsManagement />} />
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="ban-history" element={<BanHistory />} />
          <Route path="support" element={<Support />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<AdminUserProfile />} />
          <Route path="chat" element={<AdminChat />} />
        </Route>

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Chatbot />
    </>
  );
}

export default App;
