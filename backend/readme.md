# Backend — Soporte para la Gestión de Redes Industriales

Backend en Node.js + TypeScript (Express), con Prisma ORM sobre PostgreSQL local (sin Docker, usando `@prisma/adapter-pg`), autenticación JWT y WebSocket (Socket.io) con servicios de broadcast separados por dominio.

## Organización del backend (Clean Architecture / DDD)

Cinco módulos, cada uno con la misma estructura de capas (`domain/<módulo>`, `application/<módulo>`, `infrastructure/<módulo>`, `interfaces/<módulo>`):

```
monitoring    Node (equipo), StatusEvent, Incident, Segment (tramo) — el motor de monitoreo
sites         Site (sitio/planta)
auth          User, autenticación (JWT + bcrypt), autorización por rol
remoteAccess  AccessSession — solicitar/finalizar acceso remoto a un equipo
```

```
src/
├── domain/<módulo>/           # Reglas de negocio puras, sin dependencias externas
│   ├── entities/ valueObjects/ dtos/ mappers/ (services/ en monitoring)
│
├── application/<módulo>/      # Casos de uso: QUÉ hace el sistema
│   ├── repositories/            # Interfaces (contratos) de persistencia
│   ├── services/                 # Interfaces de servicios técnicos (ej. PasswordHasher, TokenService en auth)
│   └── useCases/
│
├── infrastructure/
│   ├── database/                 # Cliente de Prisma
│   ├── <módulo>/repositories/    # Implementación de los repositorios con Prisma
│   ├── <módulo>/jobs/            # Jobs periódicos (heartbeats, expiración de sesiones)
│   ├── auth/middlewares/         # authMiddleware(...roles) — JWT + verificación de rol
│   └── realtime/                 # Ver "WebSocket" abajo
│
├── interfaces/<módulo>/       # Entrada HTTP: services.ts (orquesta) → controller.ts → dependencies.ts (composition root) → router.ts
│
├── config/env.ts
└── app.ts                     # Arranque de Express + Socket.io + jobs
```

## WebSocket: un gateway + un servicio de broadcast por dominio

`infrastructure/realtime/socketServer.ts` (`RealtimeGateway`) es **solo transporte**: abre el socket y expone `emit(event, payload)`, sin saber nada de negocio. Cada módulo tiene su propio *Broadcaster* de responsabilidad única, construido sobre ese gateway:

- `MonitoringBroadcaster` → evento `monitoring:update` (cambios de estado de nodos/incidentes)
- `TopologyBroadcaster` → evento `topology:update` (alta/edición/baja de sitios, equipos o tramos)
- `SessionsBroadcaster` → evento `sessions:update` (inicio/fin/expiración de una sesión de acceso remoto)

`app.ts` crea el `RealtimeGateway` una sola vez y pasa el *Broadcaster* correspondiente a cada módulo — ningún módulo conoce a los otros ni al gateway directamente.

## Autenticación y autorización

JWT (`POST /api/auth/login`). El middleware `authMiddleware()` (sin argumentos) exige solo un token válido; `authMiddleware("ADMINISTRADOR")` exige además ese rol. Contraseñas con bcrypt. El usuario autenticado queda en `req.authUser` (`{ sub, role }`).

Los tres roles son los mismos del frontend: `ADMINISTRADOR`, `SOPORTE`, `CONSULTA`.

## Requisitos previos

- Node.js 20+
- PostgreSQL corriendo localmente (sin Docker por ahora)

## Puesta en marcha

```bash
npm install

# Crea la base de datos
createdb soporte_redes_industriales

# Copia el .env y ajusta DATABASE_URL, JWT_SECRET si hace falta
cp .env.example .env

# Crea las tablas
npm run prisma:migrate

# Crea el sitio, el Gateway (IOT2040), el PLC de prueba, el tramo entre ambos,
# y un usuario Administrador — e imprime sus credenciales
npm run seed

# Levanta el servidor en modo desarrollo
npm run dev
```

## Endpoints disponibles

**Sin autenticación** (igual que antes, para no romper al agente ni al dashboard público):
- `POST /api/agent/report` — el agente (IOT2040) reporta el estado de los tramos. Header `x-agent-token` con el token del gateway.
- `GET /api/dashboard/summary` — estado actual de todos los nodos + incidentes activos.
- `GET /api/incidents` — historial de incidentes (filtros `nodeId`, `status`, `page`, `limit`).

**Autenticación**:
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`.

**Usuarios** (`ADMINISTRADOR`):
- `GET/POST /api/usuarios`, `PUT/DELETE /api/usuarios/:id`

**Sitios** (lectura: cualquier usuario autenticado; escritura: `ADMINISTRADOR`):
- `GET/POST /api/sitios`, `PUT/DELETE /api/sitios/:id`

**Equipos** (lectura: cualquier usuario autenticado; escritura: `ADMINISTRADOR`):
- `GET/POST /api/equipos`, `PUT/DELETE /api/equipos/:id`

**Tramos** (lectura: cualquier usuario autenticado; escritura: `ADMINISTRADOR`):
- `GET/POST /api/tramos`, `PUT/DELETE /api/tramos/:id` — crear/editar un tramo sincroniza automáticamente el `parentId` del equipo destino (lo que usa el motor de correlación de incidentes para causa raíz).

**Acceso remoto** (`ADMINISTRADOR` o `SOPORTE`):
- `POST /api/acceso-remoto/solicitar` — `{ nodeId, reason, maxDurationSeconds }`. Valida, en orden: el equipo existe y tiene `remoteAccessEnabled`, está `UP`, el usuario tiene el equipo en su lista de acceso autorizado (`UserDeviceAccess`), y no hay ya otra sesión activa sobre ese equipo.
- `POST /api/acceso-remoto/sesiones/:id/finalizar`
- `GET /api/acceso-remoto/sesiones` — sesiones activas.
- `GET /api/acceso-remoto/historial` — todas las sesiones (filtros `userId`, `nodeId`, `status`).

Las sesiones que superan su `maxDurationSeconds` se cierran solas vía un job periódico (`ACCESS_SESSION_CLEANUP_INTERVAL_MS`, igual patrón que el chequeo de heartbeats).

## Eliminar vs. deshabilitar

Sitios, equipos y usuarios tienen un campo `enabled`/`habilitado` para retirarlos sin borrar historial. Eliminar (`DELETE`) se bloquea con `409` cuando hay datos dependientes (un sitio con equipos, un equipo con tramos/incidentes/sesiones, un usuario con historial de accesos) — la relación está configurada explícitamente como `onDelete: Restrict` en el schema para que esto sea un error controlado, no un borrado en cascada silencioso.

## Pendiente / fuera de alcance de este backend

- El túnel real de acceso remoto (certificados SSH de corta duración) — `AccessSession` registra y audita la sesión, pero no abre ningún túnel todavía; es lo que el frontend marca como "vista previa simulada".
- El frontend todavía no consume estos endpoints nuevos (sigue usando sus propios stores mockeados para Sitios/Equipos/Tramos/Usuarios/Sesiones) — conectar uno con el otro es el siguiente paso natural.
- Latencia y pérdida de paquetes históricas por tramo (se miden por `StatusEvent`, pero no hay un endpoint de series de tiempo todavía).

## Cómo probar el ciclo completo con curl

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@planta.com","password":"admin123"}' | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 2. Simular que el agente reporta el PLC arriba
curl -X POST http://localhost:4000/api/agent/report \
  -H "Content-Type: application/json" \
  -H "x-agent-token: <token-del-seed>" \
  -d '{"readings":[{"ip":"192.168.2.10","status":"UP"}]}'

# 3. Solicitar acceso remoto al PLC (su id sale de GET /api/equipos)
curl -X POST http://localhost:4000/api/acceso-remoto/solicitar \
  -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"nodeId":"<id-del-plc>","reason":"Ajuste de parámetros","maxDurationSeconds":1200}'
```
