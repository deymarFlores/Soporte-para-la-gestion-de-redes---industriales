# Frontend — Soporte para la Gestión de Redes Industriales

React + TypeScript + Vite, con Tailwind CSS v4 (tokens en `src/styles/tokens.css`, clases de componentes reutilizables en `src/styles/components.css`) y actualizaciones en vivo vía Socket.io.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL si el backend no corre en localhost:4000
npm run dev
```

Requiere el backend corriendo (ver `../backend/readme.md`) para tener datos reales; si no hay datos, cada vista muestra el estado de carga/error correspondiente.

## Autenticación y roles (mockeados)

El backend todavía no tiene login ni permisos, así que se simulan en el frontend (`src/mocks/users.ts`, `src/context/AuthContext.tsx`). Tres roles, según la especificación del producto:

- **Administrador** (`admin@planta.com` / `admin123`): acceso completo, incluida administración de usuarios/sitios/equipos/tramos.
- **Soporte** (`soporte@planta.com` / `soporte123`): consulta infraestructura e incidentes, y puede usar acceso remoto autorizado.
- **Consulta** (`consulta@planta.com` / `consulta123`): solo visualiza monitoreo e incidentes; no ve ni usa acceso remoto, no administra nada.

La sesión se guarda en `localStorage` solo para no perderla al recargar; no hay backend de autenticación real detrás todavía.

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
| Dashboard | Real (KPIs, cadena del enlace e incidentes recientes desde el backend; latencia/pérdida/PLC y sesiones remotas aún no expuestas, se muestran como pendientes, no inventadas) |
| Incidentes | Real (historial completo vía `GET /api/incidents`) |
| Monitoreo → Topología | Real (estado) + mock (registro de equipos/tramos) — grafo interactivo con panel de detalle |
| Monitoreo → Equipos | Igual que Administración → Equipos, en modo solo lectura (sin acciones de alta/edición/baja) |
| Acceso remoto → Equipos disponibles | Real (estado) + mock (autorización por `allowedDeviceIps`) |
| Acceso remoto → Conectar | Simulado completo (verificación → túnel → sesión con expiración), pendiente el módulo real de certificados SSH |
| Administración → Equipos | Real (estado, cuando el equipo está vinculado a un nodo del backend) + mock (alta/edición/baja, campos administrativos) |
| Administración → Tramos | Mock completo — el backend no tiene un concepto de "tramo" como entidad propia todavía, solo la relación padre-hijo implícita en `Node.parentId` |
| Análisis histórico | Pendiente (siguiente fase: gráficos de disponibilidad/latencia/pérdida/incidentes) |
| Acceso remoto → Sesiones activas / Historial | Pendiente |
| Administración → Usuarios / Sitios | Pendiente |

## Almacén de topología (`src/context/TopologyContext.tsx`)

Es la única fuente de la conexión en vivo (WebSocket) al backend — el resto de las vistas la consumen desde ahí (`useTopology()`) en vez de abrir su propia conexión. Al recibir por primera vez los nodos reales del backend, los convierte en registros de **Equipo** y **Tramo** (mockeados, editables desde Administración) que alimentan Topología, Equipos y Tramos. Un equipo creado solo desde el frontend (no registrado en el backend) se muestra con estado "Sin monitoreo" en vez de inventarle un estado — la única fuente de verdad sobre disponibilidad real sigue siendo el backend.

## Nota sobre datos aún no expuestos por el backend

El backend todavía no devuelve latencia, pérdida de paquetes ni el estado operativo del PLC (RUN/STOP) en `GET /api/dashboard/summary` (solo el estado actual del nodo), ni tiene endpoints de escritura para equipos/tramos/usuarios/sitios, ni una entidad "Tramo" propia. El frontend refleja esto mostrando esos valores como "no disponible" en vez de inventarlos, y marca explícitamente qué partes de cada flujo son simulación.
