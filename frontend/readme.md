# Frontend — Soporte para la Gestión de Redes Industriales

React + TypeScript + Vite, con Tailwind CSS v4 (tokens de diseño en `src/styles/tokens.css`) y actualizaciones en vivo vía Socket.io.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # ajusta VITE_API_URL si el backend no corre en localhost:4000
npm run dev
```

Requiere el backend corriendo (ver `../backend/readme.md`) para tener datos reales; si no hay datos, el dashboard muestra el estado de carga/error correspondiente.

## Vistas

- **Dashboard** (`/`): estado general del enlace, cadena de tramos (Gateway → PLC, construida dinámicamente a partir de `parentId`) e incidentes activos, actualizados en vivo por WebSocket.

Pendiente: vista de historial de incidentes y la vista de acceso remoto (selección de PLC + conexión segura).

## Nota sobre datos aún no expuestos por el backend

El dashboard todavía no muestra latencia, pérdida de paquetes ni el estado operativo del PLC (RUN/STOP), porque `GET /api/dashboard/summary` hoy solo devuelve el estado actual de cada nodo, no su última lectura completa. Para mostrarlos hace falta que el backend incluya esos datos en el DTO de resumen (por ejemplo, la última `StatusEvent` de cada nodo).
