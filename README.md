# Task System

Aplicación web para gestionar tareas de un pequeño equipo de desarrollo:
crear, visualizar, actualizar y eliminar tareas y organizarlas mediante
subtareas con múltiples niveles de profundidad.

## Capturas

### Desktop

![Vista desktop](assets/capturas/desktop.png)

### Mobile

![Vista mobile](assets/capturas/mobile_completo.png)

## Estructura

```
backend/   API REST (Node.js + Express + TypeScript)
frontend/  Aplicación web (React + TypeScript + Tailwind CSS)
docs/      Documentación (requisitos, arquitectura, uso de IA)
```

- Frontend y backend están dentro del mismo repositorio (monorepo con
  npm workspaces).
- El frontend se comunica exclusivamente con el backend mediante una
  API REST.
- El backend separa rutas, controllers, services (lógica de negocio) y
  repositories (persistencia). Por defecto usa un repositorio en
  memoria; si se define `DATABASE_URL` usa PostgreSQL.

### Estructura de código

```
backend/
  src/
    controllers/   # manejo de peticiones HTTP y respuestas
    routes/        # definición de rutas de la API
    services/      # lógica de negocio (jerarquía, orden)
    repositories/  # acceso a datos (interfaz + en memoria + PostgreSQL)
    models/        # entidades del dominio
    types/         # tipos TypeScript compartidos
    db/            # pool de conexión a PostgreSQL
    utils/         # utilidades y helpers
    app.ts         # configuración de la aplicación Express
    server.ts      # arranque del servidor
  db/
    schema.sql     # esquema de la base de datos (auto-aplicado en Docker)
```

```
frontend/
  src/
    components/    # componentes de UI reutilizables
    pages/         # vistas principales (dashboard)
    services/      # cliente HTTP para consumir la API REST
    hooks/         # hooks de React reutilizables
    state/         # estado global (drag & drop)
    types/         # tipos TypeScript compartidos
    utils/         # utilidades y helpers
    App.tsx        # componente raíz
    main.tsx       # punto de entrada
```

## Clonar el repositorio

```bash
git clone https://github.com/1LuciaLemes/task-system.git
cd task-system
```

Con Docker no hace falta nada más: instalá las dependencias solo si vas
a ejecutar en modo local sin Docker.

```bash
# Opcional: solo para ejecución local (npm run dev)
npm install
```

## Requisitos

- Docker y Docker Compose (para la ejecución en contenedores).
- Node.js 20 (solo para desarrollo local sin Docker).

## Ejecución con Docker Compose

```bash
docker compose up
```

Esto levanta tres servicios:

| Servicio  | Descripción                     | URL                 |
| --------- | ------------------------------- | ------------------- |
| frontend  | Aplicación web (nginx)          | http://localhost:8080 |
| backend   | API REST                        | http://localhost:3000 |
| postgres  | Base de datos PostgreSQL        | localhost:5432      |

### Variables de entorno

Se pueden configurar mediante un archivo `.env` en la raíz (ver
`.env.example`):

| Variable          | Predeterminado | Descripción              |
| ----------------- | -------------- | ------------------------ |
| `POSTGRES_USER`   | `task`         | Usuario de PostgreSQL    |
| `POSTGRES_PASSWORD` | `task`       | Contraseña de PostgreSQL |
| `POSTGRES_DB`     | `tasks`        | Base de datos            |

El esquema de la base de datos se crea automáticamente al inicializar
el contenedor de PostgreSQL (`backend/db/schema.sql`).

## Ejecución local (sin Docker)

El backend y el frontend son dos programas que se ejecutan al mismo
tiempo y cada uno "ocupa" su ventana de terminal (no devuelven el
control hasta cerrarlos con `Ctrl+C`). Por eso se necesitan **dos
ventanas de terminal abiertas a la vez** en la raíz del proyecto:

- **Ventana 1 — backend:** arranca la API en http://localhost:3000.
- **Ventana 2 — frontend:** arranca la interfaz en http://localhost:5173.

```bash
# Ventana 1: backend
npm run dev -w task-system-backend

# Ventana 2: frontend
npm run dev -w task-system-frontend
```

El frontend en modo desarrollo usa un proxy hacia el backend
(`/tasks` → `http://localhost:3000`), así que no hace falta configuración
adicional.

Al ejecutar el backend (Ventana 1) se puede elegir la persistencia:

### Opción A: persistencia en memoria (por defecto)

Sin configurar ninguna variable, el backend usa `InMemoryTaskRepository`:
no requiere base de datos y los datos se pierden al reiniciar el servidor.
Ideal para pruebas rápidas o desarrollo del frontend.

```bash
# Ventana 1 - backend en memoria:
npm run dev -w task-system-backend
```

### Opción B: persistencia con PostgreSQL

Para que el backend local use la base de datos, primero se levanta solo
el servicio de Postgres con Docker (el `schema.sql` se aplica la primera
vez). El comando de Docker con `-d` corre en segundo plano, así que no
ocupa su propia ventana:

```bash
# En cualquier terminal (no ocupa la ventana; corre en segundo plano).
docker compose up -d postgres
```

Después, en la Ventana 1 se arranca el backend conectado a Postgres:

```bash
# Ventana 1 - backend conectado a PostgreSQL:
$env:DATABASE_URL="postgres://task:task@localhost:5432/tasks"
npm run dev -w task-system-backend
```

En Linux/macOS la Ventana 1 queda así:

```bash
DATABASE_URL=postgres://task:task@localhost:5432/tasks npm run dev -w task-system-backend
```

Opcionalmente se puede definir `PGSSL=true` si la conexión lo requiere.
Con esta opción los datos persisten entre reinicios. Para detener la base
de datos: `docker compose stop postgres` (conserva los datos) o
`docker compose down -v` (borra el volumen).

## Comandos

Desde la raíz:

| Comando             | Descripción                              |
| ------------------- | ---------------------------------------- |
| `npm run build`     | Compila backend y frontend               |
| `npm test`          | Ejecuta los tests de backend y frontend  |

## Documentación

- [`docs/requirements.md`](docs/requirements.md) — requisitos funcionales y técnicos.
- [`docs/architecture.md`](docs/architecture.md) — arquitectura del sistema.
- [`docs/ai-usage.md`](docs/ai-usage.md) — registro del uso de herramientas de IA.