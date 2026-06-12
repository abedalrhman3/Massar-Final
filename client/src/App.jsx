import React from "react";
import { useEffect } from "react";
import { Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Home from "./pages/costumer/Home/Home";
import About from "./pages/costumer/About/About";
import DestinationDetails from "./pages/costumer/DestinationsDetails/DestinationDetails";
import Destinations from "./pages/costumer/Destinations/Destinations";
import Map from "./pages/costumer/Map/Map";
import Support from "./pages/costumer/Support";
import SaveList from "./pages/costumer/SaveList/SaveList";
import Gallery from "./pages/costumer/Gallery/Gallery";
import Banned from "./pages/costumer/Banned/Banned"

// Register-Login Pages
import RegisterLogin, {
  ForgotPassword,
  ResetPassword,
  VerifyEmail,
} from "./pages/costumer/Register-Login/Register-Login";

// User Profile
import UserProfile from "./pages/admin/UserProfile"
import UserSettings from "./pages/admin/Settings/index"
import UserDashboard from "./pages/costumer/UserAccount/UserDashboard";
//import UserProfile from "./pages/costumer/UserProfile/UserProfile";

// Admin Panel Layout & Pages
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import DestinationsManagement from "./pages/admin/DestinationsManagement";
import AdminDestinationDetail from "./pages/admin/DestinationDetail/DestinationDetail";
import AccountManagement from "./pages/admin/AccountsManagement";
import BanHistory from "./pages/admin/BanHistory";
import AdminSettings from "./pages/admin/Settings";
import AdminUserProfile from "./pages/admin/UserProfile";
import AdminChat from "./pages/admin/AdminChat";
import Game from "./pages/admin/Game/index";
import Locations from "./pages/admin/Game/locations/index";
import BudgetSettings from "./pages/admin/Game/BudgetSettings/index";
import Quests from "./pages/admin/Game/Quests/index";
import Reports from "./pages/admin/Game/Reports/index"


// Shared Components
import Chatbot from "./components/Chatbot/Chatbot";
import Footer from "./components/Footer/Footer";
import Navbar from "./components/Navbar/Navbar";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

// ── Private Route Guard — requires logged-in user ────────────────
const PrivateRoute = ({ children }) => {
  const { user, loading, isBanned } = useAuth();

  if (loading) return null; // AuthProvider already blocks render until resolved
  return user ? children : <Navigate to="/login" replace />;
};


// ── Admin Route Guard — requires admin role ───────────────────────
const AdminGuard = () => {
  const { user, isAdmin, loading, isBanned } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <AdminLayout />;
};

// ── Customer Layout (Navbar + Footer) ────────────────────────────
const CustomerLayout = () => (
  <>
    <Navbar />
    <Outlet />
    <Footer />
    <Chatbot />
  </>
);

function App() {
  const { user, isBanned, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log(error);
    } finally {
      navigate("/banned");
    }
  };
  useEffect(() => {
    if (user) {
      if (isBanned) {
        handleLogout();
      }
    }
  }, [user])
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
            path="/support"
            element={
              <ErrorBoundary message="Unable to load support.">
                <Support />
              </ErrorBoundary>
            }
          />
        </Route>
        <Route
          path="/destinations/:slug"
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

        <Route
          path="/save-list"
          element={
            <PrivateRoute>
              <ErrorBoundary message="The save list failed to load. Please refresh.">
                <SaveList />
              </ErrorBoundary>
            </PrivateRoute>
          }

        />
        <Route
          path="/gallery"
          element={
            <PrivateRoute>
              <ErrorBoundary message="The gallery failed to load. Please refresh.">
                <Gallery />
              </ErrorBoundary>
            </PrivateRoute>
          }
        />
        <Route path="/banned" element={<Banned />} />



        {/* ── Auth Pages ────────────────────────────────────────── */}
        <Route path="/login" element={<RegisterLogin />} />
        <Route path="/register" element={<RegisterLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* ── User Account Pages ────────────────────────────────── */}
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <UserSettings />
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
          <Route path="destinations/:slug" element={<AdminDestinationDetail />} />
          <Route path="accounts" element={<AccountManagement />} />
          <Route path="ban-history" element={<BanHistory />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="profile" element={<AdminUserProfile />} />
          <Route path="chat" element={<AdminChat />} />
          <Route path="game" element={<Game />} />
          <Route path="game/locations" element={<Locations />} />
          <Route path="game/budget-settings" element={<BudgetSettings />} />
          <Route path="game/quests" element={<Quests />} />
          <Route path="game/reports" element={<Reports />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </>
  );
}

export default App;