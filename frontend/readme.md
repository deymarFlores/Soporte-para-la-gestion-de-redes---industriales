# Frontend — Soporte para la Gestión de Redes Industriales

React + TypeScript + Vite, con Tailwind CSS v4 (tokens en `src/styles/tokens.css`, clases de componentes reutilizables en `src/styles/components.css`) y actualizaciones en vivo vía Socket.io.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL si el backend no corre en localhost:4000
npm run dev
```

Requiere el backend corriendo (ver `../backend/readme.md`) para tener datos reales; si no hay datos, cada vista muestra el estado de carga/error correspondiente.

## Autenticación y roles (mockeados, pero dinámicos)

El backend todavía no tiene login ni permisos, así que se simulan en el frontend — pero no como una lista estática: `src/context/UsersContext.tsx` es el directorio real de cuentas, y `AuthContext` lo consulta para autenticar. Esto significa que crear/editar/deshabilitar un usuario desde **Administración → Usuarios** afecta de verdad quién puede iniciar sesión, no es una vista decorativa.

Tres roles, según la especificación del producto:

- **Administrador** (`admin@planta.com` / `admin123`): acceso completo, incluida administración de usuarios/sitios/equipos/tramos.
- **Soporte** (`soporte@planta.com` / `soporte123`): consulta infraestructura e incidentes, y puede usar acceso remoto autorizado.
- **Consulta** (`consulta@planta.com` / `consulta123`): solo visualiza monitoreo e incidentes; no ve ni usa acceso remoto, no administra nada.

La sesión activa se guarda en `localStorage` solo para no perderla al recargar; el directorio de usuarios en sí vive en memoria (se reinicia a los 3 usuarios semilla al recargar la página).

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
| Dashboard | Real (KPIs, cadena del enlace, incidentes recientes y sesiones remotas activas) + honesto en lo que falta (latencia/pérdida/PLC RUN-STOP marcados "no disponible", no inventados) |
| Monitoreo → Topología | Real (estado) + mock (registro de equipos/tramos) — grafo interactivo con panel de detalle |
| Monitoreo → Equipos | Misma tabla que Administración → Equipos, en modo solo lectura |
| Incidentes | Real (historial completo vía `GET /api/incidents`) |
| Análisis histórico | Real, calculado a partir del historial de incidentes (disponibilidad diaria, incidentes por equipo, duración acumulada) — latencia/pérdida de paquetes marcadas como no disponibles, el backend no las expone todavía |
| Acceso remoto → Equipos disponibles | Real (estado) + mock (autorización por `allowedDeviceIps`) |
| Acceso remoto → Conectar | Simulado completo (verificación → túnel → sesión con expiración y motivo de acceso), pendiente el módulo real de certificados SSH |
| Acceso remoto → Sesiones activas | Real sobre el store de sesiones mockeado — refleja conexiones iniciadas desde `Conectar`, incluso desde otra pestaña |
| Acceso remoto → Historial de accesos | Real sobre el mismo store, con filtros |
| Administración → Equipos | Real (estado, cuando el equipo está vinculado a un nodo del backend) + mock (alta/edición/baja, campos administrativos) |
| Administración → Tramos | Mock completo — el backend no tiene un concepto de "tramo" como entidad propia todavía |
| Administración → Sitios | Mock completo — Equipos ya lo referencia por `sitioId`, no por texto libre |
| Administración → Usuarios | Mock, pero es la fuente real de autenticación del frontend (ver arriba) |

## Almacenes compartidos

- **`TopologyContext`**: única conexión en vivo (WebSocket) al backend — el resto de las vistas la consumen vía `useTopology()` en vez de abrir su propia conexión. Al recibir los nodos reales del backend por primera vez, los convierte en registros de **Sitio**, **Equipo** y **Tramo** editables desde Administración. Un equipo creado solo desde el frontend (no registrado en el backend) se muestra con estado "Sin monitoreo" en vez de inventarle uno.
- **`UsersContext`**: directorio de usuarios (ver arriba).
- **`SessionsContext`**: sesiones de acceso remoto, persistidas en `localStorage` (no solo en memoria) para que "Sesiones activas" e "Historial" reflejen conexiones iniciadas desde otra pestaña del mismo navegador — útil para demostrar el módulo con dos roles abiertos a la vez.

## Nota sobre datos aún no expuestos por el backend

El backend todavía no devuelve latencia, pérdida de paquetes ni el estado operativo del PLC (RUN/STOP) en `GET /api/dashboard/summary` (solo el estado actual del nodo), ni tiene endpoints de escritura para equipos/tramos/usuarios/sitios, ni una entidad "Tramo" propia, ni autenticación real. El frontend refleja esto mostrando esos valores como "no disponible" en vez de inventarlos, y marca explícitamente qué partes de cada flujo son simulación.
