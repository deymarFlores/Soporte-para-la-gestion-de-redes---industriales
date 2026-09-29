import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.js";
import { TopologyProvider } from "./context/TopologyContext.js";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.js";
import { AppLayout } from "./components/layout/AppLayout.js";
import { LoginPage } from "./pages/LoginPage.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { IncidentsHistoryPage } from "./pages/IncidentsHistoryPage.js";
import { EquipmentListPage } from "./pages/EquipmentListPage.js";
import { ConnectPage } from "./pages/ConnectPage.js";
import { PlaceholderPage } from "./pages/PlaceholderPage.js";
import { TopologiaPage } from "./pages/monitoreo/TopologiaPage.js";
import { EquiposPage } from "./pages/administracion/EquiposPage.js";
import { TramosPage } from "./pages/administracion/TramosPage.js";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <TopologyProvider>
              <AppLayout />
            </TopologyProvider>
          }
        >
          <Route path="/" element={<DashboardPage />} />

          <Route path="/monitoreo/topologia" element={<TopologiaPage />} />
          <Route path="/monitoreo/equipos" element={<EquiposPage readOnly />} />

          <Route path="/incidentes" element={<IncidentsHistoryPage />} />

          <Route
            path="/analisis-historico"
            element={
              <PlaceholderPage
                title="Análisis histórico"
                description="Disponibilidad, latencia, pérdida de paquetes e incidentes en el tiempo"
              />
            }
          />

          <Route element={<ProtectedRoute allowedRoles={["ADMINISTRADOR", "SOPORTE"]} />}>
            <Route path="/acceso-remoto/equipos" element={<EquipmentListPage />} />
            <Route path="/acceso-remoto/equipos/:nodeId/conectar" element={<ConnectPage />} />
            <Route
              path="/acceso-remoto/sesiones"
              element={<PlaceholderPage title="Sesiones activas" description="Conexiones remotas en curso, de todos los usuarios" />}
            />
            <Route
              path="/acceso-remoto/historial"
              element={<PlaceholderPage title="Historial de accesos" description="Auditoría de conexiones remotas pasadas" />}
            />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMINISTRADOR"]} />}>
            <Route
              path="/administracion/usuarios"
              element={<PlaceholderPage title="Usuarios" description="Gestión de cuentas y roles del sistema" />}
            />
            <Route
              path="/administracion/sitios"
              element={<PlaceholderPage title="Sitios" description="Instalaciones/plantas registradas" />}
            />
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
