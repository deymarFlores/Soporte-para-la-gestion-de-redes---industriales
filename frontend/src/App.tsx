import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.js";
import { TopologyProvider } from "./context/TopologyContext.js";
import { SessionsProvider } from "./context/SessionsContext.js";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.js";
import { AppLayout } from "./components/layout/AppLayout.js";
import { LoginPage } from "./pages/LoginPage.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { IncidentsHistoryPage } from "./pages/IncidentsHistoryPage.js";
import { EquipmentListPage } from "./pages/EquipmentListPage.js";
import { ConnectPage } from "./pages/ConnectPage.js";
import { TopologiaPage } from "./pages/monitoreo/TopologiaPage.js";
import { AnalisisHistoricoPage } from "./pages/AnalisisHistoricoPage.js";
import { EquiposPage } from "./pages/administracion/EquiposPage.js";
import { TramosPage } from "./pages/administracion/TramosPage.js";
import { SitiosPage } from "./pages/administracion/SitiosPage.js";
import { UsuariosPage } from "./pages/administracion/UsuariosPage.js";
import { SesionesActivasPage } from "./pages/accesoRemoto/SesionesActivasPage.js";
import { HistorialAccesosPage } from "./pages/accesoRemoto/HistorialAccesosPage.js";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <TopologyProvider>
              <SessionsProvider>
                <AppLayout />
              </SessionsProvider>
            </TopologyProvider>
          }
        >
          <Route path="/" element={<DashboardPage />} />

          <Route path="/monitoreo/topologia" element={<TopologiaPage />} />
          <Route path="/monitoreo/equipos" element={<EquiposPage readOnly />} />

          <Route path="/incidentes" element={<IncidentsHistoryPage />} />

          <Route path="/analisis-historico" element={<AnalisisHistoricoPage />} />

          <Route element={<ProtectedRoute allowedRoles={["ADMINISTRADOR", "SOPORTE"]} />}>
            <Route path="/acceso-remoto/equipos" element={<EquipmentListPage />} />
            <Route path="/acceso-remoto/equipos/:nodeId/conectar" element={<ConnectPage />} />
            <Route path="/acceso-remoto/sesiones" element={<SesionesActivasPage />} />
            <Route path="/acceso-remoto/historial" element={<HistorialAccesosPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMINISTRADOR"]} />}>
            <Route path="/administracion/usuarios" element={<UsuariosPage />} />
            <Route path="/administracion/sitios" element={<SitiosPage />} />
            <Route path="/administracion/equipos" element={<EquiposPage />} />
            <Route path="/administracion/tramos" element={<TramosPage />} />
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
