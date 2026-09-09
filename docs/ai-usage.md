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