import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.js";
import { AppLayout } from "./components/layout/AppLayout.js";
import { LoginPage } from "./pages/LoginPage.js";
import { NetworkDashboardPage } from "./pages/NetworkDashboardPage.js";
import { IncidentsHistoryPage } from "./pages/IncidentsHistoryPage.js";
import { EquipmentListPage } from "./pages/EquipmentListPage.js";
import { ConnectPage } from "./pages/ConnectPage.js";

function RoleHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "ADMIN" ? "/red" : "/equipos"} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<RoleHome />} />

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/red" element={<NetworkDashboardPage />} />
            <Route path="/incidentes" element={<IncidentsHistoryPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ENGINEER"]} />}>
            <Route path="/equipos" element={<EquipmentListPage />} />
            <Route path="/equipos/:nodeId/conectar" element={<ConnectPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
