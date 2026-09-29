import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.js";
import { ProtectedRoute } from "./components/auth/ProtectedRoute.js";
import { AppLayout } from "./components/layout/AppLayout.js";
import { LoginPage } from "./pages/LoginPage.js";
import { DashboardPage } from "./pages/DashboardPage.js";
import { IncidentsHistoryPage } from "./pages/IncidentsHistoryPage.js";
import { EquipmentListPage } from "./pages/EquipmentListPage.js";
import { ConnectPage } from "./pages/ConnectPage.js";
import { PlaceholderPage } from "./pages/PlaceholderPage.js";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />

          <Route
            path="/monitoreo/topologia"
            element={<PlaceholderPage title="Topología" description="Diagrama interactivo del enlace, nodo por nodo" />}
          />
          <Route
            path="/monitoreo/equipos"
            element={<PlaceholderPage title="Equipos" description="Tabla de equipos registrados, con filtros y detalle" />}
          />

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
            <Route
              path="/administracion/equipos"
              element={<PlaceholderPage title="Equipos" description="Alta, edición y baja de equipos monitoreados" />}
            />
            <Route
              path="/administracion/tramos"
              element={<PlaceholderPage title="Tramos" description="Configuración de los segmentos del enlace" />}
            />
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
