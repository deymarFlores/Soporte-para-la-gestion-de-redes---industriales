# Backend — Soporte para la Gestión de Redes Industriales

Backend en Node.js + TypeScript (Express), con Prisma ORM sobre PostgreSQL local (sin Docker, usando `@prisma/adapter-pg`).

## Organización del backend (Clean Architecture / DDD)

```
src/
├── domain/monitoring/         # Reglas de negocio puras, sin dependencias externas
│   ├── entities/               # Node, StatusEvent, Incident
│   ├── valueObjects/           # NodeType, NodeStatus, IncidentType, IncidentStatus
│   ├── services/                # IncidentCorrelationService (lógica de causa raíz)
│   ├── dtos/                    # Formas de respuesta de la API
│   └── mappers/                 # Entidad -> DTO
│
├── application/monitoring/    # Casos de uso: QUÉ hace el sistema
│   ├── repositories/           # Interfaces (contratos) de persistencia
│   └── useCases/                # reportStatus, checkHeartbeats, getDashboardSummary, listIncidents
│
├── infrastructure/            # Implementaciones técnicas
│   ├── database/                # Cliente de Prisma
│   ├── monitoring/repositories/ # Implementación de los repositorios con Prisma
│   ├── monitoring/jobs/         # Job periódico de detección de heartbeats caídos
│   └── realtime/                 # Socket.io (empuja actualizaciones al dashboard)
│
├── interfaces/monitoring/     # Entrada HTTP
│   ├── services.ts              # Orquesta los casos de uso
│   ├── controller.ts            # Handlers de Express
│   ├── dependencies.ts          # Composition root del módulo
│   └── router.ts
│
├── config/env.ts
└── app.ts                     # Arranque de Express + Socket.io + jobs
```

El módulo de **acceso remoto seguro** (certificados SSH de corta duración) todavía no está implementado — se aborda como su propio módulo (`domain/remoteAccess`, `application/remoteAccess`, etc.) siguiendo el mismo patrón.

## Requisitos previos

- Node.js 20+
- PostgreSQL corriendo localmente (sin Docker por ahora)

## Puesta en marcha

```bash
npm install

# Crea la base de datos
createdb soporte_redes_industriales

# Copia el .env y ajusta DATABASE_URL si hace falta
cp .env.example .env

# Crea las tablas
npm run prisma:migrate

# Crea el nodo Gateway (IOT2040) y el PLC de prueba, e imprime el token del agente
npm run seed

# Levanta el servidor en modo desarrollo
npm run dev
```

## Endpoints disponibles

- `POST /api/agent/report` — el agente (IOT2040) reporta el estado de los tramos. Requiere el header `x-agent-token` con el token del gateway (lo imprime `npm run seed`). Body:
  ```json
  { "readings": [{ "ip": "192.168.2.10", "status": "UP", "latencyMs": 12, "packetLossPct": 0 }] }
  ```
- `GET /api/dashboard/summary` — estado actual de todos los nodos + incidentes activos.
- `GET /api/incidents` — historial de incidentes (filtros opcionales `nodeId`, `status`, `page`, `limit`).
- Socket.io evento `monitoring:update` — se emite cada vez que cambia el estado de algún nodo o se abre/cierra un incidente.

## Cómo probar el ciclo completo sin el agente todavía

Con el servidor corriendo y el seed ejecutado, se puede simular un reporte del agente con `curl` (reemplaza `<token>` por el impreso por `npm run seed`):

```bash
curl -X POST http://localhost:4000/api/agent/report \
  -H "Content-Type: application/json" \
  -H "x-agent-token: <token>" \
  -d '{"readings":[{"ip":"192.168.2.10","status":"DOWN"}]}'
```

Esto debería abrir un incidente sobre el PLC, visible en `GET /api/dashboard/summary` y `GET /api/incidents`.
