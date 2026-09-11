# Task System — Uso de IA

## Rol de las herramientas de IA

Durante el desarrollo de este proyecto se utilizan dos herramientas de
IA con roles complementarios:

### OpenCode

Utilizado principalmente como asistente de programación para:

- Implementación de funcionalidades.
- Generación y modificación de código.
- Escritura de tests.
- Refactorización.
- Revisión técnica cuando corresponde.

### ChatGPT

Utilizado como apoyo para:

- Análisis de requisitos.
- Planificación.
- Decisiones de arquitectura.
- Revisión de propuestas de implementación.
- Resolución de dudas técnicas.
- Organización del proceso de desarrollo.

---

## Responsabilidad final

Las herramientas de IA son asistentes. La responsabilidad final sobre
las decisiones, el código, las pruebas, la calidad y la corrección del
proyecto corresponde al desarrollador.

Todo código generado o sugerido por IA debe ser revisado, comprendido,
probado y validado antes de considerarse terminado.

---

## Prompts relevantes

En esta sección se registran los prompts que representen decisiones
importantes o etapas relevantes del desarrollo.

### 1. Documentación del uso de IA

```
Quiero documentar el uso de inteligencia artificial que se está realizando durante el desarrollo de este proyecto.

Consultá:
- docs/requirements.md
- docs/architecture.md

Creá el archivo:
docs/ai-usage.md

El documento debe estar escrito en español.

Quiero que explique de forma transparente y profesional que durante el desarrollo se utilizan dos herramientas de IA con roles complementarios:

- OpenCode: utilizado principalmente como asistente de programación para implementación, generación/modificación de código, tests, refactorización y revisión técnica cuando corresponda.
- ChatGPT: utilizado como apoyo para análisis de requisitos, planificación, decisiones de arquitectura, revisión de propuestas de implementación, resolución de dudas técnicas y organización del proceso de desarrollo.

Dejá claro que las herramientas de IA son asistentes y que la responsabilidad final sobre las decisiones, el código, las pruebas, la calidad y la corrección del proyecto corresponde al desarrollador. Todo código generado o sugerido por IA debe ser revisado, comprendido, probado y validado antes de considerarse terminado.

Además, agregá una sección:

## Prompts relevantes

En esta sección quiero ir registrando los prompts que representen decisiones importantes o etapas relevantes del desarrollo.

Por ahora registrá como mínimo:

### 1. Definición de requisitos
Explicar brevemente que se utilizó IA para organizar y documentar los requisitos funcionales y técnicos del challenge en `docs/requirements.md`.

### 2. Definición de arquitectura
Explicar brevemente que se utilizó IA para analizar los requisitos y documentar la arquitectura del sistema en `docs/architecture.md`.

Dejá preparada la estructura para poder agregar posteriormente otros prompts relevantes, por ejemplo prompts relacionados con:
- decisiones técnicas importantes;
- implementación de partes complejas;
- tests;
- refactorizaciones;
- revisión de código;
- resolución de problemas.

No inventes prompts que todavía no fueron utilizados.

Importante:
- No modifiques `requirements.md` ni `architecture.md`.
- No instales dependencias.
- No implementes código.
- No agregues información sobre uso de IA que no se desprenda de lo indicado anteriormente.
- Mantené el documento conciso y profesional.
```

### 2. Definición de requisitos
```
Quiero crear el archivo docs/requirements.md.

A continuación te voy a proporcionar la especificación funcional del
proyecto que estamos por desarrollar.

Tu tarea en este momento es únicamente:

1. Crear la carpeta docs si no existe.
2. Crear docs/requirements.md.
3. Copiar y organizar la especificación que te proporciono en ese archivo,
   manteniendo su contenido y significado.
4. No implementar código.
5. No instalar dependencias.
6. No crear la arquitectura todavía.
7. No agregar requisitos que no estén especificados.

Este archivo será la fuente de referencia de requisitos del proyecto.
En los próximos prompts te pediré implementar diferentes partes de esta
especificación, por lo que deberás consultarlo antes de realizar cambios
relacionados con el proyecto.

[AQUI SE PEGO EL CONTENIDO DE REQUIREMENTS.MD]
```

### 3. Definición de arquitectura
```
Quiero definir la arquitectura del proyecto antes de comenzar la implementación.

Consultá y tomá como fuente principal de requisitos el archivo:
docs/requirements.md

Creá el archivo:
docs/architecture.md

El objetivo de este paso es documentar cómo estará estructurado el sistema y cómo se comunicarán sus partes. NO implementes funcionalidades todavía y NO instales dependencias.

La arquitectura propuesta para este proyecto es:

- Frontend: React + TypeScript
- Backend: Node.js + Express + TypeScript
- Persistencia: PostgreSQL
- Tests: Vitest y, si resulta necesario para tests de API, una herramienta adecuada como Supertest
- Frontend y backend estarán dentro del mismo repositorio.
- El frontend se comunicará exclusivamente con el backend mediante una API REST.
- El backend será responsable de la lógica de negocio y del acceso a datos.
- La persistencia debe estar abstraída mediante un Repository, de forma que la lógica de negocio no dependa directamente de PostgreSQL.
- La aplicación debe poder evolucionar desde una implementación en memoria hacia PostgreSQL sin tener que modificar la lógica de negocio.
- Docker Compose se utilizará posteriormente para levantar los servicios localmente, pero NO lo implementes todavía.

Documentá en architecture.md, como mínimo:

1. Visión general de la arquitectura.
2. Responsabilidades del frontend.
3. Responsabilidades del backend.
4. Responsabilidades de la capa de repositorio/persistencia.
5. Flujo de una operación desde el frontend hasta PostgreSQL y de vuelta al frontend.
6. Estructura de carpetas propuesta para frontend y backend.
7. Separación entre rutas, controladores, servicios/lógica de negocio y repositorios.
8. Cómo se manejará la jerarquía de tareas y subtareas.
9. Cómo se mantendrá la independencia entre la lógica de negocio y PostgreSQL.
10. Cómo se organizarán los tests.
11. Una sección breve sobre Docker Compose y qué servicios tendrá, dejando claro que se implementará más adelante.

Para la estructura del backend, evaluá una organización similar a:

backend/
  src/
    controllers/
    routes/
    services/
    repositories/
    models/
    types/
    utils/
    app.ts
    server.ts

Para el frontend, evaluá una organización similar a:

frontend/
  src/
    components/
    pages/
    services/
    hooks/
    types/
    utils/
    App.tsx
    main.tsx

No agregues funcionalidades que no estén en requirements.md ni conviertas nice-to-have en funcionalidades obligatorias.

Importante:
- No escribas código de implementación.
- No instales dependencias.
- No crees todavía archivos de configuración de Docker.
- No modifiques requirements.md.
- Si alguna decisión arquitectónica no está suficientemente definida, documentala como decisión pendiente en lugar de inventarla.
- Los nombres de variables, funciones, carpetas y archivos de código deben mantenerse en inglés.
- La documentación debe estar escrita en español.

Al finalizar, mostrame un resumen de las decisiones arquitectónicas que documentaste y cualquier decisión que haya quedado pendiente.
```

### 4. Preparación de la estructura inicial

```
Quiero preparar la estructura inicial del proyecto como paso previo a la implementación.

Consultá y usá como fuente los archivos:
- docs/requirements.md
- docs/architecture.md

Tu tarea es únicamente:

1. Crear la estructura de carpetas del monorepo según architecture.md:
   - backend/src/{controllers,routes,services,repositories,models,types,utils}
     con app.ts y server.ts en backend/src/
   - frontend/src/{components,pages,services,hooks,types,utils}
     con App.tsx y main.tsx en frontend/src/

2. Crear en la raíz, backend y frontend los archivos de configuración
   mínimos de proyecto. La configuración debe prepararse para:
   - Backend: Node.js + Express + TypeScript (tests con Vitest y Supertest).
   - Frontend: React + TypeScript + Tailwind CSS (tests con Vitest).
   NO instalar dependencias todavía: solo dejar los archivos de configuración
   (package.json, tsconfig.json, config de Tailwind, etc.).

3. NO instalar dependencias (sin npm install ni similar).
4. NO implementar ningún código de aplicación ni lógica de negocio.
5. NO crear archivos de configuración de Docker todavía.
6. NO modificar los archivos .md existentes.
7. NO adoptar herramientas no definidas en architecture.md o en este
   prompt. Mencioná en las decisiones pendientes cualquier herramienta
   nueva que se considere necesaria para que el desarrollador la confirme.
8. Mantener el nombre de carpetas y archivos en inglés.

Al finalizar, mostrame un resumen de lo creado y de las decisiones pendientes.
```

### 5. Implementación de la lógica de negocio del backend

```
Quiero implementar el núcleo del backend: dominio y lógica de negocio, sin API todavía.

Consultá y usá como fuente de requisitos:
- docs/requirements.md
- docs/architecture.md

Backend actual: backend/src/ con carpetas controllers, routes, services,
repositories, models, types y utils (inicializadas).

Implementá únicamente:

1. Tipos y modelos del dominio (backend/src/types y backend/src/models):
   - TaskStatus: PENDING | IN_PROGRESS | COMPLETE
   - TaskPriority: LOW | MEDIUM | HIGH
   - Task con los campos mínimos de requirements.md: id, title,
     description, status, priority, estimate, parentTaskId, position,
     createdAt, updatedAt.
   - Tipos para crear y actualizar tareas (por ejemplo CreateTaskInput
     y UpdateTaskInput).

2. Repositorio (backend/src/repositories):
   - Interfaz TaskRepository con las operaciones CRUD que necesite la
     lógica de negocio.
   - Implementación InMemoryTaskRepository que no dependa de PostgreSQL.
   - La lógica de negocio debe depender solo de la interfaz.

3. Lógica de negocio (backend/src/services):
   - TaskService.
   - Validaciones: título obligatorio y no compuesto solo de espacios;
     estimación opcional y no negativa (0 válido).
   - Estado inicial PENDING; prioridad inicial sugerida MEDIUM.
   - Jerarquía: parentTaskId (null en tareas raíz). El padre no puede
     modificarse desde la edición normal.
   - Orden: asignación básica de position dentro del mismo nivel.
   - Eliminación en cascada de todos los descendientes.
   - Método para detectar si una tarea tiene descendientes incompletos
     (status !== COMPLETE en el subárbol), de modo que el frontend pueda
     decidir el mensaje de confirmación.
   - Cálculo recursivo de la estimación total de una jerarquía.
   - Resumen de esfuerzo (total, pending, in progress, complete)
     considerando toda la jerarquía.

4. Tests unitarios con Vitest: cubrí como mínimo:
   - Validación de tareas, estados y prioridades.
   - Jerarquía y cálculo recursivo de estimaciones.
   - Eliminación de descendientes (incluyendo múltiples niveles).
   - Detección de descendientes incompletos.
   - Resumen de esfuerzo.

Restricciones:
- NO implementar todavía controllers ni rutas ni la API HTTP.
- NO usar PostgreSQL todavía.
- NO agregar funcionalidades que no estén en requirements.md.
- NO agregar comentarios al código.
- Nombres de variables, funciones, carpetas y archivos en inglés.
- No modificar archivos .md existentes.
- No commitear ni pushear.

Al finalizar corré los tests y mostrame: resumen de lo implementado,
resultado de los tests y decisiones pendientes.
```

### 6. Implementación de la capa de API REST del backend

```
Quiero implementar la capa de API REST del backend, exponiendo los endpoints definidos en requirements.md.

Consultá y usá como fuente:
- docs/requirements.md
- docs/architecture.md

El backend ya tiene models, types, TaskRepository (interfaz) +
InMemoryTaskRepository y TaskService con la lógica completa y testeada.

Implementá únicamente:

1. Controllers (backend/src/controllers):
   - TaskController que use TaskService para responder HTTP:
     GET    /tasks       (listado de tareas)
     GET    /tasks/:id   (detalle)
     POST   /tasks       (crear)
     PATCH  /tasks/:id   (actualizar, sin permitir cambiar parentTaskId)
     DELETE /tasks/:id   (eliminar en cascada)

2. Manejo de errores HTTP:
   - Mapear ValidationError a 400 con mensaje en español.
   - Mapear tarea inexistente a 404.
   - Formato de error consistente (ej: { error, message }).

3. Routes (backend/src/routes):
   - taskRouter montado en /tasks.

4. app.ts:
   - Crear la aplicación Express con middleware JSON y montar las rutas.
   - Exportar la app sin abrir el puerto (para testearla con Supertest).

5. server.ts:
   - Arrancar el servidor (puerto 3000) usando app.ts.

6. Tests de API con Vitest + Supertest cubriendo los 5 endpoints:
   crear, listar, detalle, actualizar y eliminar, incluidos 400
   (validación), 404 (inexistente) y cascada en DELETE.

Decisión a definir en este paso (documentala):
   - GET /tasks: ¿devolver solo tareas raíz o todas con su parentTaskId
     para que el frontend arme el árbol?

Restricciones:
- NO usar PostgreSQL (seguís con el repositorio en memoria).
- NO modificar la lógica de negocio salvo que un test lo exija.
- NO agregar funcionalidades fuera de requirements.md.
- NO agregar comentarios al código.
- Strings y respuestas al usuario en español; nombres de código en inglés.
- No modificar archivos .md existentes.
- No commitear ni pushear.

Al finalizar corré tests y build, y mostrame: resumen, resultado de
tests/build y decisiones pendientes.
```

### 7. Implementación del frontend

```
Quiero implementar el frontend de la aplicación.

Consultá y usá como fuente:
- docs/requirements.md
- docs/architecture.md

Backend: API REST funcional en backend/ (Express + TS, repo en memoria),
escuchando en http://localhost:3000. Endpoints: GET/POST /tasks y
GET/PATCH/DELETE /tasks/:id. El front consumirá la API vía fetch (sin
localStorage: todos los datos salen de la API).

Tecnologías: React + TypeScript + Tailwind CSS + Vitest + Vite.
Vite: build tool (instalarlo), con servidor proxy a http://localhost:3000.
Integrar Tailwind (config ya existe).

Implementá:

1. Tipos y utilidades:
   - TaskStatus/TaskPriority igual que el backend.
   - Labels en español centralizados (Prioridad: Baja/Media/Alta; estados:
     Pendiente/En progreso/Completada), con colores LOW verde / MEDIUM
     amarillo / HIGH rojo.
   - Utils: armado del árbol desde la lista plana, agenda de subtree
     (completadas/total) para progreso, resumen de esfuerzo §10.

2. Capa de datos:
   - Cliente API tipado: getTasks, getTask, createTask, updateTask,
     deleteTask (fetch, manejo de errores de la API).
   - Hook useTasks: carga tareas y expone crear/actualizar/eliminar con
     estado sincronizado.

3. Estructura de pantalla (dashboard):
   - Sidebar fija: brand, vistas Tablero/Pendientes/Completadas (filtro de
     raíces por estado, NO rutas; sin react-router), y abajo barra de
     progreso global del tablero (completadas/total, % y conteos).
   - Header: título, botón "+ Nueva tarea".
   - Franja resumen de esfuerzo §10 (Total/Pendiente/En progreso/Completada
     en horas).
   - Tablero: tareas raíz como columnas horizontales con scroll/snap.

4. TaskCard (columna §11):
   - Badge de prioridad NO editable a simple vista (Baja/Media/Alta con
     colores), clave de acceso al detalle (clic → modal).
   - Título (tachado si COMPLETE), descripción truncada, estimación "X h".
   - Barrita de progreso del subárbol (completadas/total).
   - Menú de acciones: editar, eliminar (con ConfirmDialog).
   - Footer "+ Añadir subtarea" (inline).
   - Subtareas como filas anidadas recursivas, colapsables.
   - Estado visible en la tarjeta (Pendiente/En progreso/Completada).

5. Modal de detalle (§13):
   - Overlay + panel (max-h ~80vh), header fijo con título, status,
     badge de prioridad, estimación, menú (editar/eliminar) y cerrar.
   - Cuerpo con scroll interno: descripción + árbol de subtareas
     (filas colapsables, mismo componente/estilo que la tarjeta) +
     "+ Añadir subtarea" también acá.
   - Edición en el mismo modal: al tocar "editar" el cuerpo cambia a modo
     formulario (mismo componente de crear), con guardar/cancelar.
   - Estado de navegación por tarea seleccionada (sin router).

6. Crear/editar tarea (§12): formulario con title (obligatorio),
   description, status, priority, estimate; confirmar/cancelar. Reutilizado
   para crear raíz, crear subtarea y editar (raíz y cualquier nodo).

7. ConfirmDialog compartido (§8): antes de eliminar; mensaje
   "Tenés tareas incompletas, ¿aún así deseás eliminar la tarea X?" si hay
   descendientes incompletos, o "Las subtareas también se eliminarán" si
   están completas. El front ya tiene el árbol para saberlo.

8. Estructura: frontend/src/{components,pages,services,hooks,types,utils}
   + App.tsx + main.tsx. Navegación por estado (modal + filtro). Sin router.

9. Tests Vitest: utils (labels, árbol, subtree stats, resumen) y cliente de
   servicios con fetch mock.

Restricciones:
- No modifiques el backend; cambios menores (p.ej. CORS) se avisan y
  confirman antes.
- Funciones fuera de requirements.md NO (búsqueda, ordenamiento,
  drag&drop, responsive) quedan como nice-to-have futuro.
- Toda la interfaz en español; nombres de código en inglés.
- Sin comentarios en el código.
- NO commitear ni pushear nada.
```

### 8. Diferenciación visual entre tareas principales y subtareas

```
Quiero diferenciar visualmente las tareas principales de las subtareas, incluso cuando
una tarea principal está anidada dentro de otra tarea principal.

Agregá un campo `kind` (MAIN | SUBTASK) al modelo de tareas de punta a punta
(backend y frontend):

1. El `kind` se deriva automáticamente: `MAIN` para tareas raíz (sin parentTaskId)
   y `SUBTASK` para tareas con parentTaskId. Validá el valor recibido al crear.
2. La prioridad es solo relevante para tareas principales: mostrá el badge y el
   selector de prioridad únicamente en tareas con `kind = MAIN`.
3. Una tarea principal anidada dentro de otra se muestra como una mini-tarjeta
   (con su propio badge de prioridad y su barra de progreso), mientras que las
   subtareas comunes se muestran como filas compactas.
4. Mantené el drag & drop y la creación de subtareas forzando el `kind` correcto
   desde el frontend.
5. Actualizá los tests de backend y frontend para cubrir la derivación de `kind`,
   la validación de valores inválidos y el render condicional de prioridad.
```

Nota: después de la implementación se aplicaron modificaciones
manuales de estilo y UX (prompt ejecutado por el desarrollador), que no
se registran como prompts independientes: indicadores de estado más
grandes y claros, ciclo de estado automático que promueve una tarea
padre a "En progreso" cuando una subtarea se completa, scroll
horizontal con arrastre del mouse, selects personalizados y ajustes de
layout y color azulado en los contenedores de progreso. La estimación
en horas se mantiene en la vista porque el challenge exige reflejar la
carga de trabajo a partir del campo de estimación.

### 9. Persistencia con PostgreSQL y Docker Compose

```
Implementá la persistencia con PostgreSQL y el montaje con Docker Compose para el proyecto Task System, sin modificar la lógica de negocio del backend.

1. Creá `backend/src/repositories/pgTaskRepository.ts` que implemente la interfaz `TaskRepository` (insert, findById, findAll, findByParentId, update, delete) usando `pg` con `Pool`. Los nombres de columnas serán snake_case y el repositorio mapeará hacia el modelo `Task` existente (camelCase, tipos en `backend/src/types/`).
2. Creá `backend/src/db/pool.ts` que exporte un Pool configurado con `DATABASE_URL` (incluye `ssl` solo si la variable lo indica).
3. Creá `backend/db/schema.sql`: tabla `tasks` con `id` (uuid/text), `title`, `description`, `status`, `priority`, `estimate`, `parent_task_id` (auto-referencia con `ON DELETE CASCADE`), `position`, `created_at`, `updated_at`, e índices para `parent_task_id` y `position`. Quedará montada automáticamente en el contenedor de Postgres.
4. Modificá `backend/src/server.ts` para elegir el repositorio según el entorno: si existe `DATABASE_URL` usar `PgTaskRepository`, si no, mantener `InMemoryTaskRepository`. No cambies `createApp` ni los tests.
5. Agregá `pg` a dependencias y `@types/pg` a devDependencies del backend.
6. Creá `docker-compose.yml` en la raíz con tres servicios: `postgres` (con el volumen que monte `backend/db/schema.sql`, healthcheck), `backend` (node, expone 3000, depende de postgres healthy, `DATABASE_URL` apuntando al servicio postgres) y `frontend` (sirve el build de Vite, expone 5173/80).
7. Creá los `Dockerfile` de backend y frontend, y un `.env.example` con `DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `PORT`.
8. Reescribí `README.md` en español: requisitos, cómo correr con `docker compose up`, variables de entorno y cómo correr backend/frontend en modo local sin Docker.
9. Verificá: `npm run build` y `npm test` en la raíz pasan (los tests siguen con el repo en memoria), y `docker compose config` valida el archivo.
10. NO commitees nada hasta que yo lo pida.
```

### 10. Reincorporación de estimaciones de esfuerzo

```
El challenge exige que la aplicación ayude a entender la carga de
trabajo usando el campo de estimación (esfuerzo en horas), considerando
toda la jerarquía de subtareas, y combinando la cantidad de tareas y las
horas estimadas.

Quiero volver a manejar las estimaciones sin sobrecargar la UI:

- Backend: restaurar `EffortSummary` (backend/src/types/task.ts) y los
  métodos `getSubtreeEstimate` y `getEffortSummary`
  (backend/src/services/taskService.ts) con sus tests.
- Frontend: restaurar `EffortSummary` (frontend/src/types/task.ts) y
  `frontend/src/utils/effort.ts` con sus tests.
- Agregar el campo "Estimación (horas)" opcional en el formulario de
  tareas (frontend/src/components/TaskForm.tsx) con validación no
  negativa en tiempo real (incluye rechazar el "-" sin necesidad de
  enviar el formulario).
- Mostrar en el sidebar un único card de Progreso con barra única
  ponderada (80% estimación en horas y 20% cantidad de tareas) y dos
  líneas: "X de X tareas completadas" e "X de X h completadas".
- En el detalle de una tarea mostrar "Estimación: Xh" con la suma de las
  horas propias más las de todo su subárbol.
- Alinear docs/requirements.md, docs/architecture.md y README.md.

NO commitees nada hasta que yo lo pida.
```

### 11. Validación en tiempo real de título y estimación

```
Quiero validación en vivo en los formularios, similar a la del título:

- Al hacer click en el campo de título y dejarlo vacío (blur) debe
  mostrar "El título es obligatorio", y revalidar mientras se escribe.
- Al escribir un "-" en la estimación debe aparecer en el momento
  "La estimación no puede ser negativa". Se usa type="text" con
  inputMode="decimal" porque type="number" descarta el "-" y nunca
  dispara la validación en vivo.
- Aplicado en TaskForm, CreateTaskModal (modal y agregador de
  subtareas) e InlineSubtaskForm.

NO commitees nada hasta que yo lo pida.
```