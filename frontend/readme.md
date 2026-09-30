# Frontend — Soporte para la Gestión de Redes Industriales

React + TypeScript + Vite, con Tailwind CSS v4 (tokens en `src/styles/tokens.css`, clases de componentes reutilizables en `src/styles/components.css`) y actualizaciones en vivo vía Socket.io.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL si el backend no corre en localhost:4000
npm run dev
```

Requiere el backend corriendo (ver `../backend/readme.md`), con la base de datos migrada y semillada (`npm run seed` en `backend/`) para tener las 3 cuentas de demostración.

## Autenticación y roles (reales)

El login es real: `POST /api/auth/login` contra el backend, JWT guardado en memoria + `localStorage` (clave `auth-token`) y adjuntado como `Authorization: Bearer` en cada request (`src/api/client.ts`).

Tres roles, según la especificación del producto (cuentas creadas por `backend/prisma/seed.ts`):

- **Administrador** (`admin@planta.com` / `admin123`): acceso completo, incluida administración de usuarios/sitios/equipos/tramos.
- **Soporte** (`soporte@planta.com` / `soporte123`): consulta infraestructura e incidentes, y puede usar acceso remoto autorizado.
- **Consulta** (`consulta@planta.com` / `consulta123`): solo visualiza monitoreo e incidentes; no ve ni usa acceso remoto, no administra nada.

## Navegación

```
Dashboard
Monitoreo
  Topología
  Equipos
Incidentes
Análisis histórico
Acceso remoto        (Administrador, Soporte)
  Equipos disponibles
  Sesiones activas
  Historial de accesos
Administración        (Administrador)
  Usuarios
  Sitios
  Equipos
  Tramos
```

Construida en `src/config/navigation.ts`, el sidebar se arma según el rol del usuario logueado.

## Estado de cada vista

| Vista | Estado |
|---|---|
| Dashboard | Real (KPIs, cadena del enlace, incidentes recientes y sesiones remotas activas vía `SessionsContext`) |
| Monitoreo → Topología | Real — equipos, tramos y estado vienen del backend (`TopologyContext`), grafo interactivo con panel de detalle |
| Monitoreo → Equipos | Misma tabla que Administración → Equipos, en modo solo lectura |
| Incidentes | Real (historial completo vía `GET /api/incidents`) |
| Análisis histórico | Real, calculado a partir del historial de incidentes (disponibilidad diaria, incidentes por equipo, duración acumulada) — latencia/pérdida de paquetes marcadas como no disponibles, el backend no las expone todavía |
| Acceso remoto → Equipos disponibles | Real — autorización por `allowedDeviceIds` devuelto en el login |
| Acceso remoto → Conectar | Sesión real y auditada (`POST /api/acceso-remoto/solicitar` / `finalizar`) con expiración calculada sobre el `startedAt` real; el túnel SSH hacia el equipo sigue siendo una simulación visual |
| Acceso remoto → Sesiones activas | Real, vía `SessionsContext` (polling cada 5s a `GET /api/acceso-remoto/sesiones`) |
| Acceso remoto → Historial de accesos | Real, vía `GET /api/acceso-remoto/historial`, con filtros |
| Administración → Equipos | Real — CRUD completo contra `/api/equipos` |
| Administración → Tramos | Real — CRUD completo contra `/api/tramos`, sincroniza `parentId` del equipo destino en el backend |
| Administración → Sitios | Real — CRUD completo contra `/api/sitios` |
| Administración → Usuarios | Real — CRUD completo contra `/api/usuarios`, incluye asignación de equipos con acceso remoto autorizado |

## Almacenes compartidos

- **`AuthContext`**: sesión real contra `/api/auth/login`; guarda el JWT y el usuario autenticado.
- **`TopologyContext`**: trae sitios/equipos/tramos reales (`Promise.all` sobre `listSitios`/`listEquipos`/`listTramos`) y los combina con el estado en vivo del socket de monitoreo (`useMonitoringDashboard`) para `estado`/`ultimaComprobacion`. Todos los métodos de creación/edición/baja son `async`, llaman al backend y refrescan.
- **`SessionsContext`**: sesiones activas reales, obtenidas por polling cada 5s a `GET /api/acceso-remoto/sesiones` (el backend ya emite `sessions:update` por WebSocket, pero el frontend todavía no está suscrito a ese evento — pendiente).

## Pendiente / fuera de alcance

- El frontend no está suscrito a los eventos WebSocket `topology:update` ni `sessions:update`; usa polling y refetch-tras-escritura en su lugar.
- El túnel SSH real hacia el equipo de planta no está implementado — `Conectar` gestiona la sesión (autorización, expiración, auditoría) de forma real, pero la conexión de red en sí es una simulación visual.
