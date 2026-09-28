# Frontend — Soporte para la Gestión de Redes Industriales

React + TypeScript + Vite, con Tailwind CSS v4 (tokens de diseño en `src/styles/tokens.css`) y actualizaciones en vivo vía Socket.io.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL si el backend no corre en localhost:4000
npm run dev
```

Requiere el backend corriendo (ver `../backend/readme.md`) para tener datos reales; si no hay datos, el dashboard muestra el estado de carga/error correspondiente.

## Autenticación y roles (mockeados)

El backend todavía no tiene login ni permisos por dispositivo, así que se simulan en el frontend (`src/mocks/users.ts`, `src/context/AuthContext.tsx`) para poder validar cómo se comportará el producto completo:

- **Administrador** (`admin@planta.com` / `admin123`): ve la red completa y el historial de incidentes.
- **Ingeniero** (`ingeniero@planta.com` / `ing123`): ve solo los equipos que tiene autorizados (`allowedDeviceIps`), con la disponibilidad real tomada del backend.

La sesión se guarda en `localStorage` solo para no perderla al recargar; no hay backend de autenticación real detrás todavía.

## Vistas

- **Login** (`/login`).
- **Red** (`/red`, admin): estado general del enlace, cadena de tramos e incidentes activos — igual que antes, con datos reales del backend.
- **Incidentes** (`/incidentes`, admin): historial completo de incidentes, con datos reales.
- **Mis equipos** (`/equipos`, ingeniero): lista de PLCs/dispositivos autorizados para ese usuario (permiso mockeado, estado real).
- **Conectar** (`/equipos/:id/conectar`, ingeniero): flujo de conexión punto a punto — **completamente simulado** (verificación → túnel → sesión con expiración) hasta que el backend implemente el módulo de acceso remoto (certificados SSH de corta duración).

## Nota sobre datos aún no expuestos por el backend

El dashboard todavía no muestra latencia, pérdida de paquetes ni el estado operativo del PLC (RUN/STOP), porque `GET /api/dashboard/summary` hoy solo devuelve el estado actual de cada nodo, no su última lectura completa. Para mostrarlos hace falta que el backend incluya esos datos en el DTO de resumen (por ejemplo, la última `StatusEvent` de cada nodo).
