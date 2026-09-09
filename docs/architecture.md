# Task System — Architecture

## 1. Visión general de la arquitectura

El sistema es una aplicación web de gestión de tareas compuesta por un
frontend y un backend dentro del mismo repositorio.

- **Frontend:** aplicación web React + TypeScript.
- **Backend:** API REST construida con Node.js + Express + TypeScript.
- **Persistencia:** PostgreSQL, abstraída mediante un patrón Repository.
- **Tests:** Vitest para lógica de negocio y Supertest para tests de API.

El frontend se comunica exclusivamente con el backend mediante una API
REST. El backend es responsable de la lógica de negocio y del acceso a
datos. La persistencia está abstraída de modo que la lógica de negocio
no dependa directamente de PostgreSQL.

El esquema general es:

```
Frontend (React)
      │
      │ HTTP JSON (REST)
      ▼
Backend (Express)
      │
      ├── Routes
      ├── Controllers
      ├── Services (lógica de negocio)
      └── Repositories (acceso a datos)
             │
             ▼
        PostgreSQL
```

---

## 2. Responsabilidades del frontend

- Renderizar el dashboard principal (tarjetas de tareas raíz
  horizontales y subtareas verticales).
- Permitir crear, ver, editar y eliminar tareas.
- Mostrar el detalle de una tarea con sus subtareas.
- Mostrar el resumen de esfuerzo (total, pendiente, en progreso,
  completado).
- Diferenciar visualmente prioridades y estados.
- Comunicarse con el backend únicamente a través de la API REST.

El frontend no contiene lógica de negocio: solo presenta datos y
traduce las acciones del usuario en llamadas HTTP.

---

## 3. Responsabilidades del backend

- Exponer una API REST CRUD para tareas.
- Aplicar validación de datos (título obligatorio y no solo espacios,
  estimación no negativa, etc.).
- Implementar la lógica de negocio: jerarquía de subtareas, orden,
  eliminación en cascada, cálculos de estimaciones y resumen de
  esfuerzo.
- Orquestar las operaciones de persistencia a través de repositorios.
- No depender directamente de la implementación concreta de
  PostgreSQL.

---

## 4. Responsabilidades de la capa de repositorio/persistencia

- Encapsular el acceso a los datos.
- Proveer una interfaz uniforme para las operaciones CRUD de tareas.
- Permitir implementaciones intercambiables (en memoria durante las
  primeras etapas y PostgreSQL posteriormente) sin modificar la lógica
  de negocio.
- Centralizar las consultas relacionadas con la jerarquía de tareas.

---

## 5. Flujo de una operación

Descripción de una operación de ejemplo (crear una tarea):

1. El usuario completa el formulario en el frontend.
2. El frontend envía una petición `POST /tasks` con los datos en JSON.
3. La ruta correspondiente enruta la petición hacia el controller.
4. El controller extrae y valida la estructura básica de la petición.
5. El controller delega en el service, que aplica la lógica de negocio
   (validaciones, valores iniciales, cálculo de `position`, etc.).
6. El service llama al repository, que persiste la tarea.
7. El repository devuelve la tarea persistida (con `id`, `createdAt`,
   `updatedAt`).
8. El service retorna el resultado al controller.
9. El controller responde con la representación JSON de la tarea.
10. El frontend recibe la respuesta y actualiza la interfaz.

De manera análoga fluyen las operaciones de lectura, actualización y
eliminación. En todos los casos la comunicación entre frontend y
backend es exclusivamente HTTP JSON.

---

## 6. Estructura de carpetas propuesta

### Backend

```
backend/
  src/
    controllers/   # manejo de peticiones HTTP y respuestas
    routes/        # definición de rutas de la API
    services/      # lógica de negocio
    repositories/  # acceso a datos (interfaz + implementaciones)
    models/        # entidades del dominio
    types/         # tipos TypeScript compartidos
    utils/         # utilidades y helpers
    app.ts         # configuración de la aplicación Express
    server.ts      # arranque del servidor
```

### Frontend

```
frontend/
  src/
    components/    # componentes de UI reutilizables
    pages/         # páginas/vistas principales (dashboard, detalle)
    services/      # cliente HTTP para consumir la API REST
    hooks/         # hooks de React reutilizables
    types/         # tipos TypeScript compartidos
    utils/         # utilidades y helpers
    App.tsx        # componente raíz
    main.tsx       # punto de entrada
```

---

## 7. Separación de responsabilidades

La separación entre capas sigue un flujo descendente:

- **Routes:** definen los endpoints HTTP y los asocian a los métodos
  de los controllers.
- **Controllers:** reciben las peticiones HTTP, validan la estructura
  básica de entrada, invocan los métodos de los services y construyen
  las respuestas HTTP.
- **Services:** contienen la lógica de negocio (validaciones, reglas
  de jerarquía, cálculo de estimaciones, eliminación en cascada).
  No conocen detalles de Express ni de PostgreSQL.
- **Repositories:** abstraen el acceso a datos detrás de una interfaz.
  La lógica de negocio depende solo de esa interfaz.

Esta división garantiza que cada capa tenga una única responsabilidad
y que los cambios en una capa no se propaguen a las demás.

---

## 8. Jerarquía de tareas y subtareas

La jerarquía se representa con el campo `parentTaskId`:

- Una tarea raíz tiene `parentTaskId = null`.
- Una subtarea referencia a su tarea padre mediante `parentTaskId`.
- No se crean endpoints separados para subtareas: se utilizan los
  mismos endpoints de tareas.

El orden dentro de cada nivel jerárquico se maneja con el campo
`position`.

Las operaciones que requieren conocer la jerarquía completa (calcular
estimaciones, eliminar en cascada, construir el árbol para la vista)
se resuelven en la capa de servicios a partir de los datos provistos
por los repositorios.

---

## 9. Independencia entre lógica de negocio y PostgreSQL

La separación se logra mediante el patrón Repository:

- Se define una interfaz de repositorio (por ejemplo, `TaskRepository`)
  con las operaciones que la lógica de negocio necesita.
- Se implementa una versión en memoria para las primeras etapas de
  desarrollo y los tests.
- Posteriormente se implementa una versión sobre PostgreSQL que cumpla
  la misma interfaz.

Los services dependen de la interfaz, nunca de la implementación
concreta. Esto permite evolucionar desde la implementación en memoria
hacia PostgreSQL sin modificar la lógica de negocio.

---

## 10. Organización de los tests

- **Tests unitarios de lógica de negocio (Vitest):** cubren las reglas
  de los services: validación de tareas, estimaciones, jerarquía,
  cálculo recursivo de estimaciones, eliminación de descendientes,
  estados y prioridades.
- **Tests de API (Vitest + Supertest):** cubren los flujos principales
  de los endpoints REST contra la aplicación Express, usando
  preferiblemente el repositorio en memoria.

Los tests se agrupan a nivel de módulo o capa dentro de cada proyecto
(backend/frontend) según corresponda.

---

## 11. Docker Compose (a implementar más adelante)

Este documento no define todavía la configuración de Docker Compose.
Se implementará en una etapa posterior del proyecto.

Como referencia, los servicios que se contemplan son:

- **backend:** servidor Node.js con la API REST.
- **frontend:** servidor que sirve la aplicación React.
- **postgres:** base de datos PostgreSQL.

El objetivo será que una persona clone el repositorio y, siguiendo el
README, ejecute `docker compose up` para levantar todo el sistema
localmente sin depender de servicios cloud de terceros.

---

## Decisiones pendientes

- **Detalle del esquema de datos:** la representación exacta de la
  jerarquía dentro de PostgreSQL (tabla con auto-referencia) se
  definirá al momento de implementar la capa de persistencia.
- **Formato concreto del contrato API:** los payloads exactos de
  request/response se definirán durante la implementación de la API,
  tomando como base los endpoints mínimos de requisitos.
- **Estrategia de paginación/servicio del orden:** el manejo del
  ordenamiento con `position` (estándar de asignación de valores) se
  definirá al implementar los servicios.
- **Empaquetado y build:** las herramientas de build (Vite u otras)
  se decidirán al configurar el proyecto frontend.